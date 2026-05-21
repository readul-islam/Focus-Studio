'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { fetchDesignModelObjectUrl } from '@/lib/design-model-api';

const MODEL_VIEWER_SCRIPT =
  'https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js';

type ModelViewerProps = {
  assetId: number;
  className?: string;
  minHeight?: number;
};

declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          alt?: string;
          'camera-controls'?: boolean;
          'auto-rotate'?: boolean;
          'touch-action'?: string;
          exposure?: string;
          style?: React.CSSProperties;
        },
        HTMLElement
      >;
    }
  }
}

let scriptLoading: Promise<void> | null = null;

function loadModelViewerScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (customElements.get('model-viewer')) return Promise.resolve();
  if (scriptLoading) return scriptLoading;
  scriptLoading = new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${MODEL_VIEWER_SCRIPT}"]`)) {
      const wait = () => {
        if (customElements.get('model-viewer')) resolve();
        else setTimeout(wait, 50);
      };
      wait();
      return;
    }
    const script = document.createElement('script');
    script.type = 'module';
    script.src = MODEL_VIEWER_SCRIPT;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load 3D viewer'));
    document.head.appendChild(script);
  });
  return scriptLoading;
}

export function DesignModelViewer({ assetId, className = '', minHeight = 280 }: ModelViewerProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [viewerReady, setViewerReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let revoked: string | null = null;
    let cancelled = false;

    setBlobUrl(null);
    setError(null);
    setViewerReady(false);

    (async () => {
      try {
        await loadModelViewerScript();
        if (cancelled) return;
        setViewerReady(true);
        const url = await fetchDesignModelObjectUrl(assetId);
        if (cancelled) {
          URL.revokeObjectURL(url);
          return;
        }
        revoked = url;
        setBlobUrl(url);
      } catch {
        if (!cancelled) setError('Could not load 3D model');
      }
    })();

    return () => {
      cancelled = true;
      if (revoked) URL.revokeObjectURL(revoked);
    };
  }, [assetId]);

  return (
    <div
      className={`relative w-full rounded-xl overflow-hidden border border-gray-200 bg-stone-100 ${className}`}
      style={{ height: minHeight }}
    >
      {(!viewerReady || !blobUrl) && !error && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-500"
          aria-busy="true"
        >
          <Loader2 className="w-6 h-6 animate-spin text-[#748971]" />
          <span className="text-xs">Loading 3D model…</span>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center px-4 text-center text-sm text-red-600">
          {error}
        </div>
      )}
      {viewerReady && blobUrl && !error && (
        // @ts-expect-error model-viewer is a custom element
        <model-viewer
          src={blobUrl}
          alt="3D design model"
          camera-controls=""
          auto-rotate=""
          touch-action="pan-y"
          exposure="1"
          style={{ width: '100%', height: '100%', minHeight }}
        />
      )}
    </div>
  );
}
