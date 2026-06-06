'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, Loader2 } from 'lucide-react';
import { usePresentation } from '@/hooks/usePresentations';
import { usePresentationEditorStore } from '@/store/presentationEditorStore';
import { useTranslations } from 'next-intl';

const PresentationCanvas = dynamic(
  () => import('./PresentationCanvas').then((m) => m.PresentationCanvas),
  { ssr: false, loading: () => <Loader2 className="h-8 w-8 animate-spin" /> }
);

type Props = {
  presentationId: number;
};

export function PresentationPresentMode({ presentationId }: Props) {
  const t = useTranslations('presentationEditor');
  const router = useRouter();
  const { data: presentation, isLoading } = usePresentation(presentationId);
  const { slides, activeSlideId, setSlides, setActiveSlideId, setSelectedElementId, reset } =
    usePresentationEditorStore();
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (presentation?.slides) {
      setSlides(presentation.slides.map((s) => ({
        ...s,
        canvas_data: Array.isArray(s.canvas_data) ? s.canvas_data : [],
      })));
      if (presentation.slides[0]) {
        setActiveSlideId(presentation.slides[0].id);
      }
      setSelectedElementId(null);
    }
    return () => reset();
  }, [presentation, setSlides, setActiveSlideId, setSelectedElementId, reset]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'Escape') {
        router.push(`/presentations/${presentationId}`);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  const currentIndex = slides.findIndex((s) => s.id === activeSlideId);

  const goNext = () => {
    if (currentIndex < slides.length - 1) {
      setActiveSlideId(slides[currentIndex + 1].id);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setActiveSlideId(slides[currentIndex - 1].id);
    }
  };

  if (isLoading || !presentation) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        {!started && (
          <Button onClick={() => setStarted(true)} size="sm">
            {t('presentMode.startTimer')}
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10"
          onClick={() => router.push(`/presentations/${presentationId}`)}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 min-h-0 relative">
        <PresentationCanvas readOnly viewMode="viewer" />
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10"
          onClick={goPrev}
          disabled={currentIndex <= 0}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <span className="text-white text-sm">
          {currentIndex + 1} / {slides.length}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10"
          onClick={goNext}
          disabled={currentIndex >= slides.length - 1}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
