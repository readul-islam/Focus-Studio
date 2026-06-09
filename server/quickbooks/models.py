from django.db import models
from django.utils import timezone

from users.models import Studio, User


class QuickBooksToken(models.Model):
    studio = models.ForeignKey(Studio, on_delete=models.CASCADE, related_name='quickbooks_tokens')
    access_token = models.TextField()
    refresh_token = models.TextField()
    expires_at = models.DateTimeField()
    realm_id = models.CharField(max_length=64, blank=True, default='')
    token_type = models.CharField(max_length=50, blank=True, default='Bearer')
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='quickbooks_tokens_created'
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('studio', 'realm_id')

    def is_expired(self):
        return self.expires_at <= timezone.now()
