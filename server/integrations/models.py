import secrets

from django.db import models
from django.utils import timezone

from users.models import Studio, User


class StudioApiKey(models.Model):
    """Studio-scoped API key for Zapier and other automation tools."""

    studio = models.ForeignKey(Studio, on_delete=models.CASCADE, related_name='api_keys')
    name = models.CharField(max_length=120, blank=True, default='')
    prefix = models.CharField(max_length=16, db_index=True)
    key_hash = models.CharField(max_length=64, unique=True)
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='api_keys_created'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    last_used_at = models.DateTimeField(null=True, blank=True)
    revoked_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    @property
    def is_active(self):
        return self.revoked_at is None

    def touch_used(self):
        self.last_used_at = timezone.now()
        self.save(update_fields=['last_used_at'])


class WebhookEndpoint(models.Model):
    """Outbound webhook URL (Zapier catch hook, custom automation, etc.)."""

    studio = models.ForeignKey(Studio, on_delete=models.CASCADE, related_name='webhook_endpoints')
    url = models.URLField(max_length=2048)
    secret = models.CharField(max_length=64)
    events = models.JSONField(default=list, help_text='Event types to send, or ["*"] for all')
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='webhooks_created'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def matches_event(self, event_type: str) -> bool:
        if not self.is_active:
            return False
        if not self.events:
            return True
        if '*' in self.events:
            return True
        return event_type in self.events

    @staticmethod
    def generate_secret() -> str:
        return f"whsec_{secrets.token_urlsafe(24)}"
