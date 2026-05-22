import logging
import re
from datetime import datetime, timezone as dt_timezone

import requests
from django.core.cache import cache
from django.core.files.base import ContentFile
from django.utils import timezone
from django.utils.dateparse import parse_datetime

from integrations.events import EVENT_PROJECT_CREATED, emit_studio_event
from projects.models import Project
from projects.phase_defaults import seed_default_phases_for_project
from task.models import Task, TaskAttachment
from users.models import User

from .models import NotionProjectLink, NotionProjectMapping, NotionProjectSync, NotionTaskLink
from .outbound import (
    NOTION_ATTACHMENTS_PROPERTY,
    NOTION_STATUS_DONE,
    NOTION_STATUS_IN_PROGRESS,
    NOTION_STATUS_TODO,
    upsert_project_sync_from_link,
)
from .utils import (
    extract_page_assignee_labels,
    extract_page_date,
    extract_page_file_entries,
    extract_page_rich_text,
    extract_page_select_flexible,
    extract_page_title,
    extract_task_page_status,
    notion_headers,
    query_database_pages,
    query_task_database_pages,
)

logger = logging.getLogger(__name__)

MAX_NOTION_ATTACHMENT_BYTES = 5 * 1024 * 1024


def map_notion_status_to_project_status(notion_status: str) -> str:
    normalized = (notion_status or '').strip().lower()
    if normalized in ('done', 'complete', 'completed', 'won'):
        return 'COM'
    if normalized in ('archive', 'archived', 'cancelled', 'canceled'):
        return 'ARC'
    return 'AC'


NOTION_TASK_TITLE_PROPERTY = 'Task Name'
NOTION_TASK_STATUS_PROPERTY = 'Status'
NOTION_TASK_DESCRIPTION_PROPERTY = 'description'
NOTION_TASK_START_DATE_PROPERTY = 'Start date'
NOTION_TASK_DUE_DATE_PROPERTY = 'Due date'
NOTION_TASK_PRIORITY_PROPERTY = 'Priority'
NOTION_TASK_ASSIGNEE_PROPERTY = 'Assignee'
NOTION_TASK_TEAM_PROPERTY = 'Team'


def map_notion_status_to_task_status(notion_status: str) -> str | None:
    """Map Notion task status labels to Focuspilot task status codes."""
    normalized = (notion_status or '').strip().lower()
    if normalized in (
        'not started',
        'to-do',
        'todo',
        'to do',
        NOTION_STATUS_TODO.lower(),
    ):
        return 'TD'
    if normalized in ('in review', 'in-review', 'review', 'ir'):
        return 'IR'
    if normalized in (
        'in progress',
        'in-progress',
        'doing',
        NOTION_STATUS_IN_PROGRESS.lower(),
    ):
        return 'IP'
    if normalized in ('done', 'complete', 'completed', NOTION_STATUS_DONE.lower()):
        return 'D'
    return None


def map_notion_priority_to_task(priority: str) -> str | None:
    normalized = (priority or '').strip().lower()
    if normalized == 'low':
        return 'L'
    if normalized == 'medium':
        return 'M'
    if normalized == 'high':
        return 'H'
    return None


def _parse_notion_datetime(value: str | None) -> datetime | None:
    if not value:
        return None
    parsed = parse_datetime(value.replace('Z', '+00:00'))
    if not parsed:
        return None
    if timezone.is_naive(parsed):
        return timezone.make_aware(parsed, dt_timezone.utc)
    return parsed


def _notion_page_is_stale_for_task(page: dict, task: Task) -> bool:
    """
    True when Focuspilot has newer changes than this Notion row (e.g. kanban drag).
    Skip inbound apply so we do not overwrite FP and push old status back to Notion.
    """
    notion_edited = _parse_notion_datetime(page.get('last_edited_time'))
    task_updated = task.updated_at
    if not notion_edited or not task_updated:
        return False
    if timezone.is_naive(task_updated):
        task_updated = timezone.make_aware(task_updated, dt_timezone.utc)
    return notion_edited <= task_updated


def _resolve_phase_id(project: Project | None, team_name: str) -> int | None:
    if not project or not (team_name or '').strip():
        return None
    normalized = team_name.strip().lower()
    for phase in project.phases.all():
        if (phase.name or '').strip().lower() == normalized:
            return phase.id
    return None


def _resolve_assignee_ids(studio, assignee_labels: list[str]) -> list[int]:
    if not studio or not assignee_labels:
        return []
    users = list(User.objects.filter(studio=studio))
    resolved: list[int] = []
    for label in assignee_labels:
        key = label.strip().lower()
        if not key:
            continue
        for user in users:
            name = (user.name or '').strip().lower()
            email = (user.email or '').strip().lower()
            if key == name or key == email:
                resolved.append(user.id)
                break
    return list(dict.fromkeys(resolved))


def _download_notion_attachment(url: str, access_token: str | None) -> tuple[bytes | None, str | None]:
    headers = notion_headers(access_token) if access_token and 'notion' in url.lower() else {}
    try:
        response = requests.get(url, headers=headers, timeout=45)
    except requests.RequestException as exc:
        return None, str(exc)
    if response.status_code != 200:
        return None, f'HTTP {response.status_code}'
    content = response.content
    if len(content) > MAX_NOTION_ATTACHMENT_BYTES:
        return None, 'File exceeds 5MB'
    return content, None


def _sync_task_attachments_from_notion(
    task: Task, page: dict, access_token: str | None
) -> bool:
    """Import Notion file properties into TaskAttachment rows."""
    notion_files = extract_page_file_entries(
        page, NOTION_ATTACHMENTS_PROPERTY, 'Attach file', 'Attachments'
    )
    existing_by_name = {a.file_name: a for a in task.attachments.all()}
    notion_names = {f['name'] for f in notion_files}
    changed = False

    for entry in notion_files:
        name = entry['name']
        if name in existing_by_name:
            continue
        content, error = _download_notion_attachment(entry['url'], access_token)
        if error or not content:
            logger.warning('Notion attachment download skipped for task %s: %s', task.id, error)
            continue
        safe_name = re.sub(r'[^\w.\- ]', '_', name)[:255] or 'file'
        attachment = TaskAttachment(
            task=task,
            file_name=safe_name,
            file_size=len(content),
            content_type='',
        )
        attachment.file.save(safe_name, ContentFile(content), save=False)
        attachment.save()
        changed = True

    for file_name, attachment in list(existing_by_name.items()):
        if file_name not in notion_names:
            if attachment.file:
                attachment.file.delete(save=False)
            attachment.delete()
            changed = True

    return changed


def _apply_notion_page_to_task(
    task: Task,
    page: dict,
    user=None,
    studio=None,
    access_token: str | None = None,
) -> bool:
    """Update all mapped Focuspilot task fields from a Notion row."""
    task = (
        Task.objects.select_related('project', 'phase')
        .prefetch_related('assignees', 'attachments', 'project__phases')
        .get(pk=task.pk)
    )

    if cache.get(f'notion_inbound_pause_{task.pk}'):
        return False

    if _notion_page_is_stale_for_task(page, task):
        return False

    new_title = extract_page_title(page, NOTION_TASK_TITLE_PROPERTY)
    notion_status = extract_task_page_status(page, NOTION_TASK_STATUS_PROPERTY)
    fp_status = map_notion_status_to_task_status(notion_status) if notion_status else None
    new_description = extract_page_rich_text(page, NOTION_TASK_DESCRIPTION_PROPERTY)
    new_start = extract_page_date(page, NOTION_TASK_START_DATE_PROPERTY)
    new_due = extract_page_date(page, NOTION_TASK_DUE_DATE_PROPERTY)
    notion_priority = extract_page_select_flexible(page, NOTION_TASK_PRIORITY_PROPERTY)
    fp_priority = map_notion_priority_to_task(notion_priority) if notion_priority else None
    team_name = extract_page_select_flexible(page, NOTION_TASK_TEAM_PROPERTY)
    new_phase_id = _resolve_phase_id(task.project, team_name)
    assignee_labels = extract_page_assignee_labels(page, NOTION_TASK_ASSIGNEE_PROPERTY)
    new_assignee_ids = _resolve_assignee_ids(studio or task.studio, assignee_labels)

    updates: dict = {}

    if (task.title or '') != (new_title or ''):
        updates['title'] = new_title or ''

    if fp_status is not None and task.status != fp_status:
        updates['status'] = fp_status

    if (task.description or '') != (new_description or ''):
        updates['description'] = new_description or ''

    if task.start_date != new_start:
        updates['start_date'] = new_start

    if task.end_date != new_due:
        updates['end_date'] = new_due

    if fp_priority is not None and task.priority != fp_priority:
        updates['priority'] = fp_priority

    current_phase_id = task.phase_id
    if current_phase_id != new_phase_id:
        updates['phase_id'] = new_phase_id

    if page.get('archived') and task.state != 'ARC':
        updates['state'] = 'ARC'
    elif not page.get('archived') and task.state == 'ARC':
        updates['state'] = 'AC'

    current_assignee_ids = sorted(task.assignees.values_list('id', flat=True))
    if sorted(new_assignee_ids) != current_assignee_ids:
        assignees_changed = True
    else:
        assignees_changed = False

    attachments_changed = _sync_task_attachments_from_notion(task, page, access_token)

    if not updates and not assignees_changed and not attachments_changed:
        return False

    if updates:
        updates['updated_at'] = timezone.now()
        if user:
            updates['updated_by_id'] = user.id
        Task.objects.filter(pk=task.pk).update(**updates)

    if assignees_changed:
        task.assignees.set(new_assignee_ids)

    return True


def sync_notion_tasks(studio, user=None) -> dict:
    """
    Pull changes from Notion task databases into linked Focuspilot tasks.
    Only rows with NotionTaskLink are updated (tasks created/synced from FP).
    """
    from .models import NotionToken

    try:
        token = NotionToken.objects.get(studio=studio)
    except NotionToken.DoesNotExist:
        return {
            'error': 'Notion not connected',
            'tasks_updated': 0,
            'tasks_skipped': 0,
        }

    syncs = (
        NotionProjectSync.objects.filter(studio=studio)
        .exclude(notion_tasks_database_id='')
        .select_related('project')
    )

    updated = 0
    skipped = 0
    errors: list = []

    for project_sync in syncs:
        db_id = project_sync.notion_tasks_database_id
        stored_ds_id = getattr(project_sync, 'notion_tasks_data_source_id', '') or ''
        pages, error, resolved_ds_id = query_task_database_pages(
            token.access_token, db_id, stored_ds_id or None
        )
        if resolved_ds_id and resolved_ds_id != stored_ds_id:
            NotionProjectSync.objects.filter(pk=project_sync.pk).update(
                notion_tasks_data_source_id=resolved_ds_id
            )
        if error:
            errors.append({'database_id': db_id, 'project_id': project_sync.project_id, 'error': error})
            continue

        for page in pages:
            page_id = page.get('id')
            if not page_id:
                skipped += 1
                continue

            try:
                link = NotionTaskLink.objects.select_related('task').get(
                    studio=studio, notion_page_id=page_id
                )
            except NotionTaskLink.DoesNotExist:
                skipped += 1
                continue

            task = link.task
            if not task:
                skipped += 1
                continue

            try:
                if _apply_notion_page_to_task(
                    task,
                    page,
                    user=user,
                    studio=studio,
                    access_token=token.access_token,
                ):
                    updated += 1
                else:
                    skipped += 1
            except Exception as exc:
                errors.append({'page_id': page_id, 'task_id': task.id, 'error': str(exc)})

    return {
        'tasks_updated': updated,
        'tasks_skipped': skipped,
        'tasks_errors': errors[:20],
    }


def sync_notion_projects(studio, user=None) -> dict:
    """
    Import/update Focuspilot projects from the mapped Notion database.
    Returns counts: created, updated, skipped, errors.
    """
    try:
        mapping = NotionProjectMapping.objects.select_related('studio').get(studio=studio)
    except NotionProjectMapping.DoesNotExist:
        return {'error': 'No Notion database mapped for projects', 'created': 0, 'updated': 0, 'skipped': 0}

    if not mapping.is_enabled or not mapping.database_id:
        return {'error': 'Project sync is disabled', 'created': 0, 'updated': 0, 'skipped': 0}

    from .models import NotionToken

    try:
        token = NotionToken.objects.get(studio=studio)
    except NotionToken.DoesNotExist:
        return {'error': 'Notion not connected', 'created': 0, 'updated': 0, 'skipped': 0}

    pages, error = query_database_pages(token.access_token, mapping.database_id)
    if error:
        return {'error': error, 'created': 0, 'updated': 0, 'skipped': 0}

    created = 0
    updated = 0
    skipped = 0
    errors = []

    title_prop = mapping.title_property or 'Name'
    status_prop = mapping.status_property or ''

    for page in pages:
        page_id = page.get('id')
        if not page_id:
            skipped += 1
            continue

        title = extract_page_title(page, title_prop)
        if not title:
            skipped += 1
            continue

        fp_status = 'AC'
        if status_prop:
            notion_status = extract_page_status(page, status_prop)
            if notion_status:
                fp_status = map_notion_status_to_project_status(notion_status)

        notion_url = page.get('url') or ''

        try:
            link = NotionProjectLink.objects.select_related('project').get(
                studio=studio, notion_page_id=page_id
            )
            project = link.project
            if not project:
                link.delete()
                raise NotionProjectLink.DoesNotExist

            changed = False
            if project.project_name != title:
                project.project_name = title
                changed = True
            if project.project_status != fp_status:
                project.project_status = fp_status
                changed = True
            if notion_url and project.project_description != notion_url:
                project.project_description = notion_url
                changed = True
            if changed:
                project.updated_by = user
                project.save()
                updated += 1
            else:
                skipped += 1
        except NotionProjectLink.DoesNotExist:
            project = Project.objects.create(
                studio=studio,
                project_name=title,
                project_status=fp_status,
                project_description=notion_url or None,
                created_by=user,
                updated_by=user,
            )
            NotionProjectLink.objects.create(
                studio=studio,
                notion_page_id=page_id,
                project=project,
            )
            upsert_project_sync_from_link(studio, project, page_id)
            seed_default_phases_for_project(project, studio, user=user)
            created += 1
            try:
                emit_studio_event(
                    studio,
                    EVENT_PROJECT_CREATED,
                    {
                        'id': project.id,
                        'project_name': project.project_name,
                        'source': 'notion',
                        'notion_page_id': page_id,
                    },
                )
            except Exception:
                pass
        except Exception as exc:
            errors.append({'page_id': page_id, 'error': str(exc)})

    mapping.last_synced_at = timezone.now()
    mapping.save(update_fields=['last_synced_at', 'updated_at'])

    task_result = sync_notion_tasks(studio, user=user)

    return {
        'created': created,
        'updated': updated,
        'skipped': skipped,
        'errors': errors[:20],
        'total_pages': len(pages),
        'last_synced_at': mapping.last_synced_at.isoformat(),
        **task_result,
    }
