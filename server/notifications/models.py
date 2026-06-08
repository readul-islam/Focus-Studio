from django.db import models
from users.models import User

NOTIFICATION_TYPES = [
    ('project_assigned', 'Assigned to Project'),
    ('task_assigned', 'Assigned to Task'),
    ('subtask_assigned', 'Assigned to Subtask'),
    ('team_message', 'Team Message'),
    ('comment_mention', 'Comment Mention'),
]


class Notification(models.Model):
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    project = models.ForeignKey('projects.Project', on_delete=models.CASCADE, null=True, blank=True)
    task = models.ForeignKey('task.Task', on_delete=models.CASCADE, null=True, blank=True)
    subtask = models.ForeignKey('task.SubTask', on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification for {self.recipient.email}: {self.message[:50]}"


class PushDeviceToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='push_tokens')
    token = models.CharField(max_length=255, unique=True)
    platform = models.CharField(max_length=20, blank=True, default='')
    device_name = models.CharField(max_length=120, blank=True, default='')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.user.email} — {self.platform or 'device'}"
