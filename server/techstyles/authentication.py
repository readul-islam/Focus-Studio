from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError


class CombinedJWTAuthentication(JWTAuthentication):
    """
    Studio users (user_id) and contractor portal clients (contractor_id + type=contractor).
    """

    def get_user(self, validated_token):
        contractor_id = validated_token.get('contractor_id')
        token_type = validated_token.get('type')
        if contractor_id is not None or token_type == 'contractor':
            from crm.models import Client
            try:
                return Client.objects.get(id=contractor_id, contact_type='CN', is_active=True)
            except Client.DoesNotExist:
                raise InvalidToken('Contractor not found or inactive')
        return super().get_user(validated_token)


class CookieJWTAuthentication(CombinedJWTAuthentication):
    """
    Reads the JWT access token from the 'access' httpOnly cookie.
    Falls back to Authorization header for DRF browsable API / scripts.
    """

    def authenticate(self, request):
        cookie_token = request.COOKIES.get('access')
        if cookie_token:
            try:
                validated = self.get_validated_token(cookie_token.encode())
                return self.get_user(validated), validated
            except (InvalidToken, TokenError):
                # Token in cookie is invalid/expired — let 401 trigger refresh
                return None
        # Fallback: Authorization: Bearer <token>
        return super().authenticate(request)
