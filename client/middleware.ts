import { NextRequest, NextResponse } from 'next/server';
import { countryToLocale, defaultLocale, targetLocales, type TargetLocale } from './i18n/routing';

// Routes that require no auth
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/reset-password',
  '/forgot-password',
  '/accept-invitation',
  '/verify-email',
  '/verify-otp',
  '/verify-2fa',
  '/pricing',
];

// Routes that logged-in users should be bounced away from
const AUTH_ONLY_ROUTES = ['/login', '/register','/verify-otp'];
const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';
const localeSet = new Set<string>(targetLocales);

function normalizeLocale(locale: string | null): TargetLocale | null {
  if (!locale) return null;
  return localeSet.has(locale) ? (locale as TargetLocale) : null;
}

function getCountryCode(request: NextRequest): string | null {
  const country =
    request.geo?.country ||
    request.headers.get('x-vercel-ip-country') ||
    request.headers.get('cf-ipcountry');

  if (!country) return null;
  const normalized = country.trim().toUpperCase();
  return normalized.length === 2 ? normalized : null;
}

function detectLocale(request: NextRequest): TargetLocale {
  const queryLocale = normalizeLocale(request.nextUrl.searchParams.get('lang'));
  if (queryLocale) return queryLocale;

  const cookieLocale = normalizeLocale(request.cookies.get(LOCALE_COOKIE_NAME)?.value ?? null);
  if (cookieLocale) return cookieLocale;

  const countryCode = getCountryCode(request);
  if (countryCode && countryToLocale[countryCode]) {
    return countryToLocale[countryCode];
  }

  return defaultLocale;
}

function isPublic(pathname: string): boolean {
  return PUBLIC_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'));
}

function isAuthOnly(pathname: string): boolean {
  return AUTH_ONLY_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const locale = detectLocale(request);

  // Skip Next.js internals and static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/brand') ||
    pathname.includes('.')
  ) {
    const passThrough = NextResponse.next();
    passThrough.cookies.set(LOCALE_COOKIE_NAME, locale, { path: '/', sameSite: 'lax' });
    return passThrough;
  }

  const hasSession = !!request.cookies.get('access')?.value || !!request.cookies.get('refresh')?.value;
  const hasPendingEmail = !!request.cookies.get('pending_email')?.value;
  const hasPending2fa = !!request.cookies.get('pending_2fa')?.value;

  // Logged-in users skip marketing home
  if (hasSession && pathname === '/') {
    const response = NextResponse.redirect(new URL('/home/dashboard', request.url));
    response.cookies.set(LOCALE_COOKIE_NAME, locale, { path: '/', sameSite: 'lax' });
    return response;
  }

  // Authenticated user hits /login, /register, /verify-otp → send to dashboard
  if (hasSession && isAuthOnly(pathname)) {
    const response = NextResponse.redirect(new URL('/home/dashboard', request.url));
    response.cookies.set(LOCALE_COOKIE_NAME, locale, { path: '/', sameSite: 'lax' });
    return response;
  }

  // Mid-registration: pending_email cookie exists, no auth yet
  if (hasPendingEmail && !hasSession) {
    // Let them through to /verify-otp
    if (pathname === '/verify-otp') {
      const response = NextResponse.next();
      response.cookies.set(LOCALE_COOKIE_NAME, locale, { path: '/', sameSite: 'lax' });
      return response;
    }
    // Anything else → force OTP completion first
    const response = NextResponse.redirect(new URL('/verify-otp', request.url));
    response.cookies.set(LOCALE_COOKIE_NAME, locale, { path: '/', sameSite: 'lax' });
    return response;
  }

  // Mid-login 2FA: pending_2fa cookie set after password, before TOTP
  if (hasPending2fa && !hasSession) {
    if (pathname === '/verify-2fa' || pathname === '/login') {
      const response = NextResponse.next();
      response.cookies.set(LOCALE_COOKIE_NAME, locale, { path: '/', sameSite: 'lax' });
      return response;
    }
    const response = NextResponse.redirect(new URL('/verify-2fa', request.url));
    response.cookies.set(LOCALE_COOKIE_NAME, locale, { path: '/', sameSite: 'lax' });
    return response;
  }

  // Already signed in — skip 2FA page
  if (hasSession && pathname === '/verify-2fa') {
    const response = NextResponse.redirect(new URL('/home/dashboard', request.url));
    response.cookies.set(LOCALE_COOKIE_NAME, locale, { path: '/', sameSite: 'lax' });
    return response;
  }

  // No session, no pending_email → /verify-otp or /verify-email → send to login
  if (!hasSession && !hasPendingEmail && !hasPending2fa && (pathname === '/verify-otp' || pathname === '/verify-email')) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.set(LOCALE_COOKIE_NAME, locale, { path: '/', sameSite: 'lax' });
    return response;
  }

  // No session, no pending_2fa → /verify-2fa → send to login
  if (!hasSession && !hasPending2fa && pathname === '/verify-2fa') {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.set(LOCALE_COOKIE_NAME, locale, { path: '/', sameSite: 'lax' });
    return response;
  }

  // Unauthenticated user hits protected route → send to login, preserve destination
  if (!hasSession && !isPublic(pathname)) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.set(LOCALE_COOKIE_NAME, locale, { path: '/', sameSite: 'lax' });
    return response;
  }

  const response = NextResponse.next();
  response.cookies.set(LOCALE_COOKIE_NAME, locale, { path: '/', sameSite: 'lax' });
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static, _next/image
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
