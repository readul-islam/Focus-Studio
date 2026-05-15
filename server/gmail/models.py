from django.db import models
from users.models import Studio
from crm.models import Client

# Create your models here.
class GmailToken(models.Model):
    user = models.OneToOneField('users.User', on_delete=models.CASCADE, related_name='gmail_token', null=True)
    access_token = models.TextField()
    refresh_token = models.TextField()
    expires_at = models.DateTimeField()
    token_type = models.CharField(max_length=50, blank=True, null=True)
    history_id = models.CharField(max_length=64, blank=True, null=True)  # For incremental Gmail sync
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def is_expired(self):
        from django.utils import timezone
        return self.expires_at <= timezone.now()

class Email(models.Model):
    studio = models.ForeignKey(Studio, on_delete=models.CASCADE, related_name='emails')
    client = models.ForeignKey(Client, on_delete=models.SET_NULL, null=True, blank=True, related_name='emails')
    sender = models.CharField(max_length=255)
    recipient = models.CharField(max_length=255)
    subject = models.CharField(max_length=999, blank=True, null=True)
    body = models.TextField()
    snippet = models.TextField(null=True, blank=True)
    received_at = models.DateTimeField()
    message_id = models.CharField(max_length=255, unique=True) # Gmail ID
    thread_id = models.CharField(max_length=255, db_index=True) # Gmail Thread ID
    smtp_message_id = models.CharField(max_length=255, blank=True, null=True) # SMTP Message-ID header
    is_sent = models.BooleanField(default=False)  # True if sent from the system (reply), False if received
    suggested_tasks = models.JSONField(null=True, blank=True)  # AI-generated tasks for this individual email
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['studio', 'received_at']),
            models.Index(fields=['studio', 'thread_id']),
            models.Index(fields=['studio', 'thread_id', 'received_at']),
        ]

    def __str__(self):
        return f"{self.sender} - {self.subject}"

class ThreadSummary(models.Model):
    thread_id = models.CharField(max_length=255, db_index=True)
    studio = models.ForeignKey(Studio, on_delete=models.CASCADE, related_name='thread_summaries')
    summary = models.TextField()
    email_count = models.IntegerField(default=0)  # Number of emails when summary was generated
    last_email_id = models.IntegerField(null=True, blank=True)  # PK of newest email included
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('thread_id', 'studio')

    def __str__(self):
        return f"Summary for thread {self.thread_id}"


class EmailThread(models.Model):
    thread_id = models.CharField(max_length=255, unique=True)
    studio = models.ForeignKey(Studio, on_delete=models.CASCADE, related_name='email_threads')
    projects = models.ManyToManyField('projects.Project', related_name='email_threads')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Thread {self.thread_id} - {self.studio}"