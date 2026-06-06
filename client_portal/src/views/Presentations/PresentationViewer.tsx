'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import useFetch from '@/hooks/useFetch';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from '@/lib/navigation';
import { Helmet } from 'react-helmet-async';
import { useTranslations } from 'next-intl';
import { PresentationSlideView } from './PresentationSlideView';

export default function PresentationViewer() {
  const t = useTranslations('presentations');
  const params = useParams();
  const id = params?.id;
  const navigate = useNavigate();
  const [slideIndex, setSlideIndex] = useState(0);

  const { data, isLoading } = useFetch(
    id ? `client_portal/presentations/${id}/` : null,
    { enabled: !!id }
  );

  const presentation = data as {
    title?: string;
    project_name?: string;
    slides?: Array<{
      id: number;
      background_color?: string;
      canvas_data?: unknown[];
      pins?: unknown[];
    }>;
  } | null;

  const slides = presentation?.slides || [];
  const currentSlide = slides[slideIndex];

  return (
    <DashboardLayout>
      <Helmet>
        <title>{presentation?.title || t('title')}</title>
      </Helmet>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/presentations')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">{presentation?.title}</h1>
            <p className="text-sm text-muted-foreground">{presentation?.project_name}</p>
          </div>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">{t('loading')}</p>
        ) : !currentSlide ? (
          <p className="text-muted-foreground">{t('empty')}</p>
        ) : (
          <>
            <PresentationSlideView slide={currentSlide} />
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSlideIndex((i) => Math.max(0, i - 1))}
                disabled={slideIndex <= 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                {slideIndex + 1} / {slides.length}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSlideIndex((i) => Math.min(slides.length - 1, i + 1))}
                disabled={slideIndex >= slides.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
