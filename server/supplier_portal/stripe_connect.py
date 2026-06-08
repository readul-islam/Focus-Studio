"""Stripe Connect helpers for supplier payout accounts."""

from __future__ import annotations

import logging

import stripe
from django.conf import settings

from .models import SupplierAccount

logger = logging.getLogger(__name__)


class SupplierStripeConnectError(Exception):
    """Raised when supplier Connect onboarding cannot proceed."""

    def __init__(self, message: str, *, code: str = 'stripe_error'):
        self.message = message
        self.code = code
        super().__init__(message)


def stripe_configured() -> bool:
    return bool(getattr(settings, 'STRIPE_SECRET_KEY', ''))


def _ensure_stripe():
    if not stripe_configured():
        raise SupplierStripeConnectError('Stripe is not configured.', code='not_configured')
    stripe.api_key = settings.STRIPE_SECRET_KEY


def _map_stripe_error(exc: stripe.StripeError) -> SupplierStripeConnectError:
    message = getattr(exc, 'user_message', None) or str(exc)
    lowered = message.lower()
    if 'signed up for connect' in lowered or 'enable connect' in lowered:
        return SupplierStripeConnectError(
            'Stripe Connect is not enabled on this platform account. '
            'Enable Connect in the Stripe Dashboard, then try again.',
            code='connect_not_enabled',
        )
    return SupplierStripeConnectError(message, code='stripe_error')


def _apply_account_state(supplier: SupplierAccount, account: dict) -> None:
    supplier.stripe_connect_charges_enabled = bool(account.get('charges_enabled'))
    supplier.stripe_connect_payouts_enabled = bool(account.get('payouts_enabled'))
    supplier.stripe_connect_onboarded = bool(account.get('details_submitted'))
    if account.get('id') and not supplier.stripe_connect_account_id:
        supplier.stripe_connect_account_id = account['id']
    supplier.save(
        update_fields=[
            'stripe_connect_account_id',
            'stripe_connect_charges_enabled',
            'stripe_connect_payouts_enabled',
            'stripe_connect_onboarded',
        ]
    )


def connect_status(supplier: SupplierAccount, *, fallback_email: str | None = None) -> dict:
    configured = stripe_configured()
    if not configured:
        return {
            'configured': False,
            'connected': False,
            'charges_enabled': False,
            'payouts_enabled': False,
            'details_submitted': False,
            'requires_action': False,
            'email': fallback_email,
            'company_name': supplier.company_name if supplier else None,
        }

    if not supplier.stripe_connect_account_id:
        return {
            'configured': True,
            'connected': False,
            'charges_enabled': False,
            'payouts_enabled': False,
            'details_submitted': False,
            'requires_action': False,
            'email': fallback_email,
            'company_name': supplier.company_name,
        }

    _ensure_stripe()
    account = stripe.Account.retrieve(supplier.stripe_connect_account_id)
    _apply_account_state(supplier, account)

    charges_enabled = bool(account.get('charges_enabled'))
    details_submitted = bool(account.get('details_submitted'))
    payouts_enabled = bool(account.get('payouts_enabled'))

    return {
        'configured': True,
        'connected': True,
        'charges_enabled': charges_enabled,
        'payouts_enabled': payouts_enabled,
        'details_submitted': details_submitted,
        'requires_action': not charges_enabled,
        'email': account.get('email') or fallback_email,
        'company_name': supplier.company_name,
    }


def create_onboarding_link(*, supplier: SupplierAccount, user_email: str) -> str:
    _ensure_stripe()
    portal_url = settings.SUPPLIER_PORTAL_URL.rstrip('/')
    email = (user_email or supplier.email or '').strip()
    if not email:
        raise SupplierStripeConnectError('A valid email is required to connect Stripe.', code='invalid_email')

    try:
        if not supplier.stripe_connect_account_id:
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
                metadata={'supplier_account_id': str(supplier.id)},
            )
            supplier.stripe_connect_account_id = account.id
            supplier.save(update_fields=['stripe_connect_account_id'])
        else:
            stripe.Account.modify(supplier.stripe_connect_account_id, email=email)

        link = stripe.AccountLink.create(
            account=supplier.stripe_connect_account_id,
            refresh_url=f'{portal_url}/payments?refresh=1',
            return_url=f'{portal_url}/payments?return=1',
            type='account_onboarding',
        )
    except stripe.StripeError as exc:
        logger.exception('Stripe Connect onboarding failed for supplier %s', supplier.id)
        raise _map_stripe_error(exc) from exc

    return link.url


def handle_connect_account_updated(account: dict) -> None:
    """Persist Connect account state from Stripe webhooks."""
    supplier_id = (account.get('metadata') or {}).get('supplier_account_id')
    account_id = account.get('id')
    if not supplier_id and not account_id:
        return

    supplier = None
    if supplier_id:
        supplier = SupplierAccount.objects.filter(id=supplier_id).first()
    if not supplier and account_id:
        supplier = SupplierAccount.objects.filter(stripe_connect_account_id=account_id).first()
    if not supplier:
        logger.warning('Connect webhook: supplier not found for account %s', account_id)
        return

    _apply_account_state(supplier, account)
