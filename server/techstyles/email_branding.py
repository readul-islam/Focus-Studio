"""Shared Focuspilot logo + wordmark for HTML emails."""

import functools
from pathlib import Path

from django.conf import settings


def email_logo_url() -> str:
    custom = (getattr(settings, 'EMAIL_LOGO_URL', None) or '').strip()
    if custom:
        return custom.rstrip('/')
    base = (getattr(settings, 'FRONTEND_URL', None) or 'https://focuspilot.io').rstrip('/')
    return f'{base}/brand/email_logo.png'


@functools.lru_cache(maxsize=1)
def email_logo_data_uri() -> str:
    """Embedded logo so emails render before /brand/ is deployed on the frontend."""
    b64_path = (
        Path(settings.BASE_DIR).parent
        / 'client'
        / 'public'
        / 'brand'
        / 'email_logo.b64.txt'
    )
    if b64_path.is_file():
        return f'data:image/png;base64,{b64_path.read_text(encoding="utf-8").strip()}'
    return email_logo_url()


def email_logo_img_html(*, size: int = 32) -> str:
    src = email_logo_data_uri()
    return (
        f'<img src="{src}" alt="Focuspilot" width="{size}" height="{size}" '
        f'style="display:block;border:0;outline:none;text-decoration:none;'
        f'width:{size}px;height:{size}px;" />'
    )


def email_logo_cell_html(*, size: int = 32) -> str:
    return (
        f'<td style="vertical-align:middle;padding:0 12px 0 0;width:{size}px;">'
        f'{email_logo_img_html(size=size)}'
        f'</td>'
    )


def email_brand_row_html(*, align: str = 'left') -> str:
    """Inline logo + Focuspilot wordmark for dark (#111827) email headers."""
    margin = '0 auto' if align == 'center' else '0'
    text_align = 'center' if align == 'center' else 'left'
    return f"""<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:{margin};border-collapse:collapse;">
<tr>
{email_logo_cell_html()}
<td style="vertical-align:middle;padding:0;text-align:{text_align};">
<span style="font-size:18px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;line-height:32px;mso-line-height-rule:exactly;display:inline-block;">Focuspilot</span>
</td>
</tr>
</table>"""


def email_header_inner_html(
    *,
    title: str | None = None,
    subtitle: str | None = None,
    align: str = 'center',
) -> str:
    """Brand row plus optional title/subtitle inside a dark header cell."""
    parts = [email_brand_row_html(align=align)]
    if title:
        parts.append(
            f'<h1 style="margin:16px 0 0;color:#ffffff;font-size:28px;font-weight:600;'
            f'letter-spacing:-0.5px;text-align:{align};">{title}</h1>'
        )
    if subtitle:
        parts.append(
            f'<p style="margin:10px 0 0;color:#d1d5db;font-size:14px;text-align:{align};">{subtitle}</p>'
        )
    return '\n'.join(parts)
