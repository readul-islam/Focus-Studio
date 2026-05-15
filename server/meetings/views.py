from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiTypes

from .models import Meeting, MeetingTranscript, MeetingActionItem
from .serializers import MeetingSerializer, JoinMeetingSerializer, MeetingActionItemSerializer
from . import vexa
from .ai import generate_summary_and_action_items
from techstyles.mixins import StudioScopedMixin


@extend_schema(tags=['Meetings'])
class MeetingViewSet(StudioScopedMixin, viewsets.ModelViewSet):
    queryset = Meeting.objects.select_related('transcript').prefetch_related('action_items').order_by('-created_at')
    serializer_class = MeetingSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['studio', 'platform', 'bot_status']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

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

        try:
            result = vexa.join_meeting(
                platform=meeting.platform,
                native_meeting_id=meeting.native_meeting_id,
            )
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

        # 1. Pull transcript from Vexa
        try:
            data = vexa.get_transcript(meeting.platform, meeting.native_meeting_id)
        except Exception as e:
            return Response({'error': f'Vexa API error: {str(e)}'}, status=status.HTTP_502_BAD_GATEWAY)

        # Vexa returns a list of segments or a dict with a transcript key
        raw = data if isinstance(data, list) else data.get('transcript', [])
        transcript_text = '\n'.join(
            f"{seg.get('speaker', 'Speaker')}: {seg.get('text', '')}"
            for seg in raw
        ) if raw else str(data)

        # 2. Save / update the transcript record
        transcript, _ = MeetingTranscript.objects.update_or_create(
            meeting=meeting,
            defaults={'raw_transcript': raw, 'transcript_text': transcript_text},
        )

        # 3. Generate AI summary + action items
        if transcript_text.strip():
            try:
                ai_result = generate_summary_and_action_items(transcript_text)
                transcript.summary = ai_result.get('summary', '')
                transcript.save(update_fields=['summary'])

                # 4. Create action items (clear old ones first)
                meeting.action_items.all().delete()
                for item in ai_result.get('action_items', []):
                    MeetingActionItem.objects.create(
                        meeting=meeting,
                        title=item.get('title', ''),
                        description=item.get('description', ''),
                    )
            except Exception as e:
                # AI failure should not block returning the transcript
                transcript.summary = f'[AI summary failed: {str(e)}]'
                transcript.save(update_fields=['summary'])

        meeting.bot_status = 'completed'
        meeting.save(update_fields=['bot_status'])

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
