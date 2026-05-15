from django.contrib import admin
from django.contrib.admin.sites import NotRegistered
from .models import Meeting, MeetingTranscript, MeetingActionItem


def _reregister(model, admin_class):
    try:
        admin.site.unregister(model)
    except NotRegistered:
        pass
    admin.site.register(model, admin_class)


class MeetingAdmin(admin.ModelAdmin):
    list_display = ['title', 'platform', 'bot_status', 'created_by', 'created_at']
    list_filter = ['platform', 'bot_status']


class MeetingTranscriptAdmin(admin.ModelAdmin):
    list_display = ['meeting', 'fetched_at']


class MeetingActionItemAdmin(admin.ModelAdmin):
    list_display = ['title', 'meeting', 'status', 'assignee', 'due_date']
    list_filter = ['status']


_reregister(Meeting, MeetingAdmin)
_reregister(MeetingTranscript, MeetingTranscriptAdmin)
_reregister(MeetingActionItem, MeetingActionItemAdmin)
