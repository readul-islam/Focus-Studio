from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken

class ContractorJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        try:
            contractor_id = validated_token["contractor_id"]
        except KeyError:
            raise InvalidToken("Token contained no contractor identification")
        from crm.models import Client
        try:
            return Client.objects.get(id=contractor_id, contact_type="CN", is_active=True)
        except Client.DoesNotExist:
            raise InvalidToken("Contractor not found or inactive")
