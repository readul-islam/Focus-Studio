'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ImageIcon } from 'lucide-react';

interface HelpArticleScreenshotsProps {
  screenshots?: string[];
  title: string;
}

function screenshotSrc(path: string): string {
  const normalized = path.startsWith('/') ? path : `/help-screenshots/${path}`;
  return normalized.startsWith('/help-screenshots/') ? normalized : `/help-screenshots/${path.replace(/^\//, '')}`;
}

function ScreenshotFrame({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-8 flex flex-col items-center justify-center text-center min-h-[160px]">
        <ImageIcon className="w-8 h-8 text-gray-300 mb-2" />
        <p className="text-sm text-gray-500">Screenshot coming soon</p>
        {caption && <p className="text-xs text-gray-400 mt-1">{caption}</p>}
      </div>
    );
  }

  return (
    <figure className="space-y-2">
      <div className="relative rounded-lg border border-gray-200 overflow-hidden bg-gray-50 aspect-video">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 720px"
          onError={() => setFailed(true)}
        />
      </div>
      {caption && <figcaption className="text-xs text-gray-500 text-center">{caption}</figcaption>}
    </figure>
  );
}

export function HelpArticleScreenshots({ screenshots, title }: HelpArticleScreenshotsProps) {
  if (!screenshots?.length) return null;

  return (
    <section className="my-10 space-y-4" aria-label="Article screenshots">
      <h2 className="text-lg font-semibold text-gray-900">Screenshots</h2>
      <div className={`grid gap-6 ${screenshots.length > 1 ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
        {screenshots.map((path, index) => {
          const src = screenshotSrc(path);
          const caption = path.split('/').pop()?.replace(/\.[^.]+$/, '').replace(/-/g, ' ');
          return (
            <ScreenshotFrame
              key={`${path}-${index}`}
              src={src}
              alt={`${title} — screenshot ${index + 1}`}
              caption={caption}
            />
          );
        })}
      </div>
    </section>
  );
}
