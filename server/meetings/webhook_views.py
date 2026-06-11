import logging

from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

from .models import Meeting
from . import vexa
from .transcript import ingest_vexa_transcript_for_meeting

logger = logging.getLogger(__name__)

_COMPLETED_EVENTS = {'meeting.status_change', 'meeting.completed', 'recording.completed'}


def _verify_vexa_webhook(request) -> bool:
    secret = getattr(settings, 'VEXA_WEBHOOK_SECRET', '') or ''
    if not secret:
        # Allow in dev when secret not set — configure in production
        return True
    auth = request.META.get('HTTP_AUTHORIZATION', '')
    return auth == f'Bearer {secret}'


def _meeting_from_payload(payload: dict) -> Meeting | None:
    meeting_info = payload.get('meeting') or {}
    platform = meeting_info.get('platform') or payload.get('platform')
    native_id = meeting_info.get('native_meeting_id') or payload.get('native_meeting_id')

    if not platform or not native_id:
        return None

    native_id = vexa.normalize_native_meeting_id(platform, native_id)
    return (
        Meeting.objects.filter(platform=platform, native_meeting_id=native_id)
        .order_by('-created_at')
        .first()
    )


def _is_completed_event(payload: dict) -> bool:
    event_type = payload.get('event_type', '')
    if event_type == 'recording.completed':
        return True
    if event_type == 'meeting.status_change':
        change = payload.get('status_change') or {}
        return (change.get('to') or '').lower() == 'completed'
    if event_type == 'meeting.completed':
        return True
    return False


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def vexa_webhook(request):
    """
    Inbound webhook from Vexa (dashboard.vexa.ai/webhooks or PUT /user/webhook).
    On meeting completed → fetch transcript + run AI automatically.
    """
    if not _verify_vexa_webhook(request):
        return Response({'error': 'Invalid webhook secret'}, status=status.HTTP_401_UNAUTHORIZED)

    payload = request.data if isinstance(request.data, dict) else {}
    event_type = payload.get('event_type', 'unknown')
    logger.info('Vexa webhook received: %s', event_type)

    if event_type not in _COMPLETED_EVENTS and not _is_completed_event(payload):
        return Response({'received': True, 'skipped': True}, status=status.HTTP_200_OK)

    meeting = _meeting_from_payload(payload)
    if not meeting:
        logger.warning('Vexa webhook: no matching Focuspilot meeting for payload')
        return Response({'received': True, 'matched': False}, status=status.HTTP_200_OK)

    try:
        ingest_vexa_transcript_for_meeting(meeting)
        logger.info('Vexa webhook: ingested transcript for meeting %s', meeting.id)
        return Response({'received': True, 'meeting_id': meeting.id}, status=status.HTTP_200_OK)
    except ValueError as e:
        # Transcript not ready yet — Vexa may retry
        logger.info('Vexa webhook: transcript not ready for meeting %s: %s', meeting.id, e)
        return Response({'received': True, 'retry': True, 'error': str(e)}, status=status.HTTP_200_OK)
    except Exception:
        logger.exception('Vexa webhook ingest failed for meeting %s', meeting.id)
        return Response({'error': 'Ingest failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
