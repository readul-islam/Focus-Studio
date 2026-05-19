from django.contrib import admin

from .models import StudioApiKey, WebhookEndpoint


@admin.register(StudioApiKey)
class StudioApiKeyAdmin(admin.ModelAdmin):
    list_display = ('id', 'studio', 'name', 'prefix', 'created_at', 'last_used_at', 'revoked_at')
    list_filter = ('studio',)


@admin.register(WebhookEndpoint)
class WebhookEndpointAdmin(admin.ModelAdmin):
    list_display = ('id', 'studio', 'url', 'is_active', 'created_at')
    list_filter = ('studio', 'is_active')
