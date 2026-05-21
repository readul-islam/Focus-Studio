from django.contrib import admin
from .models import DesignSession, DesignMessage, DesignAsset


@admin.register(DesignSession)
class DesignSessionAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'design_type', 'studio', 'user', 'updated_at')
    list_filter = ('design_type', 'studio')


@admin.register(DesignMessage)
class DesignMessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'session', 'role', 'created_at')


@admin.register(DesignAsset)
class DesignAssetAdmin(admin.ModelAdmin):
    list_display = ('id', 'session', 'created_at')
