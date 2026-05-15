from django.db import models
from projects.models import Project
from users.models import User, Studio

DOCUMENT_TYPE = [
    ('FILE', 'File'),
    ('FOLDER', 'Folder'),
    ('LINK', 'Link'),
]

class Document(models.Model):
    project = models.ForeignKey(Project, on_delete=models.SET_NULL, related_name='documents', null=True, blank=True)
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='children')
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=10, choices=DOCUMENT_TYPE, default='FILE')
    file = models.FileField(upload_to='documents/', null=True, blank=True)
    link_url = models.URLField(null=True, blank=True)
    client_access = models.BooleanField(default=False, null=True, blank=True)
    contractor_access = models.BooleanField(default=False, null=True, blank=True)
    studio = models.ForeignKey(Studio, on_delete=models.SET_NULL, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='documents_created', null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='documents_updated', null=True, blank=True)

    def __str__(self):
        return self.name
