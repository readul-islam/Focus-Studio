'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trash2,
  Lock,
  LockOpen,
  Minus,
  Plus,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { CanvasElement } from '../types';
import {
  TEXT_FONT_OPTIONS,
  clampFontSize,
  getFontFamilyLabel,
} from './textElementStyles';
import { cn } from '@/lib/utils';

type Props = {
  left: number;
  top: number;
  element: CanvasElement;
  locked: boolean;
  isEditing?: boolean;
  onPatch: (patch: Partial<CanvasElement['props']>, pushHistory?: boolean) => void;
  onToggleLock: () => void;
  onDelete: () => void;
};

export function TextElementToolbar({
  left,
  top,
  element,
  locked,
  isEditing = false,
  onPatch,
  onToggleLock,
  onDelete,
}: Props) {
  const t = useTranslations('presentationEditor.textToolbar');
  const props = element.props;
  const fontSize = props.fontSize || 24;
  const align = props.align || 'left';
  const fontFamily = props.fontFamily || 'Inter, sans-serif';

  const stopFocusSteal = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const adjustSize = (delta: number) => {
    onPatch({ fontSize: clampFontSize(fontSize + delta) }, true);
  };

  return (
    <div
      data-text-toolbar=""
      className="absolute z-30 flex items-center gap-0.5 rounded-xl border bg-background/95 px-1.5 py-1 shadow-lg backdrop-blur-sm pointer-events-auto"
      style={{ left, top }}
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={stopFocusSteal}
    >
      <Select
        value={fontFamily}
        onValueChange={(value) => onPatch({ fontFamily: value }, true)}
        disabled={locked}
      >
        <SelectTrigger
          className="h-8 w-[128px] border-0 bg-muted/60 text-xs shadow-none focus:ring-0"
          onPointerDown={stopFocusSteal}
        >
          <SelectValue>{getFontFamilyLabel(fontFamily)}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {TEXT_FONT_OPTIONS.map((font) => (
            <SelectItem key={font.value} value={font.value} className="text-xs">
              <span style={{ fontFamily: font.value }}>{font.label}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex h-8 items-center rounded-md bg-muted/60 px-0.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => adjustSize(-2)}
          disabled={locked}
          aria-label={t('decreaseSize')}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <Input
          type="number"
          min={8}
          max={200}
          value={fontSize}
          disabled={locked}
          onPointerDown={stopFocusSteal}
          onChange={(e) => {
            const next = Number(e.target.value);
            if (!Number.isFinite(next)) return;
            onPatch({ fontSize: clampFontSize(next) }, true);
          }}
          className="h-7 w-12 border-0 bg-transparent px-1 text-center text-xs shadow-none focus-visible:ring-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => adjustSize(2)}
          disabled={locked}
          aria-label={t('increaseSize')}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      <div className="mx-0.5 h-5 w-px bg-border" />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn('h-8 w-8', props.bold && 'bg-muted text-foreground')}
        onClick={() => onPatch({ bold: !props.bold }, true)}
        disabled={locked}
        aria-label={t('bold')}
        aria-pressed={!!props.bold}
      >
        <Bold className="h-3.5 w-3.5" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn('h-8 w-8', props.italic && 'bg-muted text-foreground')}
        onClick={() => onPatch({ italic: !props.italic }, true)}
        disabled={locked}
        aria-label={t('italic')}
        aria-pressed={!!props.italic}
      >
        <Italic className="h-3.5 w-3.5" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn('h-8 w-8', props.underline && 'bg-muted text-foreground')}
        onClick={() => onPatch({ underline: !props.underline }, true)}
        disabled={locked}
        aria-label={t('underline')}
        aria-pressed={!!props.underline}
      >
        <Underline className="h-3.5 w-3.5" />
      </Button>

      <div className="mx-0.5 h-5 w-px bg-border" />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn('h-8 w-8', align === 'left' && 'bg-muted text-foreground')}
        onClick={() => onPatch({ align: 'left' }, true)}
        disabled={locked}
        aria-label={t('alignLeft')}
        aria-pressed={align === 'left'}
      >
        <AlignLeft className="h-3.5 w-3.5" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn('h-8 w-8', align === 'center' && 'bg-muted text-foreground')}
        onClick={() => onPatch({ align: 'center' }, true)}
        disabled={locked}
        aria-label={t('alignCenter')}
        aria-pressed={align === 'center'}
      >
        <AlignCenter className="h-3.5 w-3.5" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn('h-8 w-8', align === 'right' && 'bg-muted text-foreground')}
        onClick={() => onPatch({ align: 'right' }, true)}
        disabled={locked}
        aria-label={t('alignRight')}
        aria-pressed={align === 'right'}
      >
        <AlignRight className="h-3.5 w-3.5" />
      </Button>

      <label
        className={cn(
          'relative ml-0.5 flex h-8 w-8 cursor-pointer items-center justify-center rounded-md hover:bg-muted/60',
          locked && 'pointer-events-none opacity-50'
        )}
        aria-label={t('color')}
        onPointerDown={stopFocusSteal}
      >
        <span
          className="h-4 w-4 rounded-sm border border-border"
          style={{ backgroundColor: props.fill || '#111111' }}
        />
        <input
          type="color"
          className="absolute inset-0 cursor-pointer opacity-0"
          value={props.fill || '#111111'}
          disabled={locked}
          onChange={(e) => onPatch({ fill: e.target.value }, true)}
        />
      </label>

      <div className="mx-0.5 h-5 w-px bg-border" />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={onToggleLock}
        aria-label={locked ? t('unlock') : t('lock')}
      >
        {locked ? <Lock className="h-3.5 w-3.5" /> : <LockOpen className="h-3.5 w-3.5" />}
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-destructive hover:text-destructive"
        onClick={onDelete}
        aria-label={t('delete')}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>

      {isEditing && (
        <span className="ml-1 hidden text-[10px] text-muted-foreground lg:inline">
          {t('editHint')}
        </span>
      )}
    </div>
  );
}
