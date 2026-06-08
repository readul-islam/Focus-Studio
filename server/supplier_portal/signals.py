from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

from projects.models import Procurement

from .models import SupplierOrderLine


@receiver(post_save, sender=Procurement)
def sync_supplier_order_line(sender, instance, created, **kwargs):
    catalog_product = getattr(instance, 'catalog_product', None)
    if catalog_product is None:
        return

    delivery = SupplierOrderLine.build_delivery_from_project(instance.project)
    defaults = {
        'supplier': catalog_product.supplier,
        'catalog_product': catalog_product,
        'studio': instance.studio,
        'project': instance.project,
        'quantity': instance.quantity or 1,
        'unit_price': instance.unit_price or catalog_product.trade_price,
        'currency': catalog_product.currency or 'GBP',
        **delivery,
    }

    order_line, created = SupplierOrderLine.objects.update_or_create(
        procurement=instance,
        defaults=defaults,
    )

    if created:
        from .emails import send_supplier_new_order_email

        send_supplier_new_order_email(order_line)

    if instance.status == 'ORD' and order_line.status == 'RQ':
        order_line.status = 'CF'
        order_line.ordered_at = timezone.now()
        order_line.save(update_fields=['status', 'ordered_at', 'updated_at'])
