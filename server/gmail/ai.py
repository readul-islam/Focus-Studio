"""OpenAI helpers for Gmail inbox compose."""
import logging
import re

import openai
from django.conf import settings

from .utils import _looks_like_html, _sanitize_outbound_html, _strip_html_to_text

logger = logging.getLogger(__name__)

_POLISH_SYSTEM = (
    'You improve email replies for a professional interior design studio team. '
    'Use UK English spelling and punctuation. '
    'Fix grammar and clarity while preserving the writer\'s meaning, facts, and tone intent. '
    'Do not invent prices, dates, or commitments that are not in the draft. '
    'Keep the reply concise unless the draft is long. '
    'Return ONLY the improved reply as simple HTML using these tags: '
    'p, br, strong, em, u, ul, ol, li, a (href only). '
    'No markdown, no code fences, no subject line, no greeting change unless the draft already has one.'
)


def _plain_to_simple_html(text: str) -> str:
    paragraphs = [p.strip() for p in re.split(r'\n\s*\n', text.strip()) if p.strip()]
    if not paragraphs:
        return '<p></p>'
    return ''.join(f'<p>{p.replace(chr(10), "<br>")}</p>' for p in paragraphs)


def polish_reply_draft(
    draft: str,
    *,
    subject: str | None = None,
    thread_context: str | None = None,
) -> str:
    """Return polished reply HTML from a plain-text or HTML draft."""
    if not settings.OPENAI_API_KEY:
        raise ValueError('OpenAI is not configured')

    if _looks_like_html(draft):
        plain = _strip_html_to_text(draft)
    else:
        plain = (draft or '').strip()

    if not plain:
        raise ValueError('Draft is empty')

    user_parts = []
    if subject:
        user_parts.append(f'Email subject: {subject}')
    if thread_context:
        user_parts.append(f'Recent thread context:\n{thread_context}')
    user_parts.append(f'Draft reply to polish:\n{plain}')
    user_content = '\n\n'.join(user_parts)

    client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
    response = client.chat.completions.create(
        model='gpt-4o-mini',
        temperature=0.4,
        messages=[
            {'role': 'system', 'content': _POLISH_SYSTEM},
            {'role': 'user', 'content': user_content},
        ],
    )
    raw = (response.choices[0].message.content or '').strip()
    if not raw:
        raise ValueError('AI returned an empty reply')

    if raw.startswith('```'):
        raw = re.sub(r'^```[a-z]*\n?', '', raw, flags=re.I)
        raw = re.sub(r'\n?```$', '', raw).strip()

    if _looks_like_html(raw):
        return _sanitize_outbound_html(raw)
    return _sanitize_outbound_html(_plain_to_simple_html(raw))
