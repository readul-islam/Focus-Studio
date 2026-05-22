from django.utils import timezone

from integrations.events import EVENT_PROJECT_CREATED, emit_studio_event
from projects.models import Project
from projects.phase_defaults import seed_default_phases_for_project
from task.models import Task

from .models import NotionProjectLink, NotionProjectMapping, NotionProjectSync, NotionTaskLink
from .outbound import (
    NOTION_STATUS_DONE,
    NOTION_STATUS_IN_PROGRESS,
    NOTION_STATUS_TODO,
    upsert_project_sync_from_link,
)
from .utils import (
    extract_page_date,
    extract_page_rich_text,
    extract_page_select,
    extract_page_status,
    extract_page_title,
    query_database_pages,
)


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
    if normalized in ('in review', 'review', 'ir'):
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


def _apply_notion_page_to_task(task: Task, page: dict, user=None) -> bool:
    """Update a linked Focuspilot task from a Notion row. Returns True if saved."""
    title = extract_page_title(page, NOTION_TASK_TITLE_PROPERTY)
    notion_status = extract_page_status(page, NOTION_TASK_STATUS_PROPERTY)
    fp_status = map_notion_status_to_task_status(notion_status) if notion_status else None
    description = extract_page_rich_text(page, NOTION_TASK_DESCRIPTION_PROPERTY)
    start_date = extract_page_date(page, NOTION_TASK_START_DATE_PROPERTY)
    due_date = extract_page_date(page, NOTION_TASK_DUE_DATE_PROPERTY)
    notion_priority = extract_page_select(page, NOTION_TASK_PRIORITY_PROPERTY)
    fp_priority = map_notion_priority_to_task(notion_priority) if notion_priority else None

    updates: dict = {}
    if title and task.title != title:
        updates['title'] = title
    if fp_status and task.status != fp_status:
        updates['status'] = fp_status
    if description is not None and (task.description or '') != description:
        updates['description'] = description
    if start_date != task.start_date:
        updates['start_date'] = start_date
    if due_date != task.end_date:
        updates['end_date'] = due_date
    if fp_priority and task.priority != fp_priority:
        updates['priority'] = fp_priority

    if page.get('archived') and task.state != 'ARC':
        updates['state'] = 'ARC'
    elif not page.get('archived') and task.state == 'ARC':
        updates['state'] = 'AC'

    if not updates:
        return False

    updates['updated_at'] = timezone.now()
    if user:
        updates['updated_by_id'] = user.id

    Task.objects.filter(pk=task.pk).update(**updates)
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
        pages, error = query_database_pages(token.access_token, db_id)
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
                if _apply_notion_page_to_task(task, page, user=user):
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
