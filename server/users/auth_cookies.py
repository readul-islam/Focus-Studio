from django.conf import settings


def cookie_settings(secure: bool) -> dict:
    """
    Production: SameSite=None; Secure; Domain from AUTH_COOKIE_DOMAIN.
    Development: SameSite=Lax; no Secure; no Domain.
    """
    cookie: dict = {
        'httponly': True,
        'secure': secure,
        'samesite': 'None' if secure else 'Lax',
        'path': '/',
    }
    domain = getattr(settings, 'AUTH_COOKIE_DOMAIN', '') or ''
    if secure and domain:
        cookie['domain'] = domain
    return cookie


def set_auth_cookies(response, access: str, refresh: str):
    secure = not settings.DEBUG
    cookie = cookie_settings(secure)
    response.set_cookie('access', access, max_age=86400, **cookie)
    response.set_cookie('refresh', refresh, max_age=86400, **cookie)
    return response
