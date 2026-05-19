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
from .models import NotionToken
from .utils import probe_notion_connection, search_databases


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
    results = search_databases(token.access_token, query)
    return Response([
        {
            'id': db.get('id'),
            'title': _database_title(db),
            'url': db.get('url'),
        }
        for db in results
    ])


def _database_title(db: dict) -> str:
    title_parts = db.get('title') or []
    if title_parts and isinstance(title_parts[0], dict):
        return title_parts[0].get('plain_text', 'Untitled')
    return 'Untitled'


def is_notion_connected(studio) -> bool:
    if not studio or not getattr(studio, 'notion', False):
        return False
    try:
        token = NotionToken.objects.get(studio=studio)
    except NotionToken.DoesNotExist:
        return False
    return probe_notion_connection(token.access_token)
