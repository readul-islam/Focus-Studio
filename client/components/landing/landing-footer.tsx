import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

const FOOTER_LINKS = [
  { href: '/pricing', labelKey: 'pricing' as const },
  { href: '/login', labelKey: 'signIn' as const },
  { href: '/register', labelKey: 'createAccount' as const },
];

export async function LandingFooter() {
  const t = await getTranslations('landingPage.footer');

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-gray-900">Focuspilot</p>
            <p className="max-w-md text-sm text-gray-500">{t('tagline')}</p>
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-gray-600">
            {FOOTER_LINKS.map(({ href, labelKey }) => (
              <li key={href}>
                <Link href={href} className="hover:text-gray-900 transition-colors">
                  {t(labelKey)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-10 border-t border-gray-100 pt-8 text-center text-xs text-gray-400 sm:text-left">
          {t('copyright', { year: new Date().getFullYear() })}
        </p>
      </div>
    </footer>
  );
}
