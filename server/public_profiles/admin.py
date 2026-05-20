from django.contrib import admin
from .models import StudioPublicProfile, StudioPortfolioItem, StudioReview, StudioPublicTeamMember


@admin.register(StudioPublicProfile)
class StudioPublicProfileAdmin(admin.ModelAdmin):
    list_display = ('studio', 'slug', 'is_published', 'updated_at')
    list_filter = ('is_published',)
    search_fields = ('slug', 'studio__name')


@admin.register(StudioPortfolioItem)
class StudioPortfolioItemAdmin(admin.ModelAdmin):
    list_display = ('title', 'studio', 'is_featured', 'is_published', 'sort_order')
    list_filter = ('studio', 'is_featured')


@admin.register(StudioReview)
class StudioReviewAdmin(admin.ModelAdmin):
    list_display = ('author_name', 'studio', 'rating', 'is_published')


@admin.register(StudioPublicTeamMember)
class StudioPublicTeamMemberAdmin(admin.ModelAdmin):
    list_display = ('name', 'profile', 'sort_order', 'is_visible')
