import { getApiUrl } from "@/lib/env"

export type GoogleAuthMode = "login" | "signup"

/** Full-page redirect to Django → Google OAuth (httpOnly cookies set on callback). */
export function startGoogleAuth(mode: GoogleAuthMode, nextPath?: string | null) {
  const params = new URLSearchParams({ mode })
  if (nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")) {
    params.set("next", nextPath)
  }
  window.location.href = `${getApiUrl()}/user/google/login/?${params.toString()}`
}

export const GOOGLE_AUTH_ERRORS: Record<string, string> = {
  not_configured:
    "Google sign-in is not configured yet. Use email and password, or ask your admin to set GOOGLE_AUTH_* in the API.",
  account_exists:
    "An account with this email already exists. Sign in with your password, or use Google on the sign-in page.",
  email_not_verified: "Your Google email is not verified. Please verify it with Google and try again.",
  profile_incomplete: "Could not read your Google profile. Please try again.",
  access_denied: "Google sign-in was cancelled.",
  token_exchange_failed: "Could not complete Google sign-in. Please try again.",
  profile_fetch_failed: "Could not load your Google profile. Please try again.",
  invalid_state: "Sign-in session expired. Please try again.",
  no_code: "Google did not return an authorization code. Please try again.",
}

export function googleAuthErrorMessage(code: string | null): string {
  if (!code) return "Google sign-in failed. Please try again."
  return GOOGLE_AUTH_ERRORS[code] ?? "Google sign-in failed. Please try again."
}
