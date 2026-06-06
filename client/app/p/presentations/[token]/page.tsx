'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { fetchData } from '@/lib/Api';
import type { Presentation, PresentationSlide } from '@/components/presentations/types';
import { PublicPresentationViewer } from '@/components/presentations/viewer/PublicPresentationViewer';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

function normalizeSlides(slides: PresentationSlide[]): PresentationSlide[] {
  return [...slides]
    .sort((a, b) => a.order - b.order)
    .map((s) => ({
      ...s,
      canvas_data: Array.isArray(s.canvas_data) ? s.canvas_data : [],
    }));
}

export default function PublicPresentationPage() {
  const t = useTranslations('presentationEditor.publicViewer');
  const params = useParams();
  const token = params.token as string;
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [slides, setSlides] = useState<PresentationSlide[]>([]);
  const [activeSlideId, setActiveSlideId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewerReady, setViewerReady] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setViewerReady(false);
    setError(false);

    fetchData(`/presentations/public/${token}/`)
      .then((data) => {
        if (cancelled) return;
        const pres = data as Presentation;
        setPresentation(pres);
        const normalized = pres.slides?.length ? normalizeSlides(pres.slides) : [];
        setSlides(normalized);
        setActiveSlideId(normalized[0]?.id ?? null);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleViewerReady = useCallback(() => setViewerReady(true), []);

  const currentIndex = slides.findIndex((s) => s.id === activeSlideId);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && currentIndex < slides.length - 1) {
        e.preventDefault();
        setActiveSlideId(slides[currentIndex + 1].id);
      }
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        e.preventDefault();
        setActiveSlideId(slides[currentIndex - 1].id);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [currentIndex, slides]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F1F3F5]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error || !presentation) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F1F3F5] text-muted-foreground px-6 text-center">
        {t('notFound')}
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#F1F3F5] flex flex-col overflow-hidden">
      <header className="shrink-0 border-b bg-background px-4 py-3 sm:px-6">
        <h1 className="font-semibold text-foreground truncate">{presentation.title}</h1>
        {presentation.project_name && (
          <p className="text-sm text-muted-foreground truncate">{presentation.project_name}</p>
        )}
      </header>

      <main className="flex-1 min-h-0 flex flex-col">
        {slides.length > 0 && activeSlideId ? (
          <div className="relative flex-1 min-h-0">
            {!viewerReady && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#F1F3F5]">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900" />
              </div>
            )}
            <PublicPresentationViewer
              slides={slides}
              activeSlideId={activeSlideId}
              onReady={handleViewerReady}
            />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {t('empty')}
          </div>
        )}
      </main>

      {slides.length > 1 && (
        <footer className="shrink-0 border-t bg-background px-4 py-3 flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="icon"
            aria-label={t('previous')}
            onClick={() =>
              currentIndex > 0 && setActiveSlideId(slides[currentIndex - 1].id)
            }
            disabled={currentIndex <= 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm tabular-nums text-muted-foreground min-w-[4rem] text-center">
            {currentIndex + 1} / {slides.length}
          </span>
          <Button
            variant="outline"
            size="icon"
            aria-label={t('next')}
            onClick={() =>
              currentIndex < slides.length - 1 &&
              setActiveSlideId(slides[currentIndex + 1].id)
            }
            disabled={currentIndex >= slides.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </footer>
      )}
    </div>
  );
}
