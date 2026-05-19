import base64
import secrets

import requests
from django.conf import settings
from django.core.cache import cache
from django.http import HttpResponseRedirect
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from users.models import Studio, User
from .models import NotionProjectMapping, NotionToken
from .sync import sync_notion_projects
from .utils import (
    default_title_property,
    get_database_schema,
    mappable_properties,
    probe_notion_connection,
    search_databases,
)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notion_connect(request):
    client_id = getattr(settings, 'NOTION_CLIENT_ID', '')
    redirect_uri = getattr(settings, 'NOTION_REDIRECT_URI', '')
    if not client_id or not redirect_uri:
        return Response({'error': 'Notion OAuth is not configured on the server'}, status=503)

    if not request.user.studio_id:
        return Response({'error': 'User does not belong to a studio'}, status=400)

    nonce = secrets.token_urlsafe(32)
    cache.set(f"notion_oauth_state:{nonce}", request.user.studio_id, timeout=600)

    auth_url = (
        'https://api.notion.com/v1/oauth/authorize'
        f'?client_id={client_id}'
        '&response_type=code'
        '&owner=user'
        f'&redirect_uri={redirect_uri}'
        f'&state={nonce}'
    )
    return Response({'auth_url': auth_url})


@api_view(['GET'])
@permission_classes([AllowAny])
def notion_callback(request):
    frontend = settings.FRONTEND_URL.rstrip('/')
    error = request.GET.get('error')
    if error:
        return HttpResponseRedirect(f'{frontend}/oauth/notion/callback?status=error')

    code = request.GET.get('code')
    nonce = request.GET.get('state', '')
    studio_id = cache.get(f'notion_oauth_state:{nonce}')
    if not code or not studio_id:
        return HttpResponseRedirect(f'{frontend}/oauth/notion/callback?status=error')

    cache.delete(f'notion_oauth_state:{nonce}')

    try:
        studio = Studio.objects.get(id=studio_id)
    except Studio.DoesNotExist:
        return HttpResponseRedirect(f'{frontend}/oauth/notion/callback?status=error')

    client_id = settings.NOTION_CLIENT_ID
    client_secret = settings.NOTION_CLIENT_SECRET
    redirect_uri = settings.NOTION_REDIRECT_URI

    credentials = base64.b64encode(f'{client_id}:{client_secret}'.encode()).decode()
    token_resp = requests.post(
        'https://api.notion.com/v1/oauth/token',
        headers={
            'Authorization': f'Basic {credentials}',
            'Content-Type': 'application/json',
        },
        json={
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': redirect_uri,
        },
        timeout=15,
    )
    if token_resp.status_code != 200:
        return HttpResponseRedirect(f'{frontend}/oauth/notion/callback?status=error')

    data = token_resp.json()
    workspace_name = ''
    workspace_id = data.get('workspace_id', '')
    if isinstance(data.get('workspace_name'), str):
        workspace_name = data['workspace_name']
    elif isinstance(data.get('workspace'), dict):
        workspace_name = data['workspace'].get('name', '')

    NotionToken.objects.update_or_create(
        studio=studio,
        defaults={
            'access_token': data.get('access_token', ''),
            'workspace_id': workspace_id or '',
            'workspace_name': workspace_name,
            'bot_id': data.get('bot_id', ''),
        },
    )
    studio.notion = True
    studio.save(update_fields=['notion'])

    return HttpResponseRedirect(f'{frontend}/oauth/notion/callback?status=success')


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def notion_disconnect(request):
    if not request.user.studio_id:
        return Response({'error': 'User does not belong to a studio'}, status=400)
    studio = request.user.studio
    NotionToken.objects.filter(studio=studio).delete()
    NotionProjectMapping.objects.filter(studio=studio).delete()
    studio.notion = False
    studio.save(update_fields=['notion'])
    return Response({'message': 'Notion disconnected'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notion_databases(request):
    if not request.user.studio_id:
        return Response({'error': 'User does not belong to a studio'}, status=400)
    try:
        token = NotionToken.objects.get(studio=request.user.studio)
    except NotionToken.DoesNotExist:
        return Response({'error': 'Notion not connected'}, status=400)

    query = request.GET.get('q', '')
    results, error = search_databases(token.access_token, query)
    if error:
        return Response({'error': error}, status=502)
    return Response([
        {
            'id': db.get('id'),
            'title': _database_title(db),
            'url': db.get('url'),
        }
        for db in results
    ])


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notion_status(request):
    if not request.user.studio_id:
        return Response({'error': 'User does not belong to a studio'}, status=400)
    try:
        token = NotionToken.objects.get(studio=request.user.studio)
    except NotionToken.DoesNotExist:
        return Response({'connected': False})

    mapping = None
    try:
        m = NotionProjectMapping.objects.get(studio=request.user.studio)
        mapping = {
            'database_id': m.database_id,
            'database_title': m.database_title,
            'title_property': m.title_property,
            'status_property': m.status_property,
            'is_enabled': m.is_enabled,
            'last_synced_at': m.last_synced_at.isoformat() if m.last_synced_at else None,
        }
    except NotionProjectMapping.DoesNotExist:
        pass

    return Response({
        'connected': is_notion_connected(request.user.studio),
        'workspace_name': token.workspace_name or '',
        'mapping': mapping,
    })


def _mapping_payload(mapping: NotionProjectMapping) -> dict:
    return {
        'database_id': mapping.database_id,
        'database_title': mapping.database_title,
        'title_property': mapping.title_property,
        'status_property': mapping.status_property,
        'is_enabled': mapping.is_enabled,
        'last_synced_at': mapping.last_synced_at.isoformat() if mapping.last_synced_at else None,
    }


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def notion_project_mapping(request):
    if not request.user.studio_id:
        return Response({'error': 'User does not belong to a studio'}, status=400)

    studio = request.user.studio

    if request.method == 'GET':
        try:
            mapping = NotionProjectMapping.objects.get(studio=studio)
        except NotionProjectMapping.DoesNotExist:
            return Response({'configured': False})
        return Response({'configured': True, **_mapping_payload(mapping)})

    database_id = (request.data.get('database_id') or '').strip()
    if not database_id:
        return Response({'error': 'database_id is required'}, status=400)

    title_property = (request.data.get('title_property') or '').strip()
    status_property = (request.data.get('status_property') or '').strip()
    database_title = (request.data.get('database_title') or '').strip()
    is_enabled = request.data.get('is_enabled', True)

    if not title_property:
        try:
            token = NotionToken.objects.get(studio=studio)
            props, err = get_database_schema(token.access_token, database_id)
            if err:
                return Response({'error': err}, status=502)
            title_property = default_title_property(props or {})
        except NotionToken.DoesNotExist:
            return Response({'error': 'Notion not connected'}, status=400)

    mapping, _ = NotionProjectMapping.objects.update_or_create(
        studio=studio,
        defaults={
            'database_id': database_id,
            'database_title': database_title,
            'title_property': title_property,
            'status_property': status_property,
            'is_enabled': bool(is_enabled),
            'updated_by': request.user,
        },
    )
    return Response({'configured': True, **_mapping_payload(mapping)})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def notion_project_sync(request):
    if not request.user.studio_id:
        return Response({'error': 'User does not belong to a studio'}, status=400)

    result = sync_notion_projects(request.user.studio, user=request.user)
    if result.get('error') and not result.get('created') and not result.get('updated'):
        return Response(result, status=400)
    return Response(result)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notion_database_schema(request, database_id):
    if not request.user.studio_id:
        return Response({'error': 'User does not belong to a studio'}, status=400)
    try:
        token = NotionToken.objects.get(studio=request.user.studio)
    except NotionToken.DoesNotExist:
        return Response({'error': 'Notion not connected'}, status=400)

    properties, error = get_database_schema(token.access_token, database_id)
    if error:
        return Response({'error': error}, status=502)

    mapped = mappable_properties(properties or {})
    return Response({
        'database_id': database_id,
        'title_properties': mapped['title_properties'],
        'status_properties': mapped['status_properties'],
        'default_title_property': default_title_property(properties or {}),
    })


def _database_title(db: dict) -> str:
    for key in ('title', 'name'):
        parts = db.get(key)
        if isinstance(parts, str) and parts.strip():
            return parts.strip()
        if isinstance(parts, list) and parts:
            first = parts[0]
            if isinstance(first, dict):
                plain = first.get('plain_text')
                if plain:
                    return plain
                text = first.get('text')
                if isinstance(text, dict) and text.get('content'):
                    return text['content']
    return 'Untitled'


def is_notion_connected(studio) -> bool:
    if not studio or not getattr(studio, 'notion', False):
        return False
    try:
        token = NotionToken.objects.get(studio=studio)
    except NotionToken.DoesNotExist:
        return False
    return probe_notion_connection(token.access_token)
