from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken

from crm.models import Client


class ClientJWTAuthentication(JWTAuthentication):
    """Authenticate client portal users (CRM Client with contact_type CL)."""

    def get_user(self, validated_token):
        client_id = validated_token.get('client_id')
        token_type = validated_token.get('type')
        if client_id is None or token_type != 'client':
            raise InvalidToken('Token contained no valid client identification')
        try:
            return Client.objects.get(id=client_id, contact_type='CL', is_active=True)
        except Client.DoesNotExist:
            raise InvalidToken('Client not found or inactive')
