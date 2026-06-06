'use client';

import { useTranslations } from 'next-intl';
import { SLIDE_THEMES } from './slideThemes';
import { cn } from '@/lib/utils';

type Props = {
  backgroundColor: string;
  onBackgroundColorChange: (color: string) => void;
};

export function SlideFormatPanel({ backgroundColor, onBackgroundColorChange }: Props) {
  const t = useTranslations('presentationEditor.slideFormat');

  return (
    <div className="shrink-0 border-b px-3 py-3 space-y-3">
      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {t('background')}
        </p>
        <div className="flex items-center gap-2">
          <label className="relative flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-md border shadow-sm">
            <span
              className="absolute inset-0"
              style={{ backgroundColor: backgroundColor || '#FFFFFF' }}
            />
            <input
              type="color"
              className="absolute inset-0 cursor-pointer opacity-0"
              value={backgroundColor || '#FFFFFF'}
              onChange={(e) => onBackgroundColorChange(e.target.value)}
            />
          </label>
          <span className="truncate text-xs text-muted-foreground font-mono">
            {(backgroundColor || '#FFFFFF').toUpperCase()}
          </span>
        </div>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {t('themesLabel')}
        </p>
        <div className="grid grid-cols-5 gap-1.5">
          {SLIDE_THEMES.map((theme) => {
            const active =
              theme.background_color.toUpperCase() === (backgroundColor || '#FFFFFF').toUpperCase();
            return (
              <button
                key={theme.id}
                type="button"
                title={t(`themes.${theme.id}`)}
                className={cn(
                  'aspect-square rounded-md border-2 transition-all hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                  active ? 'border-primary ring-1 ring-primary/30' : 'border-transparent ring-1 ring-border'
                )}
                style={{ backgroundColor: theme.background_color }}
                onClick={() => onBackgroundColorChange(theme.background_color)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
