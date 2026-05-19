from django.contrib import admin

from .models import NotionToken


@admin.register(NotionToken)
class NotionTokenAdmin(admin.ModelAdmin):
    list_display = ('studio', 'workspace_name', 'workspace_id', 'created_at')
