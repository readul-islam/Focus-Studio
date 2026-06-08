"""Detect mobile app clients that use Bearer tokens instead of httpOnly cookies."""

MOBILE_PLATFORM_HEADER = 'HTTP_X_CLIENT_PLATFORM'


def is_mobile_client(request) -> bool:
    return request.META.get(MOBILE_PLATFORM_HEADER, '').lower() == 'mobile'
