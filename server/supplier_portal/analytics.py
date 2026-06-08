"""Analytics helpers for supplier portal dashboards."""

from __future__ import annotations

from collections import defaultdict
from datetime import timedelta

from django.db.models import Count, Sum
from django.db.models.functions import Coalesce, TruncMonth
from django.utils import timezone

from .models import CatalogProduct, SupplierOrderLine


def line_revenue(line: SupplierOrderLine) -> float:
    if line.unit_price is None:
        return 0.0
    return float(line.unit_price) * float(line.quantity or 1)


def build_monthly_sales(order_lines, *, days: int = 365) -> list[dict]:
    now = timezone.now()
    monthly_sales = (
        order_lines.filter(created_at__gte=now - timedelta(days=days))
        .annotate(month=TruncMonth('created_at'))
        .values('month')
        .annotate(order_count=Count('id'), units=Coalesce(Sum('quantity'), 0.0))
        .order_by('month')
    )

    payload = []
    for row in monthly_sales:
        month_lines = order_lines.filter(
            created_at__year=row['month'].year,
            created_at__month=row['month'].month,
        )
        revenue = sum(line_revenue(line) for line in month_lines.only('unit_price', 'quantity'))
        paid_revenue = sum(
            line_revenue(line)
            for line in month_lines.filter(payment_status='paid').only('unit_price', 'quantity', 'payment_status')
        )
        payload.append(
            {
                'month': row['month'].strftime('%Y-%m'),
                'order_count': row['order_count'],
                'units': row['units'],
                'revenue': revenue,
                'paid_revenue': paid_revenue,
            }
        )
    return payload


def build_top_products(order_lines, *, limit: int = 10) -> list[dict]:
    grouped: dict[int, dict] = defaultdict(lambda: {'units': 0.0, 'orders': 0, 'revenue': 0.0, 'name': 'Unknown product'})
    for line in order_lines.select_related('catalog_product').only(
        'catalog_product_id',
        'catalog_product__name',
        'quantity',
        'unit_price',
    ):
        product_id = line.catalog_product_id or 0
        bucket = grouped[product_id]
        bucket['product_id'] = product_id
        bucket['name'] = line.catalog_product.name if line.catalog_product else 'Unknown product'
        bucket['units'] += float(line.quantity or 1)
        bucket['orders'] += 1
        bucket['revenue'] += line_revenue(line)

    return sorted(grouped.values(), key=lambda row: row['revenue'], reverse=True)[:limit]


def build_studio_breakdown(order_lines, *, limit: int = 10) -> list[dict]:
    grouped: dict[int, dict] = defaultdict(lambda: {'orders': 0, 'revenue': 0.0, 'name': 'Unknown studio'})
    for line in order_lines.select_related('studio').only('studio_id', 'studio__name', 'quantity', 'unit_price'):
        studio_id = line.studio_id or 0
        bucket = grouped[studio_id]
        bucket['studio_id'] = studio_id
        bucket['name'] = line.studio.name if line.studio else 'Unknown studio'
        bucket['orders'] += 1
        bucket['revenue'] += line_revenue(line)

    return sorted(grouped.values(), key=lambda row: row['revenue'], reverse=True)[:limit]


def build_category_breakdown(supplier) -> list[dict]:
    rows = (
        CatalogProduct.objects.filter(supplier=supplier, is_published=True)
        .values('category')
        .annotate(product_count=Count('id'))
        .order_by('-product_count')
    )
    return [
        {
            'category': row['category'] or 'Uncategorized',
            'product_count': row['product_count'],
        }
        for row in rows
    ]


def build_payment_breakdown(order_lines) -> list[dict]:
    return list(
        order_lines.values('payment_status')
        .annotate(count=Count('id'))
        .order_by('payment_status')
    )


def build_fulfillment_metrics(order_lines) -> dict:
    delivered = order_lines.filter(status='DL').count()
    shipped = order_lines.filter(status='SH').count()
    total = order_lines.count()
    paid = order_lines.filter(payment_status='paid').count()

    return {
        'delivery_rate': round((delivered / total) * 100, 1) if total else 0.0,
        'shipped_count': shipped,
        'delivered_count': delivered,
        'paid_orders': paid,
        'unpaid_orders': order_lines.exclude(payment_status='paid').count(),
    }


def build_supplier_summary(supplier, order_lines, month_lines) -> dict:
    totals = month_lines.aggregate(
        line_count=Count('id'),
        units_sold=Coalesce(Sum('quantity'), 0.0),
    )
    month_revenue = sum(line_revenue(line) for line in month_lines.only('unit_price', 'quantity'))
    month_paid_revenue = sum(
        line_revenue(line)
        for line in month_lines.filter(payment_status='paid').only('unit_price', 'quantity', 'payment_status')
    )

    return {
        'total_products': CatalogProduct.objects.filter(supplier=supplier).count(),
        'published_products': CatalogProduct.objects.filter(supplier=supplier, is_published=True).count(),
        'total_orders': order_lines.count(),
        'open_orders': order_lines.filter(status__in=['RQ', 'CF', 'SH']).count(),
        'month_orders': totals['line_count'],
        'month_units': totals['units_sold'],
        'month_revenue': month_revenue,
        'month_paid_revenue': month_paid_revenue,
        'lifetime_revenue': sum(line_revenue(line) for line in order_lines.only('unit_price', 'quantity')),
        'lifetime_paid_revenue': sum(
            line_revenue(line)
            for line in order_lines.filter(payment_status='paid').only('unit_price', 'quantity', 'payment_status')
        ),
    }
