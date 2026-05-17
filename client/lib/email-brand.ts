/** Shared Focuspilot logo + wordmark for HTML email templates (client-side previews). */

const appBase =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_APP_URL) ||
  'https://focuspilot.io'

export const EMAIL_LOGO_URL = `${appBase.replace(/\/$/, '')}/brand/email_logo.png`

export function emailLogoImgHtml(width = 28, height = 28): string {
  return `<img src="${EMAIL_LOGO_URL}" alt="Focuspilot" width="${width}" height="${height}" style="display:block;border:0;outline:none;text-decoration:none;" />`
}

/** Logo + "Focuspilot" row for dark (#111827) email headers. */
export function emailBrandRowHtml(align: 'left' | 'center' = 'left'): string {
  const margin = align === 'center' ? '0 auto' : '0'
  const textAlign = align === 'center' ? 'center' : 'left'
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:${margin};">
<tr>
<td style="vertical-align:middle;padding-right:10px;width:28px;height:28px;">
${emailLogoImgHtml()}
</td>
<td style="vertical-align:middle;text-align:${textAlign};">
<span style="font-size:18px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;line-height:1;">Focuspilot</span>
</td>
</tr>
</table>`
}

export function emailHeaderInnerHtml(options: {
  title?: string
  subtitle?: string
  align?: 'left' | 'center'
}): string {
  const align = options.align ?? 'center'
  const parts = [emailBrandRowHtml(align)]
  if (options.title) {
    parts.push(
      `<h1 style="margin:16px 0 0;color:#ffffff;font-size:28px;font-weight:600;letter-spacing:-0.5px;text-align:${align};">${options.title}</h1>`,
    )
  }
  if (options.subtitle) {
    parts.push(
      `<p style="margin:10px 0 0;color:#d1d5db;font-size:14px;text-align:${align};">${options.subtitle}</p>`,
    )
  }
  return parts.join('\n')
}
