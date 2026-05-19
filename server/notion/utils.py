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
