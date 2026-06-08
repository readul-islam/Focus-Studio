"""Sync supplier order fulfillment back to studio procurement."""

from __future__ import annotations

import logging

from projects.models import Procurement

from .models import SupplierOrderLine

logger = logging.getLogger(__name__)

PROCUREMENT_STATUS_MAP = {
    'SH': {'status': 'IT', 'logistic_status': 'IT'},
    'DL': {'status': 'DEL', 'logistic_status': 'DD'},
}


def sync_procurement_from_order_line(order_line: SupplierOrderLine) -> None:
    procurement = getattr(order_line, 'procurement', None)
    if procurement is None and order_line.procurement_id:
        procurement = Procurement.objects.filter(id=order_line.procurement_id).first()
    if not procurement:
        return

    mapping = PROCUREMENT_STATUS_MAP.get(order_line.status)
    if not mapping:
        return

    updates = {}
    if mapping.get('status') and procurement.status != mapping['status']:
        updates['status'] = mapping['status']
    if mapping.get('logistic_status') and procurement.logistic_status != mapping['logistic_status']:
        updates['logistic_status'] = mapping['logistic_status']

    if updates:
        Procurement.objects.filter(id=procurement.id).update(**updates)
        logger.info('Synced procurement %s from supplier order line %s: %s', procurement.id, order_line.id, updates)


def apply_order_line_status_change(order_line: SupplierOrderLine, *, previous_status: str) -> None:
    if order_line.status == previous_status:
        return

    sync_procurement_from_order_line(order_line)

    from .emails import send_studio_supplier_order_status_email

    send_studio_supplier_order_status_email(order_line, previous_status=previous_status)
