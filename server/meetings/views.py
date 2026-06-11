from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiTypes

from task.models import Task
from .models import Meeting, MeetingTranscript, MeetingActionItem
from .serializers import (
    MeetingSerializer,
    JoinMeetingSerializer,
    MeetingActionItemSerializer,
    ProcessTextSerializer,
)
from . import vexa
from .transcript import ingest_vexa_transcript_for_meeting, run_ai_extraction
from techstyles.mixins import StudioScopedMixin


@extend_schema(tags=['Meetings'])
class MeetingViewSet(StudioScopedMixin, viewsets.ModelViewSet):
    queryset = Meeting.objects.select_related(
        'transcript', 'project', 'created_by'
    ).prefetch_related('action_items').order_by('-updated_at')
    serializer_class = MeetingSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['studio', 'platform', 'bot_status', 'note_status', 'project', 'capture_source']

    def get_queryset(self):
        qs = super().get_queryset()
        project_id = self.request.query_params.get('project_id')
        if project_id:
            qs = qs.filter(project_id=project_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(
            created_by=self.request.user,
            studio=self.request.user.studio,
        )

    # ------------------------------------------------------------------
    # POST /meetings/{id}/join-bot/
    # ------------------------------------------------------------------
    @extend_schema(
        summary="Send bot to join a meeting",
        description="Deploys a Vexa bot to the specified meeting. Updates bot_id and bot_status on the Meeting record.",
        request=None,
        responses={200: MeetingSerializer, 400: OpenApiTypes.OBJECT, 502: OpenApiTypes.OBJECT},
    )
    @action(detail=True, methods=['post'], url_path='join-bot')
    def join_bot(self, request, pk=None):
        meeting = self.get_object()

        if meeting.bot_status == 'in_meeting':
            return Response({'error': 'Bot is already in this meeting.'}, status=status.HTTP_400_BAD_REQUEST)

        if not meeting.native_meeting_id:
            return Response({'error': 'Meeting URL or ID is required to join a bot.'}, status=status.HTTP_400_BAD_REQUEST)

        native_id = vexa.normalize_native_meeting_id(meeting.platform, meeting.native_meeting_id)
        if native_id != meeting.native_meeting_id:
            meeting.native_meeting_id = native_id
            meeting.save(update_fields=['native_meeting_id', 'updated_at'])

        try:
            result = vexa.join_meeting(
                platform=meeting.platform,
                native_meeting_id=native_id,
            )
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception as e:
            return Response({'error': f'Vexa API error: {str(e)}'}, status=status.HTTP_502_BAD_GATEWAY)

        meeting.bot_id = result.get('bot_id') or result.get('id')
        meeting.bot_status = 'joining'
        meeting.save(update_fields=['bot_id', 'bot_status'])

        return Response(MeetingSerializer(meeting).data, status=status.HTTP_200_OK)

    # ------------------------------------------------------------------
    # POST /meetings/{id}/stop-bot/
    # ------------------------------------------------------------------
    @extend_schema(
        summary="Stop the bot from a meeting",
        description="Removes the Vexa bot from the meeting and marks it as completed.",
        request=None,
        responses={200: MeetingSerializer, 400: OpenApiTypes.OBJECT, 502: OpenApiTypes.OBJECT},
    )
    @action(detail=True, methods=['post'], url_path='stop-bot')
    def stop_bot(self, request, pk=None):
        meeting = self.get_object()

        if not meeting.bot_id:
            return Response({'error': 'No bot is associated with this meeting.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            vexa.stop_bot(meeting.bot_id)
        except Exception as e:
            return Response({'error': f'Vexa API error: {str(e)}'}, status=status.HTTP_502_BAD_GATEWAY)

        meeting.bot_status = 'completed'
        meeting.save(update_fields=['bot_status'])

        return Response(MeetingSerializer(meeting).data, status=status.HTTP_200_OK)

    # ------------------------------------------------------------------
    # POST /meetings/{id}/fetch-transcript/
    # ------------------------------------------------------------------
    @extend_schema(
        summary="Fetch transcript, generate AI summary & action items",
        description=(
            "Pulls the transcript from Vexa, saves it, then uses GPT-4o-mini to generate a "
            "meeting summary and extract action items automatically."
        ),
        request=None,
        responses={200: MeetingSerializer, 400: OpenApiTypes.OBJECT, 502: OpenApiTypes.OBJECT},
    )
    @action(detail=True, methods=['post'], url_path='fetch-transcript')
    def fetch_transcript(self, request, pk=None):
        meeting = self.get_object()

        try:
            ingest_vexa_transcript_for_meeting(meeting)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': f'Vexa API error: {str(e)}'}, status=status.HTTP_502_BAD_GATEWAY)

        meeting.refresh_from_db()
        return Response(MeetingSerializer(meeting).data, status=status.HTTP_200_OK)

    # ------------------------------------------------------------------
    # POST /meetings/{id}/process-text/
    # ------------------------------------------------------------------
    @extend_schema(
        summary="Process pasted transcript text with AI",
        description="For site visits or manual uploads — saves transcript text and extracts summary, decisions, risks, and action items.",
        request=ProcessTextSerializer,
        responses={200: MeetingSerializer, 400: OpenApiTypes.OBJECT},
    )
    @action(detail=True, methods=['post'], url_path='process-text')
    def process_text(self, request, pk=None):
        meeting = self.get_object()
        serializer = ProcessTextSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        transcript_text = serializer.validated_data['transcript_text']
        transcript, _ = MeetingTranscript.objects.update_or_create(
            meeting=meeting,
            defaults={'transcript_text': transcript_text, 'raw_transcript': []},
        )
        transcript.transcript_text = transcript_text
        transcript.save(update_fields=['transcript_text'])
        run_ai_extraction(meeting, transcript, transcript_text)

        meeting.refresh_from_db()
        return Response(MeetingSerializer(meeting).data, status=status.HTTP_200_OK)

    # ------------------------------------------------------------------
    # POST /meetings/{id}/publish/
    # ------------------------------------------------------------------
    @extend_schema(
        summary="Publish a note after review",
        request=None,
        responses={200: MeetingSerializer},
    )
    @action(detail=True, methods=['post'], url_path='publish')
    def publish(self, request, pk=None):
        meeting = self.get_object()
        meeting.note_status = 'published'
        meeting.save(update_fields=['note_status', 'updated_at'])
        return Response(MeetingSerializer(meeting).data, status=status.HTTP_200_OK)

    # ------------------------------------------------------------------
    # PATCH /meetings/{id}/action-items/{item_id}/
    # ------------------------------------------------------------------
    @extend_schema(
        summary="Update a single action item",
        description="Partially update an action item (e.g. change status, assignee, due_date).",
        request=MeetingActionItemSerializer,
        responses={200: MeetingActionItemSerializer, 404: OpenApiTypes.OBJECT},
    )
    @action(detail=True, methods=['patch'], url_path='action-items/(?P<item_pk>[^/.]+)')
    def update_action_item(self, request, pk=None, item_pk=None):
        meeting = self.get_object()
        try:
            item = meeting.action_items.get(pk=item_pk)
        except MeetingActionItem.DoesNotExist:
            return Response({'error': 'Action item not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = MeetingActionItemSerializer(item, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    # ------------------------------------------------------------------
    # POST /meetings/{id}/action-items/{item_id}/convert-to-task/
    # ------------------------------------------------------------------
    @extend_schema(
        summary="Convert an action item to a project task",
        request=None,
        responses={200: OpenApiTypes.OBJECT, 400: OpenApiTypes.OBJECT, 404: OpenApiTypes.OBJECT},
    )
    @action(detail=True, methods=['post'], url_path='action-items/(?P<item_pk>[^/.]+)/convert-to-task')
    def convert_action_item_to_task(self, request, pk=None, item_pk=None):
        meeting = self.get_object()
        if not meeting.project_id:
            return Response(
                {'error': 'Link this note to a project before converting action items to tasks.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            item = meeting.action_items.get(pk=item_pk)
        except MeetingActionItem.DoesNotExist:
            return Response({'error': 'Action item not found.'}, status=status.HTTP_404_NOT_FOUND)

        if item.converted_task_id:
            return Response(
                {'error': 'Action item already converted.', 'task_id': item.converted_task_id},
                status=status.HTTP_400_BAD_REQUEST,
            )

        task = Task.objects.create(
            title=item.title,
            description=item.description or '',
            project_id=meeting.project_id,
            studio=meeting.studio,
            created_by=request.user,
        )
        item.converted_task_id = task.id
        item.status = 'done'
        item.save(update_fields=['converted_task_id', 'status', 'updated_at'])

        return Response(
            {'task_id': task.id, 'title': task.title, 'meeting': MeetingSerializer(meeting).data},
            status=status.HTTP_200_OK,
        )
