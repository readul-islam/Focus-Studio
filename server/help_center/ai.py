import json
import logging

import openai
from django.conf import settings

logger = logging.getLogger(__name__)

SUPPORT_MODEL = 'gpt-4o-mini'


def _format_article_context(article_context: list) -> str:
    if not article_context:
        return 'No help articles matched this question yet. Answer from general Focuspilot product knowledge and suggest browsing /help or emailing support@focuspilot.io if unsure.'

    blocks = []
    for item in article_context[:5]:
        title = (item.get('title') or '').strip()
        category = (item.get('category') or '').strip()
        slug = (item.get('slug') or '').strip()
        excerpt = (item.get('excerpt') or item.get('content') or '')[:800].strip()
        if not title:
            continue
        link = f'/help/{category}/{slug}' if category and slug else '/help'
        blocks.append(f'- **{title}** ({link})\n  {excerpt}')
    return '\n\n'.join(blocks) if blocks else 'No help articles provided.'


def _format_history(history: list) -> list:
    messages = []
    for entry in history[-16:]:
        role = entry.get('role')
        content = (entry.get('content') or '').strip()
        if role in ('user', 'assistant') and content:
            messages.append({'role': role, 'content': content})
    return messages


def generate_support_reply(
    *,
    user,
    message: str,
    history: list,
    page_path: str = '',
    article_context: list | None = None,
) -> str:
    if not settings.OPENAI_API_KEY:
        raise ValueError('OPENAI_API_KEY is not configured.')

    first_name = ''
    if user:
        first_name = (getattr(user, 'first_name', None) or getattr(user, 'name', None) or '').strip()
    studio_name = ''
    if user and getattr(user, 'studio', None):
        studio_name = getattr(user.studio, 'name', '') or ''

    system_prompt = (
        'You are FocusPilot AI, the friendly support assistant for Focuspilot — the operating system for interior design studios.\n'
        'Focuspilot covers: projects, tasks, CRM, finance (invoices, purchase orders, Stripe Connect), library, '
        'team permissions, reports, design tools, AI inbox, and client collaboration.\n\n'
        'Rules:\n'
        '- Be concise, warm, and practical. Use UK English.\n'
        '- Prefer step-by-step instructions when explaining workflows.\n'
        '- Ground answers in the help articles provided below when relevant; cite article titles and include markdown links like [/help/category/slug].\n'
        '- If you are unsure or the question needs human help (billing disputes, bugs, account access), say so and suggest support@focuspilot.io.\n'
        '- Never invent features that are not described in the help context.\n'
        '- Keep responses under 200 words unless the user asks for detail.\n\n'
        f'User: {first_name or "Studio member"}'
        + (f' · Studio: {studio_name}' if studio_name else '')
        + (f'\nCurrent page: {page_path}' if page_path else '')
        + '\n\nRelevant help articles:\n'
        + _format_article_context(article_context or [])
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
            max_tokens=600,
        )
        reply = (response.choices[0].message.content or '').strip()
        return reply or 'Sorry, I could not generate a reply. Please try again or email support@focuspilot.io.'
    except openai.APIError as exc:
        logger.exception('Support chat OpenAI error: %s', exc)
        raise
