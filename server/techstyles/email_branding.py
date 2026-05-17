"""Shared Focuspilot logo + wordmark for HTML emails."""

from django.conf import settings


def email_logo_url() -> str:
    custom = (getattr(settings, 'EMAIL_LOGO_URL', None) or '').strip()
    if custom:
        return custom.rstrip('/')
    base = (getattr(settings, 'FRONTEND_URL', None) or 'https://focuspilot.io').rstrip('/')
    return f'{base}/brand/email_logo.png'


def email_logo_bg_cell_html(*, size: int = 32) -> str:
    primary = email_logo_url()
    return (
        f'<td width="{size}" height="{size}" style="width:{size}px;height:{size}px;'
        f'vertical-align:middle;padding:0 12px 0 0;mso-line-height-rule:exactly;'
        f'background-image:url({primary});background-repeat:no-repeat;'
        f'background-position:center center;background-size:contain;">'
        f'<span style="display:block;width:{size}px;height:{size}px;line-height:{size}px;'
        f'font-size:0;overflow:hidden;mso-hide:all;">&nbsp;</span>'
        f'</td>'
    )


def email_brand_row_html(*, align: str = 'left') -> str:
    """Inline logo + Focuspilot wordmark for dark (#111827) email headers."""
    margin = '0 auto' if align == 'center' else '0'
    text_align = 'center' if align == 'center' else 'left'
    return f"""<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:{margin};border-collapse:collapse;">
<tr>
{email_logo_bg_cell_html()}
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
