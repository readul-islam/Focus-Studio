from django.contrib import admin
from .models import ContractorProject, ContractorSharedProcurement, ContractorSharedDocument, ContractorMessage


class ContractorMessageAdmin(admin.ModelAdmin):
    list_display = ('project', 'contractor', 'sender_type', 'content_preview', 'created_at', 'is_read')
    list_filter = ('sender_type', 'is_read', 'created_at', 'project')
    search_fields = ('content', 'contractor__name', 'project__project_name')
    readonly_fields = ('created_at',)

    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Message'


try:
    admin.site.register(ContractorMessage, ContractorMessageAdmin)
except admin.sites.AlreadyRegistered:
    pass
