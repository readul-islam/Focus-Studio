from django.contrib import admin

from .models import HelpArticleFeedback


@admin.register(HelpArticleFeedback)
class HelpArticleFeedbackAdmin(admin.ModelAdmin):
    list_display = ('category', 'article_slug', 'rating', 'user', 'created_at')
    list_filter = ('rating', 'category')
    search_fields = ('article_slug', 'comment', 'user__email')
