import requests
from django.conf import settings

VEXA_API_BASE = getattr(settings, 'VEXA_API_BASE', 'https://gateway.vexa.ai')
VEXA_API_KEY = getattr(settings, 'VEXA_API_KEY', '')


def _headers():
    return {'X-API-Key': VEXA_API_KEY, 'Content-Type': 'application/json'}


def join_meeting(platform: str, native_meeting_id: str, bot_name: str = 'Focuspilot Bot') -> dict:
    response = requests.post(
        f"{VEXA_API_BASE}/bots",
        headers=_headers(),
        json={'platform': platform, 'native_meeting_id': native_meeting_id, 'bot_name': bot_name},
        timeout=30,
    )
    response.raise_for_status()
    return response.json()


def get_transcript(platform: str, native_meeting_id: str) -> dict:
    response = requests.get(
        f"{VEXA_API_BASE}/transcripts/{platform}/{native_meeting_id}",
        headers=_headers(),
        timeout=30,
    )
    response.raise_for_status()
    return response.json()


def stop_bot(bot_id: str) -> dict:
    response = requests.delete(
        f"{VEXA_API_BASE}/bots/{bot_id}",
        headers=_headers(),
        timeout=30,
    )
    response.raise_for_status()
    return response.json()
