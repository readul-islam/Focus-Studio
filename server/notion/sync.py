from django.utils import timezone

from integrations.events import EVENT_PROJECT_CREATED, emit_studio_event
from projects.models import Project

from .models import NotionProjectLink, NotionProjectMapping
from .utils import extract_page_status, extract_page_title, query_database_pages


def map_notion_status_to_project_status(notion_status: str) -> str:
    normalized = (notion_status or '').strip().lower()
    if normalized in ('done', 'complete', 'completed', 'won'):
        return 'COM'
    if normalized in ('archive', 'archived', 'cancelled', 'canceled'):
        return 'ARC'
    return 'AC'


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

    return {
        'created': created,
        'updated': updated,
        'skipped': skipped,
        'errors': errors[:20],
        'total_pages': len(pages),
        'last_synced_at': mapping.last_synced_at.isoformat(),
    }
