from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError


class CookieJWTAuthentication(JWTAuthentication):
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
