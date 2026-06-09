"""QuickBooks Online helpers."""

from __future__ import annotations

import logging
from datetime import timedelta

import requests
from django.conf import settings
from django.utils import timezone

from finance.models import Invoice
from users.models import Studio

from .models import QuickBooksToken

logger = logging.getLogger(__name__)

INTUIT_TOKEN_URL = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer'
INTUIT_API_BASE = 'https://quickbooks.api.intuit.com/v3/company'


def quickbooks_configured() -> bool:
    return bool(getattr(settings, 'QUICKBOOKS_CLIENT_ID', '') and getattr(settings, 'QUICKBOOKS_CLIENT_SECRET', ''))


def get_studio_token(studio: Studio) -> QuickBooksToken | None:
    return QuickBooksToken.objects.filter(studio=studio).order_by('-updated_at').first()


def refresh_token_if_needed(token: QuickBooksToken) -> QuickBooksToken:
    if not token.is_expired():
        return token
    if not quickbooks_configured():
        return token

    response = requests.post(
        INTUIT_TOKEN_URL,
        data={
            'grant_type': 'refresh_token',
            'refresh_token': token.refresh_token,
        },
        auth=(settings.QUICKBOOKS_CLIENT_ID, settings.QUICKBOOKS_CLIENT_SECRET),
        headers={'Accept': 'application/json'},
        timeout=30,
    )
    if response.status_code != 200:
        logger.warning('QuickBooks token refresh failed: %s', response.text)
        return token

    data = response.json()
    token.access_token = data.get('access_token', token.access_token)
    token.refresh_token = data.get('refresh_token', token.refresh_token)
    token.expires_at = timezone.now() + timedelta(seconds=int(data.get('expires_in', 3600)))
    token.save(update_fields=['access_token', 'refresh_token', 'expires_at', 'updated_at'])
    return token


def sync_invoice_to_quickbooks(invoice: Invoice) -> dict:
    """Push invoice metadata to QuickBooks Online when configured."""
    if not invoice.studio or not invoice.studio.quickbooks:
        return {'skipped': True, 'reason': 'studio_not_connected'}

    if not invoice.qb_sync:
        return {'skipped': True, 'reason': 'qb_sync_disabled'}

    token = get_studio_token(invoice.studio)
    if not token or not token.realm_id:
        return {'error': 'QuickBooks is not connected for this studio.'}

    if not quickbooks_configured():
        invoice.qb_sync_status = 'pending'
        invoice.qb_sync_error = 'QuickBooks credentials are not configured on the server.'
        invoice.save(update_fields=['qb_sync_status', 'qb_sync_error', 'updated_at'])
        return {'error': invoice.qb_sync_error}

    token = refresh_token_if_needed(token)
    customer_name = 'Client'
    if invoice.client:
        customer_name = invoice.client.company_name or invoice.client.name or invoice.client.email or customer_name

    invoice_number = f'INV-{invoice.id:03d}'
    payload = {
        'Line': [
            {
                'Amount': float(invoice.total_amount or 0),
                'DetailType': 'SalesItemLineDetail',
                'SalesItemLineDetail': {
                    'ItemRef': {'value': '1', 'name': 'Services'},
                    'Qty': 1,
                    'UnitPrice': float(invoice.total_amount or 0),
                },
                'Description': f'Invoice {invoice_number}',
            }
        ],
        'CustomerRef': {'name': customer_name},
        'DocNumber': invoice_number,
        'CurrencyRef': {'value': (invoice.currency or 'GBP').upper()},
    }

    url = f'{INTUIT_API_BASE}/{token.realm_id}/invoice'
    response = requests.post(
        url,
        json=payload,
        headers={
            'Authorization': f'Bearer {token.access_token}',
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        timeout=30,
    )

    if response.status_code not in (200, 201):
        invoice.qb_sync_status = 'failed'
        invoice.qb_sync_error = response.text[:500]
        invoice.save(update_fields=['qb_sync_status', 'qb_sync_error', 'updated_at'])
        return {'error': invoice.qb_sync_error}

    body = response.json()
    qb_invoice = body.get('Invoice', {})
    invoice.qb_id = str(qb_invoice.get('Id', ''))
    invoice.qb_sync_status = 'synced'
    invoice.qb_sync_error = None
    invoice.save(update_fields=['qb_id', 'qb_sync_status', 'qb_sync_error', 'updated_at'])
    return {'synced': True, 'qb_id': invoice.qb_id}
