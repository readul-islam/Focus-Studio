from django.contrib import admin

from .models import NotionProjectLink, NotionProjectMapping, NotionToken


@admin.register(NotionToken)
class NotionTokenAdmin(admin.ModelAdmin):
    list_display = ('studio', 'workspace_name', 'workspace_id', 'created_at')


@admin.register(NotionProjectMapping)
class NotionProjectMappingAdmin(admin.ModelAdmin):
    list_display = ('studio', 'database_title', 'is_enabled', 'last_synced_at')


@admin.register(NotionProjectLink)
class NotionProjectLinkAdmin(admin.ModelAdmin):
    list_display = ('studio', 'notion_page_id', 'project', 'created_at')
