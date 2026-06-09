import secrets
from datetime import timedelta

import requests
from django.conf import settings
from django.core.cache import cache
from django.http import HttpResponseRedirect
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from users.models import Studio, User

from .models import QuickBooksToken
from .utils import quickbooks_configured

INTUIT_AUTH_URL = 'https://appcenter.intuit.com/connect/oauth2'
INTUIT_TOKEN_URL = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer'


@api_view(['GET'])
@permission_classes([AllowAny])
def quickbooks_connect(request):
    if not quickbooks_configured():
        return HttpResponseRedirect(f'{settings.FRONTEND_URL}/oauth/quickbooks/callback?status=not_configured')

    try:
        studio_id = User.objects.get(id=request.GET.get('user_id')).studio.id
    except (User.DoesNotExist, AttributeError):
        return HttpResponseRedirect(f'{settings.FRONTEND_URL}/oauth/quickbooks/callback?status=error')

    nonce = secrets.token_urlsafe(32)
    cache.set(f'qb_oauth_state:{nonce}', studio_id, timeout=600)

    scope = getattr(settings, 'QUICKBOOKS_SCOPE', 'com.intuit.quickbooks.accounting')
    redirect_uri = settings.QUICKBOOKS_REDIRECT_URI
    auth_url = (
        f'{INTUIT_AUTH_URL}'
        f'?client_id={settings.QUICKBOOKS_CLIENT_ID}'
        f'&redirect_uri={redirect_uri}'
        f'&response_type=code'
        f'&scope={scope}'
        f'&state={nonce}'
    )
    return HttpResponseRedirect(auth_url)


@api_view(['GET'])
@permission_classes([AllowAny])
def quickbooks_callback(request):
    error = request.GET.get('error')
    if error:
        return HttpResponseRedirect(f'{settings.FRONTEND_URL}/oauth/quickbooks/callback?status=error')

    code = request.GET.get('code')
    realm_id = request.GET.get('realmId', '')
    nonce = request.GET.get('state', '')
    studio_id = cache.get(f'qb_oauth_state:{nonce}')
    if not code or not studio_id:
        return HttpResponseRedirect(f'{settings.FRONTEND_URL}/oauth/quickbooks/callback?status=error')

    cache.delete(f'qb_oauth_state:{nonce}')

    try:
        studio = Studio.objects.get(id=studio_id)
    except Studio.DoesNotExist:
        return HttpResponseRedirect(f'{settings.FRONTEND_URL}/oauth/quickbooks/callback?status=error')

    response = requests.post(
        INTUIT_TOKEN_URL,
        data={
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': settings.QUICKBOOKS_REDIRECT_URI,
        },
        auth=(settings.QUICKBOOKS_CLIENT_ID, settings.QUICKBOOKS_CLIENT_SECRET),
        headers={'Accept': 'application/json'},
        timeout=30,
    )
    if response.status_code != 200:
        return HttpResponseRedirect(f'{settings.FRONTEND_URL}/oauth/quickbooks/callback?status=error')

    token_data = response.json()
    QuickBooksToken.objects.update_or_create(
        studio=studio,
        realm_id=realm_id or '',
        defaults={
            'access_token': token_data.get('access_token', ''),
            'refresh_token': token_data.get('refresh_token', ''),
            'expires_at': timezone.now() + timedelta(seconds=int(token_data.get('expires_in', 3600))),
            'token_type': token_data.get('token_type', 'Bearer'),
        },
    )
    studio.quickbooks = True
    studio.save(update_fields=['quickbooks'])
    return HttpResponseRedirect(f'{settings.FRONTEND_URL}/oauth/quickbooks/callback?status=success')


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def quickbooks_disconnect(request):
    studio = request.user.studio
    if not studio:
        return Response({'error': 'No studio associated with this account.'}, status=400)
    QuickBooksToken.objects.filter(studio=studio).delete()
    studio.quickbooks = False
    studio.save(update_fields=['quickbooks'])
    return Response({'message': 'QuickBooks disconnected.'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def quickbooks_status(request):
    studio = request.user.studio
    if not studio:
        return Response({'configured': quickbooks_configured(), 'connected': False})
    connected = studio.quickbooks and QuickBooksToken.objects.filter(studio=studio).exists()
    token = QuickBooksToken.objects.filter(studio=studio).order_by('-updated_at').first()
    return Response({
        'configured': quickbooks_configured(),
        'connected': connected,
        'realm_id': token.realm_id if token else '',
    })
