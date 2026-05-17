import { getAppUrl } from "@/lib/env"

/** Full navigation so httpOnly cookies from api.* are used by the studio app. */
export function redirectToApp(path = "/home/dashboard", nextParam?: string | null) {
  const app = getAppUrl()
  const next =
    nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : path
  window.location.href = `${app}${next}`
}

export function loginUrlOnApp(next?: string | null): string {
  const app = getAppUrl()
  if (next && next.startsWith("/")) {
    return `${app}/login?next=${encodeURIComponent(next)}`
  }
  return `${app}/login`
}
