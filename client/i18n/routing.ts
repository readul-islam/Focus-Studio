import {defineRouting} from 'next-intl/routing';

export const targetLocales = [
  'en-US',
  'en-GB',
  'en-AU',
  'en-CA',
  'ar-AE',
  'en-SG',
  'en-NZ',
  'en-IE',
  'nl-NL',
  'de-DE',
  'ja-JP'
] as const;

export type TargetLocale = (typeof targetLocales)[number];

export const defaultLocale: TargetLocale = 'en-US';

/** Locales shown in the language switcher dropdown (add more here when ready). */
export const switcherLocales = ['en-US', 'ja-JP'] as const satisfies readonly TargetLocale[];

export const countryToLocale: Record<string, TargetLocale> = {
  US: 'en-US',
  GB: 'en-GB',
  AU: 'en-AU',
  CA: 'en-CA',
  AE: 'ar-AE',
  SG: 'en-SG',
  NZ: 'en-NZ',
  IE: 'en-IE',
  NL: 'nl-NL',
  DE: 'de-DE',
  JP: 'ja-JP'
};

export const routing = defineRouting({
  locales: [...targetLocales],
  defaultLocale,
  localePrefix: 'never'
});
