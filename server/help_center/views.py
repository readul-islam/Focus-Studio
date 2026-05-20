from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import HelpArticleFeedback


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
    """Admin-style counts for an article (optional future use)."""
    qs = HelpArticleFeedback.objects.filter(category=category, article_slug=article_slug)
    helpful = qs.filter(rating=HelpArticleFeedback.HELPFUL).count()
    not_helpful = qs.filter(rating=HelpArticleFeedback.NOT_HELPFUL).count()
    return Response({'helpful': helpful, 'not_helpful': not_helpful, 'total': helpful + not_helpful})
