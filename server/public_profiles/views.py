from django.db.models import Avg
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema

from users.permissions import check_role_permission
from users.models import User
from projects.models import Project
from .models import (
    StudioPublicProfile, StudioPortfolioItem, StudioReview,
    StudioPublicTeamMember, validate_public_slug, PROJECT_TYPE_LABELS,
)
from .serializers import (
    StudioPublicProfileManageSerializer,
    StudioPortfolioItemSerializer,
    StudioReviewSerializer,
    PublicStudioProfileSerializer,
    ProjectPortfolioCandidateSerializer,
)
from .utils import suggest_slug_from_name, absolute_media_url


def _require_settings_edit(user):
    if not check_role_permission(user, 'settings.edit'):
        return Response({'detail': 'You do not have permission to edit studio settings.'}, status=403)
    return None


def _get_or_create_profile(studio):
    try:
        return StudioPublicProfile.objects.get(studio=studio)
    except StudioPublicProfile.DoesNotExist:
        base = suggest_slug_from_name(studio.name)
        slug = base
        n = 1
        while StudioPublicProfile.objects.filter(slug=slug).exists():
            slug = f'{base}-{n}'
            n += 1
        return StudioPublicProfile.objects.create(studio=studio, slug=slug)


def _build_public_payload(profile, request):
    studio = profile.studio
    portfolio = StudioPortfolioItem.objects.filter(
        studio=studio, is_published=True,
    ).select_related('project')
    reviews = StudioReview.objects.filter(studio=studio, is_published=True)
    review_stats = reviews.aggregate(avg=Avg('rating'))
    avg_rating = review_stats['avg']
    review_count = reviews.count()

    team = []
    if profile.show_team:
        highlights = list(
            StudioPublicTeamMember.objects.filter(
                profile=profile, is_visible=True,
            ).select_related('user').order_by('sort_order')
        )
        if highlights:
            for m in highlights:
                pic = None
                if m.user and m.user.profile_picture:
                    pic = absolute_media_url(request, m.user.profile_picture)
                team.append({'name': m.name, 'title': m.title, 'profile_picture_url': pic})
        else:
            members = User.objects.filter(
                studio=studio, is_active=True,
            ).exclude(role='').order_by('name')[:12]
            for u in members:
                pic = absolute_media_url(request, u.profile_picture) if u.profile_picture else None
                team.append({
                    'name': u.name or u.email.split('@')[0],
                    'title': u.title or '',
                    'profile_picture_url': pic,
                })

    data = {
        'slug': profile.slug,
        'studio_name': studio.name or 'Design Studio',
        'headline': profile.headline,
        'tagline': profile.tagline,
        'about': profile.about,
        'cover_image_url': absolute_media_url(request, profile.cover_image),
        'logo_url': absolute_media_url(request, studio.primary_logo) if studio.primary_logo else None,
        'location_display': profile.location_display,
        'founded_year': profile.founded_year,
        'team_size_display': profile.team_size_display,
        'services': profile.services or [],
        'specialties': profile.specialties or [],
        'website_url': profile.website_url,
        'linkedin_url': profile.linkedin_url,
        'instagram_url': profile.instagram_url,
        'pinterest_url': profile.pinterest_url,
        'houzz_url': profile.houzz_url,
        'contact_email_public': profile.contact_email_public or studio.support_email or '',
        'contact_phone_public': profile.contact_phone_public or studio.phone_number or '',
        'portfolio': StudioPortfolioItemSerializer(portfolio, many=True, context={'request': request}).data,
        'reviews': StudioReviewSerializer(reviews, many=True).data,
        'team': team,
        'average_rating': round(avg_rating, 1) if avg_rating is not None else None,
        'review_count': review_count,
    }
    return data


@extend_schema(tags=['Public profiles'])
@api_view(['GET'])
@permission_classes([AllowAny])
def public_studio_by_slug(request, slug):
    """Public studio profile — only when published."""
    try:
        profile = StudioPublicProfile.objects.select_related('studio').get(slug=slug)
    except StudioPublicProfile.DoesNotExist:
        return Response({'detail': 'Profile not found.'}, status=404)
    if not profile.is_published:
        return Response({'detail': 'This profile is not published.'}, status=404)
    profile.studio.refresh_from_db()
    data = _build_public_payload(profile, request)
    response = Response(data)
    response['Cache-Control'] = 'no-store, max-age=0'
    return response


@extend_schema(tags=['Public profiles'])
@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def manage_profile(request):
    """Get or update the authenticated studio's public profile."""
    studio = request.user.studio
    if not studio:
        return Response({'error': 'No studio found.'}, status=400)
    if request.method != 'GET':
        denied = _require_settings_edit(request.user)
        if denied:
            return denied

    profile = _get_or_create_profile(studio)
    profile.studio.refresh_from_db()

    if request.method == 'GET':
        ser = StudioPublicProfileManageSerializer(profile, context={'request': request})
        return Response(ser.data)

    ser = StudioPublicProfileManageSerializer(
        profile, data=request.data, partial=True, context={'request': request},
    )
    ser.is_valid(raise_exception=True)
    ser.save()
    return Response(ser.data)


@extend_schema(tags=['Public profiles'])
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def publish_profile(request):
    denied = _require_settings_edit(request.user)
    if denied:
        return denied
    studio = request.user.studio
    if not studio:
        return Response({'error': 'No studio found.'}, status=400)
    profile = _get_or_create_profile(studio)
    publish = request.data.get('is_published', True)
    if publish and not profile.headline.strip():
        return Response(
            {'detail': 'Add a headline before publishing.'},
            status=status.HTTP_400_BAD_REQUEST,
        )
    profile.is_published = bool(publish)
    profile.save(update_fields=['is_published', 'updated_at'])
    ser = StudioPublicProfileManageSerializer(profile, context={'request': request})
    return Response(ser.data)


@extend_schema(tags=['Public profiles'])
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_slug(request):
    slug = (request.query_params.get('slug') or '').strip().lower()
    if not slug:
        return Response({'available': False, 'detail': 'Slug required.'})
    try:
        validate_public_slug(slug)
    except Exception as e:
        return Response({'available': False, 'detail': str(e.messages[0] if hasattr(e, 'messages') else e)})
    profile = StudioPublicProfile.objects.filter(slug=slug).first()
    if profile and profile.studio_id != request.user.studio_id:
        return Response({'available': False})
    return Response({'available': True, 'slug': slug})


@extend_schema(tags=['Public profiles'])
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def portfolio_items(request):
    studio = request.user.studio
    if not studio:
        return Response({'error': 'No studio found.'}, status=400)
    _get_or_create_profile(studio)

    if request.method == 'GET':
        items = StudioPortfolioItem.objects.filter(studio=studio)
        return Response(StudioPortfolioItemSerializer(items, many=True, context={'request': request}).data)

    denied = _require_settings_edit(request.user)
    if denied:
        return denied
    ser = StudioPortfolioItemSerializer(data=request.data, context={'request': request})
    ser.is_valid(raise_exception=True)
    item = ser.save(studio=studio)
    return Response(StudioPortfolioItemSerializer(item, context={'request': request}).data, status=201)


@extend_schema(tags=['Public profiles'])
@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def portfolio_item_detail(request, item_id):
    studio = request.user.studio
    try:
        item = StudioPortfolioItem.objects.get(pk=item_id, studio=studio)
    except StudioPortfolioItem.DoesNotExist:
        return Response({'detail': 'Not found.'}, status=404)

    if request.method == 'GET':
        return Response(StudioPortfolioItemSerializer(item, context={'request': request}).data)

    denied = _require_settings_edit(request.user)
    if denied:
        return denied

    if request.method == 'DELETE':
        item.delete()
        return Response(status=204)

    ser = StudioPortfolioItemSerializer(item, data=request.data, partial=True, context={'request': request})
    ser.is_valid(raise_exception=True)
    ser.save()
    return Response(ser.data)


@extend_schema(tags=['Public profiles'])
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def reviews_list(request):
    studio = request.user.studio
    if not studio:
        return Response({'error': 'No studio found.'}, status=400)

    if request.method == 'GET':
        items = StudioReview.objects.filter(studio=studio)
        return Response(StudioReviewSerializer(items, many=True).data)

    denied = _require_settings_edit(request.user)
    if denied:
        return denied
    ser = StudioReviewSerializer(data=request.data)
    ser.is_valid(raise_exception=True)
    review = ser.save(studio=studio)
    return Response(StudioReviewSerializer(review).data, status=201)


@extend_schema(tags=['Public profiles'])
@api_view(['PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def review_detail(request, review_id):
    studio = request.user.studio
    try:
        review = StudioReview.objects.get(pk=review_id, studio=studio)
    except StudioReview.DoesNotExist:
        return Response({'detail': 'Not found.'}, status=404)

    denied = _require_settings_edit(request.user)
    if denied:
        return denied

    if request.method == 'DELETE':
        review.delete()
        return Response(status=204)

    ser = StudioReviewSerializer(review, data=request.data, partial=True)
    ser.is_valid(raise_exception=True)
    ser.save()
    return Response(ser.data)


@extend_schema(tags=['Public profiles'])
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def project_candidates(request):
    """Completed/archived projects available to add to portfolio."""
    studio = request.user.studio
    qs = Project.objects.filter(studio=studio).filter(
        project_status__in=['COM', 'ARC', 'WON'],
    ).order_by('-end_date', '-created_at')
    return Response(
        ProjectPortfolioCandidateSerializer(qs, many=True, context={'request': request}).data,
    )


@extend_schema(tags=['Public profiles'])
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def import_projects(request):
    """Create portfolio items from selected project IDs."""
    denied = _require_settings_edit(request.user)
    if denied:
        return denied
    studio = request.user.studio
    project_ids = request.data.get('project_ids') or []
    if not isinstance(project_ids, list):
        return Response({'detail': 'project_ids must be a list.'}, status=400)

    created = []
    for pid in project_ids:
        try:
            project = Project.objects.get(pk=pid, studio=studio)
        except Project.DoesNotExist:
            continue
        if StudioPortfolioItem.objects.filter(studio=studio, project=project).exists():
            continue
        title = project.portfolio_title or project.project_name or 'Project'
        summary = project.portfolio_summary or (project.project_description or '')[:500]
        location = project.location or ''
        year = project.end_date.year if project.end_date else None
        item = StudioPortfolioItem.objects.create(
            studio=studio,
            project=project,
            title=title,
            summary=summary,
            location=location,
            project_type=project.project_type or '',
            year=year,
            sort_order=project.portfolio_order or 0,
            is_featured=project.portfolio_featured,
        )
        created.append(item)

    return Response(
        StudioPortfolioItemSerializer(created, many=True, context={'request': request}).data,
        status=201,
    )
