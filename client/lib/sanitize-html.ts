import DOMPurify from 'dompurify';

const EMAIL_DISPLAY_CONFIG: DOMPurify.Config = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike',
    'ul', 'ol', 'li', 'a', 'div', 'span', 'blockquote', 'h1', 'h2', 'h3',
  ],
  ALLOWED_ATTR: ['href', 'target', 'rel'],
  ALLOW_DATA_ATTR: false,
};

const CONFIG: DOMPurify.Config = EMAIL_DISPLAY_CONFIG;

export function sanitizeEmailHtml(html: string): string {
  if (typeof window === 'undefined') return '';
  if (!html?.trim()) return '';
  return DOMPurify.sanitize(html, EMAIL_DISPLAY_CONFIG) as string;
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
