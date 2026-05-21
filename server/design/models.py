from django.db import models
from users.models import User, Studio


DESIGN_TYPE_CHOICES = [
    ('interior', 'Interior'),
    ('exterior', 'Exterior'),
]

MESSAGE_ROLE_CHOICES = [
    ('user', 'User'),
    ('assistant', 'Assistant'),
]


class DesignSession(models.Model):
    studio = models.ForeignKey(Studio, on_delete=models.CASCADE, related_name='design_sessions')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='design_sessions')
    title = models.CharField(max_length=255, default='New design')
    design_type = models.CharField(max_length=20, choices=DESIGN_TYPE_CHOICES, default='interior')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f'{self.title} ({self.studio_id})'


class DesignMessage(models.Model):
    session = models.ForeignKey(DesignSession, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=20, choices=MESSAGE_ROLE_CHOICES)
    content = models.TextField()
    asset = models.ForeignKey(
        'DesignAsset',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='messages',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f'{self.role}: {self.content[:40]}'


class DesignAsset(models.Model):
    session = models.ForeignKey(DesignSession, on_delete=models.CASCADE, related_name='assets')
    file = models.ImageField(upload_to='design_assets/%Y/%m/')
    prompt = models.TextField(blank=True)
    source_sketch = models.ImageField(upload_to='design_sketches/%Y/%m/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Asset {self.id} (session {self.session_id})'
