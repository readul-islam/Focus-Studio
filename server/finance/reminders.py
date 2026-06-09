"""Invoice payment reminder automation."""

from __future__ import annotations

from datetime import timedelta

from django.conf import settings
from django.utils import timezone

from finance.models import Invoice
from techstyles.resend_utils import send_invoice_reminder_email


def mark_overdue_invoices(*, studio_id: int | None = None) -> int:
    today = timezone.localdate()
    qs = Invoice.objects.filter(status='SNT', due_date__lt=today)
    if studio_id:
        qs = qs.filter(studio_id=studio_id)
    return qs.update(status='OVD')


def _portal_pay_hint(invoice: Invoice) -> str:
    base = getattr(settings, 'CLIENT_PORTAL_URL', 'https://portal.focuspilot.io').rstrip('/')
    return f'{base}/finance/{invoice.id}'


def send_invoice_reminder(invoice: Invoice, *, manual: bool = False) -> dict:
    if invoice.status not in {'SNT', 'OVD'}:
        return {'error': 'Only sent or overdue invoices can receive reminders.'}
    if not invoice.client or not invoice.client.email:
        return {'error': 'Invoice has no client email.'}

    studio_name = invoice.studio.name if invoice.studio else 'Your studio'
    invoice_number = f'INV-{invoice.id:03d}'
    due = invoice.due_date.strftime('%d %b %Y') if invoice.due_date else 'soon'
    amount = f'{invoice.currency or "GBP"} {invoice.total_amount or 0}'
    portal_url = _portal_pay_hint(invoice)

    plain = (
        f'Dear {invoice.client.name or "Client"},\n\n'
        f'This is a friendly reminder that invoice {invoice_number} for {amount} '
        f'{"was due on " + due if invoice.status == "OVD" else "is due on " + due}.\n\n'
        f'View and pay in your client portal: {portal_url}\n\n'
        f'Thank you,\n{studio_name}'
    )
    html = f"""
    <p>Dear {invoice.client.name or 'Client'},</p>
    <p>This is a friendly reminder that invoice <strong>{invoice_number}</strong>
    for <strong>{amount}</strong> {'was due on' if invoice.status == 'OVD' else 'is due on'}
    <strong>{due}</strong>.</p>
    <p><a href="{portal_url}">Open your client portal to view and pay</a></p>
    <p>Thank you,<br/>{studio_name}</p>
    """

    send_invoice_reminder_email(
        to_email=invoice.client.email,
        studio_name=studio_name,
        invoice_number=invoice_number,
        html_message=html,
        plain_message=plain,
    )

    invoice.reminder_count = (invoice.reminder_count or 0) + 1
    invoice.last_reminder_at = timezone.now()
    invoice.save(update_fields=['reminder_count', 'last_reminder_at', 'updated_at'])
    return {'sent': True, 'manual': manual}


def process_automated_reminders(*, studio_id: int | None = None) -> dict:
    """Send reminders for overdue invoices and invoices due within 1 day."""
    mark_overdue_invoices(studio_id=studio_id)
    today = timezone.localdate()
    due_soon = today + timedelta(days=1)
    cooldown = timedelta(days=3)
    cutoff = timezone.now() - cooldown

    qs = Invoice.objects.filter(status__in=['SNT', 'OVD']).exclude(client__isnull=True)
    if studio_id:
        qs = qs.filter(studio_id=studio_id)

    sent = 0
    skipped = 0
    for invoice in qs.select_related('client', 'studio'):
        if not invoice.client.email:
            skipped += 1
            continue
        should_send = False
        if invoice.status == 'OVD':
            should_send = True
        elif invoice.due_date and invoice.due_date <= due_soon:
            should_send = True
        if not should_send:
            skipped += 1
            continue
        if invoice.last_reminder_at and invoice.last_reminder_at > cutoff:
            skipped += 1
            continue
        result = send_invoice_reminder(invoice)
        if result.get('sent'):
            sent += 1
        else:
            skipped += 1

    return {'sent': sent, 'skipped': skipped}
