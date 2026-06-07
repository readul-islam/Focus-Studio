from django.conf import settings
from django.db import models


class HelpArticleFeedback(models.Model):
    HELPFUL = 'helpful'
    NOT_HELPFUL = 'not_helpful'
    RATING_CHOICES = [
        (HELPFUL, 'Helpful'),
        (NOT_HELPFUL, 'Not helpful'),
    ]

    category = models.CharField(max_length=80)
    article_slug = models.CharField(max_length=120)
    rating = models.CharField(max_length=20, choices=RATING_CHOICES)
    comment = models.TextField(blank=True, default='')
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='help_feedbacks',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['category', 'article_slug']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f'{self.category}/{self.article_slug} — {self.rating}'


class SupportConversation(models.Model):
    PORTAL_STUDIO = 'studio'
    PORTAL_CLIENT = 'client_portal'
    PORTAL_CONTRACTOR = 'contractor_portal'
    PORTAL_CHOICES = [
        (PORTAL_STUDIO, 'Studio app'),
        (PORTAL_CLIENT, 'Client portal'),
        (PORTAL_CONTRACTOR, 'Contractor portal'),
    ]

    portal = models.CharField(max_length=20, choices=PORTAL_CHOICES, default=PORTAL_STUDIO)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='support_conversations',
        null=True,
        blank=True,
    )
    portal_client = models.ForeignKey(
        'crm.Client',
        on_delete=models.CASCADE,
        related_name='portal_support_conversations',
        null=True,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['user', '-updated_at']),
            models.Index(fields=['portal_client', 'portal', '-updated_at']),
        ]

    def __str__(self):
        owner = self.user_id or self.portal_client_id
        return f'Support #{self.pk} ({self.portal}) — {owner}'


class SupportMessage(models.Model):
    ROLE_USER = 'user'
    ROLE_ASSISTANT = 'assistant'
    ROLE_CHOICES = [
        (ROLE_USER, 'User'),
        (ROLE_ASSISTANT, 'Assistant'),
    ]

    conversation = models.ForeignKey(
        SupportConversation,
        on_delete=models.CASCADE,
        related_name='messages',
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['conversation', 'created_at']),
        ]

    def __str__(self):
        return f'{self.role}: {self.content[:40]}'
