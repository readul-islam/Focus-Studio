"""RFQ / quote workflow for catalog procurement items."""

from __future__ import annotations

import logging
from decimal import Decimal

from django.utils import timezone

from projects.models import Procurement

from .emails import send_studio_quote_received_email, send_supplier_quote_request_email
from .models import SupplierOrderLine

logger = logging.getLogger(__name__)


class SupplierQuoteError(Exception):
    def __init__(self, message: str, *, code: str = 'quote_error'):
        self.message = message
        self.code = code
        super().__init__(message)


def request_catalog_quote(*, procurement: Procurement, message: str = '') -> SupplierOrderLine:
    order_line = getattr(procurement, 'supplier_order_line', None)
    if order_line is None:
        try:
            order_line = SupplierOrderLine.objects.select_related(
                'supplier',
                'catalog_product',
                'project',
                'studio',
            ).get(procurement=procurement)
        except SupplierOrderLine.DoesNotExist:
            raise SupplierQuoteError(
                'This procurement item is not linked to a supplier order.',
                code='not_supplier_order',
            )

    if order_line.quote_status == 'QT':
        raise SupplierQuoteError('A quote has already been submitted for this item.', code='already_quoted')
    if order_line.quote_status == 'RQ':
        raise SupplierQuoteError('A quote has already been requested.', code='already_requested')

    now = timezone.now()
    order_line.quote_status = 'RQ'
    order_line.quote_requested_at = now
    order_line.save(update_fields=['quote_status', 'quote_requested_at', 'updated_at'])

    procurement.status = 'QT'
    procurement.save(update_fields=['status', 'updated_at'])

    send_supplier_quote_request_email(order_line, message=message)
    logger.info('Quote requested for procurement %s / order line %s', procurement.id, order_line.id)
    return order_line


def submit_catalog_quote(
    *,
    order_line: SupplierOrderLine,
    unit_price: Decimal,
    lead_time_days: int | None = None,
    notes: str = '',
) -> SupplierOrderLine:
    if order_line.quote_status not in {'RQ', 'NR'}:
        raise SupplierQuoteError('This order is not awaiting a quote.', code='invalid_state')
    if unit_price <= 0:
        raise SupplierQuoteError('Quoted unit price must be greater than zero.', code='invalid_amount')

    now = timezone.now()
    order_line.unit_price = unit_price
    order_line.quote_status = 'QT'
    order_line.quoted_at = now
    order_line.quoted_lead_time_days = lead_time_days
    order_line.quote_notes = notes or None
    order_line.save(
        update_fields=[
            'unit_price',
            'quote_status',
            'quoted_at',
            'quoted_lead_time_days',
            'quote_notes',
            'updated_at',
        ]
    )

    procurement = getattr(order_line, 'procurement', None)
    if procurement is None and order_line.procurement_id:
        procurement = Procurement.objects.filter(id=order_line.procurement_id).first()

    if procurement:
        procurement.unit_price = unit_price
        procurement.status = 'CR' if procurement.client_access else 'IA'
        if lead_time_days is not None:
            procurement.lead_time = f'{lead_time_days} days'
        procurement.save(update_fields=['unit_price', 'status', 'lead_time', 'updated_at'])

    send_studio_quote_received_email(order_line)
    logger.info('Quote submitted for order line %s', order_line.id)
    return order_line
