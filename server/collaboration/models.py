from django.db import models
from users.models import User, Studio
from projects.models import Project


class ProjectTeamMessage(models.Model):
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name='team_messages'
    )
    user = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name='team_messages_sent'
    )
    studio = models.ForeignKey(Studio, on_delete=models.CASCADE, related_name='team_messages')
    content = models.TextField(blank=True, default='')
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='replies',
    )
    is_pinned = models.BooleanField(default=False, db_index=True)
    pinned_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']
        verbose_name = 'Project Team Message'
        verbose_name_plural = 'Project Team Messages'

    def __str__(self):
        author = self.user.name if self.user else 'Unknown'
        return f'{author} in {self.project_id}: {self.content[:50]}'


class ProjectPresence(models.Model):
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name='presence_records'
    )
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='project_presence'
    )
    studio = models.ForeignKey(Studio, on_delete=models.CASCADE, related_name='project_presence')
    last_seen = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [['project', 'user']]
        verbose_name = 'Project Presence'
        verbose_name_plural = 'Project Presence Records'

    def __str__(self):
        return f'{self.user.name} on project {self.project_id}'


class TeamMessageAttachment(models.Model):
    FILE_TYPE_CHOICES = [
        ('image', 'Image'),
        ('video', 'Video'),
        ('pdf', 'PDF'),
        ('document', 'Document'),
        ('other', 'Other'),
    ]

    message = models.ForeignKey(
        ProjectTeamMessage,
        on_delete=models.CASCADE,
        related_name='attachments',
    )
    file = models.FileField(upload_to='team_chat/%Y/%m/')
    file_name = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField(default=0)
    content_type = models.CharField(max_length=128, blank=True, default='')
    file_type = models.CharField(max_length=20, choices=FILE_TYPE_CHOICES, default='other')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']
        verbose_name = 'Team Message Attachment'
        verbose_name_plural = 'Team Message Attachments'

    def __str__(self):
        return self.file_name
