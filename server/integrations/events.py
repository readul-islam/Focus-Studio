import logging

from .models import WebhookEndpoint
from .utils import deliver_webhook

logger = logging.getLogger(__name__)

# Supported event types for Zapier / outbound webhooks
EVENT_PROJECT_CREATED = 'project.created'
EVENT_CLIENT_CREATED = 'client.created'
EVENT_INVOICE_CREATED = 'invoice.created'

ALL_EVENTS = [
    EVENT_PROJECT_CREATED,
    EVENT_CLIENT_CREATED,
    EVENT_INVOICE_CREATED,
]


def emit_studio_event(studio, event_type: str, data: dict) -> None:
    """Send payload to all active webhook endpoints for this studio."""
    if studio is None:
        return
    endpoints = WebhookEndpoint.objects.filter(studio=studio, is_active=True)
    for endpoint in endpoints:
        if not endpoint.matches_event(event_type):
            continue
        result = deliver_webhook(endpoint, event_type, data)
        if not result['ok']:
            logger.warning(
                'Webhook delivery failed studio=%s endpoint=%s event=%s error=%s',
                studio.id,
                endpoint.id,
                event_type,
                result.get('error'),
            )


def notify_client_created(studio, client) -> None:
    emit_studio_event(
        studio,
        EVENT_CLIENT_CREATED,
        {
            'id': client.id,
            'contact_type': client.contact_type,
            'company_name': client.company_name,
            'name': client.name,
            'surname': client.surname,
            'email': client.email,
        },
    )


def notify_invoice_created(studio, invoice) -> None:
    emit_studio_event(
        studio,
        EVENT_INVOICE_CREATED,
        {
            'id': invoice.id,
            'status': invoice.status,
            'total_amount': str(invoice.total_amount) if invoice.total_amount is not None else None,
            'currency': invoice.currency,
            'client_id': invoice.client_id,
            'project_id': invoice.project_id,
        },
    )
