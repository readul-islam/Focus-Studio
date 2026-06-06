"""Stripe Connect helpers for studio invoice payments."""

from __future__ import annotations

import logging

import stripe
from django.conf import settings

from users.models import Studio

logger = logging.getLogger(__name__)


def stripe_configured() -> bool:
    return bool(getattr(settings, 'STRIPE_SECRET_KEY', ''))


def _ensure_stripe():
    if not stripe_configured():
        raise RuntimeError('Stripe is not configured.')
    stripe.api_key = settings.STRIPE_SECRET_KEY


def _apply_account_state(studio: Studio, account: dict) -> None:
    studio.stripe_connect_charges_enabled = bool(account.get('charges_enabled'))
    studio.stripe_connect_onboarded = bool(account.get('details_submitted'))
    if account.get('id') and not studio.stripe_connect_account_id:
        studio.stripe_connect_account_id = account['id']
    studio.save(
        update_fields=[
            'stripe_connect_account_id',
            'stripe_connect_charges_enabled',
            'stripe_connect_onboarded',
        ]
    )


def connect_status(studio: Studio, *, fallback_email: str | None = None) -> dict:
    configured = stripe_configured()
    if not configured:
        return {
            'configured': False,
            'connected': False,
            'charges_enabled': False,
            'details_submitted': False,
            'requires_action': False,
            'email': fallback_email,
            'studio_name': studio.name if studio else None,
        }

    if not studio.stripe_connect_account_id:
        return {
            'configured': True,
            'connected': False,
            'charges_enabled': False,
            'details_submitted': False,
            'requires_action': False,
            'email': fallback_email,
            'studio_name': studio.name,
        }

    _ensure_stripe()
    account = stripe.Account.retrieve(studio.stripe_connect_account_id)
    _apply_account_state(studio, account)

    charges_enabled = bool(account.get('charges_enabled'))
    details_submitted = bool(account.get('details_submitted'))
    account_email = account.get('email') or fallback_email

    return {
        'configured': True,
        'connected': True,
        'charges_enabled': charges_enabled,
        'details_submitted': details_submitted,
        'requires_action': not charges_enabled,
        'email': account_email,
        'studio_name': studio.name,
    }


def create_onboarding_link(*, studio: Studio, user_email: str) -> str:
    _ensure_stripe()
    frontend = settings.FRONTEND_URL.rstrip('/')
    email = (user_email or '').strip()
    if not email:
        raise ValueError('A valid email is required to connect Stripe.')

    if not studio.stripe_connect_account_id:
        account = stripe.Account.create(
            controller={
                'stripe_dashboard': {'type': 'express'},
                'fees': {'payer': 'application'},
                'losses': {'payments': 'application'},
            },
            capabilities={
                'card_payments': {'requested': True},
                'transfers': {'requested': True},
            },
            email=email,
            metadata={'studio_id': str(studio.id)},
        )
        studio.stripe_connect_account_id = account.id
        studio.save(update_fields=['stripe_connect_account_id'])
    else:
        stripe.Account.modify(studio.stripe_connect_account_id, email=email)

    link = stripe.AccountLink.create(
        account=studio.stripe_connect_account_id,
        refresh_url=f'{frontend}/finance/stripe-connect?refresh=1',
        return_url=f'{frontend}/finance/stripe-connect?return=1',
        type='account_onboarding',
    )
    return link.url


def handle_connect_account_updated(account: dict) -> None:
    """Persist Connect account state from Stripe webhooks."""
    studio_id = (account.get('metadata') or {}).get('studio_id')
    account_id = account.get('id')
    if not studio_id and not account_id:
        return

    studio = None
    if studio_id:
        studio = Studio.objects.filter(id=studio_id).first()
    if not studio and account_id:
        studio = Studio.objects.filter(stripe_connect_account_id=account_id).first()
    if not studio:
        logger.warning('Connect webhook: studio not found for account %s', account_id)
        return

    _apply_account_state(studio, account)
