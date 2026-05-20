from django.contrib.auth import authenticate
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from django.conf import settings

from .models import User, UserTwoFactor
from .totp_utils import (
    generate_backup_codes,
    generate_totp_secret,
    provisioning_uri,
    sign_totp_secret,
    verify_backup_code,
    verify_totp_code,
)
from .views import _cookie_settings


def _issue_auth_response(user) -> Response:
    refresh = RefreshToken.for_user(user)
    secure = not settings.DEBUG
    cookie = _cookie_settings(secure)
    from .serializers import UserSerializer

    response = Response({'user': UserSerializer(user).data}, status=status.HTTP_200_OK)
    response.set_cookie('access', str(refresh.access_token), max_age=86400, **cookie)
    response.set_cookie('refresh', str(refresh), max_age=86400, **cookie)
    return response


def _get_two_factor(user: User) -> UserTwoFactor:
    tf, _ = UserTwoFactor.objects.get_or_create(user=user)
    return tf


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def two_factor_status(request):
    tf = getattr(request.user, 'two_factor', None)
    enabled = bool(tf and tf.is_enabled)
    return Response({
        'is_enabled': enabled,
        'enabled_at': tf.enabled_at.isoformat() if enabled and tf.enabled_at else None,
        'backup_codes_remaining': len(tf.backup_codes_hashes) if tf and enabled else 0,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def two_factor_setup(request):
    tf = _get_two_factor(request.user)
    if tf.is_enabled:
        return Response({'detail': '2FA is already enabled. Disable it first to reconfigure.'}, status=status.HTTP_400_BAD_REQUEST)

    secret = generate_totp_secret()
    tf.totp_secret_signed = sign_totp_secret(secret)
    tf.is_enabled = False
    tf.backup_codes_hashes = []
    tf.save(update_fields=['totp_secret_signed', 'is_enabled', 'backup_codes_hashes'])

    uri = provisioning_uri(tf.totp_secret_signed, request.user.email)
    return Response({
        'provisioning_uri': uri,
        'secret': secret,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def two_factor_confirm(request):
    code = (request.data.get('code') or '').strip()
    if not code:
        return Response({'detail': 'Verification code is required.'}, status=status.HTTP_400_BAD_REQUEST)

    tf = _get_two_factor(request.user)
    if not tf.totp_secret_signed:
        return Response({'detail': 'Run setup first.'}, status=status.HTTP_400_BAD_REQUEST)
    if tf.is_enabled:
        return Response({'detail': '2FA is already enabled.'}, status=status.HTTP_400_BAD_REQUEST)

    if not verify_totp_code(tf.totp_secret_signed, code):
        return Response({'detail': 'Invalid verification code.'}, status=status.HTTP_400_BAD_REQUEST)

    plain_codes, hashes = generate_backup_codes()
    tf.is_enabled = True
    tf.enabled_at = timezone.now()
    tf.backup_codes_hashes = hashes
    tf.save(update_fields=['is_enabled', 'enabled_at', 'backup_codes_hashes'])

    return Response({
        'detail': 'Two-factor authentication enabled.',
        'backup_codes': plain_codes,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def two_factor_disable(request):
    password = request.data.get('password') or ''
    code = (request.data.get('code') or '').strip()

    if not password:
        return Response({'detail': 'Current password is required.'}, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(request=request, username=request.user.email, password=password)
    if user is None:
        return Response({'detail': 'Incorrect password.'}, status=status.HTTP_400_BAD_REQUEST)

    tf = getattr(request.user, 'two_factor', None)
    if not tf or not tf.is_enabled:
        return Response({'detail': '2FA is not enabled.'}, status=status.HTTP_400_BAD_REQUEST)

    if not code:
        return Response({'detail': 'Authenticator or backup code is required.'}, status=status.HTTP_400_BAD_REQUEST)

    valid = verify_totp_code(tf.totp_secret_signed, code)
    if not valid:
        ok, _ = verify_backup_code(code, tf.backup_codes_hashes)
        valid = ok

    if not valid:
        return Response({'detail': 'Invalid verification code.'}, status=status.HTTP_400_BAD_REQUEST)

    tf.is_enabled = False
    tf.totp_secret_signed = ''
    tf.backup_codes_hashes = []
    tf.enabled_at = None
    tf.save()

    return Response({'detail': 'Two-factor authentication disabled.'})


@api_view(['GET'])
@permission_classes([AllowAny])
def two_factor_session(request):
    email = request.COOKIES.get('pending_2fa')
    if not email:
        return Response({'detail': 'No pending session.'}, status=status.HTTP_404_NOT_FOUND)
    return Response({'email': email})


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_two_factor_login(request):
    email = request.COOKIES.get('pending_2fa')
    if not email:
        return Response({'detail': 'No pending session.'}, status=status.HTTP_400_BAD_REQUEST)

    code = (request.data.get('code') or '').strip()
    if not code:
        return Response({'detail': 'Code is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email=email)
        tf = user.two_factor
    except (User.DoesNotExist, UserTwoFactor.DoesNotExist):
        return Response({'detail': 'Invalid session.'}, status=status.HTTP_400_BAD_REQUEST)

    if not tf.is_enabled:
        return Response({'detail': '2FA not enabled for this account.'}, status=status.HTTP_400_BAD_REQUEST)

    valid = verify_totp_code(tf.totp_secret_signed, code)
    if not valid:
        ok, remaining = verify_backup_code(code, tf.backup_codes_hashes)
        if ok:
            tf.backup_codes_hashes = remaining
            tf.save(update_fields=['backup_codes_hashes'])
            valid = True

    if not valid:
        return Response({'detail': 'Invalid code.'}, status=status.HTTP_400_BAD_REQUEST)

    secure = not settings.DEBUG
    cookie = _cookie_settings(secure)
    response = _issue_auth_response(user)
    response.delete_cookie('pending_2fa', path='/', domain=cookie.get('domain'))
    return response
