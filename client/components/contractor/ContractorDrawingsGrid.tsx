'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  FileText,
  CheckCircle,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { DrawingConfirmationDialog } from './DrawingConfirmationDialog';
import type { ContractorDrawing } from '@/lib/contractor/types';

interface ContractorDrawingsGridProps {
  drawings: ContractorDrawing[];
}

function formatDate(dateString: string, locale: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return '';
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

export function ContractorDrawingsGrid({ drawings }: ContractorDrawingsGridProps) {
  const t = useTranslations('contractorDrawingsGrid');
  const [selectedDrawing, setSelectedDrawing] = useState<ContractorDrawing | null>(null);
  const [localDrawings, setLocalDrawings] = useState(drawings);

  const handleConfirmSurvey = async (drawingId: string, notes?: string) => {
    setLocalDrawings(prev =>
      prev.map(d =>
        d.id === drawingId
          ? {
              ...d,
              surveyed: true,
              surveyed_at: new Date().toISOString(),
              survey_notes: notes,
            }
          : d
      )
    );
  };

  if (localDrawings.length === 0) {
    return (
      <Card className="p-8 text-center border-greige-500/30">
        <FileText className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
        <p className="text-neutral-500">{t('empty')}</p>
      </Card>
    );
  }

  const pendingDrawings = localDrawings.filter(d => !d.surveyed);
  const surveyedDrawings = localDrawings.filter(d => d.surveyed);

  return (
    <div className="space-y-6">
      {pendingDrawings.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-terracotta-600" />
            <h3 className="text-lg font-semibold text-neutral-900">
              {t('awaitingSurvey')}
            </h3>
            <Badge className="bg-terracotta-600 text-white text-xs">
              {pendingDrawings.length}
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingDrawings.map((drawing) => (
              <DrawingCard
                key={drawing.id}
                drawing={drawing}
                onConfirm={() => setSelectedDrawing(drawing)}
              />
            ))}
          </div>
        </div>
      )}

      {surveyedDrawings.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-sage-600" />
            <h3 className="text-lg font-semibold text-neutral-900">
              {t('surveyedDrawings')}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {surveyedDrawings.map((drawing) => (
              <DrawingCard key={drawing.id} drawing={drawing} />
            ))}
          </div>
        </div>
      )}

      <DrawingConfirmationDialog
        drawing={selectedDrawing}
        isOpen={!!selectedDrawing}
        onClose={() => setSelectedDrawing(null)}
        onConfirm={handleConfirmSurvey}
      />
    </div>
  );
}

interface DrawingCardProps {
  drawing: ContractorDrawing;
  onConfirm?: () => void;
}

function DrawingCard({ drawing, onConfirm }: DrawingCardProps) {
  const t = useTranslations('contractorDrawingsGrid');
  const locale = useLocale();
  const [imageError, setImageError] = useState(false);

  return (
    <Card className="border-greige-500/30 overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-[4/3] bg-stone-100 relative">
        {drawing.thumbnail_url && !imageError ? (
          <img
            src={drawing.thumbnail_url}
            alt={drawing.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100">
            <FileText className="w-16 h-16 text-neutral-300" />
          </div>
        )}
        <Badge className="absolute top-2 right-2 bg-white/90 text-neutral-700 border-0 text-xs">
          {drawing.version}
        </Badge>
        {drawing.surveyed ? (
          <Badge className="absolute top-2 left-2 bg-sage-600 text-white border-0 text-xs">
            <CheckCircle className="w-3 h-3 mr-1" />
            {t('surveyedBadge')}
          </Badge>
        ) : (
          <Badge className="absolute top-2 left-2 bg-terracotta-600 text-white border-0 text-xs">
            <AlertCircle className="w-3 h-3 mr-1" />
            {t('pendingBadge')}
          </Badge>
        )}
      </div>

      <div className="p-4">
        <h4 className="font-medium text-neutral-900 line-clamp-1 mb-1">
          {drawing.name}
        </h4>
        <div className="flex items-center gap-2 text-xs text-neutral-500 mb-3">
          <span>{drawing.room || t('generalRoom')}</span>
          {drawing.file_size && (
            <>
              <span>·</span>
              <span>{formatFileSize(drawing.file_size)}</span>
            </>
          )}
        </div>
        <div className="text-xs text-neutral-500 mb-3">
          {drawing.revised_at ? (
            <span>{t('revisedOn', { date: formatDate(drawing.revised_at, locale) })}</span>
          ) : (
            <span>{t('addedOn', { date: formatDate(drawing.uploaded_at, locale) })}</span>
          )}
        </div>

        {drawing.surveyed && drawing.surveyed_at && (
          <div className="text-xs text-sage-700 bg-sage-50 rounded-md p-2 mb-3">
            <p>
              {t('confirmedBy', {
                name: drawing.surveyed_by || t('confirmedByYou'),
                date: formatDate(drawing.surveyed_at, locale),
              })}
            </p>
            {drawing.survey_notes && (
              <p className="mt-1 text-neutral-600">{drawing.survey_notes}</p>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-9 text-xs bg-transparent"
            onClick={() => window.open(drawing.file_url, '_blank')}
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            {t('view')}
          </Button>
          {!drawing.surveyed && onConfirm && (
            <Button
              size="sm"
              className="flex-1 h-9 text-xs bg-umber-900 text-white hover:bg-umber-800"
              onClick={onConfirm}
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              {t('markSurveyed')}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
