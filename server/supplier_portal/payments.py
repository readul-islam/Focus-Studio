"""Stripe Checkout payments from studios to suppliers."""

from __future__ import annotations

import logging
from decimal import Decimal, ROUND_HALF_UP

import stripe
from django.conf import settings
from django.utils import timezone

from projects.models import Procurement

from .models import SupplierOrderLine
from .stripe_connect import SupplierStripeConnectError, _ensure_stripe, stripe_configured

logger = logging.getLogger(__name__)


class SupplierPaymentError(Exception):
    def __init__(self, message: str, *, code: str = 'payment_error'):
        self.message = message
        self.code = code
        super().__init__(message)


def _minor_units(amount: Decimal, currency: str) -> int:
    zero_decimal = currency.upper() in {'BIF', 'CLP', 'DJF', 'GNF', 'JPY', 'KMF', 'KRW', 'MGA', 'PYG', 'RWF', 'UGX', 'VND', 'VUV', 'XAF', 'XOF', 'XPF'}
    if zero_decimal:
        return int(amount.quantize(Decimal('1'), rounding=ROUND_HALF_UP))
    return int((amount * 100).quantize(Decimal('1'), rounding=ROUND_HALF_UP))


def _platform_fee_amount(total_minor: int) -> int:
    bps = int(getattr(settings, 'STRIPE_SUPPLIER_PLATFORM_FEE_BPS', 0) or 0)
    if bps <= 0:
        return 0
    return int(total_minor * bps / 10000)


def _payment_metadata(
    *,
    order_line: SupplierOrderLine,
    procurement: Procurement,
    paid_by_user=None,
) -> dict[str, str]:
    metadata = {
        'type': 'supplier_order_payment',
        'supplier_order_line_id': str(order_line.id),
        'procurement_id': str(procurement.id),
        'studio_id': str(procurement.studio_id or ''),
    }
    if paid_by_user is not None:
        metadata['paid_by_user_id'] = str(paid_by_user.id)
        if getattr(paid_by_user, 'email', None):
            metadata['paid_by_email'] = paid_by_user.email
    return metadata


def create_supplier_order_checkout(
    *,
    procurement: Procurement,
    success_url: str,
    cancel_url: str,
    paid_by_user=None,
) -> str:
    if not stripe_configured():
        raise SupplierPaymentError('Stripe is not configured.', code='not_configured')

    order_line = getattr(procurement, 'supplier_order_line', None)
    if order_line is None:
        try:
            order_line = SupplierOrderLine.objects.select_related(
                'supplier',
                'catalog_product',
                'project',
            ).get(procurement=procurement)
        except SupplierOrderLine.DoesNotExist:
            raise SupplierPaymentError('This procurement item is not linked to a supplier order.', code='not_supplier_order')

    if order_line.payment_status == 'paid':
        raise SupplierPaymentError('This supplier order has already been paid.', code='already_paid')

    supplier = order_line.supplier
    if not supplier.stripe_connect_account_id or not supplier.stripe_connect_charges_enabled:
        raise SupplierPaymentError(
            'The supplier has not finished Stripe Connect onboarding.',
            code='supplier_not_ready',
        )

    unit_price = order_line.unit_price or procurement.unit_price
    if unit_price is None:
        raise SupplierPaymentError('Order total is missing a unit price.', code='invalid_amount')

    quantity = Decimal(str(order_line.quantity or procurement.quantity or 1))
    total = (Decimal(str(unit_price)) * quantity).quantize(Decimal('0.01'))
    if total <= 0:
        raise SupplierPaymentError('Order total must be greater than zero.', code='invalid_amount')

    currency = (order_line.currency or procurement.catalog_product.currency or 'GBP').lower()
    amount_minor = _minor_units(total, currency)
    application_fee = _platform_fee_amount(amount_minor)

    product_name = order_line.catalog_product.name if order_line.catalog_product else 'Catalog product'
    project_name = order_line.project.project_name if order_line.project else 'Project'

    _ensure_stripe()
    try:
        session = stripe.checkout.Session.create(
            mode='payment',
            line_items=[
                {
                    'price_data': {
                        'currency': currency,
                        'unit_amount': amount_minor,
                        'product_data': {
                            'name': product_name,
                            'description': f'Supplier order for {project_name}',
                        },
                    },
                    'quantity': 1,
                }
            ],
            payment_intent_data={
                'application_fee_amount': application_fee or None,
                'transfer_data': {'destination': supplier.stripe_connect_account_id},
                'metadata': _payment_metadata(
                    order_line=order_line,
                    procurement=procurement,
                    paid_by_user=paid_by_user,
                ),
            },
            metadata=_payment_metadata(
                order_line=order_line,
                procurement=procurement,
                paid_by_user=paid_by_user,
            ),
            success_url=success_url,
            cancel_url=cancel_url,
        )
    except stripe.StripeError as exc:
        logger.exception('Supplier checkout failed for procurement %s', procurement.id)
        raise SupplierPaymentError(getattr(exc, 'user_message', None) or str(exc), code='stripe_error') from exc

    order_line.stripe_checkout_session_id = session.id
    order_line.save(update_fields=['stripe_checkout_session_id', 'updated_at'])
    return session.url


def mark_supplier_order_paid(
    *,
    order_line_id: int,
    payment_intent_id: str | None = None,
    paid_by_email: str | None = None,
) -> None:
    try:
        order_line = SupplierOrderLine.objects.select_related(
            'supplier',
            'catalog_product',
            'project',
            'studio',
            'procurement',
            'procurement__created_by',
        ).get(id=order_line_id)
    except SupplierOrderLine.DoesNotExist:
        logger.warning('Supplier payment webhook: order line %s not found', order_line_id)
        return

    if order_line.payment_status == 'paid':
        return

    order_line.payment_status = 'paid'
    order_line.paid_at = timezone.now()
    if payment_intent_id:
        order_line.stripe_payment_intent_id = payment_intent_id
    order_line.save(update_fields=['payment_status', 'paid_at', 'stripe_payment_intent_id', 'updated_at'])

    from .emails import send_studio_supplier_payment_confirmation_email, send_supplier_payment_received_email

    send_supplier_payment_received_email(order_line)
    send_studio_supplier_payment_confirmation_email(order_line, paid_by_email=paid_by_email)
    logger.info('Supplier order line %s marked paid; payment emails dispatched', order_line.id)


def _metadata_from_payment_object(payload: dict) -> dict | None:
    metadata = payload.get('metadata') or {}
    if metadata.get('type') != 'supplier_order_payment':
        return None
    return metadata


def handle_supplier_checkout_completed(session: dict) -> None:
    metadata = _metadata_from_payment_object(session)
    if not metadata:
        return

    order_line_id = metadata.get('supplier_order_line_id')
    if not order_line_id:
        logger.warning('Supplier checkout completed without order line metadata')
        return

    payment_intent_id = session.get('payment_intent')
    paid_by_email = metadata.get('paid_by_email') or None
    mark_supplier_order_paid(
        order_line_id=int(order_line_id),
        payment_intent_id=payment_intent_id,
        paid_by_email=paid_by_email,
    )


def handle_supplier_payment_intent_succeeded(payment_intent: dict) -> None:
    """Backup handler when checkout.session.completed is delayed or missed."""
    metadata = _metadata_from_payment_object(payment_intent)
    if not metadata:
        return

    order_line_id = metadata.get('supplier_order_line_id')
    if not order_line_id:
        logger.warning('Supplier payment intent succeeded without order line metadata')
        return

    mark_supplier_order_paid(
        order_line_id=int(order_line_id),
        payment_intent_id=payment_intent.get('id'),
        paid_by_email=metadata.get('paid_by_email') or None,
    )
