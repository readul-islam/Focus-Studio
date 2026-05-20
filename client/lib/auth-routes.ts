/**
 * Routes where the user is not expected to have a session.
 * Used to skip /user/self/ fetches and avoid redirect-to-login on refresh 401.
 */
export const PUBLIC_APP_ROUTES = [
  '/',
  '/login',
  '/register',
  '/verify-email',
  '/verify-otp',
  '/verify-2fa',
  '/reset-password',
  '/forgot-password',
  '/accept-invitation',
  '/pricing',
  '/auth/google/callback',
] as const;

export function isPublicAppRoute(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return PUBLIC_APP_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

/** API paths that must not trigger token refresh or login redirect on failure */
export const PUBLIC_API_AUTH_PATHS = [
  '/user/login/',
  '/user/register/',
  '/user/refresh/',
  '/user/logout/',
  '/user/forgot-password/',
  '/user/reset-password/',
  '/user/validate-reset-token/',
  '/user/otp-session/',
  '/user/verify-otp/',
  '/user/resend-otp/',
  '/user/2fa-session/',
  '/user/verify-2fa/',
  '/user/google/',
];

export function isPublicApiAuthPath(url: string | undefined): boolean {
  if (!url) return false;
  return PUBLIC_API_AUTH_PATHS.some((p) => url.includes(p));
}
