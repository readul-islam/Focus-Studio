from collaboration.file_utils import is_allowed_attachment
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from users.permissions import TasksViewPermission
from .attachment_serializers import TaskAttachmentSerializer
from .models import Task, TaskAttachment

MAX_TASK_ATTACHMENT_BYTES = 5 * 1024 * 1024


def _task_for_user(task_id, user):
    qs = Task.objects.filter(pk=task_id)
    if getattr(user, 'studio_id', None):
        qs = qs.filter(studio_id=user.studio_id)
    return get_object_or_404(qs)


def _sync_task_notion(task):
    try:
        from notion.outbound import update_task_in_notion

        update_task_in_notion(task)
    except Exception:
        pass


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated, TasksViewPermission])
def task_attachments(request, task_id):
    task = _task_for_user(task_id, request.user)

    if request.method == 'GET':
        attachments = task.attachments.all()
        serializer = TaskAttachmentSerializer(
            attachments, many=True, context={'request': request}
        )
        return Response(serializer.data)

    uploads = request.FILES.getlist('files') or request.FILES.getlist('file')
    if not uploads and request.FILES.get('file'):
        uploads = [request.FILES['file']]
    if not uploads:
        return Response({'error': 'No files provided'}, status=status.HTTP_400_BAD_REQUEST)

    created = []
    for upload in uploads:
        if upload.size > MAX_TASK_ATTACHMENT_BYTES:
            return Response(
                {'error': f'{upload.name} exceeds the 5MB size limit'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not is_allowed_attachment(upload.name, getattr(upload, 'content_type', '')):
            return Response(
                {'error': f'File type not allowed: {upload.name}'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        attachment = TaskAttachment.objects.create(
            task=task,
            file=upload,
            file_name=upload.name,
            file_size=upload.size,
            content_type=getattr(upload, 'content_type', '') or '',
        )
        created.append(attachment)

    _sync_task_notion(task)
    serializer = TaskAttachmentSerializer(created, many=True, context={'request': request})
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated, TasksViewPermission])
def task_attachment_delete(request, attachment_id):
    qs = TaskAttachment.objects.select_related('task')
    if getattr(request.user, 'studio_id', None):
        qs = qs.filter(task__studio_id=request.user.studio_id)
    attachment = get_object_or_404(qs, pk=attachment_id)
    task = attachment.task
    if attachment.file:
        attachment.file.delete(save=False)
    attachment.delete()
    _sync_task_notion(task)
    return Response(status=status.HTTP_204_NO_CONTENT)
