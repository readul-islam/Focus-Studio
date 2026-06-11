import re

import requests
from django.conf import settings

VEXA_API_BASE = getattr(settings, 'VEXA_API_BASE', 'https://api.cloud.vexa.ai')
VEXA_API_KEY = getattr(settings, 'VEXA_API_KEY', '')

_GOOGLE_MEET_CODE = re.compile(r'^[a-z]{3}-[a-z]{4}-[a-z]{3}$', re.IGNORECASE)
_GOOGLE_MEET_URL = re.compile(r'meet\.google\.com/([a-z]{3}-[a-z]{4}-[a-z]{3})', re.IGNORECASE)
_ZOOM_URL = re.compile(r'zoom\.us/j/(\d+)', re.IGNORECASE)


def normalize_native_meeting_id(platform: str, value: str) -> str:
    """Extract platform meeting code from a full URL or raw code."""
    raw = (value or '').strip()
    if not raw:
        return raw

    if platform == 'google_meet':
        url_match = _GOOGLE_MEET_URL.search(raw)
        if url_match:
            return url_match.group(1).lower()
        if _GOOGLE_MEET_CODE.match(raw):
            return raw.lower()

    if platform == 'zoom':
        zoom_match = _ZOOM_URL.search(raw)
        if zoom_match:
            return zoom_match.group(1)

    if '/' in raw:
        return raw.rstrip('/').split('/')[-1]
    return raw


def _headers():
    return {'X-API-Key': VEXA_API_KEY, 'Content-Type': 'application/json'}


def join_meeting(platform: str, native_meeting_id: str, bot_name: str = 'Focuspilot Bot') -> dict:
    if not VEXA_API_KEY:
        raise ValueError(
            'VEXA_API_KEY is not configured. Add your bot API key from https://vexa.ai/account → API Keys.'
        )

    meeting_id = normalize_native_meeting_id(platform, native_meeting_id)
    response = requests.post(
        f"{VEXA_API_BASE.rstrip('/')}/bots",
        headers=_headers(),
        json={
            'platform': platform,
            'native_meeting_id': meeting_id,
            'bot_name': bot_name,
            'recording_enabled': True,
            'transcribe_enabled': True,
            'transcription_tier': 'realtime',
        },
        timeout=30,
    )
    response.raise_for_status()
    return response.json()


def get_transcript(platform: str, native_meeting_id: str) -> dict:
    if not VEXA_API_KEY:
        raise ValueError('VEXA_API_KEY is not configured.')

    meeting_id = normalize_native_meeting_id(platform, native_meeting_id)
    response = requests.get(
        f"{VEXA_API_BASE.rstrip('/')}/transcripts/{platform}/{meeting_id}",
        headers=_headers(),
        timeout=30,
    )
    response.raise_for_status()
    return response.json()


def stop_bot(bot_id: str) -> dict:
    if not VEXA_API_KEY:
        raise ValueError('VEXA_API_KEY is not configured.')

    response = requests.delete(
        f"{VEXA_API_BASE.rstrip('/')}/bots/{bot_id}",
        headers=_headers(),
        timeout=30,
    )
    response.raise_for_status()
    return response.json()
