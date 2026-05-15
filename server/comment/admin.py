from django.contrib import admin
from .models import Comments


# @admin.register(Comments)
# class CommentsAdmin(admin.ModelAdmin):
#     list_display = ['id', 'user', 'text', 'studio', 'created_at']
#     list_filter = ['studio', 'created_at']
#     search_fields = ['text', 'user__email']
#     readonly_fields = ['created_at', 'updated_at']
