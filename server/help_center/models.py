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
