from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from users.models import Studio
from .auth import StudioApiKeyAuthentication
from .events import (
    ALL_EVENTS,
    EVENT_LABELS,
    EVENT_PROJECT_CREATED,
    emit_studio_event,
    normalize_webhook_events,
    notify_client_created,
)
from .models import StudioApiKey, WebhookEndpoint
from .utils import deliver_webhook, generate_api_key


def _require_studio(user):
    if not user.studio_id:
        return None, Response({'error': 'User does not belong to a studio'}, status=400)
    return user.studio, None


# --- API keys (JWT) ---


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def api_keys_list_create(request):
    studio, err = _require_studio(request.user)
    if err:
        return err

    if request.method == 'GET':
        keys = StudioApiKey.objects.filter(studio=studio, revoked_at__isnull=True)
        return Response([
            {
                'id': k.id,
                'name': k.name,
                'prefix': k.prefix,
                'token': f'{k.prefix}…',
                'created_at': k.created_at.isoformat(),
                'last_used_at': k.last_used_at.isoformat() if k.last_used_at else None,
            }
            for k in keys
        ])

    name = (request.data.get('name') or 'Zapier').strip()[:120]
    raw, prefix, key_hash = generate_api_key()
    key = StudioApiKey.objects.create(
        studio=studio,
        name=name,
        prefix=prefix,
        key_hash=key_hash,
        created_by=request.user,
    )
    return Response(
        {
            'id': key.id,
            'name': key.name,
            'token': raw,
            'prefix': prefix,
            'created_at': key.created_at.isoformat(),
            'message': 'Copy this key now — it will not be shown again.',
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def api_keys_revoke(request, key_id):
    studio, err = _require_studio(request.user)
    if err:
        return err
    key = get_object_or_404(StudioApiKey, id=key_id, studio=studio, revoked_at__isnull=True)
    from django.utils import timezone

    key.revoked_at = timezone.now()
    key.save(update_fields=['revoked_at'])
    return Response(status=status.HTTP_204_NO_CONTENT)


# --- Webhooks (JWT) ---


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def webhooks_list_create(request):
    studio, err = _require_studio(request.user)
    if err:
        return err

    if request.method == 'GET':
        hooks = WebhookEndpoint.objects.filter(studio=studio)
        return Response([
            {
                'id': h.id,
                'url': h.url,
                'events': h.events,
                'is_active': h.is_active,
                'secret': h.secret,
                'created_at': h.created_at.isoformat(),
            }
            for h in hooks
        ])

    url = (request.data.get('url') or '').strip()
    if not url:
        return Response({'error': 'url is required'}, status=400)

    events = normalize_webhook_events(request.data.get('events') or ['*'])
    if events is None:
        return Response({'error': 'events must include valid types or *'}, status=400)

    hook = WebhookEndpoint.objects.create(
        studio=studio,
        url=url,
        secret=WebhookEndpoint.generate_secret(),
        events=events,
        created_by=request.user,
    )
    return Response(
        {
            'id': hook.id,
            'url': hook.url,
            'events': hook.events,
            'is_active': hook.is_active,
            'secret': hook.secret,
            'created_at': hook.created_at.isoformat(),
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(['PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def webhooks_detail(request, hook_id):
    studio, err = _require_studio(request.user)
    if err:
        return err
    hook = get_object_or_404(WebhookEndpoint, id=hook_id, studio=studio)

    if request.method == 'DELETE':
        hook.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    if 'url' in request.data:
        hook.url = request.data['url'].strip()
    if 'events' in request.data:
        events = normalize_webhook_events(request.data['events'])
        if events is None:
            return Response({'error': 'events must include valid types or *'}, status=400)
        hook.events = events
    if 'is_active' in request.data:
        hook.is_active = bool(request.data['is_active'])
    hook.save()
    return Response(
        {
            'id': hook.id,
            'url': hook.url,
            'events': hook.events,
            'is_active': hook.is_active,
            'secret': hook.secret,
        }
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def webhooks_test(request, hook_id):
    studio, err = _require_studio(request.user)
    if err:
        return err
    hook = get_object_or_404(WebhookEndpoint, id=hook_id, studio=studio)
    result = deliver_webhook(
        hook,
        'ping',
        {
            'message': 'Test event from Focuspilot',
            'studio_id': studio.id,
            'studio_name': studio.name,
        },
    )
    return Response(result)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def webhook_event_types(request):
    return Response({
        'events': ALL_EVENTS,
        'labels': EVENT_LABELS,
    })


# --- Zapier / automation REST (API key) ---


def _studio_from_api_key(request):
    studio = getattr(request, 'studio', None)
    if studio is None:
        return None, Response({'error': 'Valid API key required'}, status=status.HTTP_401_UNAUTHORIZED)
    return studio, None


@api_view(['GET'])
@authentication_classes([StudioApiKeyAuthentication])
@permission_classes([AllowAny])
def v1_list_projects(request):
    from projects.models import Project

    studio, err = _studio_from_api_key(request)
    if err:
        return err
    projects = Project.objects.filter(studio=studio).order_by('-id')[:100]
    return Response([
        {
            'id': p.id,
            'project_name': p.project_name,
            'project_status': p.project_status,
            'created_at': p.created_at.isoformat() if p.created_at else None,
        }
        for p in projects
    ])


@api_view(['POST'])
@authentication_classes([StudioApiKeyAuthentication])
@permission_classes([AllowAny])
def v1_create_project(request):
    from projects.models import Project

    studio, err = _studio_from_api_key(request)
    if err:
        return err
    name = (request.data.get('project_name') or request.data.get('name') or '').strip()
    if not name:
        return Response({'error': 'project_name is required'}, status=400)

    project = Project.objects.create(
        project_name=name,
        project_status=request.data.get('project_status') or 'AC',
        studio=studio,
        created_by=None,
    )
    emit_studio_event(
        studio,
        EVENT_PROJECT_CREATED,
        {'id': project.id, 'project_name': project.project_name},
    )
    return Response(
        {'id': project.id, 'project_name': project.project_name},
        status=status.HTTP_201_CREATED,
    )


def _serialize_client(client) -> dict:
    return {
        'id': client.id,
        'contact_type': client.contact_type,
        'company_name': client.company_name,
        'name': client.name,
        'surname': client.surname,
        'email': client.email,
        'phone': client.phone,
        'status': client.status,
        'created_at': client.created_at.isoformat() if client.created_at else None,
    }


@api_view(['GET'])
@authentication_classes([StudioApiKeyAuthentication])
@permission_classes([AllowAny])
def v1_list_clients(request):
    from crm.models import Client

    studio, err = _studio_from_api_key(request)
    if err:
        return err
    qs = Client.objects.filter(studio=studio).order_by('-id')
    contact_type = (request.GET.get('contact_type') or '').strip().upper()
    if contact_type:
        qs = qs.filter(contact_type=contact_type)
    return Response([_serialize_client(c) for c in qs[:100]])


@api_view(['POST'])
@authentication_classes([StudioApiKeyAuthentication])
@permission_classes([AllowAny])
def v1_create_client(request):
    from crm.models import Client

    studio, err = _studio_from_api_key(request)
    if err:
        return err
    name = (request.data.get('name') or '').strip() or None
    company_name = (request.data.get('company_name') or '').strip() or None
    if not name and not company_name:
        return Response(
            {'error': 'name or company_name is required'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    contact_type = (request.data.get('contact_type') or 'CL').strip().upper()
    if contact_type not in ('CL', 'SP', 'CN'):
        return Response(
            {'error': 'contact_type must be CL, SP, or CN'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    client = Client.objects.create(
        studio=studio,
        contact_type=contact_type,
        name=name,
        surname=(request.data.get('surname') or '').strip() or None,
        company_name=company_name,
        email=(request.data.get('email') or '').strip() or None,
        phone=(request.data.get('phone') or '').strip() or None,
        status=(request.data.get('status') or 'NE').strip().upper() or 'NE',
    )
    notify_client_created(studio, client)
    return Response(_serialize_client(client), status=status.HTTP_201_CREATED)
