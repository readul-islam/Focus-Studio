'use client';

import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { FileStack, LayoutTemplate, Palette, ShoppingBag, Sparkles } from 'lucide-react';

export type PresentationTemplateMeta = {
  id: string;
  name: string;
  description: string;
  category: string;
  slide_count: number;
};

const TRANSLATED_TEMPLATE_IDS = new Set([
  'blank',
  'client-concept',
  'ffe-selection',
  'mood-inspiration',
  'project-kickoff',
]);

const TEMPLATE_ACCENT: Record<string, { bg: string; icon: typeof LayoutTemplate }> = {
  blank: { bg: 'bg-stone-100 border-stone-200', icon: FileStack },
  'client-concept': { bg: 'bg-slate-900 border-slate-700', icon: Sparkles },
  'ffe-selection': { bg: 'bg-blue-50 border-blue-200', icon: ShoppingBag },
  'mood-inspiration': { bg: 'bg-violet-50 border-violet-200', icon: Palette },
  'project-kickoff': { bg: 'bg-emerald-50 border-emerald-200', icon: LayoutTemplate },
};

type Props = {
  templates: PresentationTemplateMeta[];
  value: string;
  onChange: (templateId: string) => void;
  isLoading?: boolean;
};

export function PresentationTemplatePicker({ templates, value, onChange, isLoading }: Props) {
  const t = useTranslations('presentationsPage.createDialog');

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 rounded-lg bg-muted/60 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">{t('templateLabel')}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[280px] overflow-y-auto pr-1">
        {templates.map((template) => {
          const accent = TEMPLATE_ACCENT[template.id] ?? TEMPLATE_ACCENT.blank;
          const Icon = accent.icon;
          const selected = value === template.id;
          const name = TRANSLATED_TEMPLATE_IDS.has(template.id)
            ? t(`templates.${template.id}.name` as 'templates.blank.name')
            : template.name;
          const description = TRANSLATED_TEMPLATE_IDS.has(template.id)
            ? t(`templates.${template.id}.description` as 'templates.blank.description')
            : template.description;

          return (
            <button
              key={template.id}
              type="button"
              onClick={() => onChange(template.id)}
              className={cn(
                'flex gap-3 rounded-lg border p-3 text-left transition hover:border-primary/50',
                selected ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-border bg-card'
              )}
            >
              <div
                className={cn(
                  'flex h-12 w-12 shrink-0 items-center justify-center rounded-md border',
                  accent.bg,
                  template.id === 'client-concept' ? 'text-white' : 'text-stone-700'
                )}
              >
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium truncate">{name}</p>
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground shrink-0">
                    {t('slideCount', { count: template.slide_count })}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
