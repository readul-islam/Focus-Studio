'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { DesignModelViewer } from '@/components/design/DesignModelViewer';

type Props = {
  open: boolean;
  assetId: number;
  onClose: () => void;
};

export function DesignModelLightbox({ open, assetId, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  const minHeight = typeof window !== 'undefined' ? window.innerHeight - 120 : 500;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex flex-col bg-black/95"
      role="dialog"
      aria-modal="true"
      aria-label="3D model fullscreen"
    >
      <div className="flex items-center justify-between gap-4 px-4 py-3 shrink-0 border-b border-white/10">
        <p className="text-sm text-white/80">Drag to rotate · Scroll to zoom · Esc to close</p>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-2 rounded-full bg-white text-gray-900 px-4 py-2 text-sm font-medium shadow-lg hover:bg-gray-100 shrink-0"
          aria-label="Close fullscreen"
        >
          <X className="w-4 h-4" />
          Close
        </button>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="absolute top-3 right-3 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-gray-900 shadow-lg hover:bg-white md:hidden"
        aria-label="Close fullscreen"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex-1 min-h-0 px-4 pb-4 pt-2">
        <DesignModelViewer assetId={assetId} minHeight={minHeight} />
      </div>

      <div className="shrink-0 flex justify-center pb-5 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-2.5 text-sm font-medium text-white hover:bg-white/20"
        >
          <X className="w-4 h-4" />
          Exit fullscreen
        </button>
      </div>
    </div>,
    document.body
  );
}
