from django.db import models
from django.conf import settings


class ChangeLog(models.Model):
    CHANGE_TYPE_CHOICES = [
        ('feature', 'Feature'),
        ('fix', 'Bug Fix'),
        ('improvement', 'Improvement'),
        ('breaking', 'Breaking Change'),
        ('other', 'Other'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField()
    change_type = models.CharField(max_length=20, choices=CHANGE_TYPE_CHOICES, default='other')
    date = models.DateField(help_text='Date the change was released or effective')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='changelogs',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']
        verbose_name = 'Change Log'
        verbose_name_plural = 'Change Logs'

    def __str__(self):
        return f'[{self.get_change_type_display()}] {self.title} ({self.date})'
