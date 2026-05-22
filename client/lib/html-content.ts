/** True when HTML has visible text (ignores empty paragraphs). */
export function htmlHasContent(html: string | null | undefined): boolean {
  if (!html) return false;
  if (typeof document === 'undefined') {
    return html.replace(/<[^>]+>/g, '').trim().length > 0;
  }
  const el = document.createElement('div');
  el.innerHTML = html;
  return Boolean(el.textContent?.trim());
}
