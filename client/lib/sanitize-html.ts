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

/** Allow basic formatting for outbound compose (Gmail-compatible subset). */
const COMPOSE_CONFIG: DOMPurify.Config = {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li', 'a', 'div', 'span'],
  ALLOWED_ATTR: ['href', 'target', 'rel'],
  ALLOW_DATA_ATTR: false,
};

export function sanitizeComposeHtml(html: string): string {
  if (typeof window === 'undefined') return '';
  const clean = DOMPurify.sanitize(html, COMPOSE_CONFIG) as string;
  return clean.replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" ');
}
