import requests
from django.conf import settings


def notion_headers(access_token: str) -> dict:
    return {
        'Authorization': f'Bearer {access_token}',
        'Notion-Version': getattr(settings, 'NOTION_API_VERSION', '2022-06-28'),
        'Content-Type': 'application/json',
    }


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
    """Returns (pages list, error_message). Follows pagination."""
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
