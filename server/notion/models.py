from django.db import models
from django.utils import timezone

from users.models import Studio, User


class NotionToken(models.Model):
    studio = models.OneToOneField(Studio, on_delete=models.CASCADE, related_name='notion_token')
    access_token = models.TextField()
    workspace_id = models.CharField(max_length=64, blank=True, default='')
    workspace_name = models.CharField(max_length=255, blank=True, default='')
    bot_id = models.CharField(max_length=64, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='notion_tokens_created'
    )

    def is_valid(self):
        return bool(self.access_token)
