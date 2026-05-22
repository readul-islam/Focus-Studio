"""
Create Notion task database views matching the reference template:
All Projects (table), By Status (board), Gantt (timeline).
Requires Notion API 2025-09-03+ for /v1/views.
"""

from __future__ import annotations

import logging

import requests
from django.conf import settings

NOTION_TASK_START_DATE_PROPERTY = 'Start date'
NOTION_TASK_DUE_DATE_PROPERTY = 'Due date'

logger = logging.getLogger(__name__)

VIEW_ALL_PROJECTS = 'All Projects'
VIEW_BY_STATUS = 'By Status'
VIEW_GANTT = 'Gantt'

NOTION_STATUS_PROPERTY = 'Status'

def notion_views_headers(access_token: str) -> dict:
    version = getattr(settings, 'NOTION_VIEWS_API_VERSION', '2025-09-03')
    return {
        'Authorization': f'Bearer {access_token}',
        'Notion-Version': version,
        'Content-Type': 'application/json',
    }


def _views_request(method: str, url: str, access_token: str, json_body: dict | None = None) -> tuple:
    try:
        response = requests.request(
            method,
            url,
            headers=notion_views_headers(access_token),
            json=json_body,
            timeout=30,
        )
    except requests.RequestException as exc:
        return None, str(exc)
    if response.status_code not in (200, 201):
        try:
            message = response.json().get('message', response.text[:300])
        except ValueError:
            message = response.text[:300] or 'Notion Views API error'
        return None, message
    try:
        return response.json(), None
    except ValueError:
        return {}, None


def _get_data_source_id(access_token: str, database_id: str) -> tuple[str | None, str | None]:
    from .utils import get_database_data_source_id

    return get_database_data_source_id(access_token, database_id)


def _list_database_views(access_token: str, database_id: str) -> tuple[list[dict], str | None]:
    data, error = _views_request(
        'GET',
        f'https://api.notion.com/v1/views?database_id={database_id}',
        access_token,
    )
    if error:
        return [], error
    return data.get('results', []) if data else [], None


def _retrieve_view(access_token: str, view_id: str) -> tuple[dict | None, str | None]:
    return _views_request('GET', f'https://api.notion.com/v1/views/{view_id}', access_token)


def _rename_view(access_token: str, view_id: str, name: str) -> str | None:
    _, error = _views_request(
        'PATCH',
        f'https://api.notion.com/v1/views/{view_id}',
        access_token,
        {'name': name},
    )
    return error


def _create_database_view(
    access_token: str,
    database_id: str,
    data_source_id: str,
    name: str,
    view_type: str,
    configuration: dict | None = None,
    position: dict | None = None,
) -> str | None:
    body: dict = {
        'database_id': database_id,
        'data_source_id': data_source_id,
        'name': name,
        'type': view_type,
    }
    if configuration:
        body['configuration'] = configuration
    if position:
        body['position'] = position
    _, error = _views_request('POST', 'https://api.notion.com/v1/views', access_token, body)
    return error


def _board_configuration() -> dict:
    return {
        'type': 'board',
        'group_by': {
            'type': 'status',
            'property_id': NOTION_STATUS_PROPERTY,
            'group_by': 'group',
            'sort': {'type': 'manual'},
        },
    }


def _timeline_configuration() -> dict:
    return {
        'type': 'timeline',
        'date_property_id': NOTION_TASK_START_DATE_PROPERTY,
        'end_date_property_id': NOTION_TASK_DUE_DATE_PROPERTY,
    }


def ensure_task_database_workflow_views(access_token: str, database_id: str) -> None:
    """
    Ensure task database has All Projects, By Status, and Gantt views.
    Safe to call repeatedly; logs warnings and never raises.
    """
    if not database_id:
        return

    data_source_id, error = _get_data_source_id(access_token, database_id)
    if error or not data_source_id:
        logger.warning('Notion views: data source for db %s: %s', database_id, error)
        return

    view_refs, error = _list_database_views(access_token, database_id)
    if error:
        logger.warning('Notion views: list views for db %s: %s', database_id, error)
        return

    existing_names: set[str] = set()
    default_table_view_id: str | None = None

    for ref in view_refs:
        view_id = ref.get('id')
        if not view_id:
            continue
        detail, detail_error = _retrieve_view(access_token, view_id)
        if detail_error or not detail:
            continue
        view_name = (detail.get('name') or '').strip()
        if view_name:
            existing_names.add(view_name)
        if detail.get('type') == 'table' and not default_table_view_id:
            default_table_view_id = view_id

    if VIEW_ALL_PROJECTS not in existing_names and default_table_view_id:
        rename_error = _rename_view(access_token, default_table_view_id, VIEW_ALL_PROJECTS)
        if rename_error:
            logger.warning('Notion views: rename default table: %s', rename_error)
        else:
            existing_names.add(VIEW_ALL_PROJECTS)

    if VIEW_BY_STATUS not in existing_names:
        err = _create_database_view(
            access_token,
            database_id,
            data_source_id,
            VIEW_BY_STATUS,
            'board',
            configuration=_board_configuration(),
            position={'type': 'start'},
        )
        if err:
            logger.warning('Notion views: create By Status: %s', err)
        else:
            existing_names.add(VIEW_BY_STATUS)

    if VIEW_ALL_PROJECTS not in existing_names:
        err = _create_database_view(
            access_token,
            database_id,
            data_source_id,
            VIEW_ALL_PROJECTS,
            'table',
            position={'type': 'end'} if VIEW_BY_STATUS in existing_names else None,
        )
        if err:
            logger.warning('Notion views: create All Projects: %s', err)
        else:
            existing_names.add(VIEW_ALL_PROJECTS)

    if VIEW_GANTT not in existing_names:
        err = _create_database_view(
            access_token,
            database_id,
            data_source_id,
            VIEW_GANTT,
            'timeline',
            configuration=_timeline_configuration(),
            position={'type': 'end'},
        )
        if err:
            logger.warning('Notion views: create Gantt: %s', err)
