from rest_framework import authentication, exceptions

from .models import StudioApiKey
from .utils import hash_api_key


class StudioApiKeyAuthentication(authentication.BaseAuthentication):
    """
    Authenticate requests with Authorization: Bearer fp_live_...
  Assigns request.studio and request.auth_user_studio_key on success.
    """

    keyword = 'Bearer'

    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if not auth_header.startswith(f'{self.keyword} '):
            return None

        raw_key = auth_header[len(self.keyword) + 1 :].strip()
        if not raw_key.startswith('fp_live_'):
            return None

        key_hash = hash_api_key(raw_key)
        try:
            api_key = StudioApiKey.objects.select_related('studio').get(
                key_hash=key_hash, revoked_at__isnull=True
            )
        except StudioApiKey.DoesNotExist:
            raise exceptions.AuthenticationFailed('Invalid API key')

        api_key.touch_used()
        request.studio = api_key.studio
        return (None, api_key)
