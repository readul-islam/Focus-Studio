import { NextRequest, NextResponse } from 'next/server';

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
  '/pricing',
];

// Routes that logged-in users should be bounced away from
const AUTH_ONLY_ROUTES = ['/login', '/register','/verify-otp'];

function isPublic(pathname: string): boolean {
  return PUBLIC_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'));
}

function isAuthOnly(pathname: string): boolean {
  return AUTH_ONLY_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip Next.js internals and static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/brand') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const hasSession = !!request.cookies.get('access')?.value || !!request.cookies.get('refresh')?.value;
  const hasPendingEmail = !!request.cookies.get('pending_email')?.value;

  // Logged-in users skip marketing home
  if (hasSession && pathname === '/') {
    return NextResponse.redirect(new URL('/home/dashboard', request.url));
  }

  // Authenticated user hits /login, /register, /verify-otp → send to dashboard
  if (hasSession && isAuthOnly(pathname)) {
    return NextResponse.redirect(new URL('/home/dashboard', request.url));
  }

  // Mid-registration: pending_email cookie exists, no auth yet
  if (hasPendingEmail && !hasSession) {
    // Let them through to /verify-otp
    if (pathname === '/verify-otp') return NextResponse.next();
    // Anything else → force OTP completion first
    return NextResponse.redirect(new URL('/verify-otp', request.url));
  }

  // No session, no pending_email → /verify-otp or /verify-email → send to login
  if (!hasSession && !hasPendingEmail && (pathname === '/verify-otp' || pathname === '/verify-email')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Unauthenticated user hits protected route → send to login, preserve destination
  if (!hasSession && !isPublic(pathname)) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
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
