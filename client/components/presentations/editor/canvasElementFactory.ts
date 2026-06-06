import type { CanvasElement } from '../types';

export function newElementId() {
  return `el-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function createTextElement(overrides?: Partial<CanvasElement>): CanvasElement {
  return {
    id: newElementId(),
    type: 'text',
    x: 120,
    y: 120,
    w: 420,
    h: 48,
    z: 0,
    props: {
      text: '',
      fontSize: 32,
      fill: '#111111',
      fontFamily: 'Inter, sans-serif',
      align: 'left',
    },
    ...overrides,
  };
}

export function createShapeElement(overrides?: Partial<CanvasElement>): CanvasElement {
  return {
    id: newElementId(),
    type: 'shape',
    x: 200,
    y: 200,
    w: 200,
    h: 120,
    z: 0,
    props: { shapeType: 'rect', fill: '#E2E8F0', stroke: '#94A3B8' },
    ...overrides,
  };
}

export function createImageElement(
  src: string,
  layout: { x: number; y: number; w: number; h: number },
  name?: string
): CanvasElement {
  return {
    id: newElementId(),
    type: 'image',
    x: layout.x,
    y: layout.y,
    w: layout.w,
    h: layout.h,
    z: 0,
    props: { src, name },
  };
}
