from django.db import models
from users.models import User, Studio

PLATFORM_CHOICES = [
    ('google_meet', 'Google Meet'),
    ('teams', 'Microsoft Teams'),
    ('zoom', 'Zoom'),
]

BOT_STATUS_CHOICES = [
    ('pending', 'Pending'),
    ('joining', 'Joining'),
    ('in_meeting', 'In Meeting'),
    ('completed', 'Completed'),
    ('failed', 'Failed'),
]

ACTION_ITEM_STATUS_CHOICES = [
    ('pending', 'Pending'),
    ('in_progress', 'In Progress'),
    ('done', 'Done'),
]


class Meeting(models.Model):
    title = models.CharField(max_length=255)
    platform = models.CharField(max_length=50, choices=PLATFORM_CHOICES)
    native_meeting_id = models.CharField(max_length=255)
    meeting_url = models.URLField(blank=True)
    bot_id = models.CharField(max_length=255, blank=True, null=True)
    bot_status = models.CharField(max_length=20, choices=BOT_STATUS_CHOICES, default='pending')
    scheduled_at = models.DateTimeField(null=True, blank=True)
    studio = models.ForeignKey(Studio, on_delete=models.SET_NULL, null=True, blank=True, related_name='meetings')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='meetings_created')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.platform})"


class MeetingTranscript(models.Model):
    meeting = models.OneToOneField(Meeting, on_delete=models.CASCADE, related_name='transcript')
    raw_transcript = models.JSONField(default=list)
    transcript_text = models.TextField(blank=True)
    summary = models.TextField(blank=True)
    fetched_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Transcript for {self.meeting.title}"


class MeetingActionItem(models.Model):
    meeting = models.ForeignKey(Meeting, on_delete=models.CASCADE, related_name='action_items')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    assignee = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='meeting_action_items')
    due_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=ACTION_ITEM_STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
