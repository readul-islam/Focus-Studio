"""OpenAI vision + image generation for the Design workspace."""
import base64
import logging
import urllib.request

import openai
from django.conf import settings
from django.core.files.base import ContentFile

logger = logging.getLogger(__name__)

VISION_MODEL = 'gpt-4o'
CHAT_MODEL = 'gpt-4o-mini'
# GPT Image models return base64 in the response by default (no response_format param).
IMAGE_MODEL = 'gpt-image-1'
IMAGE_MODEL_FALLBACK = 'dall-e-3'


def _client():
    if not settings.OPENAI_API_KEY:
        raise ValueError('OPENAI_API_KEY is not configured.')
    return openai.OpenAI(api_key=settings.OPENAI_API_KEY)


def _encode_image(uploaded_file) -> tuple[str, str]:
    """Return (base64_data, mime_type) for an uploaded file."""
    uploaded_file.seek(0)
    raw = uploaded_file.read()
    uploaded_file.seek(0)
    ext = (uploaded_file.name or '').split('.')[-1].lower()
    mime = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'webp': 'image/webp',
        'gif': 'image/gif',
        'svg': 'image/svg+xml',
    }.get(ext, 'image/jpeg')
    return base64.b64encode(raw).decode('utf-8'), mime


def analyze_sketches(uploaded_files, prompt: str, design_type: str) -> str:
    """Use vision to turn sketches + prompt into a detailed design brief."""
    client = _client()
    type_label = 'interior' if design_type == 'interior' else 'exterior'
    content_parts = [
        {
            'type': 'text',
            'text': (
                f'You are an expert {type_label} design architect. '
                f'The user wants a {type_label} design. Their request: {prompt or "Create a refined design from the sketch."}\n\n'
                'Analyze any uploaded sketches and produce a detailed design brief (2–4 paragraphs) '
                'covering: style, layout, materials, color palette, lighting, and key furniture or facade elements. '
                'This brief will be used to generate a photorealistic render. Respond in plain text only.'
            ),
        },
    ]
    for f in uploaded_files:
        b64, mime = _encode_image(f)
        content_parts.append({
            'type': 'image_url',
            'image_url': {'url': f'data:{mime};base64,{b64}', 'detail': 'high'},
        })

    response = client.chat.completions.create(
        model=VISION_MODEL,
        messages=[{'role': 'user', 'content': content_parts}],
        temperature=0.4,
        max_tokens=1200,
    )
    return (response.choices[0].message.content or '').strip()


def build_image_prompt(brief: str, design_type: str, user_prompt: str) -> str:
    type_label = 'interior design' if design_type == 'interior' else 'exterior architectural design'
    parts = [
        f'Photorealistic {type_label} render for a professional architecture studio.',
        brief,
    ]
    if user_prompt:
        parts.append(f'User direction: {user_prompt}')
    parts.append(
        'High-end editorial quality, natural lighting, accurate proportions, '
        'no text overlays, no watermarks, no distorted geometry.'
    )
    return ' '.join(parts)


def _bytes_from_image_response(response) -> bytes:
    """Extract image bytes from Images API response (b64_json or temporary URL)."""
    item = response.data[0]
    b64 = getattr(item, 'b64_json', None)
    if b64:
        return base64.b64decode(b64)
    url = getattr(item, 'url', None)
    if url:
        with urllib.request.urlopen(url, timeout=120) as resp:
            return resp.read()
    raise ValueError('Image generation returned no data.')


def generate_design_image(image_prompt: str) -> bytes:
    """Generate image bytes via OpenAI Images API."""
    client = _client()
    prompt = image_prompt[:4000]

    # GPT Image: b64_json is default; response_format is not a valid parameter.
    try:
        response = client.images.generate(
            model=IMAGE_MODEL,
            prompt=prompt,
            size='1024x1024',
            quality='high',
            n=1,
        )
        return _bytes_from_image_response(response)
    except openai.BadRequestError as e:
        logger.warning('Primary image model %s failed: %s', IMAGE_MODEL, e)
    except openai.APIError as e:
        logger.warning('Primary image model %s failed: %s', IMAGE_MODEL, e)

    # DALL-E 3 fallback (no response_format — some API versions reject it on /images/generations).
    response = client.images.generate(
        model=IMAGE_MODEL_FALLBACK,
        prompt=prompt,
        size='1024x1024',
        quality='standard',
        n=1,
    )
    return _bytes_from_image_response(response)


def chat_followup(session_messages: list[dict], message: str, design_type: str) -> str:
    """Text-only follow-up in an existing design session."""
    client = _client()
    type_label = 'interior' if design_type == 'interior' else 'exterior'
    system = (
        f'You are a senior {type_label} design assistant for an architecture and design studio. '
        'Give practical, creative advice. Be concise and professional. '
        'If the user asks for a new render, suggest they upload a sketch and use Generate.'
    )
    messages = [{'role': 'system', 'content': system}]
    for m in session_messages[-20:]:
        messages.append({'role': m['role'], 'content': m['content']})
    messages.append({'role': 'user', 'content': message})

    response = client.chat.completions.create(
        model=CHAT_MODEL,
        messages=messages,
        temperature=0.5,
        max_tokens=800,
    )
    return (response.choices[0].message.content or '').strip()


def save_generated_image(session, image_bytes: bytes, prompt: str):
    """Persist DesignAsset to default storage (S3) and return (asset, assistant_text)."""
    from .models import DesignAsset, DesignMessage

    asset = DesignAsset(session=session, prompt=prompt, asset_type='image')
    filename = f'design_{session.id}_{DesignAsset.objects.count() + 1}.png'
    asset.file.save(filename, ContentFile(image_bytes, name=filename), save=True)

    summary = prompt[:500] if len(prompt) > 500 else prompt
    assistant_text = f'Here is your generated {session.design_type} design render.'
    DesignMessage.objects.create(
        session=session,
        role='assistant',
        content=assistant_text,
        asset=asset,
    )
    return asset, assistant_text
