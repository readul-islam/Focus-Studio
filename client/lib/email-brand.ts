/** Shared Focuspilot logo + wordmark for HTML email templates (client-side previews). */

const appBase =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_APP_URL) ||
  'https://focuspilot.io'

export const EMAIL_LOGO_URL = `${appBase.replace(/\/$/, '')}/brand/email_logo.png`

export function emailLogoBgCellHtml(size = 32): string {
  return `<td width="${size}" height="${size}" style="width:${size}px;height:${size}px;vertical-align:middle;padding:0 12px 0 0;mso-line-height-rule:exactly;background-image:url(${EMAIL_LOGO_URL});background-repeat:no-repeat;background-position:center center;background-size:contain;">
<span style="display:block;width:${size}px;height:${size}px;line-height:${size}px;font-size:0;overflow:hidden;mso-hide:all;">&nbsp;</span>
</td>`
}

/** Logo + "Focuspilot" row for dark (#111827) email headers. */
export function emailBrandRowHtml(align: 'left' | 'center' = 'left'): string {
  const margin = align === 'center' ? '0 auto' : '0'
  const textAlign = align === 'center' ? 'center' : 'left'
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:${margin};border-collapse:collapse;">
<tr>
${emailLogoBgCellHtml()}
<td style="vertical-align:middle;padding:0;text-align:${textAlign};">
<span style="font-size:18px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;line-height:32px;mso-line-height-rule:exactly;display:inline-block;">Focuspilot</span>
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
