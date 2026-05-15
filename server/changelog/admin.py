from django.contrib import admin
from .models import ChangeLog

try:
    admin.site.unregister(ChangeLog)
except admin.sites.NotRegistered:
    pass


@admin.register(ChangeLog)
class ChangeLogAdmin(admin.ModelAdmin):
    list_display = ['title', 'change_type', 'date', 'created_by', 'created_at']
    list_filter = ['change_type', 'date']
    search_fields = ['title', 'description']
    ordering = ['-date', '-created_at']
    date_hierarchy = 'date'
    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        (None, {
            'fields': ('title', 'description', 'change_type', 'date')
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

    def save_model(self, request, obj, form, change):
        if not obj.pk:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)
