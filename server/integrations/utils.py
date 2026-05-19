import hashlib
import hmac
import json
import secrets
from typing import Tuple

import requests
from django.utils import timezone

API_KEY_PREFIX = 'fp_live_'


def generate_api_key() -> Tuple[str, str, str]:
    """Returns (full_key, display_prefix, key_hash)."""
    raw = f"{API_KEY_PREFIX}{secrets.token_urlsafe(32)}"
    prefix = raw[:16]
    key_hash = hashlib.sha256(raw.encode()).hexdigest()
    return raw, prefix, key_hash


def hash_api_key(raw_key: str) -> str:
    return hashlib.sha256(raw_key.encode()).hexdigest()


def sign_payload(secret: str, body: bytes) -> str:
    return hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()


def deliver_webhook(endpoint, event_type: str, data: dict) -> dict:
    """POST event to endpoint URL. Returns {ok, status_code, error}."""
    payload = {
        'id': secrets.token_urlsafe(12),
        'type': event_type,
        'created_at': timezone.now().isoformat(),
        'data': data,
    }
    body = json.dumps(payload, default=str).encode('utf-8')
    signature = sign_payload(endpoint.secret, body)
    headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'Focuspilot-Webhooks/1.0',
        'X-Focuspilot-Event': event_type,
        'X-Focuspilot-Signature': f'sha256={signature}',
    }
    try:
        response = requests.post(endpoint.url, data=body, headers=headers, timeout=15)
        return {
            'ok': 200 <= response.status_code < 300,
            'status_code': response.status_code,
            'error': None if response.ok else response.text[:500],
        }
    except requests.RequestException as exc:
        return {'ok': False, 'status_code': None, 'error': str(exc)}
