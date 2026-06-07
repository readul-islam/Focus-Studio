from django.conf import settings
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from crm.models import Client

from .models import SupportConversation, SupportMessage
from .portal_ai import generate_portal_support_reply
from .portal_knowledge import search_portal_faq


def _serialize_messages(conversation: SupportConversation):
    return [
        {
            'id': msg.id,
            'role': msg.role,
            'content': msg.content,
            'created_at': msg.created_at.isoformat(),
        }
        for msg in conversation.messages.order_by('created_at')
    ]


def _get_portal_conversation(portal: str, portal_client: Client, conversation_id=None):
    if conversation_id:
        return SupportConversation.objects.filter(
            id=conversation_id,
            portal=portal,
            portal_client=portal_client,
        ).first()
    return (
        SupportConversation.objects.filter(portal=portal, portal_client=portal_client)
        .order_by('-updated_at')
        .first()
    )


def _portal_chat_view(request, portal: str, auth_class):
    """Shared handler for client and contractor portal support chat."""
    if not settings.OPENAI_API_KEY:
        return Response(
            {'error': 'AI support is not configured. Please email support@focuspilot.io.'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    portal_client = request.user
    if not isinstance(portal_client, Client):
        return Response({'error': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)

    expected_type = 'CL' if portal == SupportConversation.PORTAL_CLIENT else 'CN'
    if portal_client.contact_type != expected_type:
        return Response({'error': 'Invalid portal account.'}, status=status.HTTP_403_FORBIDDEN)

    message = (request.data.get('message') or '').strip()
    if not message:
        return Response({'error': 'message is required.'}, status=status.HTTP_400_BAD_REQUEST)

    conversation_id = request.data.get('conversation_id')
    page_path = (request.data.get('page_path') or '').strip()[:500]
    project_name = (request.data.get('project_name') or '').strip()[:200]

    conversation = _get_portal_conversation(portal, portal_client, conversation_id)
    if not conversation:
        conversation = SupportConversation.objects.create(portal=portal, portal_client=portal_client)

    history = [
        {'role': msg.role, 'content': msg.content}
        for msg in conversation.messages.order_by('created_at')
    ]

    try:
        reply = generate_portal_support_reply(
            portal=portal,
            portal_user=portal_client,
            message=message,
            history=history,
            page_path=page_path,
            project_name=project_name,
        )
    except ValueError as exc:
        return Response({'error': str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    except Exception:
        return Response(
            {'error': 'Something went wrong. Please try again or email support@focuspilot.io.'},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    with transaction.atomic():
        SupportMessage.objects.create(
            conversation=conversation,
            role=SupportMessage.ROLE_USER,
            content=message,
        )
        SupportMessage.objects.create(
            conversation=conversation,
            role=SupportMessage.ROLE_ASSISTANT,
            content=reply,
        )
        conversation.save(update_fields=['updated_at'])

    faq = search_portal_faq(portal, message, limit=3)

    return Response({
        'reply': reply,
        'conversation_id': conversation.id,
        'related_faq': [{'title': f['title'], 'id': f['id']} for f in faq],
    })


def _portal_conversation_view(request, portal: str):
    portal_client = request.user
    if not isinstance(portal_client, Client):
        return Response({'error': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)

    conversation = _get_portal_conversation(portal, portal_client)
    if not conversation:
        return Response({'conversation_id': None, 'messages': []})

    return Response({
        'conversation_id': conversation.id,
        'messages': _serialize_messages(conversation),
    })


def _portal_clear_view(request, portal: str):
    portal_client = request.user
    if not isinstance(portal_client, Client):
        return Response({'error': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)

    conversation_id = request.data.get('conversation_id')
    if conversation_id:
        conversation = get_object_or_404(
            SupportConversation,
            id=conversation_id,
            portal=portal,
            portal_client=portal_client,
        )
        conversation.delete()
    else:
        SupportConversation.objects.filter(portal=portal, portal_client=portal_client).delete()

    return Response({'detail': 'Conversation cleared.'})


def make_portal_support_views(auth_class, portal: str):
    """Factory for portal-specific support endpoints."""

    @api_view(['GET'])
    @authentication_classes([auth_class])
    @permission_classes([AllowAny])
    def conversation(request):
        return _portal_conversation_view(request, portal)

    @api_view(['POST'])
    @authentication_classes([auth_class])
    @permission_classes([AllowAny])
    def chat(request):
        return _portal_chat_view(request, portal, auth_class)

    @api_view(['DELETE'])
    @authentication_classes([auth_class])
    @permission_classes([AllowAny])
    def clear(request):
        return _portal_clear_view(request, portal)

    return conversation, chat, clear
