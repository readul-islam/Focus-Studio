'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { SLIDE_HEIGHT, SLIDE_WIDTH } from '../types';
import {
  clampHorizontalGuide,
  clampVerticalGuide,
  GUIDE_COLOR,
} from './canvasGuides';
import { getSlideYOffset, RULER_HEIGHT, RULER_WIDTH } from './canvasViewport';
type DragKind = 'new-h' | 'new-v';

type Props = {
  containerWidth: number;
  containerHeight: number;
  offsetX: number;
  offsetY: number;
  zoom: number;
  activeSlideIndex: number;
  disabled?: boolean;
  onAddHorizontalGuide: (y: number) => void;
  onAddVerticalGuide: (x: number) => void;
};

function GuideDragHandle({ orientation }: { orientation: 'h' | 'v' }) {
  if (orientation === 'h') {
    return (
      <div className="flex flex-col items-center pointer-events-none">
        <div className="h-1.5 w-px bg-foreground/40" />
        <div className="flex h-[11px] w-[11px] items-center justify-center rounded-full border border-foreground/25 bg-background shadow-[0_1px_3px_rgba(0,0,0,0.12)]">
          <div className="h-[5px] w-[5px] rounded-full bg-foreground" />
        </div>
        <div className="h-2 w-px bg-foreground/55" />
      </div>
    );
  }

  return (
    <div className="flex items-center pointer-events-none">
      <div className="w-1.5 h-px bg-foreground/40" />
      <div className="flex h-[11px] w-[11px] items-center justify-center rounded-full border border-foreground/25 bg-background shadow-[0_1px_3px_rgba(0,0,0,0.12)]">
        <div className="h-[5px] w-[5px] rounded-full bg-foreground" />
      </div>
      <div className="w-2 h-px bg-foreground/55" />
    </div>
  );
}

function GuidePositionLabel({ value, orientation }: { value: number; orientation: 'h' | 'v' }) {
  return (
    <span
      className="rounded bg-foreground px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-background shadow-sm"
      style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}
    >
      {orientation === 'h' ? `Y ${value}` : `X ${value}`}
    </span>
  );
}

export function RulerGuideInteraction({
  containerWidth,
  containerHeight,
  offsetX,
  offsetY,
  zoom,
  activeSlideIndex,
  disabled = false,
  onAddHorizontalGuide,
  onAddVerticalGuide,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverRuler, setHoverRuler] = useState<'h' | 'v' | null>(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [drag, setDrag] = useState<{ kind: DragKind; preview: number } | null>(null);

  const slideTop = offsetY + getSlideYOffset(activeSlideIndex) * zoom;
  const slideLeft = offsetX;
  const slideWidth = SLIDE_WIDTH * zoom;
  const slideHeight = SLIDE_HEIGHT * zoom;

  const screenToSlideX = useCallback(
    (screenX: number) => clampVerticalGuide((screenX - offsetX) / zoom, SLIDE_WIDTH),
    [offsetX, zoom]
  );

  const screenToSlideY = useCallback(
    (screenY: number) =>
      clampHorizontalGuide(
        (screenY - offsetY) / zoom - getSlideYOffset(activeSlideIndex),
        SLIDE_HEIGHT
      ),
    [offsetY, zoom, activeSlideIndex]
  );

  const isOverSlide = useCallback(
    (clientX: number, clientY: number) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return false;
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      return (
        x >= slideLeft &&
        x <= slideLeft + slideWidth &&
        y >= slideTop &&
        y <= slideTop + slideHeight
      );
    },
    [slideLeft, slideTop, slideWidth, slideHeight]
  );

  const updateCursor = useCallback((clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setCursor({ x: clientX - rect.left, y: clientY - rect.top });
  }, []);

  useEffect(() => {
    if (!drag) return;

    const onMove = (e: MouseEvent) => {
      updateCursor(e.clientX, e.clientY);
      if (drag.kind === 'new-h') {
        setDrag({ kind: 'new-h', preview: screenToSlideY(e.clientY) });
      } else {
        setDrag({ kind: 'new-v', preview: screenToSlideX(e.clientX) });
      }
    };

    const onUp = (e: MouseEvent) => {
      if (drag.kind === 'new-h' && isOverSlide(e.clientX, e.clientY)) {
        onAddHorizontalGuide(screenToSlideY(e.clientY));
      }
      if (drag.kind === 'new-v' && isOverSlide(e.clientX, e.clientY)) {
        onAddVerticalGuide(screenToSlideX(e.clientX));
      }
      setDrag(null);
      setHoverRuler(null);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [
    drag,
    isOverSlide,
    onAddHorizontalGuide,
    onAddVerticalGuide,
    screenToSlideX,
    screenToSlideY,
    updateCursor,
  ]);

  if (disabled || activeSlideIndex < 0) return null;

  const showHorizontalHandle = (hoverRuler === 'h' || drag?.kind === 'new-h') && !disabled;
  const showVerticalHandle = (hoverRuler === 'v' || drag?.kind === 'new-v') && !disabled;

  const previewHorizontalY =
    drag?.kind === 'new-h' ? slideTop + drag.preview * zoom : null;
  const previewVerticalX =
    drag?.kind === 'new-v' ? slideLeft + drag.preview * zoom : null;

  return (
    <div ref={containerRef} className="absolute inset-0 z-20 pointer-events-none">
      <div
        className="absolute pointer-events-auto cursor-row-resize transition-colors"
        style={{
          top: 0,
          left: RULER_WIDTH,
          right: 0,
          height: RULER_HEIGHT,
          background: hoverRuler === 'h' || drag?.kind === 'new-h' ? 'rgba(0,0,0,0.03)' : undefined,
        }}
        onMouseEnter={() => setHoverRuler('h')}
        onMouseLeave={() => !drag && setHoverRuler(null)}
        onMouseMove={(e) => {
          setHoverRuler('h');
          updateCursor(e.clientX, e.clientY);
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          setDrag({ kind: 'new-h', preview: screenToSlideY(e.clientY) });
          updateCursor(e.clientX, e.clientY);
        }}
      />

      <div
        className="absolute pointer-events-auto cursor-col-resize transition-colors"
        style={{
          top: RULER_HEIGHT,
          left: 0,
          width: RULER_WIDTH,
          bottom: 0,
          background: hoverRuler === 'v' || drag?.kind === 'new-v' ? 'rgba(0,0,0,0.03)' : undefined,
        }}
        onMouseEnter={() => setHoverRuler('v')}
        onMouseLeave={() => !drag && setHoverRuler(null)}
        onMouseMove={(e) => {
          setHoverRuler('v');
          updateCursor(e.clientX, e.clientY);
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          setDrag({ kind: 'new-v', preview: screenToSlideX(e.clientX) });
          updateCursor(e.clientX, e.clientY);
        }}
      />

      {hoverRuler === 'h' && !drag && (
        <div
          className="absolute pointer-events-none z-[21]"
          style={{
            left: cursor.x,
            top: 0,
            width: 1,
            height: RULER_HEIGHT,
            background: 'rgba(0,0,0,0.18)',
          }}
        />
      )}

      {hoverRuler === 'v' && !drag && (
        <div
          className="absolute pointer-events-none z-[21]"
          style={{
            top: cursor.y,
            left: 0,
            width: RULER_WIDTH,
            height: 1,
            background: 'rgba(0,0,0,0.18)',
          }}
        />
      )}

      {showHorizontalHandle && (
        <div
          className="absolute pointer-events-none z-[22]"
          style={{
            left: cursor.x,
            top: RULER_HEIGHT - 1,
            transform: 'translateX(-50%)',
          }}
        >
          <GuideDragHandle orientation="h" />
        </div>
      )}

      {showVerticalHandle && (
        <div
          className="absolute pointer-events-none z-[22]"
          style={{
            top: cursor.y,
            left: RULER_WIDTH - 1,
            transform: 'translateY(-50%)',
          }}
        >
          <GuideDragHandle orientation="v" />
        </div>
      )}

      {previewHorizontalY !== null && (
        <>
          <div
            className="absolute pointer-events-none"
            style={{
              left: slideLeft,
              top: previewHorizontalY,
              width: slideWidth,
              height: 0,
              borderTop: `1px solid ${GUIDE_COLOR}`,
            }}
          />
          <div
            className="absolute pointer-events-none"
            style={{
              left: slideLeft + 8,
              top: previewHorizontalY - 22,
            }}
          >
            <GuidePositionLabel value={drag!.preview} orientation="h" />
          </div>
        </>
      )}

      {previewVerticalX !== null && (
        <>
          <div
            className="absolute pointer-events-none"
            style={{
              left: previewVerticalX,
              top: slideTop,
              width: 0,
              height: slideHeight,
              borderLeft: `1px solid ${GUIDE_COLOR}`,
            }}
          />
          <div
            className="absolute pointer-events-none"
            style={{
              left: previewVerticalX + 8,
              top: slideTop + 8,
            }}
          >
            <GuidePositionLabel value={drag!.preview} orientation="v" />
          </div>
        </>
      )}

      {drag && (
        <div className="absolute inset-0 pointer-events-auto cursor-crosshair" />
      )}
    </div>
  );
}
