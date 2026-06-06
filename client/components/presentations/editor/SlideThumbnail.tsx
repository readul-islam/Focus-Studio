'use client';

import type { PresentationSlide } from '../types';
import { cn } from '@/lib/utils';

type Props = {
  slide: PresentationSlide;
  index: number;
  isActive: boolean;
};

export function SlideThumbnail({ slide, index, isActive }: Props) {
  const elements = Array.isArray(slide.canvas_data) ? slide.canvas_data : [];
  const previewImage = elements.find(
    (el) => (el.type === 'image' || el.type === 'pdf') && el.props.src
  )?.props.src;

  return (
    <div
      className={cn(
        'relative w-full aspect-video rounded-sm overflow-hidden border',
        isActive ? 'border-primary' : 'border-border/60'
      )}
      style={{ backgroundColor: slide.background_color || '#FFFFFF' }}
    >
      {previewImage && (
        <img
          src={previewImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
      )}
      {elements.length > 0 && !previewImage && (
        <div className="absolute inset-2 rounded-sm bg-muted/30 border border-dashed border-muted-foreground/20" />
      )}
      <span className="absolute bottom-1 right-1 rounded bg-background/90 px-1 py-0.5 text-[9px] font-medium text-muted-foreground shadow-sm">
        {index + 1}
      </span>
    </div>
  );
}
