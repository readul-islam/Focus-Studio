"""OpenAI helpers for CRM proposal wizard drafts."""
import json
import logging
import re

import openai
from django.conf import settings

logger = logging.getLogger(__name__)

_VALID_DRAFT_TYPES = frozenset({'scope', 'pricing', 'both'})


def _normalize_line_items(items) -> list[dict]:
    normalized: list[dict] = []
    for item in items or []:
        if not isinstance(item, dict):
            continue
        description = (item.get('description') or '').strip()
        if not description:
            continue
        quantity = float(item.get('quantity') or 1)
        rate = round(float(item.get('rate') or 0), 2)
        amount = round(quantity * rate, 2)
        normalized.append({
            'description': description,
            'quantity': quantity,
            'rate': rate,
            'amount': amount,
        })
    return normalized


def _strip_code_fences(raw: str) -> str:
    text = (raw or '').strip()
    if text.startswith('```'):
        text = re.sub(r'^```[a-z]*\n?', '', text, flags=re.I)
        text = re.sub(r'\n?```$', '', text).strip()
    return text


def _build_user_prompt(
    *,
    draft_type: str,
    project_type: str,
    client_name: str,
    project_description: str,
    budget_range: str,
    timeline: str,
    rooms: str,
    style_preference: str,
    studio_name: str,
) -> str:
    lines = [
        f'Studio: {studio_name or "Interior design studio"}',
        f'Project title: {project_type or "Untitled project"}',
    ]
    if client_name:
        lines.append(f'Client: {client_name}')
    if budget_range:
        lines.append(f'Budget or brief notes: {budget_range}')
    if timeline:
        lines.append(f'Timeline / valid until: {timeline}')
    if rooms:
        lines.append(f'Rooms / spaces: {rooms}')
    if style_preference:
        lines.append(f'Style / branding notes: {style_preference}')
    if project_description:
        lines.append(f'Existing scope or notes:\n{project_description}')

    if draft_type == 'scope':
        if project_description:
            lines.append(
                'Task: Expand and professionalise the scope section. '
                'Keep facts from the notes; improve structure and completeness.'
            )
        else:
            lines.append(
                'Task: Draft a comprehensive project scope for this proposal '
                '(design phases, documentation, project management).'
            )
    elif draft_type == 'pricing':
        lines.append(
            'Task: Propose fee line items that match the scope and project scale. '
            'Use realistic UK studio rates in GBP.'
        )
    else:
        lines.append(
            'Task: Draft both a professional scope section and matching fee line items.'
        )

    return '\n\n'.join(lines)


def _json_schema_hint(draft_type: str) -> str:
    if draft_type == 'scope':
        return '{"scope": "## Project Scope\\n..."}'
    if draft_type == 'pricing':
        return (
            '{"line_items": [{"description": "...", "quantity": 1, "rate": 2500, "amount": 2500}]}'
        )
    return (
        '{"scope": "## Project Scope\\n...", '
        '"line_items": [{"description": "...", "quantity": 1, "rate": 2500, "amount": 2500}]}'
    )


def generate_proposal_draft(
    *,
    draft_type: str = 'both',
    project_type: str = '',
    client_name: str = '',
    project_description: str = '',
    budget_range: str = '',
    timeline: str = '',
    rooms: str = '',
    style_preference: str = '',
    studio_name: str = '',
) -> dict:
    """
    Generate proposal scope and/or pricing line items for the CRM wizard.
    Returns dict with optional keys: scope (str), line_items (list).
    """
    draft_type = (draft_type or 'both').strip().lower()
    if draft_type not in _VALID_DRAFT_TYPES:
        raise ValueError('draft_type must be scope, pricing, or both')

    if not settings.OPENAI_API_KEY:
        raise ValueError('OpenAI is not configured')

    user_content = _build_user_prompt(
        draft_type=draft_type,
        project_type=project_type,
        client_name=client_name,
        project_description=project_description,
        budget_range=budget_range,
        timeline=timeline,
        rooms=rooms,
        style_preference=style_preference,
        studio_name=studio_name,
    )

    system = (
        'You help interior design studios write client proposals. '
        'Use UK English spelling. '
        'Respond ONLY with valid JSON matching the requested shape. '
        'Scope text must use Markdown with ## and ### headings. '
        'For line_items: quantity, rate, and amount must be numeric; amount = quantity × rate. '
        'Do not invent client-specific commitments (dates, prices in scope prose) not supported by the brief. '
        f'Required JSON shape: {_json_schema_hint(draft_type)}'
    )

    client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
    response = client.chat.completions.create(
        model='gpt-4o-mini',
        temperature=0.4,
        response_format={'type': 'json_object'},
        messages=[
            {'role': 'system', 'content': system},
            {'role': 'user', 'content': user_content},
        ],
    )

    raw = _strip_code_fences(response.choices[0].message.content or '')
    if not raw:
        raise ValueError('AI returned an empty response')

    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError as exc:
        logger.warning('proposal ai-draft invalid JSON: %s', raw[:500])
        raise ValueError('AI returned invalid JSON') from exc

    result: dict = {}
    if draft_type in ('scope', 'both'):
        scope = (parsed.get('scope') or '').strip()
        if scope:
            result['scope'] = scope

    if draft_type in ('pricing', 'both'):
        line_items = _normalize_line_items(parsed.get('line_items'))
        if line_items:
            result['line_items'] = line_items

    if not result:
        raise ValueError('AI returned no usable proposal content')

    return result
