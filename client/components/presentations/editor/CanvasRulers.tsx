'use client';

import { useMemo } from 'react';
import { SLIDE_WIDTH } from '../types';
import { getTotalDeckHeight, RULER_HEIGHT, RULER_WIDTH } from './canvasViewport';
import {
  buildRulerTicks,
  contentToScreen,
  getRulerTickVisibility,
} from './rulerTicks';

const RULER_BG = '#F4F4F5';
const RULER_BORDER = '#E4E4E7';
const TICK_MAJOR = '#71717A';
const TICK_MEDIUM = '#94949E';
const TICK_MINOR = '#ADADB5';
const LABEL_COLOR = '#52525B';

type Props = {
  containerWidth: number;
  containerHeight: number;
  offsetX: number;
  offsetY: number;
  zoom: number;
  slideCount: number;
};

function tickHeight(kind: 'major' | 'medium' | 'minor', orientation: 'h' | 'v') {
  if (orientation === 'h') {
    if (kind === 'major') return 10;
    if (kind === 'medium') return 7;
    return 5;
  }
  if (kind === 'major') return 10;
  if (kind === 'medium') return 7;
  return 5;
}

function tickColor(kind: 'major' | 'medium' | 'minor') {
  if (kind === 'major') return TICK_MAJOR;
  if (kind === 'medium') return TICK_MEDIUM;
  return TICK_MINOR;
}

function tickStrokeWidth(kind: 'major' | 'medium' | 'minor') {
  if (kind === 'major') return 1;
  if (kind === 'medium') return 0.85;
  return 1;
}

export function CanvasRulers({
  containerWidth,
  containerHeight,
  offsetX,
  offsetY,
  zoom,
  slideCount,
}: Props) {
  const deckHeight = getTotalDeckHeight(slideCount);
  const visibility = getRulerTickVisibility(zoom);
  const hWidth = Math.max(0, containerWidth - RULER_WIDTH);
  const vHeight = Math.max(0, containerHeight - RULER_HEIGHT);

  const horizontalTicks = useMemo(() => {
    const contentMin = (RULER_WIDTH - offsetX) / zoom;
    const contentMax = (containerWidth - offsetX) / zoom;
    return buildRulerTicks(contentMin, contentMax, SLIDE_WIDTH, visibility);
  }, [containerWidth, offsetX, zoom, visibility]);

  const verticalTicks = useMemo(() => {
    const contentMin = (RULER_HEIGHT - offsetY) / zoom;
    const contentMax = (containerHeight - offsetY) / zoom;
    return buildRulerTicks(contentMin, contentMax, deckHeight, visibility);
  }, [containerHeight, offsetY, zoom, deckHeight, visibility]);

  return (
    <>
      {/* Corner */}
      <div
        className="absolute top-0 left-0 z-10 pointer-events-none select-none"
        style={{
          width: RULER_WIDTH,
          height: RULER_HEIGHT,
          background: RULER_BG,
          borderRight: `1px solid ${RULER_BORDER}`,
          borderBottom: `1px solid ${RULER_BORDER}`,
        }}
      />

      {/* Horizontal ruler */}
      <div
        className="absolute top-0 z-10 pointer-events-none select-none overflow-hidden"
        style={{
          left: RULER_WIDTH,
          right: 0,
          height: RULER_HEIGHT,
          background: RULER_BG,
          borderBottom: `1px solid ${RULER_BORDER}`,
        }}
      >
        <svg
          width={hWidth}
          height={RULER_HEIGHT}
          className="block"
          aria-hidden
        >
          {horizontalTicks.map((tick) => {
            const x = contentToScreen(tick.pos, offsetX, zoom) - RULER_WIDTH;
            if (x < -2 || x > hWidth + 2) return null;
            const h = tickHeight(tick.kind, 'h');
            return (
              <g key={`h-${tick.pos}-${tick.kind}`}>
                <line
                  x1={x}
                  y1={RULER_HEIGHT}
                  x2={x}
                  y2={RULER_HEIGHT - h}
                  stroke={tickColor(tick.kind)}
                  strokeWidth={tickStrokeWidth(tick.kind)}
                />
                {tick.label !== undefined && (
                  <text
                    x={x + 3}
                    y={11}
                    fill={LABEL_COLOR}
                    fontSize={10}
                    fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                    fontWeight={500}
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {tick.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Vertical ruler */}
      <div
        className="absolute left-0 z-10 pointer-events-none select-none overflow-hidden"
        style={{
          top: RULER_HEIGHT,
          width: RULER_WIDTH,
          height: vHeight,
          background: RULER_BG,
          borderRight: `1px solid ${RULER_BORDER}`,
        }}
      >
        <svg
          width={RULER_WIDTH}
          height={vHeight}
          className="block"
          aria-hidden
        >
          {verticalTicks.map((tick) => {
            const y = contentToScreen(tick.pos, offsetY, zoom) - RULER_HEIGHT;
            if (y < -2 || y > vHeight + 2) return null;
            const w = tickHeight(tick.kind, 'v');
            return (
              <g key={`v-${tick.pos}-${tick.kind}`}>
                <line
                  x1={RULER_WIDTH}
                  y1={y}
                  x2={RULER_WIDTH - w}
                  y2={y}
                  stroke={tickColor(tick.kind)}
                  strokeWidth={tickStrokeWidth(tick.kind)}
                />
                {tick.label !== undefined && (
                  <text
                    x={4}
                    y={y - 3}
                    fill={LABEL_COLOR}
                    fontSize={9}
                    fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                    fontWeight={500}
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {tick.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </>
  );
}

export const CANVAS_GRID_STEP = 100;
