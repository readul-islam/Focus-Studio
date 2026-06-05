import { NextRequest, NextResponse } from 'next/server';
import { countryToLocale, defaultLocale, targetLocales, type TargetLocale } from '../i18n/routing';

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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    const passThrough = NextResponse.next();
    passThrough.cookies.set(LOCALE_COOKIE_NAME, detectLocale(request), {
      path: '/',
      sameSite: 'lax',
    });
    return passThrough;
  }

  const response = NextResponse.next();
  response.cookies.set(LOCALE_COOKIE_NAME, detectLocale(request), {
    path: '/',
    sameSite: 'lax',
  });
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
