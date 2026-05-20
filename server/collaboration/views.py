import logging
from datetime import timedelta

from django.db import IntegrityError
from django.db.models import Case, IntegerField, Value, When
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from projects.models import Project
from techstyles.mixins import StudioScopedMixin
from .models import ProjectTeamMessage, ProjectPresence, TeamMessageAttachment
from .file_utils import classify_file_type, is_allowed_attachment, MAX_ATTACHMENT_BYTES
from .serializers import (
    ProjectTeamMessageSerializer,
    ProjectTeamMessageCreateSerializer,
    ProjectPresenceSerializer,
    TeamChatAttachmentLibrarySerializer,
)
from .utils import find_mentioned_users

logger = logging.getLogger(__name__)

PRESENCE_TIMEOUT_SECONDS = 60


def _parse_project_id(raw):
    if raw is None or raw == '':
        return None
    try:
        return int(raw)
    except (TypeError, ValueError):
        return None


def _get_project_for_user(project_id, user):
    if not getattr(user, 'studio_id', None):
        return None
    try:
        return Project.objects.get(id=project_id, studio_id=user.studio_id)
    except (Project.DoesNotExist, ValueError, TypeError):
        return None


def _serializer_context(request):
    return {'request': request}


class ProjectTeamMessageViewSet(StudioScopedMixin, viewsets.ModelViewSet):
    queryset = ProjectTeamMessage.objects.select_related(
        'user', 'project', 'parent'
    ).prefetch_related('attachments')
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post']

    def get_serializer_class(self):
        if self.action == 'create':
            return ProjectTeamMessageCreateSerializer
        return ProjectTeamMessageSerializer

    def get_serializer_context(self):
        return _serializer_context(self.request)

    def get_queryset(self):
        qs = super().get_queryset()
        project_id = _parse_project_id(self.request.query_params.get('project_id'))
        if project_id:
            qs = qs.filter(project_id=project_id)
        return (
            qs.annotate(
                _pin_order=Case(
                    When(is_pinned=True, then=Value(0)),
                    default=Value(1),
                    output_field=IntegerField(),
                )
            )
            .order_by('_pin_order', '-pinned_at', 'created_at')
        )

    def list(self, request, *args, **kwargs):
        if not getattr(request.user, 'studio_id', None):
            return Response([])
        return super().list(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        if not getattr(request.user, 'studio_id', None):
            return Response(
                {'error': 'User is not associated with a studio'},
                status=status.HTTP_403_FORBIDDEN,
            )

        project_id = _parse_project_id(request.data.get('project_id'))
        if not project_id:
            return Response(
                {'error': 'project_id is required'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        project = _get_project_for_user(project_id, request.user)
        if not project:
            return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = ProjectTeamMessageCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        content = (serializer.validated_data.get('content') or '').strip()
        uploads = request.FILES.getlist('files')

        if not content and not uploads:
            return Response(
                {'error': 'Message text or at least one file is required'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        for upload in uploads:
            if upload.size > MAX_ATTACHMENT_BYTES:
                return Response(
                    {'error': f'{upload.name} exceeds the 25MB size limit'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if not is_allowed_attachment(upload.name, getattr(upload, 'content_type', '')):
                return Response(
                    {'error': f'File type not allowed: {upload.name}'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        parent = None
        parent_id = serializer.validated_data.get('parent_id')
        if parent_id:
            try:
                parent = ProjectTeamMessage.objects.get(
                    id=parent_id, project=project, studio_id=request.user.studio_id
                )
            except ProjectTeamMessage.DoesNotExist:
                return Response({'error': 'Parent message not found'}, status=status.HTTP_404_NOT_FOUND)

        message = ProjectTeamMessage.objects.create(
            project=project,
            user=request.user,
            studio_id=request.user.studio_id,
            content=content,
            parent=parent,
        )

        for upload in uploads:
            TeamMessageAttachment.objects.create(
                message=message,
                file=upload,
                file_name=upload.name,
                file_size=upload.size,
                content_type=getattr(upload, 'content_type', '') or '',
                file_type=classify_file_type(upload.name, getattr(upload, 'content_type', '')),
            )

        if content:
            self._notify_team_message(request, project, message)

        message = ProjectTeamMessage.objects.prefetch_related('attachments').get(pk=message.pk)
        output = ProjectTeamMessageSerializer(message, context=_serializer_context(request))
        return Response(output.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='pin')
    def pin_message(self, request, pk=None):
        if not getattr(request.user, 'studio_id', None):
            return Response(
                {'error': 'User is not associated with a studio'},
                status=status.HTTP_403_FORBIDDEN,
            )
        message = self.get_object()
        message.is_pinned = True
        message.pinned_at = timezone.now()
        message.save(update_fields=['is_pinned', 'pinned_at', 'updated_at'])
        message = (
            ProjectTeamMessage.objects.select_related('user', 'project', 'parent')
            .prefetch_related('attachments')
            .get(pk=message.pk)
        )
        return Response(
            ProjectTeamMessageSerializer(
                message, context=_serializer_context(request)
            ).data
        )

    @action(detail=True, methods=['post'], url_path='unpin')
    def unpin_message(self, request, pk=None):
        if not getattr(request.user, 'studio_id', None):
            return Response(
                {'error': 'User is not associated with a studio'},
                status=status.HTTP_403_FORBIDDEN,
            )
        message = self.get_object()
        message.is_pinned = False
        message.pinned_at = None
        message.save(update_fields=['is_pinned', 'pinned_at', 'updated_at'])
        message = (
            ProjectTeamMessage.objects.select_related('user', 'project', 'parent')
            .prefetch_related('attachments')
            .get(pk=message.pk)
        )
        return Response(
            ProjectTeamMessageSerializer(
                message, context=_serializer_context(request)
            ).data
        )

    def _notify_team_message(self, request, project, message):
        from notifications.models import Notification

        project_name = project.project_name or 'a project'
        author = request.user.name or request.user.email
        content = message.content or ''
        is_team_mention = '@team' in content.lower()

        try:
            recipients = find_mentioned_users(
                content,
                request.user.studio,
                exclude_user_id=request.user.id,
            )
            for mentioned_user in recipients:
                if is_team_mention:
                    body = f'{author} mentioned everyone (@team) in {project_name}'
                    ntype = 'team_message'
                else:
                    body = f'{author} mentioned you in {project_name}'
                    ntype = 'comment_mention'
                Notification.objects.create(
                    recipient=mentioned_user,
                    notification_type=ntype,
                    message=body,
                    project=project,
                )
        except Exception as exc:
            logger.warning('mention notification failed: %s', exc)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def presence_heartbeat(request):
    if not getattr(request.user, 'studio_id', None):
        return Response(
            {'error': 'User is not associated with a studio'},
            status=status.HTTP_403_FORBIDDEN,
        )

    project_id = _parse_project_id(request.data.get('project_id'))
    if not project_id:
        return Response({'error': 'project_id is required'}, status=status.HTTP_400_BAD_REQUEST)

    project = _get_project_for_user(project_id, request.user)
    if not project:
        return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)

    try:
        presence, _ = ProjectPresence.objects.update_or_create(
            project=project,
            user=request.user,
            defaults={'studio_id': request.user.studio_id, 'last_seen': timezone.now()},
        )
    except IntegrityError as exc:
        logger.exception('presence heartbeat failed: %s', exc)
        return Response(
            {'error': 'Could not update presence'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return Response(
        ProjectPresenceSerializer(presence, context=_serializer_context(request)).data
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def notify_mention(request):
    """Create a mention notification (e.g. from task comments)."""
    from notifications.models import Notification
    from users.models import User

    if not getattr(request.user, 'studio_id', None):
        return Response(
            {'error': 'User is not associated with a studio'},
            status=status.HTTP_403_FORBIDDEN,
        )

    recipient_id = request.data.get('recipient_id')
    message_text = request.data.get('message', '')
    project_id = _parse_project_id(request.data.get('project_id'))
    task_id = request.data.get('task_id')

    if not recipient_id:
        return Response({'error': 'recipient_id is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        recipient = User.objects.get(id=recipient_id, studio_id=request.user.studio_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    if recipient.id == request.user.id:
        return Response({'status': 'skipped'})

    project = None
    task = None
    if project_id:
        project = _get_project_for_user(project_id, request.user)
    if task_id:
        from task.models import Task
        try:
            task = Task.objects.get(id=task_id, studio_id=request.user.studio_id)
            project = project or task.project
        except Task.DoesNotExist:
            pass

    preview = (message_text[:120] + '…') if len(message_text) > 120 else message_text
    author = request.user.name or request.user.email
    try:
        Notification.objects.create(
            recipient=recipient,
            notification_type='comment_mention',
            message=f"{author} mentioned you: {preview}" if preview else f"{author} mentioned you",
            project=project,
            task=task,
        )
    except Exception as exc:
        logger.warning('notify_mention failed: %s', exc)
        return Response({'error': 'Could not create notification'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({'status': 'ok'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def presence_list(request):
    if not getattr(request.user, 'studio_id', None):
        return Response([])

    project_id = _parse_project_id(request.query_params.get('project_id'))
    if not project_id:
        return Response({'error': 'project_id is required'}, status=status.HTTP_400_BAD_REQUEST)

    project = _get_project_for_user(project_id, request.user)
    if not project:
        return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)

    cutoff = timezone.now() - timedelta(seconds=PRESENCE_TIMEOUT_SECONDS)
    active = ProjectPresence.objects.filter(
        project=project,
        studio_id=request.user.studio_id,
        last_seen__gte=cutoff,
    ).select_related('user')

    serializer = ProjectPresenceSerializer(
        active, many=True, context=_serializer_context(request)
    )
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def chat_attachments_list(request):
    """All team-chat file attachments for a project (Files tab » Team chat section)."""
    if not getattr(request.user, 'studio_id', None):
        return Response([])

    project_id = _parse_project_id(request.query_params.get('project_id'))
    if not project_id:
        return Response({'error': 'project_id is required'}, status=status.HTTP_400_BAD_REQUEST)

    project = _get_project_for_user(project_id, request.user)
    if not project:
        return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)

    qs = (
        TeamMessageAttachment.objects.filter(
            message__project_id=project_id,
            message__studio_id=request.user.studio_id,
        )
        .select_related('message', 'message__user')
        .order_by('-created_at')
    )

    serializer = TeamChatAttachmentLibrarySerializer(
        qs, many=True, context=_serializer_context(request)
    )
    return Response(serializer.data)
