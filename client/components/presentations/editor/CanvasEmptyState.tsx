'use client';

import { Button } from '@/components/ui/button';
import { Type, ImageIcon, Shapes, Palette, Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { SLIDE_THEMES } from './slideThemes';

type Props = {
  onAddText: () => void;
  onUploadImage: () => void;
  onAddImage: () => void;
  onAddShape: () => void;
  onApplyTheme: (backgroundColor: string) => void;
};

export function CanvasEmptyState({
  onAddText,
  onUploadImage,
  onAddImage,
  onAddShape,
  onApplyTheme,
}: Props) {
  const t = useTranslations('presentationEditor.emptyState');
  const tFormat = useTranslations('presentationEditor.slideFormat');
  const quickThemes = SLIDE_THEMES.slice(0, 6);

  return (
    <div className="flex h-full flex-col items-center justify-center px-8 py-10 pointer-events-auto">
      <div className="max-w-lg text-center">
        <p className="text-xl font-semibold tracking-tight text-foreground">{t('title')}</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t('description')}</p>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
        <Button variant="outline" size="sm" className="h-9 gap-2 bg-background/90" onClick={onAddText}>
          <Type className="h-4 w-4" />
          {t('addText')}
        </Button>
        <Button variant="outline" size="sm" className="h-9 gap-2 bg-background/90" onClick={onUploadImage}>
          <Upload className="h-4 w-4" />
          {t('uploadImage')}
        </Button>
        <Button variant="outline" size="sm" className="h-9 gap-2 bg-background/90" onClick={onAddImage}>
          <ImageIcon className="h-4 w-4" />
          {t('addImageFromLibrary')}
        </Button>
        <Button variant="outline" size="sm" className="h-9 gap-2 bg-background/90" onClick={onAddShape}>
          <Shapes className="h-4 w-4" />
          {t('addShape')}
        </Button>
      </div>

      <div className="mt-8 w-full max-w-md">
        <div className="mb-2 flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Palette className="h-3.5 w-3.5" />
          {t('quickThemes')}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {quickThemes.map((theme) => (
            <button
              key={theme.id}
              type="button"
              title={tFormat(`themes.${theme.id}`)}
              className="h-8 w-8 rounded-full border-2 border-background shadow-sm ring-1 ring-border transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              style={{ backgroundColor: theme.background_color }}
              onClick={() => onApplyTheme(theme.background_color)}
            />
          ))}
        </div>
      </div>

      <p className="mt-6 text-xs text-muted-foreground">{t('dropHint')}</p>
    </div>
  );
}
