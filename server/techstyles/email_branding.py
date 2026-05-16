"""Shared Focuspilot logo + wordmark for HTML emails."""

from django.conf import settings

DEFAULT_EMAIL_LOGO_FALLBACK_URL = 'https://i.ibb.co/BVqBTSJx/email-logo.png'


def email_logo_url() -> str:
    custom = (getattr(settings, 'EMAIL_LOGO_URL', None) or '').strip()
    if custom:
        return custom.rstrip('/')
    base = (getattr(settings, 'FRONTEND_URL', None) or 'https://focuspilot.io').rstrip('/')
    return f'{base}/brand/email_logo.png'


def email_logo_fallback_url() -> str:
    custom = (getattr(settings, 'EMAIL_LOGO_FALLBACK_URL', None) or '').strip()
    if custom:
        return custom.rstrip('/')
    return DEFAULT_EMAIL_LOGO_FALLBACK_URL


def email_logo_img_html(*, width: int = 28, height: int = 28) -> str:
    """Logo img with CDN fallback (onerror + background for partial client support)."""
    primary = email_logo_url()
    fallback = email_logo_fallback_url()
    return (
        f'<img src="{primary}" alt="Focuspilot" width="{width}" height="{height}" '
        f'style="display:block;border:0;outline:none;text-decoration:none;" '
        f'onerror="this.onerror=null;this.src=\'{fallback}\';" />'
    )


def email_brand_row_html(*, align: str = 'left') -> str:
    """Inline logo + Focuspilot wordmark for dark (#111827) email headers."""
    fallback = email_logo_fallback_url()
    margin = '0 auto' if align == 'center' else '0'
    text_align = 'center' if align == 'center' else 'left'
    return f"""<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:{margin};">
<tr>
<td style="vertical-align:middle;padding-right:10px;width:28px;height:28px;background-image:url({fallback});background-repeat:no-repeat;background-position:center;background-size:28px 28px;">
{email_logo_img_html()}
</td>
<td style="vertical-align:middle;text-align:{text_align};">
<span style="font-size:18px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;line-height:1;">Focuspilot</span>
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
