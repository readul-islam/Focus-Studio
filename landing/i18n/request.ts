import { cookies, headers } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';
import { loadLocaleMessages } from '@/lib/locale-messages';
import { defaultLocale, targetLocales, type TargetLocale } from './routing';

const localeSet = new Set<string>(targetLocales);

function getCookieLocale(): TargetLocale {
  const cookieLocale = cookies().get('NEXT_LOCALE')?.value;
  if (cookieLocale && localeSet.has(cookieLocale)) {
    return cookieLocale as TargetLocale;
  }
  return defaultLocale;
}

export default getRequestConfig(async () => {
  const locale = getCookieLocale();
  const messages = await loadLocaleMessages(locale, defaultLocale);

  const dateTimeFormats =
    locale === 'ja-JP'
      ? {
          short: { day: 'numeric', month: 'short', year: 'numeric' } as const,
          long: { year: 'numeric', month: 'long', day: 'numeric' } as const,
        }
      : {
          short: { day: '2-digit', month: 'short', year: 'numeric' } as const,
          long: { day: '2-digit', month: 'long', year: 'numeric' } as const,
        };

  return {
    locale,
    messages,
    now: new Date(),
    timeZone: headers().get('x-vercel-ip-timezone') ?? 'UTC',
    formats: {
      dateTime: dateTimeFormats,
    },
    onError(error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(error);
      }
    },
    getMessageFallback({ namespace, key, error }) {
      if (process.env.NODE_ENV === 'development' && error?.code === 'MISSING_MESSAGE') {
        return `[${namespace}.${key}]`;
      }
      return key;
    },
  };
});
