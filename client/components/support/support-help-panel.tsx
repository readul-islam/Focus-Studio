'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowRight, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { HELP_CATEGORIES, searchArticles } from '@/lib/help-content';

export function SupportHelpPanel() {
  const t = useTranslations('supportWidget.help');
  const [query, setQuery] = useState('');
  const results = query.length >= 2 ? searchArticles(query) : [];

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="shrink-0 border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">{t('title')}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{t('subtitle')}</p>
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="h-10 pl-9 text-sm"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3">
        {results.length > 0 ? (
          <ul className="space-y-1">
            {results.map((article) => (
              <li key={`${article.category}-${article.slug}`}>
                <Link
                  href={`/help/${article.category}/${article.slug}`}
                  className="block rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/40"
                >
                  <p className="text-sm font-medium text-foreground">{article.title}</p>
                  <p className="line-clamp-2 text-xs text-muted-foreground">{article.description}</p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t('categories')}</p>
            {HELP_CATEGORIES.map((category) => (
              <Link
                key={category.slug}
                href={`/help/${category.slug}`}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 text-sm transition-colors hover:bg-muted/30"
              >
                <span className="font-medium text-foreground">{category.name}</span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-border px-4 py-3">
        <Link
          href="/help"
          className="flex items-center justify-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          {t('viewAll')}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
