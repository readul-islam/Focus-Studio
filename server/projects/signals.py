from django.db.models.signals import pre_delete, pre_save, post_save, m2m_changed
from django.dispatch import receiver
from finance.models import PurchaseOrder, Invoice
from projects.models import Procurement

@receiver(pre_delete, sender=PurchaseOrder)
def reset_procurement_po_flags(sender, instance, **kwargs):
    """
    Reset procurement PO flags when a PurchaseOrder is deleted.
    """
    procurements = Procurement.objects.filter(po=instance)
    procurements.update(
        po_created=False,
        po_sent=False,
        po_received=False,
        po=None,
        status='IR',
        order_date=None,
        lead_time=None,
        logistic_status='IT',
        ETA=None
    )

@receiver(pre_delete, sender=Invoice)
def reset_procurement_invoice_flags(sender, instance, **kwargs):
    """
    Reset procurement Invoice flags when an Invoice is deleted.
    """
    procurements = Procurement.objects.filter(invoice=instance)
    procurements.update(
        inv_created=False,
        inv_sent=False,
        inv_received=False,
        invoice=None
    )

@receiver(m2m_changed, sender='projects.Project_secondary_client')
def sync_secondary_client_portal_access(sender, instance, action, pk_set, **kwargs):
    """
    Auto-create or remove ClientProject records when clients are added/removed
    from Project.secondary_client, so they automatically gain/lose client portal access.
    """
    from client_portal.models import ClientProject
    from crm.models import Client

    if action == 'post_add' and pk_set:
        for client_id in pk_set:
            try:
                client = Client.objects.get(pk=client_id)
                ClientProject.objects.get_or_create(client=client, project=instance)
            except Client.DoesNotExist:
                pass

    elif action == 'post_remove' and pk_set:
        ClientProject.objects.filter(
            project=instance,
            client_id__in=pk_set,
        ).delete()

    elif action == 'post_clear':
        # Collect current secondary client ids before they were cleared — not available here,
        # so we remove all ClientProject records that don't match the primary client.
        ClientProject.objects.filter(project=instance).exclude(
            client=instance.client
        ).delete()


@receiver(pre_save, sender='projects.Project')
def update_project_location_from_client(sender, instance, **kwargs):
    """
    Update project location and billing address from client address.
    Fires if field is empty OR if the client has changed.
    Uses address_line_1 as the representative address value.
    """
    if not instance.id:
        # New project
        if instance.client:
            client_address = instance.client.address_line_1
            if client_address:
                if not instance.location:
                    instance.location = client_address
                if not instance.billing_address_line_1:
                    instance.billing_address_line_1 = client_address
    else:
        # Existing project (PATCH/PUT)
        try:
            old_instance = sender.objects.get(id=instance.id)
            client_changed = old_instance.client != instance.client
        except sender.DoesNotExist:
            client_changed = False

        if instance.client:
            client_address = instance.client.address_line_1
            if client_address:
                # Update location if empty or client changed
                if not instance.location or client_changed:
                    instance.location = client_address
                # Update billing_address_line_1 if empty or client changed
                if not instance.billing_address_line_1 or client_changed:
                    instance.billing_address_line_1 = client_address


@receiver(post_save, sender=Invoice)
def mark_procurements_inv_received_on_paid(sender, instance, **kwargs):
    """
    When an invoice's status is manually set to Paid ('PD'), mark all
    procurements linked to that invoice as inv_received = True.
    """
    if instance.status == 'PD':
        Procurement.objects.filter(invoice=instance, inv_received=False).update(inv_received=True)


@receiver(post_save, sender=PurchaseOrder)
def mark_procurements_po_received_on_paid(sender, instance, **kwargs):
    """
    When a purchase order's status is manually set to Paid ('PD'), mark all
    procurements linked to that PO as po_received = True.
    """
    if instance.status == 'PD':
        Procurement.objects.filter(po=instance, po_received=False).update(po_received=True)
