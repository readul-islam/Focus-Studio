from django.db import models
from django.utils import timezone

from users.models import Studio, User


class NotionToken(models.Model):
    studio = models.OneToOneField(Studio, on_delete=models.CASCADE, related_name='notion_token')
    access_token = models.TextField()
    workspace_id = models.CharField(max_length=64, blank=True, default='')
    workspace_name = models.CharField(max_length=255, blank=True, default='')
    bot_id = models.CharField(max_length=64, blank=True, default='')
    parent_page_id = models.CharField(
        max_length=64,
        blank=True,
        default='',
        help_text='Notion page ID where new Focuspilot projects are created as child pages.',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='notion_tokens_created'
    )

    def is_valid(self):
        return bool(self.access_token)


class NotionProjectMapping(models.Model):
    """Maps a Notion database to auto-create/update Focuspilot projects."""

    studio = models.OneToOneField(
        Studio, on_delete=models.CASCADE, related_name='notion_project_mapping'
    )
    database_id = models.CharField(max_length=64)
    database_title = models.CharField(max_length=255, blank=True, default='')
    title_property = models.CharField(
        max_length=120, default='Name', help_text='Notion title property for project name'
    )
    status_property = models.CharField(
        max_length=120, blank=True, default='', help_text='Optional status/select property'
    )
    is_enabled = models.BooleanField(default=True)
    last_synced_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='notion_mappings_updated'
    )

    def __str__(self):
        return f'{self.studio_id} → {self.database_title or self.database_id}'


class NotionProjectLink(models.Model):
    """Links a Notion page (row) to a Focuspilot project."""

    studio = models.ForeignKey(Studio, on_delete=models.CASCADE, related_name='notion_project_links')
    notion_page_id = models.CharField(max_length=64, db_index=True)
    project = models.ForeignKey(
        'projects.Project', on_delete=models.CASCADE, related_name='notion_links'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['studio', 'notion_page_id'],
                name='unique_notion_page_per_studio',
            ),
        ]

    def __str__(self):
        return f'{self.notion_page_id} → project {self.project_id}'


class NotionProjectSync(models.Model):
    """Outbound sync: Focuspilot project ↔ Notion project page + optional tasks database."""

    studio = models.ForeignKey(Studio, on_delete=models.CASCADE, related_name='notion_project_syncs')
    project = models.OneToOneField(
        'projects.Project', on_delete=models.CASCADE, related_name='notion_sync'
    )
    notion_project_page_id = models.CharField(max_length=64)
    notion_tasks_database_id = models.CharField(max_length=64, blank=True, default='')
    last_pushed_at = models.DateTimeField(null=True, blank=True)
    last_error = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'project {self.project_id} → {self.notion_project_page_id}'


class NotionTaskLink(models.Model):
    """Outbound sync: Focuspilot task ↔ Notion database row (page)."""

    studio = models.ForeignKey(Studio, on_delete=models.CASCADE, related_name='notion_task_links')
    task = models.OneToOneField('task.Task', on_delete=models.CASCADE, related_name='notion_link')
    notion_page_id = models.CharField(max_length=64, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['studio', 'notion_page_id'],
                name='unique_notion_task_page_per_studio',
            ),
        ]

    def __str__(self):
        return f'task {self.task_id} → {self.notion_page_id}'
