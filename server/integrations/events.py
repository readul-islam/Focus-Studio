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
