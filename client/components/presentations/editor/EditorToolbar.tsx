'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  MapPin,
  Share2,
  Play,
  ChevronRight,
} from 'lucide-react';
import { usePresentationEditorStore } from '@/store/presentationEditorStore';
import { useTranslations } from 'next-intl';

type Props = {
  title: string;
  onShare: () => void;
  onStartTimer?: () => void;
  canShare: boolean;
  presentationId: number;
  saveStatus?: 'saved' | 'saving' | 'unsaved';
};

export function EditorToolbar({
  title,
  onShare,
  onStartTimer,
  canShare,
  presentationId,
  saveStatus = 'saved',
}: Props) {
  const t = useTranslations('presentationEditor');
  const {
    zoom,
    setZoom,
    undo,
    redo,
    history,
    redoStack,
    pinsPanelOpen,
    setPinsPanelOpen,
  } = usePresentationEditorStore();

  return (
    <div className="h-12 border-b bg-background flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-2 text-sm min-w-0">
        <Link href="/presentations" className="text-muted-foreground hover:text-foreground shrink-0">
          {t('breadcrumb.presentations')}
        </Link>
        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="font-medium truncate">{title}</span>
        {saveStatus !== 'saved' && (
          <span
            className={`ml-2 shrink-0 text-[10px] font-medium uppercase tracking-wide ${
              saveStatus === 'saving' ? 'text-muted-foreground' : 'text-amber-600'
            }`}
          >
            {saveStatus === 'saving' ? t('toolbar.saving') : t('toolbar.unsaved')}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1">
        {onStartTimer && (
          <Button variant="outline" size="sm" onClick={onStartTimer}>
            <Play className="mr-1.5 h-3.5 w-3.5" />
            {t('toolbar.startTimer')}
          </Button>
        )}

        <Button variant="ghost" size="icon" onClick={() => setZoom(zoom - 0.1)} disabled={zoom <= 0.25}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="text-xs w-10 text-center">{Math.round(zoom * 100)}%</span>
        <Button variant="ghost" size="icon" onClick={() => setZoom(zoom + 0.1)} disabled={zoom >= 2}>
          <ZoomIn className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="icon" onClick={undo} disabled={history.length === 0}>
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={redo} disabled={redoStack.length === 0}>
          <Redo2 className="h-4 w-4" />
        </Button>

        <Button
          variant={pinsPanelOpen ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setPinsPanelOpen(!pinsPanelOpen)}
        >
          <MapPin className="mr-1.5 h-3.5 w-3.5" />
          {t('toolbar.pins')}
        </Button>

        {canShare && (
          <Button size="sm" onClick={onShare}>
            <Share2 className="mr-1.5 h-3.5 w-3.5" />
            {t('toolbar.share')}
          </Button>
        )}

        <Link href={`/presentations/${presentationId}/present`}>
          <Button variant="outline" size="sm">
            {t('toolbar.present')}
          </Button>
        </Link>
      </div>
    </div>
  );
}
