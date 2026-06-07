import logging

import openai
from django.conf import settings

from .portal_knowledge import search_portal_faq

logger = logging.getLogger(__name__)

SUPPORT_MODEL = 'gpt-4o-mini'


def _format_faq_context(faq_items: list) -> str:
    if not faq_items:
        return 'No FAQ articles matched.'
    blocks = []
    for item in faq_items:
        blocks.append(f"- **{item['title']}**: {item['content']}")
    return '\n'.join(blocks)


def _format_history(history: list) -> list:
    messages = []
    for entry in history[-16:]:
        role = entry.get('role')
        content = (entry.get('content') or '').strip()
        if role in ('user', 'assistant') and content:
            messages.append({'role': role, 'content': content})
    return messages


def generate_portal_support_reply(
    *,
    portal: str,
    portal_user,
    message: str,
    history: list,
    page_path: str = '',
    project_name: str = '',
) -> str:
    if not settings.OPENAI_API_KEY:
        raise ValueError('OPENAI_API_KEY is not configured.')

    faq_items = search_portal_faq(portal, message)
    faq_context = _format_faq_context(faq_items)

    display_name = ''
    if portal_user:
        display_name = (getattr(portal_user, 'name', None) or '').strip()
        if getattr(portal_user, 'company_name', None):
            display_name = display_name or portal_user.company_name

    portal_label = 'client portal' if portal == 'client_portal' else 'contractor portal'

    system_prompt = (
        f'You are FocusPilot AI, the AI support assistant for Focuspilot\'s {portal_label}.\n'
        'You help clients or contractors use the portal — not the full studio app.\n\n'
        'Rules:\n'
        '- Be concise, warm, and practical. Use UK English.\n'
        '- Answer using the FAQ context below. Do not invent features.\n'
        '- For project-specific decisions (approvals, pricing, deadlines), tell the user to contact their studio.\n'
        '- For contractor users, mention the Messages page for studio communication when relevant.\n'
        '- For bugs or account access issues, suggest support@focuspilot.io.\n'
        '- Keep responses under 180 words unless more detail is requested.\n\n'
        f'User: {display_name or "Portal user"}'
        + (f'\nProject: {project_name}' if project_name else '')
        + (f'\nCurrent page: {page_path}' if page_path else '')
        + '\n\nFAQ context:\n'
        + faq_context
    )

    client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
    messages = [{'role': 'system', 'content': system_prompt}]
    messages.extend(_format_history(history))
    messages.append({'role': 'user', 'content': message})

    try:
        response = client.chat.completions.create(
            model=SUPPORT_MODEL,
            messages=messages,
            temperature=0.35,
            max_tokens=500,
        )
        reply = (response.choices[0].message.content or '').strip()
        return reply or 'Sorry, I could not generate a reply. Please email support@focuspilot.io.'
    except openai.APIError as exc:
        logger.exception('Portal support chat OpenAI error: %s', exc)
        raise
