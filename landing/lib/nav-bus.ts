/**
 * Simple global nav event bus so only one menu is open at a time.
 */
export const NAV_EVENT = "focuspilot:nav-open"

export function notifyNavOpen(id: string) {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent(NAV_EVENT, { detail: { id } }))
}

export function subscribeNavOpen(handler: (id: string) => void) {
  if (typeof window === "undefined") return () => {}
  const fn = (e: Event) => {
    const anyEvent = e as CustomEvent<{ id?: string }>
    handler(anyEvent.detail?.id ?? "")
  }
  window.addEventListener(NAV_EVENT, fn as EventListener)
  return () => window.removeEventListener(NAV_EVENT, fn as EventListener)
}
