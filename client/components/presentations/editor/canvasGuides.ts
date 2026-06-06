export type SlideGuides = {
  horizontal: number[];
  vertical: number[];
};

export const EMPTY_GUIDES: SlideGuides = { horizontal: [], vertical: [] };

export const GUIDE_COLOR = '#E8A090';

export function snapGuide(value: number, step = 1): number {
  return Math.round(value / step) * step;
}

export function clampHorizontalGuide(y: number, slideHeight: number): number {
  return Math.max(0, Math.min(slideHeight, snapGuide(y)));
}

export function clampVerticalGuide(x: number, slideWidth: number): number {
  return Math.max(0, Math.min(slideWidth, snapGuide(x)));
}
