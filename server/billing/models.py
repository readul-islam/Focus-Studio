from django.db import models
from django.utils import timezone
from users.models import Studio


class StudioSubscription(models.Model):
    """Stripe subscription state for a studio (one subscription per studio)."""

    STATUS_CHOICES = [
        ('incomplete', 'Incomplete'),
        ('incomplete_expired', 'Incomplete expired'),
        ('trialing', 'Trialing'),
        ('active', 'Active'),
        ('past_due', 'Past due'),
        ('canceled', 'Canceled'),
        ('unpaid', 'Unpaid'),
        ('paused', 'Paused'),
    ]

    PLAN_CHOICES = [
        ('beta', 'Beta Access'),
        ('starter', 'Starter'),
        ('professional', 'Professional'),
        ('enterprise', 'Enterprise'),
    ]

    studio = models.OneToOneField(
        Studio,
        on_delete=models.CASCADE,
        related_name='subscription',
    )
    stripe_customer_id = models.CharField(max_length=255, blank=True, null=True, db_index=True)
    stripe_subscription_id = models.CharField(max_length=255, blank=True, null=True, db_index=True)
    plan_tier = models.CharField(max_length=32, choices=PLAN_CHOICES, blank=True, null=True)
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default='incomplete')
    trial_ends_at = models.DateTimeField(blank=True, null=True)
    current_period_start = models.DateTimeField(blank=True, null=True)
    current_period_end = models.DateTimeField(blank=True, null=True)
    cancel_at_period_end = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Studio subscription'
        verbose_name_plural = 'Studio subscriptions'

    def __str__(self):
        return f'{self.studio} — {self.plan_tier or "no plan"} ({self.status})'

    @property
    def is_active(self) -> bool:
        if self.status not in ('active', 'trialing'):
            return False
        if self.status == 'trialing' and self.trial_ends_at and self.trial_ends_at < timezone.now():
            return False
        return bool(self.plan_tier)

    @property
    def needs_plan_selection(self) -> bool:
        return not self.is_active
