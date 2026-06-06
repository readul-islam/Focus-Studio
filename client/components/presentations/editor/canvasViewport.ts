import { SLIDE_WIDTH, SLIDE_HEIGHT } from '../types';

export const RULER_HEIGHT = 26;
export const RULER_WIDTH = 36;
export const SLIDE_GAP = 72;
const PAN_MARGIN = 48;

export type Pan = { x: number; y: number };

export function getViewportCenter(containerWidth: number, containerHeight: number) {
  const availW = containerWidth - RULER_WIDTH;
  const availH = containerHeight - RULER_HEIGHT;
  return {
    x: RULER_WIDTH + availW / 2,
    y: RULER_HEIGHT + availH / 2,
    availW,
    availH,
  };
}

export function getSlideYOffset(slideIndex: number): number {
  return slideIndex * (SLIDE_HEIGHT + SLIDE_GAP);
}

/** Which slide contains a point in deck (stacked) coordinates */
export function getSlideIndexFromDeckY(deckY: number, slideCount: number): number {
  if (slideCount <= 0) return 0;
  const stride = SLIDE_HEIGHT + SLIDE_GAP;
  const index = Math.floor((deckY + SLIDE_HEIGHT / 2) / stride);
  return Math.max(0, Math.min(slideCount - 1, index));
}

export function getTotalDeckHeight(slideCount: number): number {
  if (slideCount <= 0) return SLIDE_HEIGHT;
  return slideCount * SLIDE_HEIGHT + (slideCount - 1) * SLIDE_GAP;
}

export function getCanvasLayout(
  containerWidth: number,
  containerHeight: number,
  zoom: number,
  pan: Pan,
  slideCount: number
) {
  const { availW, availH } = getViewportCenter(containerWidth, containerHeight);
  const slideW = SLIDE_WIDTH * zoom;
  const deckH = getTotalDeckHeight(slideCount) * zoom;

  const baseX = RULER_WIDTH + Math.max(0, (availW - slideW) / 2);
  const baseY = RULER_HEIGHT + Math.max(0, (availH - SLIDE_HEIGHT * zoom) / 2);

  const offsetX = baseX + pan.x;
  const offsetY = baseY + pan.y;

  return { offsetX, offsetY, availW, availH, slideW, slideH: SLIDE_HEIGHT * zoom, deckH, baseX, baseY };
}

export function panToCenterContentPoint(
  contentX: number,
  contentY: number,
  containerWidth: number,
  containerHeight: number,
  zoom: number,
  slideCount: number
): Pan {
  const { x: viewportCenterX, y: viewportCenterY } = getViewportCenter(
    containerWidth,
    containerHeight
  );
  const { baseX, baseY } = getCanvasLayout(
    containerWidth,
    containerHeight,
    zoom,
    { x: 0, y: 0 },
    slideCount
  );

  return {
    x: 0,
    y: viewportCenterY - baseY - contentY * zoom,
  };
}

export function clampPan(
  next: Pan,
  containerWidth: number,
  containerHeight: number,
  zoom: number,
  slideCount: number
): Pan {
  const { baseY, deckH, availH } = getCanvasLayout(
    containerWidth,
    containerHeight,
    zoom,
    { x: 0, y: 0 },
    slideCount
  );

  const minY = availH + RULER_HEIGHT - baseY - deckH - PAN_MARGIN;
  const maxY = RULER_HEIGHT - baseY + PAN_MARGIN;

  return {
    x: 0,
    y: Math.min(maxY, Math.max(minY, next.y)),
  };
}

export function panForSlideIndex(
  slideIndex: number,
  containerWidth: number,
  containerHeight: number,
  zoom: number,
  slideCount: number
): Pan {
  const slideCenterY = getSlideYOffset(slideIndex) + SLIDE_HEIGHT / 2;
  const pan = panToCenterContentPoint(
    SLIDE_WIDTH / 2,
    slideCenterY,
    containerWidth,
    containerHeight,
    zoom,
    slideCount
  );
  return clampPan(pan, containerWidth, containerHeight, zoom, slideCount);
}

export function getActiveSlideIndex(
  panY: number,
  containerWidth: number,
  containerHeight: number,
  zoom: number,
  slideCount: number
): number {
  if (slideCount <= 0) return 0;

  const { y: viewportCenterY } = getViewportCenter(containerWidth, containerHeight);
  const { baseY } = getCanvasLayout(
    containerWidth,
    containerHeight,
    zoom,
    { x: 0, y: panY },
    slideCount
  );

  const slideCoordY = (viewportCenterY - (baseY + panY)) / zoom;

  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < slideCount; i++) {
    const slideCenter = getSlideYOffset(i) + SLIDE_HEIGHT / 2;
    const dist = Math.abs(slideCoordY - slideCenter);
    if (dist < bestDist) {
      bestDist = dist;
      best = i;
    }
  }
  return best;
}

export function slideToScreenCoords(
  slideIndex: number,
  localX: number,
  localY: number,
  offsetX: number,
  offsetY: number,
  zoom: number
) {
  return {
    x: offsetX + localX * zoom,
    y: offsetY + (getSlideYOffset(slideIndex) + localY) * zoom,
  };
}

export function computeViewerFitZoom(containerWidth: number, containerHeight: number): number {
  if (containerWidth <= 0 || containerHeight <= 0) return 0.72;
  const padding = 48;
  const scaleX = (containerWidth - padding) / SLIDE_WIDTH;
  const scaleY = (containerHeight - padding) / SLIDE_HEIGHT;
  return Math.min(Math.max(0.25, Math.min(scaleX, scaleY)), 1);
}

export function getViewerCanvasLayout(
  containerWidth: number,
  containerHeight: number,
  zoom: number
) {
  const slideW = SLIDE_WIDTH * zoom;
  const slideH = SLIDE_HEIGHT * zoom;
  const offsetX = Math.max(0, (containerWidth - slideW) / 2);
  const offsetY = Math.max(0, (containerHeight - slideH) / 2);

  return {
    offsetX,
    offsetY,
    availW: containerWidth,
    availH: containerHeight,
    slideW,
    slideH,
    deckH: slideH,
    baseX: offsetX,
    baseY: offsetY,
  };
}

export function screenToSlideCoords(
  slideIndex: number,
  screenX: number,
  screenY: number,
  offsetX: number,
  offsetY: number,
  zoom: number
) {
  return {
    x: (screenX - offsetX) / zoom,
    y: (screenY - offsetY) / zoom - getSlideYOffset(slideIndex),
  };
}
