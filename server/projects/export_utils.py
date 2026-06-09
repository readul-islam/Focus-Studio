"""FF&E / procurement schedule export helpers."""

from __future__ import annotations

import csv
import io
from html import escape

from projects.models import Procurement


def _product_name(procurement: Procurement) -> str:
    if procurement.product and procurement.product.name:
        return procurement.product.name
    if procurement.catalog_product and procurement.catalog_product.name:
        return procurement.catalog_product.name
    return procurement.description or ''


def _supplier_name(procurement: Procurement) -> str:
    if procurement.product and procurement.product.supplier:
        s = procurement.product.supplier
        return s.company_name or s.name or ''
    if procurement.catalog_product and procurement.catalog_product.supplier:
        return procurement.catalog_product.supplier.company_name or ''
    return ''


def _spec_fields(procurement: Procurement) -> dict[str, str]:
    product = procurement.product
    if not product:
        return {
            'materials': '',
            'dimension': '',
            'composition': '',
            'construction': '',
            'url': '',
            'type': '',
        }
    return {
        'materials': product.materials or '',
        'dimension': product.dimension or '',
        'composition': product.composition or '',
        'construction': product.construction or '',
        'url': product.url or '',
        'type': product.type or '',
    }


def procurement_export_rows(procurements) -> list[dict]:
    rows = []
    for item in procurements:
        specs = _spec_fields(item)
        qty = float(item.quantity or 1)
        unit_price = float(item.unit_price or 0)
        rows.append({
            'product': _product_name(item),
            'room': item.room.name if item.room else '',
            'supplier': _supplier_name(item),
            'quantity': qty,
            'unit': item.unit_type or 'EA',
            'unit_price': unit_price,
            'total_price': qty * unit_price,
            'status': item.status or '',
            'materials': specs['materials'],
            'dimension': specs['dimension'],
            'composition': specs['composition'],
            'construction': specs['construction'],
            'product_type': specs['type'],
            'product_url': specs['url'],
            'eta': item.ETA.isoformat() if item.ETA else '',
            'tracking': item.tracking_number or '',
        })
    return rows


def render_procurement_csv(rows: list[dict]) -> str:
    headers = [
        'Product', 'Room', 'Supplier', 'Qty', 'Unit', 'Unit Price', 'Total',
        'Status', 'Materials', 'Dimensions', 'Composition', 'Construction',
        'Product Type', 'URL', 'ETA', 'Tracking',
    ]
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(headers)
    for row in rows:
        writer.writerow([
            row['product'], row['room'], row['supplier'], row['quantity'], row['unit'],
            row['unit_price'], row['total_price'], row['status'],
            row['materials'], row['dimension'], row['composition'], row['construction'],
            row['product_type'], row['product_url'], row['eta'], row['tracking'],
        ])
    return buffer.getvalue()


def render_procurement_spec_html(*, project_name: str, rows: list[dict]) -> str:
    body_rows = []
    for row in rows:
        body_rows.append(
            '<tr>'
            f'<td>{escape(row["product"])}</td>'
            f'<td>{escape(row["room"])}</td>'
            f'<td>{escape(row["supplier"])}</td>'
            f'<td>{row["quantity"]}</td>'
            f'<td>{escape(row["materials"])}</td>'
            f'<td>{escape(row["dimension"])}</td>'
            f'<td>{escape(row["composition"])}</td>'
            f'<td>{escape(row["construction"])}</td>'
            '</tr>'
        )
    return f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"/><title>FF&amp;E Schedule — {escape(project_name)}</title>
<style>
body {{ font-family: system-ui, sans-serif; margin: 2rem; color: #111; }}
h1 {{ font-size: 1.25rem; margin-bottom: 0.25rem; }}
p {{ color: #555; margin-top: 0; }}
table {{ width: 100%; border-collapse: collapse; margin-top: 1.5rem; font-size: 12px; }}
th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; vertical-align: top; }}
th {{ background: #f5f5f4; }}
</style></head><body>
<h1>FF&amp;E Schedule</h1>
<p>{escape(project_name)}</p>
<table>
<thead><tr>
<th>Product</th><th>Room</th><th>Supplier</th><th>Qty</th>
<th>Materials</th><th>Dimensions</th><th>Composition</th><th>Construction</th>
</tr></thead>
<tbody>{''.join(body_rows)}</tbody>
</table></body></html>"""
