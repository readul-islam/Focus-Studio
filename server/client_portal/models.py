from django.db import models
from crm.models import Client
from projects.models import Project

class ClientProject(models.Model):
    """
    Links clients to projects they can access in the client portal.
    """
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='client_portal_projects')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='client_access_grants')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('client', 'project')
        verbose_name = 'Client Project Access'
        verbose_name_plural = 'Client Project Access'
    
    def __str__(self):
        return f"{self.client.name} - {self.project.project_name}"


class ClientProjectMessage(models.Model):
    """Two-way messages between studio staff and a client for a project."""

    SENDER_CHOICES = [
        ('studio', 'Studio'),
        ('client', 'Client'),
    ]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='client_messages')
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='project_messages')
    studio = models.ForeignKey('users.Studio', on_delete=models.CASCADE, related_name='client_messages')
    content = models.TextField()
    sender_type = models.CharField(max_length=20, choices=SENDER_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['created_at']
        verbose_name = 'Client Project Message'
        verbose_name_plural = 'Client Project Messages'

    def __str__(self):
        return f"{self.sender_type} · {self.project.project_name} · {self.created_at:%Y-%m-%d %H:%M}"
