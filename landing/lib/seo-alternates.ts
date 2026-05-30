const BASE_URL = 'https://focuspilot.io';

/** Hreflang alternates for cookie / ?lang= based locale detection. */
export function localeHreflangAlternates(path = ''): {
  canonical: string;
  languages: Record<string, string>;
} {
  const normalized = path.replace(/^\//, '');
  const canonical = normalized ? `${BASE_URL}/${normalized}` : BASE_URL;

  return {
    canonical,
    languages: {
      'en-US': `${canonical}?lang=en-US`,
      'ja-JP': `${canonical}?lang=ja-JP`,
      'x-default': canonical,
    },
  };
}

export { BASE_URL };
