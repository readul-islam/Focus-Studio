from rest_framework import status
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from crm.models import Client
from notifications.models import Notification
from projects.models import Project

from .authentication import ClientJWTAuthentication
from .models import ClientProject, ClientProjectMessage
from .serializers import ClientProjectMessageSerializer


def _notify_studio_of_client_message(message: ClientProjectMessage):
    project = message.project
    recipients = set(project.assignees.values_list('id', flat=True))
    if project.created_by_id:
        recipients.add(project.created_by_id)
    preview = (message.content or '')[:120]
    for user_id in recipients:
        Notification.objects.create(
            recipient_id=user_id,
            notification_type='client_message',
            message=f'New client message on {project.project_name}: {preview}',
            project=project,
        )


@api_view(['GET', 'POST'])
@authentication_classes([ClientJWTAuthentication])
@permission_classes([AllowAny])
def client_project_messages(request):
    client = request.user
    if not isinstance(client, Client) or client.contact_type != 'CL':
        return Response({'detail': 'Client authentication required.'}, status=status.HTTP_403_FORBIDDEN)

    project_id = request.query_params.get('project_id') or request.data.get('project_id')
    if not project_id:
        return Response({'error': 'project_id is required'}, status=status.HTTP_400_BAD_REQUEST)

    if not ClientProject.objects.filter(client=client, project_id=project_id).exists():
        return Response({'detail': 'You do not have access to this project.'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        messages = ClientProjectMessage.objects.filter(project_id=project_id, client=client).order_by('created_at')
        ClientProjectMessage.objects.filter(
            project_id=project_id, client=client, sender_type='studio', is_read=False
        ).update(is_read=True)
        return Response(ClientProjectMessageSerializer(messages, many=True).data)

    content = (request.data.get('content') or '').strip()
    if not content:
        return Response({'error': 'content is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        project = Project.objects.get(id=project_id)
    except Project.DoesNotExist:
        return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)

    message = ClientProjectMessage.objects.create(
        project=project,
        client=client,
        studio=project.studio,
        content=content,
        sender_type='client',
    )
    _notify_studio_of_client_message(message)
    return Response(ClientProjectMessageSerializer(message).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@authentication_classes([ClientJWTAuthentication])
@permission_classes([AllowAny])
def client_project_messages_unread(request):
    project_id = request.query_params.get('project_id')
    client = request.user
    if not project_id or not isinstance(client, Client):
        return Response({'count': 0})
    count = ClientProjectMessage.objects.filter(
        project_id=project_id,
        client=client,
        sender_type='studio',
        is_read=False,
    ).count()
    return Response({'count': count})
