'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Lock,
  LockOpen,
  Trash2,
  X,
  MoreHorizontal,
  Copy,
  ArrowUp,
  ArrowDown,
  Image,
  ImageOff,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

type Props = {
  left: number;
  top: number;
  locked: boolean;
  onDeselect: () => void;
  onToggleLock: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  isImage?: boolean;
  hasSlideBackground?: boolean;
  onSetAsBackground?: () => void;
  onDetachBackground?: () => void;
};

export function ElementContextToolbar({
  left,
  top,
  locked,
  onDeselect,
  onToggleLock,
  onDelete,
  onDuplicate,
  onBringForward,
  onSendBackward,
  isImage,
  hasSlideBackground,
  onSetAsBackground,
  onDetachBackground,
}: Props) {
  const t = useTranslations('presentationEditor');

  return (
    <div
      className="absolute z-20 flex items-center gap-0.5 rounded-full border bg-background shadow-md px-1 py-0.5 pointer-events-auto"
      style={{ left, top }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7 rounded-full text-destructive hover:text-destructive"
        onClick={onDeselect}
        aria-label={t('elementToolbar.deselect')}
      >
        <X className="h-3.5 w-3.5" />
      </Button>

      <div className="w-px h-4 bg-border" />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7 rounded-full"
        onClick={onToggleLock}
        aria-label={locked ? t('elementToolbar.unlock') : t('elementToolbar.lock')}
      >
        {locked ? <Lock className="h-3.5 w-3.5" /> : <LockOpen className="h-3.5 w-3.5" />}
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7 rounded-full"
        onClick={onDelete}
        aria-label={t('elementToolbar.delete')}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full"
            aria-label={t('elementToolbar.more')}
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onDuplicate}>
            <Copy className="mr-2 h-4 w-4" />
            {t('elementToolbar.duplicate')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onBringForward}>
            <ArrowUp className="mr-2 h-4 w-4" />
            {t('elementToolbar.bringForward')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onSendBackward}>
            <ArrowDown className="mr-2 h-4 w-4" />
            {t('elementToolbar.sendBackward')}
          </DropdownMenuItem>
          {(isImage || hasSlideBackground) && <DropdownMenuSeparator />}
          {isImage && onSetAsBackground && (
            <DropdownMenuItem onClick={onSetAsBackground}>
              <Image className="mr-2 h-4 w-4" />
              {t('elementToolbar.setAsBackground')}
            </DropdownMenuItem>
          )}
          {hasSlideBackground && onDetachBackground && (
            <DropdownMenuItem onClick={onDetachBackground}>
              <ImageOff className="mr-2 h-4 w-4" />
              {t('elementToolbar.detachBackground')}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
