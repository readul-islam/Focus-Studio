'use client';

import { useEffect, useState } from 'react';

const cache = new Map<string, HTMLImageElement>();

function resolveImageSrc(src: string): string {
  if (
    src.startsWith('http://') ||
    src.startsWith('https://') ||
    src.startsWith('data:') ||
    src.startsWith('blob:')
  ) {
    return src;
  }
  const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');
  return `${base}${src.startsWith('/') ? '' : '/'}${src}`;
}

export function useCanvasImage(src: string | undefined) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!src) {
      setImage(null);
      return;
    }
    const resolvedSrc = resolveImageSrc(src);
    if (cache.has(resolvedSrc)) {
      setImage(cache.get(resolvedSrc)!);
      return;
    }
    const img = new window.Image();
    img.onload = () => {
      cache.set(resolvedSrc, img);
      setImage(img);
    };
    img.onerror = () => setImage(null);
    img.src = resolvedSrc;
  }, [src]);

  return image;
}
