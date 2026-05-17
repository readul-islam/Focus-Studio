/** Studio app — start Google OAuth on the Django API (httpOnly cookies on callback). */

export type GoogleAuthMode = 'login' | 'signup';

export function startGoogleAuth(mode: GoogleAuthMode, nextPath?: string | null) {
  const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000')
    .replace(/\/$/, '')
    .replace('127.0.0.1', 'localhost');
  const params = new URLSearchParams({ mode });
  if (nextPath && nextPath.startsWith('/') && !nextPath.startsWith('//')) {
    params.set('next', nextPath);
  }
  window.location.href = `${base}/user/google/login/?${params.toString()}`;
}

export const GOOGLE_AUTH_ERRORS: Record<string, string> = {
  not_configured: 'Google sign-in is not configured on the server yet.',
  account_exists: 'An account with this email already exists. Sign in with password or use Sign in with Google.',
  email_not_verified: 'Your Google email is not verified.',
  access_denied: 'Google sign-in was cancelled.',
  token_exchange_failed: 'Could not complete Google sign-in. Please try again.',
  profile_fetch_failed: 'Could not load your Google profile.',
  invalid_state: 'Sign-in session expired. Please try again.',
  google_session: 'Could not verify your session after Google sign-in. Please try again.',
};

export function googleAuthErrorMessage(code: string | null | undefined): string {
  if (!code) return 'Google sign-in failed. Please try again.';
  return GOOGLE_AUTH_ERRORS[code] ?? 'Google sign-in failed. Please try again.';
}
