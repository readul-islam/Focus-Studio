import re
from django.utils.text import slugify


def suggest_slug_from_name(name: str) -> str:
    base = slugify(name or 'studio')[:60]
    if len(base) < 3:
        base = 'studio'
    return base


def absolute_media_url(request, field):
    if not field:
        return None
    try:
        url = field.url
    except (ValueError, AttributeError):
        return None
    if request:
        return request.build_absolute_uri(url)
    return url
