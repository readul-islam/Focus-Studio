'use client';

import { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Group, Rect, Text, Image as KonvaImage, Circle } from 'react-konva';
import type { CanvasElement, PresentationSlide } from '../types';
import { SLIDE_WIDTH, SLIDE_HEIGHT } from '../types';
import { SlideBackgroundLayer } from '../editor/SlideBackgroundLayer';
import { useCanvasImage } from '../editor/useCanvasImage';
import {
  getKonvaFontStyle,
  getTextDecoration,
  normalizeFontFamily,
  TEXT_LINE_HEIGHT,
} from '../editor/textElementStyles';
import {
  computeViewerFitZoom,
  getViewerCanvasLayout,
} from '../editor/canvasViewport';
import { SLIDE_SHADOW } from '../editor/canvasConstants';

function ViewerImage({ element }: { element: CanvasElement }) {
  const image = useCanvasImage(element.props.src);
  if (!image) return null;
  return (
    <KonvaImage
      image={image}
      x={element.x}
      y={element.y}
      width={element.w}
      height={element.h}
    />
  );
}

function ViewerText({ element }: { element: CanvasElement }) {
  const displayText = element.props.text?.trim() ? element.props.text : '';
  if (!displayText) return null;
  return (
    <Text
      x={element.x}
      y={element.y}
      width={element.w}
      text={displayText}
      fontSize={element.props.fontSize || 24}
      fill={element.props.fill || '#111111'}
      fontFamily={normalizeFontFamily(element.props.fontFamily)}
      fontStyle={getKonvaFontStyle(element)}
      align={element.props.align || 'left'}
      textDecoration={getTextDecoration(element)}
      lineHeight={TEXT_LINE_HEIGHT}
      wrap="word"
    />
  );
}

function ViewerShape({ element }: { element: CanvasElement }) {
  if (element.props.shapeType === 'circle') {
    const radius = Math.min(element.w, element.h) / 2;
    return (
      <Circle
        x={element.x + radius}
        y={element.y + radius}
        radius={radius}
        fill={element.props.fill || '#e5e7eb'}
        stroke={element.props.stroke || '#9ca3af'}
        strokeWidth={element.props.strokeWidth || 1}
      />
    );
  }
  return (
    <Rect
      x={element.x}
      y={element.y}
      width={element.w}
      height={element.h}
      fill={element.props.fill || '#e5e7eb'}
      stroke={element.props.stroke || '#9ca3af'}
      strokeWidth={element.props.strokeWidth || 1}
    />
  );
}

function renderElement(element: CanvasElement) {
  if (element.type === 'text') return <ViewerText key={element.id} element={element} />;
  if (element.type === 'shape') return <ViewerShape key={element.id} element={element} />;
  if (element.type === 'image' || element.type === 'pdf') {
    return <ViewerImage key={element.id} element={element} />;
  }
  return null;
}

type Props = {
  slides: PresentationSlide[];
  activeSlideId: number | null;
  onReady?: () => void;
};

export function PublicPresentationViewer({ slides, activeSlideId, onReady }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = (width: number, height: number) => {
      const w = Math.floor(width);
      const h = Math.floor(height);
      if (w > 0 && h > 0) setSize({ width: w, height: h });
    };

    const ro = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (rect) update(rect.width, rect.height);
    });
    ro.observe(el);

    const rect = el.getBoundingClientRect();
    update(rect.width, rect.height);

    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (size.width > 0 && size.height > 0) {
      onReady?.();
    }
  }, [size.width, size.height, onReady]);

  const activeSlide = slides.find((s) => s.id === activeSlideId) ?? slides[0];
  if (!activeSlide || size.width <= 0 || size.height <= 0) {
    return <div ref={containerRef} className="h-full w-full bg-[#F1F3F5]" />;
  }

  const zoom = computeViewerFitZoom(size.width, size.height);
  const { offsetX, offsetY } = getViewerCanvasLayout(size.width, size.height, zoom);
  const elements = Array.isArray(activeSlide.canvas_data) ? activeSlide.canvas_data : [];

  return (
    <div ref={containerRef} className="h-full w-full bg-[#F1F3F5]">
      <Stage
        width={size.width}
        height={size.height}
        scaleX={zoom}
        scaleY={zoom}
        x={offsetX}
        y={offsetY}
      >
        <Layer>
          <Group>
            <Rect
              x={0}
              y={0}
              width={SLIDE_WIDTH}
              height={SLIDE_HEIGHT}
              fill="transparent"
              shadowColor={SLIDE_SHADOW.color}
              shadowBlur={SLIDE_SHADOW.blur}
              shadowOffset={{ x: 0, y: SLIDE_SHADOW.offsetY }}
              shadowOpacity={SLIDE_SHADOW.opacity}
              listening={false}
            />
            <SlideBackgroundLayer
              backgroundColor={activeSlide.background_color || '#FFFFFF'}
              backgroundImageUrl={activeSlide.background_image_url}
            />
            {elements
              .sort((a, b) => a.z - b.z)
              .map((el) => renderElement(el))}
          </Group>
        </Layer>
      </Stage>
    </div>
  );
}
