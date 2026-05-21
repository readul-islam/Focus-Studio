"""Meshy API client for Image-to-3D generation."""
import base64
import logging
import time
import urllib.request

import requests
from django.conf import settings

logger = logging.getLogger(__name__)

MESHY_API_BASE = 'https://api.meshy.ai'
MESHY_TEST_API_KEY = 'msy_dummy_api_key_for_test_mode_12345678'
POLL_INTERVAL_SEC = 4
MAX_POLL_ATTEMPTS = 90  # up to ~6 minutes


def get_meshy_api_key() -> str:
    key = getattr(settings, 'MESHY_API_KEY', None) or ''
    key = (key or '').strip()
    return key or MESHY_TEST_API_KEY


def is_test_mode() -> bool:
    return get_meshy_api_key() == MESHY_TEST_API_KEY


def file_to_data_uri(uploaded_file) -> str:
    uploaded_file.seek(0)
    raw = uploaded_file.read()
    uploaded_file.seek(0)
    name = (getattr(uploaded_file, 'name', '') or '').lower()
    if name.endswith('.png'):
        mime = 'image/png'
    elif name.endswith('.webp'):
        mime = 'image/webp'
    else:
        mime = 'image/jpeg'
    b64 = base64.b64encode(raw).decode('ascii')
    return f'data:{mime};base64,{b64}'


def create_image_to_3d_task(
    image_data_uri: str,
    *,
    texture_prompt: str = '',
    design_type: str = 'interior',
) -> str:
    """Create Meshy image-to-3d task; returns task id."""
    api_key = get_meshy_api_key()
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json',
    }
    prompt_parts = [
        f'Professional {design_type} design object for an architecture studio.',
    ]
    if texture_prompt:
        prompt_parts.append(texture_prompt)
    payload = {
        'image_url': image_data_uri,
        'should_texture': True,
        'should_remesh': True,
        'target_formats': ['glb'],
    }
    if texture_prompt:
        payload['texture_prompt'] = texture_prompt[:600]

    response = requests.post(
        f'{MESHY_API_BASE}/openapi/v1/image-to-3d',
        headers=headers,
        json=payload,
        timeout=60,
    )
    response.raise_for_status()
    data = response.json()
    task_id = data.get('result')
    if not task_id:
        raise ValueError('Meshy did not return a task id.')
    return task_id


def get_image_to_3d_task(task_id: str) -> dict:
    api_key = get_meshy_api_key()
    response = requests.get(
        f'{MESHY_API_BASE}/openapi/v1/image-to-3d/{task_id}',
        headers={'Authorization': f'Bearer {api_key}'},
        timeout=60,
    )
    response.raise_for_status()
    return response.json()


def wait_for_image_to_3d_task(task_id: str, progress_callback=None) -> dict:
    """Poll until SUCCEEDED, FAILED, or timeout. Returns task dict."""
    for attempt in range(MAX_POLL_ATTEMPTS):
        task = get_image_to_3d_task(task_id)
        status = task.get('status', '')
        progress = task.get('progress', 0)
        if progress_callback:
            progress_callback(status, progress)
        if status == 'SUCCEEDED':
            return task
        if status in ('FAILED', 'CANCELED'):
            err = task.get('task_error', {}) or {}
            msg = err.get('message') if isinstance(err, dict) else str(err)
            raise ValueError(msg or f'Meshy task {status.lower()}')
        time.sleep(POLL_INTERVAL_SEC if not is_test_mode() else 2)
    raise TimeoutError('3D generation timed out. Please try again.')


def download_glb_from_task(task: dict) -> bytes:
    urls = task.get('model_urls') or {}
    glb_url = urls.get('glb')
    if not glb_url:
        raise ValueError('Meshy task completed but no GLB URL was returned.')
    with urllib.request.urlopen(glb_url, timeout=120) as resp:
        return resp.read()


def generate_3d_from_image_file(
    uploaded_file,
    *,
    prompt: str = '',
    design_type: str = 'interior',
    progress_callback=None,
) -> tuple[bytes, str]:
    """
    Full pipeline: data URI → Meshy task → poll → GLB bytes.
    Returns (glb_bytes, meshy_task_id).
    """
    data_uri = file_to_data_uri(uploaded_file)
    task_id = create_image_to_3d_task(
        data_uri,
        texture_prompt=prompt,
        design_type=design_type,
    )
    logger.info('Meshy image-to-3d task created: %s (test_mode=%s)', task_id, is_test_mode())
    task = wait_for_image_to_3d_task(task_id, progress_callback=progress_callback)
    glb_bytes = download_glb_from_task(task)
    return glb_bytes, task_id
