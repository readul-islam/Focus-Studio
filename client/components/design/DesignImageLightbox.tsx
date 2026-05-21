'use client';

import { useCallback, useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import 'yet-another-react-lightbox/styles.css';

export type DesignLightboxSlide = {
  src: string;
  alt?: string;
};

export function useDesignImageLightbox() {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [slides, setSlides] = useState<DesignLightboxSlide[]>([]);

  const openImage = useCallback(
    (src: string, options?: { alt?: string; gallery?: DesignLightboxSlide[] }) => {
      const gallery = options?.gallery?.filter(s => s.src) ?? [];
      if (gallery.length > 0) {
        const idx = gallery.findIndex(s => s.src === src);
        setSlides(gallery);
        setIndex(idx >= 0 ? idx : 0);
      } else {
        setSlides([{ src, alt: options?.alt }]);
        setIndex(0);
      }
      setOpen(true);
    },
    []
  );

  const close = useCallback(() => setOpen(false), []);

  const LightboxModal = () => (
    <Lightbox
      open={open}
      close={close}
      slides={slides}
      index={index}
      on={{ view: ({ index: i }) => setIndex(i) }}
      plugins={[Zoom, Fullscreen]}
      zoom={{ maxZoomPixelRatio: 4, scrollToZoom: true }}
      animation={{ fade: 250 }}
      carousel={{ finite: slides.length <= 1 }}
      controller={{ closeOnBackdropClick: true }}
      styles={{
        container: { backgroundColor: 'rgba(0, 0, 0, 0.92)' },
      }}
    />
  );

  return { openImage, close, LightboxModal };
}

/** Clickable image wrapper — opens fullscreen lightbox on click. */
export function DesignClickableImage({
  src,
  alt,
  className,
  onOpen,
}: {
  src: string;
  alt: string;
  className?: string;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`block p-0 border-0 bg-transparent cursor-zoom-in w-full h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#748971] focus-visible:ring-offset-2 rounded-xl ${className ?? ''}`}
      aria-label={`View ${alt} fullscreen`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="w-full h-full object-cover pointer-events-none" />
    </button>
  );
}
