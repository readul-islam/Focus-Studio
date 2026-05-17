"""
Google Sign-In / Sign-Up for studio accounts (openid + email + profile).

Configure GOOGLE_AUTH_* in .env (or reuse GMAIL_CLIENT_ID / GMAIL_CLIENT_SECRET).
Add this redirect URI in Google Cloud Console:
  {API_URL}/user/google/callback/
"""
import base64
import secrets
from urllib.parse import urlencode

import requests
from django.conf import settings
from django.core.cache import cache
from django.http import HttpResponseRedirect
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .auth_cookies import set_auth_cookies
from .models import User, OtpVerification


def _google_configured() -> bool:
    return bool(settings.GOOGLE_AUTH_CLIENT_ID and settings.GOOGLE_AUTH_CLIENT_SECRET)


def _marketing_callback_url(**params) -> str:
    """Errors during landing-site signup — show message on marketing."""
    base = f"{settings.MARKETING_URL.rstrip('/')}/auth/google/callback"
    if not params:
        return base
    return f"{base}?{urlencode(params)}"


def _frontend_callback_url(**params) -> str:
    """Success + session handoff — studio app verifies cookies via /user/self/."""
    base = f"{settings.FRONTEND_URL.rstrip('/')}/auth/google/callback"
    if not params:
        return base
    return f"{base}?{urlencode(params)}"


def _encode_next(next_path: str | None) -> str:
    if not next_path or not next_path.startswith('/') or next_path.startswith('//'):
        return ''
    return base64.urlsafe_b64encode(next_path.encode()).decode().rstrip('=')


def _decode_next(encoded: str) -> str:
    if not encoded:
        return '/home/dashboard'
    try:
        pad = '=' * (-len(encoded) % 4)
        raw = base64.urlsafe_b64decode(encoded + pad).decode()
        if raw.startswith('/') and not raw.startswith('//'):
            return raw
    except Exception:
        pass
    return '/home/dashboard'


def _normalize_redirect_uri(uri: str) -> str:
    """Google requires an exact redirect_uri match (including trailing slash)."""
    uri = (uri or '').strip()
    if not uri.endswith('/'):
        uri += '/'
    return uri


def _redirect_uri_for_request(request) -> str:
    """
    Dev: build from the host the browser used (localhost vs 127.0.0.1).
    Prod: use GOOGLE_AUTH_REDIRECT_URI from .env.
    """
    if settings.DEBUG:
        return _normalize_redirect_uri(request.build_absolute_uri('/user/google/callback/'))
    return _normalize_redirect_uri(settings.GOOGLE_AUTH_REDIRECT_URI)


@api_view(['GET'])
@permission_classes([AllowAny])
def google_oauth_debug(request):
    """Dev helper — open in browser to see the redirect_uri Google must allow."""
    redirect_uri = _redirect_uri_for_request(request)
    return Response({
        'redirect_uri': redirect_uri,
        'client_id': settings.GOOGLE_AUTH_CLIENT_ID,
        'google_console_hint': (
            'Add this exact redirect_uri under Credentials → your OAuth client → '
            'Authorized redirect URIs. Must match the same OAuth client as client_id above.'
        ),
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def google_auth_start(request):
    """Redirect browser to Google OAuth consent screen."""
    if not _google_configured():
        return HttpResponseRedirect(
            _marketing_callback_url(status='error', code='not_configured')
        )

    mode = request.GET.get('mode', 'login')
    if mode not in ('login', 'signup'):
        mode = 'login'

    next_path = _encode_next(request.GET.get('next'))

    redirect_uri = _redirect_uri_for_request(request)

    nonce = secrets.token_urlsafe(32)
    cache.set(
        f'google_auth_state:{nonce}',
        {'mode': mode, 'next': next_path, 'redirect_uri': redirect_uri},
        timeout=600,
    )

    state = f"{nonce}:{mode}:{next_path}"
    params = {
        'response_type': 'code',
        'client_id': settings.GOOGLE_AUTH_CLIENT_ID,
        'redirect_uri': redirect_uri,
        'scope': settings.GOOGLE_AUTH_SCOPES,
        'access_type': 'online',
        'prompt': 'select_account',
        'state': state,
    }
    auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
    return HttpResponseRedirect(auth_url)


def _fetch_google_profile(access_token: str) -> dict | None:
    try:
        r = requests.get(
            'https://www.googleapis.com/oauth2/v3/userinfo',
            headers={'Authorization': f'Bearer {access_token}'},
            timeout=15,
        )
        r.raise_for_status()
        return r.json()
    except Exception:
        return None


def _issue_tokens_and_redirect(user: User, next_encoded: str, is_new: bool):
    refresh = RefreshToken.for_user(user)
    redirect_params = {
        'status': 'success',
        'next': next_encoded or _encode_next('/onboarding' if is_new else '/home/dashboard'),
    }
    if is_new:
        redirect_params['is_new'] = '1'

    response = HttpResponseRedirect(_frontend_callback_url(**redirect_params))
    set_auth_cookies(response, str(refresh.access_token), str(refresh))
    return response


def _get_or_create_google_user(profile: dict, mode: str) -> tuple[User | None, str | None, bool]:
    """
    Returns (user, error_code, is_new).
    error_code is set when user cannot be authenticated.
    """
    google_id = profile.get('sub')
    email = (profile.get('email') or '').strip().lower()
    name = (profile.get('name') or profile.get('given_name') or email.split('@')[0] or '').strip()
    email_verified = profile.get('email_verified', False)

    if not google_id or not email:
        return None, 'profile_incomplete', False

    if not email_verified:
        return None, 'email_not_verified', False

    user_by_google = User.objects.filter(google_id=google_id).first()
    if user_by_google:
        if not user_by_google.is_active:
            user_by_google.is_active = True
            user_by_google.save(update_fields=['is_active'])
        OtpVerification.objects.filter(user=user_by_google).delete()
        return user_by_google, None, False

    user_by_email = User.objects.filter(email=email).first()
    if user_by_email:
        if mode == 'signup':
            return None, 'account_exists', False
        # login: link Google to existing email/password account
        user_by_email.google_id = google_id
        if name and not user_by_email.name:
            user_by_email.name = name
        user_by_email.is_active = True
        user_by_email.save(update_fields=['google_id', 'name', 'is_active'])
        OtpVerification.objects.filter(user=user_by_email).delete()
        return user_by_email, None, False

    if mode == 'login':
        # Standard Google sign-in: create account if none exists
        pass

    user = User.objects.create_user(
        email=email,
        password=secrets.token_urlsafe(32),
        name=name,
        google_id=google_id,
        is_active=True,
        role='admin',
    )
    user.set_unusable_password()
    user.save(update_fields=['password'])
    return user, None, True


@api_view(['GET'])
@permission_classes([AllowAny])
def google_auth_callback(request):
    """OAuth callback from Google — exchange code, sign in/up, set JWT cookies."""
    error = request.GET.get('error')
    if error:
        return HttpResponseRedirect(
            _marketing_callback_url(status='error', code=error)
        )

    code = request.GET.get('code')
    state = request.GET.get('state', '')

    if not code:
        return HttpResponseRedirect(
            _marketing_callback_url(status='error', code='no_code')
        )

    try:
        nonce, mode, next_encoded = state.split(':', 2)
    except ValueError:
        return HttpResponseRedirect(
            _marketing_callback_url(status='error', code='invalid_state')
        )

    stored = cache.get(f'google_auth_state:{nonce}')
    if not stored or stored.get('mode') != mode:
        return HttpResponseRedirect(
            _marketing_callback_url(status='error', code='invalid_state')
        )
    cache.delete(f'google_auth_state:{nonce}')
    next_encoded = stored.get('next') or next_encoded
    redirect_uri = stored.get('redirect_uri') or _redirect_uri_for_request(request)

    token_data = {
        'code': code,
        'client_id': settings.GOOGLE_AUTH_CLIENT_ID,
        'client_secret': settings.GOOGLE_AUTH_CLIENT_SECRET,
        'redirect_uri': redirect_uri,
        'grant_type': 'authorization_code',
    }

    try:
        r = requests.post('https://oauth2.googleapis.com/token', data=token_data, timeout=15)
        r.raise_for_status()
        tokens = r.json()
    except Exception:
        return HttpResponseRedirect(
            _marketing_callback_url(status='error', code='token_exchange_failed')
        )

    profile = _fetch_google_profile(tokens.get('access_token', ''))
    if not profile:
        return HttpResponseRedirect(
            _marketing_callback_url(status='error', code='profile_fetch_failed')
        )

    user, err, is_new = _get_or_create_google_user(profile, mode)
    if err:
        return HttpResponseRedirect(
            _marketing_callback_url(status='error', code=err)
        )

    user.last_login = timezone.now()
    user.save(update_fields=['last_login'])

    return _issue_tokens_and_redirect(user, next_encoded, is_new)
