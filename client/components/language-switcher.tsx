'use client';

import { switcherLocales } from '@/i18n/routing';
import { Check, Globe } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

const localeLabelMap: Record<(typeof switcherLocales)[number], string> = {
  'en-US': 'English (US)',
  'ja-JP': 'Japanese (Japan)'
};

export function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations('language');
  const router = useRouter();
  const pathname = usePathname();

  const setLocale = (nextLocale: string) => {
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    router.replace(pathname);
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-lg"
          aria-label={t('switchLanguage')}
          title={t('switchLanguage')}
        >
          <Globe className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {switcherLocales.map((item) => (
          <DropdownMenuItem key={item} onClick={() => setLocale(item)} className="flex items-center justify-between gap-2">
            <span>{localeLabelMap[item] ?? item}</span>
            {item === locale ? <Check className="w-4 h-4 text-primary" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
