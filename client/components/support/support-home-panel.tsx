'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowRight, BookOpen, ChevronRight, Mail, Sparkles } from 'lucide-react';
import { getPopularArticles } from '@/lib/help-content';

type Props = {
  userName?: string;
  onOpenChat: () => void;
  onOpenHelp: () => void;
};

export function SupportHomePanel({ userName, onOpenChat, onOpenHelp }: Props) {
  const t = useTranslations('supportWidget.home');
  const popular = getPopularArticles().slice(0, 3);
  const greetingName = userName?.trim() || t('there');

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-4 py-4 pb-6">
      <h2 className="text-lg font-semibold leading-snug tracking-tight text-foreground">
        {t('greeting', { name: greetingName })}
      </h2>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{t('subtitle')}</p>

      <button
        type="button"
        onClick={onOpenChat}
        className="mt-5 flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-3.5 text-left shadow-sm transition-colors hover:bg-muted/30"
      >
        <div>
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <Sparkles className="h-4 w-4 text-primary" aria-hidden />
            {t('askPilot')}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{t('askPilotHint')}</p>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
      </button>

      <button
        type="button"
        onClick={onOpenHelp}
        className="mt-3 flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-3.5 text-left shadow-sm transition-colors hover:bg-muted/30"
      >
        <div className="flex items-start gap-3">
          <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          <div>
            <p className="text-sm font-medium text-foreground">{t('helpCentre')}</p>
            <p className="text-xs text-muted-foreground">{t('helpCentreHint')}</p>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      <a
        href="mailto:support@focuspilot.io"
        className="mt-3 flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-3.5 text-left shadow-sm transition-colors hover:bg-muted/30"
      >
        <div className="flex items-start gap-3">
          <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          <div>
            <p className="text-sm font-medium text-foreground">{t('contactSupport')}</p>
            <p className="text-xs text-muted-foreground">{t('contactHint')}</p>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      </a>

      <div className="mt-5">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">{t('popularTitle')}</p>
        <div className="space-y-1.5">
          {popular.map((article) => (
            <Link
              key={article.slug}
              href={`/help/${article.category}/${article.slug}`}
              className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted/40"
            >
              <span className="line-clamp-1 pr-2">{article.title}</span>
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
