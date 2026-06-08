from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken

from .models import SupplierAccount


class SupplierJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        try:
            supplier_id = validated_token['supplier_account_id']
        except KeyError:
            raise InvalidToken('Token contained no supplier identification')

        try:
            return SupplierAccount.objects.get(id=supplier_id, is_active=True)
        except SupplierAccount.DoesNotExist:
            raise InvalidToken('Supplier account not found or inactive')
