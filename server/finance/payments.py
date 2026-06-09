"""Stripe Checkout payments from clients to studios for invoices."""

from __future__ import annotations

import logging
from decimal import Decimal, ROUND_HALF_UP

import stripe
from django.conf import settings
from django.utils import timezone

from finance.models import Invoice
from finance.stripe_connect import StripeConnectError, _ensure_stripe, stripe_configured
from users.models import Studio

logger = logging.getLogger(__name__)


class InvoicePaymentError(Exception):
    def __init__(self, message: str, *, code: str = 'payment_error'):
        self.message = message
        self.code = code
        super().__init__(message)


def _minor_units(amount: Decimal, currency: str) -> int:
    zero_decimal = currency.upper() in {
        'BIF', 'CLP', 'DJF', 'GNF', 'JPY', 'KMF', 'KRW', 'MGA', 'PYG',
        'RWF', 'UGX', 'VND', 'VUV', 'XAF', 'XOF', 'XPF',
    }
    if zero_decimal:
        return int(amount.quantize(Decimal('1'), rounding=ROUND_HALF_UP))
    return int((amount * 100).quantize(Decimal('1'), rounding=ROUND_HALF_UP))


def _platform_fee_amount(total_minor: int) -> int:
    bps = int(getattr(settings, 'STRIPE_INVOICE_PLATFORM_FEE_BPS', 0) or 0)
    if bps <= 0:
        return 0
    return int(total_minor * bps / 10000)


def _payment_metadata(*, invoice: Invoice, client_email: str | None = None) -> dict[str, str]:
    metadata = {
        'type': 'client_invoice_payment',
        'invoice_id': str(invoice.id),
        'studio_id': str(invoice.studio_id or ''),
        'project_id': str(invoice.project_id or ''),
    }
    if client_email:
        metadata['client_email'] = client_email
    return metadata


def invoice_payable(invoice: Invoice, *, studio: Studio | None = None) -> bool:
    if invoice.status == 'PD':
        return False
    if invoice.status not in {'SNT', 'OVD'}:
        return False
    total = invoice.total_amount
    if total is None or Decimal(str(total)) <= 0:
        return False
    studio = studio or invoice.studio
    if not studio:
        return False
    if not stripe_configured():
        return False
    return bool(studio.stripe_connect_account_id and studio.stripe_connect_charges_enabled)


def create_client_invoice_checkout(
    *,
    invoice: Invoice,
    success_url: str,
    cancel_url: str,
    client_email: str | None = None,
) -> str:
    if not stripe_configured():
        raise InvoicePaymentError('Stripe is not configured.', code='not_configured')

    if invoice.status == 'PD':
        raise InvoicePaymentError('This invoice has already been paid.', code='already_paid')

    if invoice.status not in {'SNT', 'OVD'}:
        raise InvoicePaymentError('Only sent or overdue invoices can be paid online.', code='not_payable')

    studio = invoice.studio
    if not studio:
        raise InvoicePaymentError('Invoice is not linked to a studio.', code='invalid_invoice')

    if not studio.stripe_connect_account_id or not studio.stripe_connect_charges_enabled:
        raise InvoicePaymentError(
            'The studio has not finished Stripe Connect onboarding.',
            code='studio_not_ready',
        )

    total = Decimal(str(invoice.total_amount or 0)).quantize(Decimal('0.01'))
    if total <= 0:
        raise InvoicePaymentError('Invoice total must be greater than zero.', code='invalid_amount')

    currency = (invoice.currency or 'GBP').lower()
    amount_minor = _minor_units(total, currency)
    application_fee = _platform_fee_amount(amount_minor)

    invoice_number = f'INV-{invoice.id:03d}'
    project_name = invoice.project.project_name if invoice.project else 'Project'

    _ensure_stripe()
    metadata = _payment_metadata(invoice=invoice, client_email=client_email)
    try:
        session = stripe.checkout.Session.create(
            mode='payment',
            customer_email=client_email or None,
            line_items=[
                {
                    'price_data': {
                        'currency': currency,
                        'unit_amount': amount_minor,
                        'product_data': {
                            'name': f'Invoice {invoice_number}',
                            'description': f'Payment for {project_name}',
                        },
                    },
                    'quantity': 1,
                }
            ],
            payment_intent_data={
                'application_fee_amount': application_fee or None,
                'transfer_data': {'destination': studio.stripe_connect_account_id},
                'metadata': metadata,
            },
            metadata=metadata,
            success_url=success_url,
            cancel_url=cancel_url,
        )
    except stripe.StripeError as exc:
        logger.exception('Client invoice checkout failed for invoice %s', invoice.id)
        raise InvoicePaymentError(getattr(exc, 'user_message', None) or str(exc), code='stripe_error') from exc

    invoice.stripe_checkout_session_id = session.id
    invoice.save(update_fields=['stripe_checkout_session_id', 'updated_at'])
    return session.url


def mark_invoice_paid(*, invoice_id: int, payment_intent_id: str | None = None) -> None:
    try:
        invoice = Invoice.objects.select_related('studio', 'project', 'client').get(id=invoice_id)
    except Invoice.DoesNotExist:
        logger.warning('Invoice payment webhook: invoice %s not found', invoice_id)
        return

    if invoice.status == 'PD':
        return

    invoice.status = 'PD'
    invoice.paid_at = timezone.now()
    if payment_intent_id:
        invoice.stripe_payment_intent_id = payment_intent_id
    invoice.save(update_fields=['status', 'paid_at', 'stripe_payment_intent_id', 'updated_at'])
    logger.info('Invoice %s marked paid via Stripe', invoice.id)


def _metadata_from_payment_object(payload: dict) -> dict | None:
    metadata = payload.get('metadata') or {}
    if metadata.get('type') != 'client_invoice_payment':
        return None
    return metadata


def handle_invoice_checkout_completed(session: dict) -> None:
    metadata = _metadata_from_payment_object(session)
    if not metadata:
        return

    invoice_id = metadata.get('invoice_id')
    if not invoice_id:
        logger.warning('Invoice checkout completed without invoice metadata')
        return

    mark_invoice_paid(
        invoice_id=int(invoice_id),
        payment_intent_id=session.get('payment_intent'),
    )


def handle_invoice_payment_intent_succeeded(payment_intent: dict) -> None:
    """Backup handler when checkout.session.completed is delayed or missed."""
    metadata = _metadata_from_payment_object(payment_intent)
    if not metadata:
        return

    invoice_id = metadata.get('invoice_id')
    if not invoice_id:
        logger.warning('Invoice payment intent succeeded without invoice metadata')
        return

    mark_invoice_paid(
        invoice_id=int(invoice_id),
        payment_intent_id=payment_intent.get('id'),
    )
