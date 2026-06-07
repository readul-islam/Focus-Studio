from django.conf import settings
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .ai import generate_support_reply
from .models import HelpArticleFeedback, SupportConversation, SupportMessage


@api_view(['POST'])
@permission_classes([AllowAny])
def submit_article_feedback(request):
    category = (request.data.get('category') or '').strip()
    article_slug = (request.data.get('article_slug') or '').strip()
    rating = (request.data.get('rating') or '').strip()
    comment = (request.data.get('comment') or '').strip()[:2000]

    if not category or not article_slug:
        return Response({'detail': 'category and article_slug are required.'}, status=status.HTTP_400_BAD_REQUEST)

    if rating not in (HelpArticleFeedback.HELPFUL, HelpArticleFeedback.NOT_HELPFUL):
        return Response({'detail': 'rating must be helpful or not_helpful.'}, status=status.HTTP_400_BAD_REQUEST)

    user = request.user if request.user.is_authenticated else None

    HelpArticleFeedback.objects.create(
        category=category,
        article_slug=article_slug,
        rating=rating,
        comment=comment,
        user=user,
    )

    return Response({'detail': 'Thank you for your feedback.'}, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def article_feedback_summary(request, category: str, article_slug: str):
    qs = HelpArticleFeedback.objects.filter(category=category, article_slug=article_slug)
    helpful = qs.filter(rating=HelpArticleFeedback.HELPFUL).count()
    not_helpful = qs.filter(rating=HelpArticleFeedback.NOT_HELPFUL).count()
    return Response({'helpful': helpful, 'not_helpful': not_helpful, 'total': helpful + not_helpful})


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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def support_conversation(request):
    conversation = (
        SupportConversation.objects.filter(
            user=request.user,
            portal=SupportConversation.PORTAL_STUDIO,
        )
        .prefetch_related('messages')
        .order_by('-updated_at')
        .first()
    )
    if not conversation:
        return Response({'conversation_id': None, 'messages': []})
    return Response({
        'conversation_id': conversation.id,
        'messages': _serialize_messages(conversation),
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def support_chat(request):
    message = (request.data.get('message') or '').strip()
    if not message:
        return Response({'error': 'message is required.'}, status=status.HTTP_400_BAD_REQUEST)

    if not settings.OPENAI_API_KEY:
        return Response(
            {'error': 'AI support is not configured. Please email support@focuspilot.io.'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    conversation_id = request.data.get('conversation_id')
    page_path = (request.data.get('page_path') or '').strip()[:500]
    article_context = request.data.get('article_context') or []
    if not isinstance(article_context, list):
        article_context = []

    conversation = None
    if conversation_id:
        conversation = SupportConversation.objects.filter(
            id=conversation_id,
            user=request.user,
            portal=SupportConversation.PORTAL_STUDIO,
        ).first()

    if not conversation:
        conversation = SupportConversation.objects.create(
            user=request.user,
            portal=SupportConversation.PORTAL_STUDIO,
        )

    history = [
        {'role': msg.role, 'content': msg.content}
        for msg in conversation.messages.order_by('created_at')
    ]

    try:
        reply = generate_support_reply(
            user=request.user,
            message=message,
            history=history,
            page_path=page_path,
            article_context=article_context,
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

    return Response({
        'reply': reply,
        'conversation_id': conversation.id,
    })


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def support_conversation_clear(request):
    conversation_id = request.data.get('conversation_id')
    if conversation_id:
        conversation = get_object_or_404(
            SupportConversation,
            id=conversation_id,
            user=request.user,
            portal=SupportConversation.PORTAL_STUDIO,
        )
        conversation.delete()
    else:
        SupportConversation.objects.filter(
            user=request.user,
            portal=SupportConversation.PORTAL_STUDIO,
        ).delete()
    return Response({'detail': 'Conversation cleared.'})
