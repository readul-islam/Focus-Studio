import DOMPurify from 'dompurify';

const CONFIG: DOMPurify.Config = {
  FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
  FORBID_ATTR: ['onclick', 'onerror', 'onload', 'onmouseover', 'onfocus', 'onblur', 'onchange', 'onsubmit', 'action'],
  ALLOW_DATA_ATTR: false,
  FORCE_BODY: true,
};

export function sanitizeEmailHtml(html: string): string {
  if (typeof window === 'undefined') return '';
  return DOMPurify.sanitize(html, CONFIG) as string;
}
