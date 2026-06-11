"""Transcript fetch, Vexa parsing, and AI extraction for meeting notes."""

from .models import Meeting, MeetingTranscript, MeetingActionItem
from .ai import generate_summary_and_action_items
from . import vexa


def parse_vexa_transcript_payload(data) -> tuple[list, str]:
    """
    Normalize Vexa GET /transcripts/... response to (segments, plain_text).
    Vexa returns segments[] (not transcript[]).
    """
    if isinstance(data, list):
        segments = data
    elif isinstance(data, dict):
        segments = (
            data.get('segments')
            or data.get('transcript')
            or data.get('utterances')
            or []
        )
    else:
        segments = []

    if not isinstance(segments, list):
        segments = []

    lines: list[str] = []
    for seg in segments:
        if not isinstance(seg, dict):
            continue
        text = (seg.get('text') or seg.get('content') or '').strip()
        if not text:
            continue
        speaker = (
            seg.get('speaker')
            or seg.get('speaker_name')
            or seg.get('name')
            or 'Speaker'
        )
        lines.append(f'{speaker}: {text}')

    transcript_text = '\n'.join(lines)
    if not transcript_text and isinstance(data, dict):
        # Last resort: notes field from Vexa meeting metadata
        notes = data.get('notes')
        if isinstance(notes, str) and notes.strip():
            transcript_text = notes.strip()

    return segments, transcript_text


def run_ai_extraction(meeting: Meeting, transcript: MeetingTranscript, transcript_text: str):
    if not transcript_text.strip():
        return transcript

    try:
        ai_result = generate_summary_and_action_items(transcript_text)
        transcript.summary = ai_result.get('summary', '')
        transcript.decisions = ai_result.get('decisions', [])
        transcript.risks = ai_result.get('risks', [])
        transcript.save(update_fields=['summary', 'decisions', 'risks'])

        meeting.action_items.all().delete()
        for item in ai_result.get('action_items', []):
            MeetingActionItem.objects.create(
                meeting=meeting,
                title=item.get('title', ''),
                description=item.get('description', ''),
            )
    except Exception as e:
        transcript.summary = f'[AI summary failed: {str(e)}]'
        transcript.save(update_fields=['summary'])

    return transcript


def ingest_vexa_transcript_for_meeting(meeting: Meeting) -> MeetingTranscript:
    """Pull transcript from Vexa, save locally, run AI extraction."""
    data = vexa.get_transcript(meeting.platform, meeting.native_meeting_id)
    segments, transcript_text = parse_vexa_transcript_payload(data)

    if not transcript_text.strip():
        raise ValueError(
            'Transcript not ready yet — wait a minute after the meeting ends and try again.'
        )

    transcript, _ = MeetingTranscript.objects.update_or_create(
        meeting=meeting,
        defaults={'raw_transcript': segments, 'transcript_text': transcript_text},
    )
    transcript.raw_transcript = segments
    transcript.transcript_text = transcript_text
    transcript.save(update_fields=['raw_transcript', 'transcript_text'])

    run_ai_extraction(meeting, transcript, transcript_text)

    meeting.bot_status = 'completed'
    meeting.save(update_fields=['bot_status', 'updated_at'])

    meeting.refresh_from_db()
    return transcript
