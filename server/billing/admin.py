from django.contrib import admin
from .models import StudioSubscription


@admin.register(StudioSubscription)
class StudioSubscriptionAdmin(admin.ModelAdmin):
    list_display = ('studio', 'plan_tier', 'status', 'trial_ends_at', 'current_period_end', 'updated_at')
    list_filter = ('status', 'plan_tier')
    search_fields = ('studio__name', 'stripe_customer_id', 'stripe_subscription_id')
    readonly_fields = ('created_at', 'updated_at')
