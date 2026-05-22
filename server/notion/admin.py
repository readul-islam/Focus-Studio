from django.contrib import admin

from .models import (
    NotionProjectLink,
    NotionProjectMapping,
    NotionProjectSync,
    NotionTaskLink,
    NotionToken,
)


@admin.register(NotionToken)
class NotionTokenAdmin(admin.ModelAdmin):
    list_display = ('studio', 'workspace_name', 'workspace_id', 'parent_page_id', 'created_at')


@admin.register(NotionProjectMapping)
class NotionProjectMappingAdmin(admin.ModelAdmin):
    list_display = ('studio', 'database_title', 'is_enabled', 'last_synced_at')


@admin.register(NotionProjectLink)
class NotionProjectLinkAdmin(admin.ModelAdmin):
    list_display = ('studio', 'notion_page_id', 'project', 'created_at')


@admin.register(NotionProjectSync)
class NotionProjectSyncAdmin(admin.ModelAdmin):
    list_display = (
        'studio',
        'project',
        'notion_project_page_id',
        'notion_tasks_database_id',
        'last_pushed_at',
    )


@admin.register(NotionTaskLink)
class NotionTaskLinkAdmin(admin.ModelAdmin):
    list_display = ('studio', 'task', 'notion_page_id', 'updated_at')
