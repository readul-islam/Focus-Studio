"""Stripe billing integration."""

from __future__ import annotations

import logging
from datetime import datetime, timezone as dt_timezone

import stripe
from django.conf import settings
from django.utils import timezone

from users.models import Studio

from .models import StudioSubscription
from .plans import get_plan

logger = logging.getLogger(__name__)


def stripe_configured() -> bool:
    return bool(getattr(settings, 'STRIPE_SECRET_KEY', ''))


def _ensure_stripe():
    if not stripe_configured():
        raise RuntimeError('Stripe is not configured. Set STRIPE_SECRET_KEY and price IDs.')
    stripe.api_key = settings.STRIPE_SECRET_KEY


def get_or_create_subscription(studio: Studio) -> StudioSubscription:
    sub, _ = StudioSubscription.objects.get_or_create(studio=studio)
    return sub


def _ts_to_aware(ts: int | None) -> datetime | None:
    if not ts:
        return None
    return datetime.fromtimestamp(ts, tz=dt_timezone.utc)


def apply_stripe_subscription(studio: Studio, stripe_sub: dict, plan_tier: str | None = None) -> StudioSubscription:
    """Persist Stripe subscription object onto StudioSubscription."""
    sub = get_or_create_subscription(studio)
    sub.stripe_subscription_id = stripe_sub.get('id')
    sub.status = stripe_sub.get('status', sub.status)
    sub.trial_ends_at = _ts_to_aware(stripe_sub.get('trial_end'))
    sub.current_period_start = _ts_to_aware(stripe_sub.get('current_period_start'))
    sub.current_period_end = _ts_to_aware(stripe_sub.get('current_period_end'))
    sub.cancel_at_period_end = bool(stripe_sub.get('cancel_at_period_end'))

    if plan_tier:
        sub.plan_tier = plan_tier
    elif stripe_sub.get('metadata', {}).get('plan_tier'):
        sub.plan_tier = stripe_sub['metadata']['plan_tier']
    elif stripe_sub.get('items', {}).get('data'):
        price_id = stripe_sub['items']['data'][0].get('price', {}).get('id')
        sub.plan_tier = _tier_from_price_id(price_id) or sub.plan_tier

    sub.save()
    return sub


def _tier_from_price_id(price_id: str | None) -> str | None:
    if not price_id:
        return None
    mapping = {
        getattr(settings, 'STRIPE_PRICE_SOLO', ''): 'solo',
        getattr(settings, 'STRIPE_PRICE_STARTER', ''): 'starter',
        getattr(settings, 'STRIPE_PRICE_PROFESSIONAL', ''): 'professional',
        getattr(settings, 'STRIPE_PRICE_ENTERPRISE', ''): 'enterprise',
    }
    return mapping.get(price_id)


def subscription_payload(sub: StudioSubscription | None) -> dict:
    if not sub:
        return {
            'has_subscription': False,
            'is_active': False,
            'needs_plan_selection': True,
            'plan_tier': None,
            'status': None,
            'trial_ends_at': None,
            'current_period_end': None,
            'cancel_at_period_end': False,
        }
    return {
        'has_subscription': bool(sub.stripe_subscription_id or sub.plan_tier),
        'is_active': sub.is_active,
        'needs_plan_selection': sub.needs_plan_selection,
        'plan_tier': sub.plan_tier,
        'status': sub.status,
        'trial_ends_at': sub.trial_ends_at.isoformat() if sub.trial_ends_at else None,
        'current_period_end': sub.current_period_end.isoformat() if sub.current_period_end else None,
        'cancel_at_period_end': sub.cancel_at_period_end,
    }


def _sync_stripe_product_display(price_id: str, plan: dict) -> None:
    """Keep Stripe Checkout line items aligned with our plan marketing copy."""
    price = stripe.Price.retrieve(price_id, expand=['product'])
    product_id = price['product'] if isinstance(price['product'], str) else price['product']['id']
    stripe.Product.modify(
        product_id,
        name=plan.get('stripe_name') or plan['name'],
        description=plan.get('stripe_description') or '',
    )
    nickname = f"{plan['name']} — billed monthly"
    stripe.Price.modify(price_id, nickname=nickname)


def activate_plan_without_payment(*, studio: Studio, plan_tier: str) -> StudioSubscription:
    """Activate a plan that does not require Stripe Checkout (e.g. beta access)."""
    plan = get_plan(plan_tier)
    if not plan.get('no_payment_required'):
        raise ValueError(f'Plan "{plan_tier}" requires checkout.')

    sub = get_or_create_subscription(studio)
    sub.plan_tier = plan_tier
    sub.status = 'active'
    sub.trial_ends_at = None
    sub.save(update_fields=['plan_tier', 'status', 'trial_ends_at', 'updated_at'])
    return sub


def create_checkout_session(*, studio: Studio, user, plan_tier: str) -> str:
    _ensure_stripe()
    plan = get_plan(plan_tier)
    if plan.get('no_payment_required'):
        raise ValueError(f'Plan "{plan_tier}" does not use checkout. Use activate instead.')
    price_id = plan.get('stripe_price_id')
    if not price_id:
        raise ValueError(f'Checkout is not available for plan "{plan_tier}". Configure STRIPE_PRICE_* env vars.')

    _sync_stripe_product_display(price_id, plan)

    sub = get_or_create_subscription(studio)

    if not sub.stripe_customer_id:
        customer = stripe.Customer.create(
            email=user.email,
            name=studio.name or user.name or user.email,
            metadata={'studio_id': str(studio.id)},
        )
        sub.stripe_customer_id = customer['id']
        sub.save(update_fields=['stripe_customer_id', 'updated_at'])

    trial_days = getattr(settings, 'STRIPE_TRIAL_DAYS', 14)

    session = stripe.checkout.Session.create(
        customer=sub.stripe_customer_id,
        mode='subscription',
        line_items=[{'price': price_id, 'quantity': 1}],
        subscription_data={
            'trial_period_days': trial_days,
            'metadata': {
                'studio_id': str(studio.id),
                'plan_tier': plan_tier,
            },
        },
        custom_text={
            'submit': {'message': f'Start your {trial_days}-day free trial — cancel anytime.'},
        },
        success_url=f'{settings.FRONTEND_URL}/billing/success?session_id={{CHECKOUT_SESSION_ID}}',
        cancel_url=f'{settings.FRONTEND_URL}/billing/cancel',
        metadata={
            'studio_id': str(studio.id),
            'plan_tier': plan_tier,
        },
        allow_promotion_codes=True,
    )
    return session['url']


def create_portal_session(*, studio: Studio) -> str:
    _ensure_stripe()
    sub = get_or_create_subscription(studio)
    if not sub.stripe_customer_id:
        raise ValueError('No billing customer on file. Subscribe to a plan first.')
    session = stripe.billing_portal.Session.create(
        customer=sub.stripe_customer_id,
        return_url=f'{settings.FRONTEND_URL}/settings/studio/billing',
    )
    return session['url']


def verify_checkout_session(session_id: str, studio: Studio) -> StudioSubscription:
    _ensure_stripe()
    session = stripe.checkout.Session.retrieve(session_id, expand=['subscription'])
    meta_studio = session.get('metadata', {}).get('studio_id')
    if meta_studio and str(studio.id) != str(meta_studio):
        raise PermissionError('Checkout session does not belong to this studio.')

    plan_tier = session.get('metadata', {}).get('plan_tier')
    stripe_sub = session.get('subscription')
    if isinstance(stripe_sub, str):
        stripe_sub = stripe.Subscription.retrieve(stripe_sub)
    if stripe_sub:
        return apply_stripe_subscription(studio, stripe_sub, plan_tier=plan_tier)

    sub = get_or_create_subscription(studio)
    if plan_tier:
        sub.plan_tier = plan_tier
        sub.save(update_fields=['plan_tier', 'updated_at'])
    return sub


def handle_webhook_event(payload: bytes, sig_header: str) -> None:
    _ensure_stripe()
    webhook_secret = getattr(settings, 'STRIPE_WEBHOOK_SECRET', '')
    if not webhook_secret:
        raise RuntimeError('STRIPE_WEBHOOK_SECRET is not configured.')

    event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
    event_type = event['type']
    data = event['data']['object']

    if event_type == 'checkout.session.completed':
        from finance.payments import handle_invoice_checkout_completed
        from supplier_portal.payments import handle_supplier_checkout_completed

        handle_supplier_checkout_completed(data)
        handle_invoice_checkout_completed(data)
        _on_checkout_completed(data)
    elif event_type in ('customer.subscription.created', 'customer.subscription.updated'):
        _on_subscription_updated(data)
    elif event_type == 'customer.subscription.deleted':
        _on_subscription_deleted(data)
    elif event_type == 'invoice.payment_failed':
        _on_payment_failed(data)
    elif event_type == 'payment_intent.succeeded':
        from finance.payments import handle_invoice_payment_intent_succeeded
        from supplier_portal.payments import handle_supplier_payment_intent_succeeded

        handle_supplier_payment_intent_succeeded(data)
        handle_invoice_payment_intent_succeeded(data)
    elif event_type == 'account.updated':
        from finance.stripe_connect import handle_connect_account_updated
        from supplier_portal.stripe_connect import handle_connect_account_updated as handle_supplier_connect_updated

        handle_connect_account_updated(data)
        handle_supplier_connect_updated(data)


def _studio_from_metadata(metadata: dict) -> Studio | None:
    studio_id = metadata.get('studio_id')
    if not studio_id:
        return None
    try:
        return Studio.objects.get(pk=studio_id)
    except Studio.DoesNotExist:
        logger.warning('Studio %s not found for billing webhook', studio_id)
        return None


def _on_checkout_completed(session: dict) -> None:
    studio = _studio_from_metadata(session.get('metadata') or {})
    if not studio:
        return
    plan_tier = (session.get('metadata') or {}).get('plan_tier')
    sub_id = session.get('subscription')
    if sub_id:
        stripe_sub = stripe.Subscription.retrieve(sub_id)
        apply_stripe_subscription(studio, stripe_sub, plan_tier=plan_tier)


def _on_subscription_updated(stripe_sub: dict) -> None:
    studio = _studio_from_metadata(stripe_sub.get('metadata') or {})
    if not studio:
        customer_id = stripe_sub.get('customer')
        if customer_id:
            try:
                sub = StudioSubscription.objects.get(stripe_customer_id=customer_id)
                studio = sub.studio
            except StudioSubscription.DoesNotExist:
                return
        else:
            return
    apply_stripe_subscription(studio, stripe_sub)


def _on_subscription_deleted(stripe_sub: dict) -> None:
    sub_id = stripe_sub.get('id')
    try:
        sub = StudioSubscription.objects.get(stripe_subscription_id=sub_id)
    except StudioSubscription.DoesNotExist:
        return
    sub.status = 'canceled'
    sub.stripe_subscription_id = None
    sub.cancel_at_period_end = False
    sub.save(update_fields=['status', 'stripe_subscription_id', 'cancel_at_period_end', 'updated_at'])


def _on_payment_failed(invoice: dict) -> None:
    sub_id = invoice.get('subscription')
    if not sub_id:
        return
    try:
        sub = StudioSubscription.objects.get(stripe_subscription_id=sub_id)
    except StudioSubscription.DoesNotExist:
        return
    sub.status = 'past_due'
    sub.save(update_fields=['status', 'updated_at'])
