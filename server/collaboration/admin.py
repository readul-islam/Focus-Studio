from django.contrib import admin
from .models import ProjectTeamMessage, ProjectPresence, TeamMessageAttachment


@admin.register(ProjectTeamMessage)
class ProjectTeamMessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'project', 'user', 'created_at')
    list_filter = ('studio', 'created_at')
    search_fields = ('content', 'user__name')


@admin.register(ProjectPresence)
class ProjectPresenceAdmin(admin.ModelAdmin):
    list_display = ('project', 'user', 'last_seen')
    list_filter = ('studio',)


@admin.register(TeamMessageAttachment)
class TeamMessageAttachmentAdmin(admin.ModelAdmin):
    list_display = ('file_name', 'file_type', 'message', 'created_at')
    list_filter = ('file_type',)
