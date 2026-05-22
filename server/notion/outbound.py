"""
Focuspilot → Notion outbound sync (projects + tasks).
Failures are logged and never block local saves.
"""

from __future__ import annotations

import logging
import re
from typing import TYPE_CHECKING

import requests
from django.utils import timezone

from .models import NotionProjectLink, NotionProjectSync, NotionTaskLink, NotionToken
from .utils import notion_headers

if TYPE_CHECKING:
    from projects.models import Project
    from task.models import Task
    from users.models import User

logger = logging.getLogger(__name__)

FOCUSPILOT_PROJECTS_PAGE_TITLE = 'Focuspilot Projects'
TASK_DB_TITLE_SUFFIX = ' — Tasks'

NOTION_STATUS_TODO = 'Not started'
NOTION_STATUS_IN_PROGRESS = 'In progress'
NOTION_STATUS_DONE = 'Done'

PRIORITY_MAP = {'L': 'Low', 'M': 'Medium', 'H': 'High'}
STATUS_TO_NOTION = {
    'TD': NOTION_STATUS_TODO,
    'IP': NOTION_STATUS_IN_PROGRESS,
    'IR': NOTION_STATUS_IN_PROGRESS,
    'D': NOTION_STATUS_DONE,
}


def _notion_request(method: str, url: str, access_token: str, json_body: dict | None = None) -> tuple:
    try:
        r = requests.request(
            method,
            url,
            headers=notion_headers(access_token),
            json=json_body,
            timeout=30,
        )
    except requests.RequestException as exc:
        return None, str(exc)
    if r.status_code not in (200, 201):
        try:
            message = r.json().get('message', r.text[:300])
        except ValueError:
            message = r.text[:300] or 'Notion API error'
        return None, message
    try:
        return r.json(), None
    except ValueError:
        return {}, None


def _rich_text(content: str) -> list:
    text = (content or '')[:2000]
    if not text:
        return []
    return [{'type': 'text', 'text': {'content': text}}]


def _title_property(text: str) -> dict:
    return {'title': _rich_text(text or 'Untitled')}


def _date_property(value) -> dict:
    if not value:
        return {'date': None}
    return {'date': {'start': value.isoformat()}}


def map_task_status_to_notion(status: str | None) -> str:
    return STATUS_TO_NOTION.get((status or '').strip(), NOTION_STATUS_TODO)


def map_task_priority_to_notion(priority: str | None) -> str:
    return PRIORITY_MAP.get((priority or '').strip(), 'Medium')


NOTION_ATTACHMENTS_PROPERTY = 'Attachments'


def task_database_schema() -> dict:
    return {
        'Task Name': {'title': {}},
        'description': {'rich_text': {}},
        'Status': {
            'status': {
                'options': [
                    {'name': NOTION_STATUS_TODO, 'color': 'default'},
                    {'name': NOTION_STATUS_IN_PROGRESS, 'color': 'blue'},
                    {'name': NOTION_STATUS_DONE, 'color': 'green'},
                ],
            }
        },
        'Start date': {'date': {}},
        'Due date': {'date': {}},
        'Priority': {
            'select': {
                'options': [
                    {'name': 'Low', 'color': 'green'},
                    {'name': 'Medium', 'color': 'yellow'},
                    {'name': 'High', 'color': 'red'},
                ],
            }
        },
        'Assignee': {'rich_text': {}},
        'Team': {
            'select': {
                'options': [
                    {'name': 'Account Management', 'color': 'gray'},
                    {'name': 'Human Resources', 'color': 'purple'},
                    {'name': 'Product Design', 'color': 'green'},
                ],
            }
        },
        NOTION_ATTACHMENTS_PROPERTY: {'files': {}},
    }


def _attachment_public_url(attachment, request=None) -> str | None:
    if not attachment.file:
        return None
    try:
        url = attachment.file.url
        if request and url and url.startswith('/'):
            return request.build_absolute_uri(url)
        return url
    except Exception:
        return None


def get_task_attachment_file_entries(task: Task, request=None) -> list[dict]:
    """Build Notion files property entries from task attachments."""
    entries = []
    try:
        attachments = task.attachments.all()
    except Exception:
        return entries

    for att in attachments:
        url = _attachment_public_url(att, request)
        if not url:
            continue
        entries.append(
            {
                'name': (att.file_name or 'file')[:100],
                'type': 'external',
                'external': {'url': url},
            }
        )
    return entries


def ensure_task_database_attachments_property(
    access_token: str, database_id: str
) -> None:
    """Add Attachments column to task DBs created before this property existed."""
    body = {'properties': {NOTION_ATTACHMENTS_PROPERTY: {'files': {}}}}
    _notion_request('PATCH', f'https://api.notion.com/v1/databases/{database_id}', access_token, body)


def build_task_page_properties(task: Task) -> dict:
    assignee_names = []
    try:
        for user in task.assignees.all():
            name = (user.name or user.email or '').strip()
            if name:
                assignee_names.append(name)
    except Exception:
        pass

    phase_name = ''
    if task.phase_id and task.phase:
        phase_name = (task.phase.name or '').strip()

    props = {
        'Task Name': _title_property(task.title or 'Untitled'),
        'description': {'rich_text': _rich_text(task.description or '')},
        'Status': {'status': {'name': map_task_status_to_notion(task.status)}},
        'Start date': _date_property(task.start_date),
        'Due date': _date_property(task.end_date),
        'Priority': {'select': {'name': map_task_priority_to_notion(task.priority)}},
        'Assignee': {'rich_text': _rich_text(', '.join(assignee_names))},
    }
    if phase_name:
        props['Team'] = {'select': {'name': phase_name}}

    file_entries = get_task_attachment_file_entries(task)
    props[NOTION_ATTACHMENTS_PROPERTY] = {'files': file_entries}

    return props


def normalize_notion_page_id(value: str) -> str:
    """Accept raw ID or Notion URL."""
    raw = (value or '').strip()
    if not raw:
        return ''
    match = re.search(
        r'([0-9a-f]{32}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})',
        raw.replace('-', ''),
    )
    if not match:
        return raw
    hex_id = match.group(1).replace('-', '')
    if len(hex_id) == 32:
        return f'{hex_id[0:8]}-{hex_id[8:12]}-{hex_id[12:16]}-{hex_id[16:20]}-{hex_id[20:32]}'
    return raw


def get_studio_notion_token(studio) -> NotionToken | None:
    if not studio or not getattr(studio, 'notion', False):
        return None
    try:
        return NotionToken.objects.get(studio=studio)
    except NotionToken.DoesNotExist:
        return None


def _find_or_create_parent_page(access_token: str, token: NotionToken) -> tuple[str | None, str | None]:
    if token.parent_page_id:
        return token.parent_page_id, None

    payload = {
        'filter': {'property': 'object', 'value': 'page'},
        'query': FOCUSPILOT_PROJECTS_PAGE_TITLE,
        'page_size': 20,
    }
    data, error = _notion_request('POST', 'https://api.notion.com/v1/search', access_token, payload)
    if error:
        return None, error

    for item in data.get('results', []) if data else []:
        if item.get('object') != 'page':
            continue
        title_parts = item.get('properties', {}).get('title', {}).get('title', [])
        title = ''.join(p.get('plain_text', '') for p in title_parts if isinstance(p, dict))
        if title.strip().lower() == FOCUSPILOT_PROJECTS_PAGE_TITLE.lower():
            page_id = item.get('id')
            token.parent_page_id = page_id
            token.save(update_fields=['parent_page_id', 'updated_at'])
            return page_id, None

    # Create hub page as child of workspace (page parent type page_id requires shared parent;
    # use search result workspace - Notion API allows parent workspace for internal integrations in some cases)
    # Fallback: create without parent using workspace - actually need a page. Create at root via workspace parent.
    create_body = {
        'parent': {'type': 'workspace', 'workspace': True},
        'properties': {
            'title': {'title': _rich_text(FOCUSPILOT_PROJECTS_PAGE_TITLE)},
        },
    }
    created, error = _notion_request('POST', 'https://api.notion.com/v1/pages', access_token, create_body)
    if error:
        return None, error
    page_id = created.get('id') if created else None
    if page_id:
        token.parent_page_id = page_id
        token.save(update_fields=['parent_page_id', 'updated_at'])
    return page_id, None


def create_notion_project_page(
    access_token: str, parent_page_id: str, project_name: str
) -> tuple[dict | None, str | None]:
    body = {
        'parent': {'type': 'page_id', 'page_id': parent_page_id},
        'properties': {
            'title': {'title': _rich_text(project_name or 'Untitled Project')},
        },
    }
    return _notion_request('POST', 'https://api.notion.com/v1/pages', access_token, body)


def create_notion_task_database(
    access_token: str, project_page_id: str, project_name: str
) -> tuple[dict | None, str | None]:
    body = {
        'parent': {'type': 'page_id', 'page_id': project_page_id},
        'title': [{'type': 'text', 'text': {'content': f'{project_name or "Project"}{TASK_DB_TITLE_SUFFIX}'}}],
        'properties': task_database_schema(),
    }
    return _notion_request('POST', 'https://api.notion.com/v1/databases', access_token, body)


def create_notion_task_row(access_token: str, database_id: str, task: Task) -> tuple[dict | None, str | None]:
    body = {
        'parent': {'type': 'database_id', 'database_id': database_id},
        'properties': build_task_page_properties(task),
    }
    return _notion_request('POST', 'https://api.notion.com/v1/pages', access_token, body)


def update_notion_task_page(access_token: str, page_id: str, task: Task) -> tuple[dict | None, str | None]:
    body = {'properties': build_task_page_properties(task)}
    return _notion_request('PATCH', f'https://api.notion.com/v1/pages/{page_id}', access_token, body)


def archive_notion_page(access_token: str, page_id: str) -> tuple[dict | None, str | None]:
    return _notion_request(
        'PATCH',
        f'https://api.notion.com/v1/pages/{page_id}',
        access_token,
        {'archived': True},
    )


def upsert_project_sync_from_link(studio, project, notion_page_id: str) -> NotionProjectSync:
    sync, _ = NotionProjectSync.objects.update_or_create(
        project=project,
        defaults={
            'studio': studio,
            'notion_project_page_id': notion_page_id,
        },
    )
    return sync


def push_project_to_notion(project: Project, user: User | None = None) -> None:
    studio = project.studio
    if not studio:
        return
    if NotionProjectSync.objects.filter(project=project).exists():
        return

    inbound = NotionProjectLink.objects.filter(project=project).first()
    if inbound:
        upsert_project_sync_from_link(studio, project, inbound.notion_page_id)
        return

    token = get_studio_notion_token(studio)
    if not token:
        return

    parent_id, error = _find_or_create_parent_page(token.access_token, token)
    if error or not parent_id:
        logger.warning('Notion parent page: %s', error)
        return

    page_data, error = create_notion_project_page(
        token.access_token, parent_id, project.project_name or 'Untitled Project'
    )
    if error or not page_data:
        logger.warning('Notion project page create failed: %s', error)
        return

    page_id = page_data.get('id')
    if not page_id:
        return

    NotionProjectSync.objects.update_or_create(
        project=project,
        defaults={
            'studio': studio,
            'notion_project_page_id': page_id,
            'last_pushed_at': timezone.now(),
            'last_error': '',
        },
    )


def get_or_create_task_database(sync: NotionProjectSync, project: Project, token: NotionToken) -> str | None:
    if sync.notion_tasks_database_id:
        from .utils import get_database_data_source_id

        if not sync.notion_tasks_data_source_id:
            data_source_id, _ = get_database_data_source_id(
                token.access_token, sync.notion_tasks_database_id
            )
            if data_source_id:
                sync.notion_tasks_data_source_id = data_source_id
                sync.save(update_fields=['notion_tasks_data_source_id', 'updated_at'])

        ensure_task_database_attachments_property(
            token.access_token, sync.notion_tasks_database_id
        )
        try:
            from .views_setup import ensure_task_database_workflow_views

            ensure_task_database_workflow_views(token.access_token, sync.notion_tasks_database_id)
        except Exception as exc:
            logger.warning('Notion task database views setup failed: %s', exc)
        return sync.notion_tasks_database_id

    db_data, error = create_notion_task_database(
        token.access_token,
        sync.notion_project_page_id,
        project.project_name or 'Project',
    )
    if error or not db_data:
        sync.last_error = error or 'Failed to create task database'
        sync.save(update_fields=['last_error', 'updated_at'])
        logger.warning('Notion task database create failed: %s', error)
        return None

    db_id = db_data.get('id')
    if not db_id:
        return None

    from .utils import get_database_data_source_id

    data_source_id, _ = get_database_data_source_id(token.access_token, db_id)

    sync.notion_tasks_database_id = db_id
    sync.notion_tasks_data_source_id = data_source_id or ''
    sync.last_pushed_at = timezone.now()
    sync.last_error = ''
    sync.save(
        update_fields=[
            'notion_tasks_database_id',
            'notion_tasks_data_source_id',
            'last_pushed_at',
            'last_error',
            'updated_at',
        ]
    )

    try:
        from .views_setup import ensure_task_database_workflow_views

        ensure_task_database_workflow_views(token.access_token, db_id)
    except Exception as exc:
        logger.warning('Notion task database views setup failed: %s', exc)

    return db_id


def _load_task_for_notion(task: Task) -> Task:
    from task.models import Task as TaskModel

    return TaskModel.objects.select_related('project', 'phase').prefetch_related(
        'assignees', 'attachments'
    ).get(pk=task.pk)


def push_task_to_notion(task: Task, user: User | None = None) -> None:
    if not task.project_id:
        return
    task = _load_task_for_notion(task)

    try:
        if task.notion_link:
            update_task_in_notion(task)
            return
    except NotionTaskLink.DoesNotExist:
        pass

    project = task.project
    if not project:
        return
    studio = task.studio or project.studio
    if not studio:
        return

    token = get_studio_notion_token(studio)
    if not token:
        return

    try:
        sync = project.notion_sync
    except NotionProjectSync.DoesNotExist:
        push_project_to_notion(project, user)
        try:
            sync = project.notion_sync
        except NotionProjectSync.DoesNotExist:
            return

    db_id = get_or_create_task_database(sync, project, token)
    if not db_id:
        return

    page_data, error = create_notion_task_row(token.access_token, db_id, task)
    if error or not page_data:
        logger.warning('Notion task row create failed: %s', error)
        return

    page_id = page_data.get('id')
    if not page_id:
        return

    NotionTaskLink.objects.update_or_create(
        task=task,
        defaults={
            'studio': studio,
            'notion_page_id': page_id,
        },
    )


def update_task_in_notion(task: Task) -> None:
    task = _load_task_for_notion(task)
    try:
        link = task.notion_link
    except NotionTaskLink.DoesNotExist:
        push_task_to_notion(task)
        return

    studio = task.studio or (task.project.studio if task.project else None)
    if not studio:
        return
    token = get_studio_notion_token(studio)
    if not token:
        return

    _, error = update_notion_task_page(token.access_token, link.notion_page_id, task)
    if error:
        logger.warning('Notion task update failed: %s', error)


def archive_task_in_notion(task: Task) -> None:
    try:
        link = task.notion_link
    except NotionTaskLink.DoesNotExist:
        return
    studio = task.studio or (task.project.studio if task.project else None)
    token = get_studio_notion_token(studio) if studio else None
    if not token:
        return
    archive_notion_page(token.access_token, link.notion_page_id)
