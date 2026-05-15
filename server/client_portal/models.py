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
