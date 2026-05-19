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


def search_databases(access_token: str, query: str = '') -> list:
    r = requests.post(
        'https://api.notion.com/v1/search',
        headers=notion_headers(access_token),
        json={'filter': {'property': 'object', 'value': 'database'}, 'query': query},
        timeout=15,
    )
    if r.status_code != 200:
        return []
    return r.json().get('results', [])
