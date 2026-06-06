from django.contrib import admin

from .models import Presentation, PresentationSlide, PresentationPin, PresentationComment


class PresentationSlideInline(admin.TabularInline):
    model = PresentationSlide
    extra = 0


@admin.register(Presentation)
class PresentationAdmin(admin.ModelAdmin):
    list_display = ['title', 'project', 'studio', 'updated_at', 'client_dashboard_published', 'web_published']
    list_filter = ['studio', 'client_dashboard_published', 'web_published']
    search_fields = ['title']
    inlines = [PresentationSlideInline]


@admin.register(PresentationPin)
class PresentationPinAdmin(admin.ModelAdmin):
    list_display = ['id', 'slide', 'pin_type', 'product', 'design_asset']


@admin.register(PresentationComment)
class PresentationCommentAdmin(admin.ModelAdmin):
    list_display = ['id', 'slide', 'author_type', 'created_at']
