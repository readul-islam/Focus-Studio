import requests
from django.conf import settings


def notion_headers(access_token: str, api_version: str | None = None) -> dict:
    return {
        'Authorization': f'Bearer {access_token}',
        'Notion-Version': api_version or getattr(settings, 'NOTION_API_VERSION', '2022-06-28'),
        'Content-Type': 'application/json',
    }


def notion_modern_headers(access_token: str) -> dict:
    """Headers for data source / views APIs (2025-09-03+)."""
    version = getattr(settings, 'NOTION_VIEWS_API_VERSION', '2025-09-03')
    return notion_headers(access_token, api_version=version)


def probe_notion_connection(access_token: str) -> bool:
    """Light check that token works."""
    try:
        r = requests.get(
            'https://api.notion.com/v1/users/me',
            headers=notion_headers(access_token),
            timeout=10,
        )
        return r.status_code == 200
    except requests.RequestException:
        return False


def _search_notion(access_token: str, payload: dict) -> tuple:
    try:
        r = requests.post(
            'https://api.notion.com/v1/search',
            headers=notion_headers(access_token),
            json=payload,
            timeout=15,
        )
    except requests.RequestException as exc:
        return None, str(exc)
    if r.status_code != 200:
        try:
            message = r.json().get('message', r.text[:200])
        except ValueError:
            message = r.text[:200] or 'Notion API error'
        return None, message
    return r.json().get('results', []), None


def search_databases(access_token: str, query: str = '') -> tuple:
    """Returns (databases, error_message). error_message is None on success."""
    seen: set[str] = set()
    merged: list = []

    for obj_type in ('database', 'data_source'):
        payload = {
            'filter': {'property': 'object', 'value': obj_type},
            'page_size': 100,
        }
        if query:
            payload['query'] = query
        results, error = _search_notion(access_token, payload)
        if error:
            return [], error
        for item in results or []:
            item_id = item.get('id')
            if item_id and item_id not in seen:
                seen.add(item_id)
                merged.append(item)

    if not merged:
        # Fallback: list everything the token can access, keep databases only
        payload = {'page_size': 100}
        if query:
            payload['query'] = query
        results, error = _search_notion(access_token, payload)
        if error:
            return [], error
        for item in results or []:
            if item.get('object') not in ('database', 'data_source'):
                continue
            item_id = item.get('id')
            if item_id and item_id not in seen:
                seen.add(item_id)
                merged.append(item)

    return merged, None


def get_database_schema(access_token: str, database_id: str) -> tuple:
    """Returns (properties dict, error_message)."""
    try:
        r = requests.get(
            f'https://api.notion.com/v1/databases/{database_id}',
            headers=notion_headers(access_token),
            timeout=15,
        )
    except requests.RequestException as exc:
        return None, str(exc)
    if r.status_code != 200:
        try:
            message = r.json().get('message', r.text[:200])
        except ValueError:
            message = r.text[:200] or 'Notion API error'
        return None, message
    return r.json().get('properties', {}), None


def query_database_pages(access_token: str, database_id: str) -> tuple:
    """Returns (pages list, error_message). Legacy databases/{id}/query."""
    pages: list = []
    start_cursor = None
    while True:
        body = {'page_size': 100}
        if start_cursor:
            body['start_cursor'] = start_cursor
        try:
            r = requests.post(
                f'https://api.notion.com/v1/databases/{database_id}/query',
                headers=notion_headers(access_token),
                json=body,
                timeout=30,
            )
        except requests.RequestException as exc:
            return [], str(exc)
        if r.status_code != 200:
            try:
                message = r.json().get('message', r.text[:200])
            except ValueError:
                message = r.text[:200] or 'Notion API error'
            return [], message
        data = r.json()
        pages.extend(data.get('results', []))
        if not data.get('has_more'):
            break
        start_cursor = data.get('next_cursor')
        if not start_cursor:
            break
    return pages, None


def get_database_data_source_id(access_token: str, database_id: str) -> tuple[str | None, str | None]:
    """Resolve data_source_id for a Notion database (required on API 2025-09-03+)."""
    try:
        r = requests.get(
            f'https://api.notion.com/v1/databases/{database_id}',
            headers=notion_modern_headers(access_token),
            timeout=15,
        )
    except requests.RequestException as exc:
        return None, str(exc)
    if r.status_code != 200:
        try:
            message = r.json().get('message', r.text[:200])
        except ValueError:
            message = r.text[:200] or 'Notion API error'
        return None, message
    data = r.json()
    sources = data.get('data_sources') or []
    if not sources:
        return None, 'No data sources on database'
    source_id = sources[0].get('id')
    if not source_id:
        return None, 'Missing data source id'
    return source_id, None


def query_data_source_pages(access_token: str, data_source_id: str) -> tuple:
    """Returns (pages list, error_message). Uses POST /v1/data_sources/{id}/query."""
    pages: list = []
    start_cursor = None
    while True:
        body = {'page_size': 100}
        if start_cursor:
            body['start_cursor'] = start_cursor
        try:
            r = requests.post(
                f'https://api.notion.com/v1/data_sources/{data_source_id}/query',
                headers=notion_modern_headers(access_token),
                json=body,
                timeout=30,
            )
        except requests.RequestException as exc:
            return [], str(exc)
        if r.status_code != 200:
            try:
                message = r.json().get('message', r.text[:300])
            except ValueError:
                message = r.text[:300] or 'Notion API error'
            return [], message
        data = r.json()
        pages.extend(data.get('results', []))
        if not data.get('has_more'):
            break
        start_cursor = data.get('next_cursor')
        if not start_cursor:
            break
    return pages, None


def query_task_database_pages(
    access_token: str, database_id: str, data_source_id: str | None = None
) -> tuple[list, str | None, str | None]:
    """
    Query all pages in a task database.
    Returns (pages, error, resolved_data_source_id).
    Prefers data_sources API; falls back to legacy database query.
    """
    ds_id = (data_source_id or '').strip()
    if not ds_id:
        ds_id, _ = get_database_data_source_id(access_token, database_id)
    if ds_id:
        pages, error = query_data_source_pages(access_token, ds_id)
        if not error:
            return pages, None, ds_id
    pages, error = query_database_pages(access_token, database_id)
    return pages, error, ds_id or None


def _rich_text_plain(parts: list) -> str:
    if not parts:
        return ''
    chunks = []
    for part in parts:
        if isinstance(part, dict):
            chunks.append(part.get('plain_text') or '')
    return ''.join(chunks).strip()


def extract_page_title(page: dict, title_property: str) -> str:
    prop = page.get('properties', {}).get(title_property, {})
    if prop.get('type') == 'title':
        return _rich_text_plain(prop.get('title', []))
    return ''


def extract_page_status(page: dict, status_property: str) -> str:
    if not status_property:
        return ''
    prop = page.get('properties', {}).get(status_property, {})
    prop_type = prop.get('type')
    if prop_type == 'status':
        status = prop.get('status')
        return status.get('name', '') if isinstance(status, dict) else ''
    if prop_type == 'select':
        select = prop.get('select')
        return select.get('name', '') if isinstance(select, dict) else ''
    return ''


def extract_task_page_status(page: dict, preferred_name: str = 'Status') -> str:
    """Read status from the expected column, or any status/select property on the row."""
    value = extract_page_status(page, preferred_name)
    if value:
        return value
    for name, prop in (page.get('properties') or {}).items():
        if not isinstance(prop, dict):
            continue
        if prop.get('type') in ('status', 'select'):
            value = extract_page_status(page, name)
            if value:
                return value
    return ''


def extract_page_rich_text(page: dict, property_name: str) -> str:
    prop = page.get('properties', {}).get(property_name, {})
    if prop.get('type') == 'rich_text':
        return _rich_text_plain(prop.get('rich_text', []))
    return ''


def extract_page_date(page: dict, property_name: str):
    """Return date object or None from a Notion date property."""
    prop = page.get('properties', {}).get(property_name, {})
    if prop.get('type') != 'date':
        return None
    date_val = prop.get('date')
    if not isinstance(date_val, dict):
        return None
    start = date_val.get('start')
    if not start:
        return None
    from datetime import date as date_cls

    try:
        return date_cls.fromisoformat(str(start)[:10])
    except ValueError:
        return None


def extract_page_select(page: dict, property_name: str) -> str:
    return extract_page_status(page, property_name)


def extract_page_select_flexible(page: dict, preferred_name: str) -> str:
    value = extract_page_select(page, preferred_name)
    if value:
        return value
    for name, prop in (page.get('properties') or {}).items():
        if isinstance(prop, dict) and prop.get('type') == 'select':
            value = extract_page_select(page, name)
            if value:
                return value
    return ''


def extract_page_assignee_labels(page: dict, property_name: str = 'Assignee') -> list[str]:
    """Assignee column may be rich_text (our outbound) or people (Notion template)."""
    prop = page.get('properties', {}).get(property_name, {})
    if not isinstance(prop, dict):
        return []

    if prop.get('type') == 'people':
        labels = []
        for person in prop.get('people') or []:
            if not isinstance(person, dict):
                continue
            name = (person.get('name') or '').strip()
            if name:
                labels.append(name)
        return labels

    text = extract_page_rich_text(page, property_name)
    if not text:
        return []
    parts = text.replace(';', ',').split(',')
    return [p.strip() for p in parts if p.strip()]


def extract_page_file_entries(page: dict, *property_names: str) -> list[dict]:
    """Return [{name, url}] from a Notion files property."""
    properties = page.get('properties') or {}
    candidates = list(property_names) if property_names else []
    if not candidates:
        candidates = [
            name
            for name, schema in properties.items()
            if isinstance(schema, dict) and schema.get('type') == 'files'
        ]

    entries: list[dict] = []
    seen_urls: set[str] = set()

    for prop_name in candidates:
        prop = properties.get(prop_name, {})
        if not isinstance(prop, dict) or prop.get('type') != 'files':
            continue
        for item in prop.get('files') or []:
            if not isinstance(item, dict):
                continue
            name = (item.get('name') or 'file').strip() or 'file'
            url = ''
            if item.get('type') == 'external':
                url = (item.get('external') or {}).get('url') or ''
            elif item.get('type') == 'file':
                url = (item.get('file') or {}).get('url') or ''
            url = (url or '').strip()
            if not url or url in seen_urls:
                continue
            seen_urls.add(url)
            entries.append({'name': name[:255], 'url': url})
    return entries


def default_title_property(properties: dict) -> str:
    for name, schema in properties.items():
        if schema.get('type') == 'title':
            return name
    return 'Name'


def mappable_properties(properties: dict) -> dict:
    titles = [name for name, schema in properties.items() if schema.get('type') == 'title']
    statuses = [
        name
        for name, schema in properties.items()
        if schema.get('type') in ('status', 'select')
    ]
    return {'title_properties': titles, 'status_properties': statuses}
