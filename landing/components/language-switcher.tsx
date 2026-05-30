'use client';

import { switcherLocales } from '@/i18n/routing';
import { Check, Globe } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const localeLabelKeys: Record<(typeof switcherLocales)[number], 'englishUs' | 'japanese'> = {
  'en-US': 'englishUs',
  'ja-JP': 'japanese',
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
          className="h-9 w-9 rounded-lg border-stone-200 bg-white text-stone-700 hover:bg-stone-100"
          aria-label={t('switchLanguage')}
          title={t('switchLanguage')}
        >
          <Globe className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-[100] w-56 border-stone-200 bg-white text-stone-900 shadow-lg">
        {switcherLocales.map((item) => (
          <DropdownMenuItem
            key={item}
            onClick={() => setLocale(item)}
            className="flex items-center justify-between gap-2"
          >
            <span>{t(localeLabelKeys[item])}</span>
            {item === locale ? <Check className="h-4 w-4 text-[#C96A4A]" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
