import { defineRouting } from 'next-intl/routing';

export const targetLocales = ['en-US', 'ja-JP'] as const;

export type TargetLocale = (typeof targetLocales)[number];

export const defaultLocale: TargetLocale = 'en-US';

/** Locales shown in the header language dropdown. */
export const switcherLocales = ['en-US', 'ja-JP'] as const satisfies readonly TargetLocale[];

export const countryToLocale: Record<string, TargetLocale> = {
  US: 'en-US',
  JP: 'ja-JP',
};

export const routing = defineRouting({
  locales: [...targetLocales],
  defaultLocale,
  localePrefix: 'never',
});
