from django.db import models
from django.utils import timezone
from users.models import Studio, User

class XeroToken(models.Model):
    studio = models.ForeignKey(Studio, on_delete=models.SET_NULL, null=True, blank=True)
    access_token = models.TextField()
    refresh_token = models.TextField()
    expires_at = models.DateTimeField()
    id_token = models.TextField(blank=True)
    token_type = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='xero_tokens_created', null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='xero_tokens_updated', null=True, blank=True)

    def is_expired(self):
        return self.expires_at <= timezone.now()

    def to_dict(self):
        return {
            "access_token": self.access_token,
            "refresh_token": self.refresh_token,
            "id_token": self.id_token,
            "expires_at": self.expires_at,
            "token_type": self.token_type,
        }
