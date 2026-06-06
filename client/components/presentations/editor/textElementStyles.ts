import type { CSSProperties } from 'react';
import type { CanvasElement } from '../types';

export const TEXT_FONT_OPTIONS = [
  { value: 'Inter, sans-serif', label: 'Inter' },
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Helvetica, sans-serif', label: 'Helvetica' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Times New Roman, serif', label: 'Times New Roman' },
  { value: 'Courier New, monospace', label: 'Courier New' },
] as const;

export const TEXT_SIZE_OPTIONS = [12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 64, 72] as const;

export const TEXT_LINE_HEIGHT = 1.2;
export const TEXT_MIN_WIDTH = 80;
export const TEXT_MIN_HEIGHT = 32;

export function getKonvaFontStyle(element: CanvasElement): string {
  const bold = !!element.props.bold;
  const italic = !!element.props.italic;
  if (bold && italic) return 'bold italic';
  if (bold) return 'bold';
  if (italic) return 'italic';
  return 'normal';
}

export function getCanvasFontStyle(props: CanvasElement['props']): string {
  const bold = !!props.bold;
  const italic = !!props.italic;
  if (bold && italic) return 'bold italic';
  if (bold) return 'bold';
  if (italic) return 'italic';
  return 'normal';
}

export function getTextDecoration(element: CanvasElement): string {
  const parts: string[] = [];
  if (element.props.underline) parts.push('underline');
  if (element.props.strikethrough) parts.push('line-through');
  return parts.join(' ') || '';
}

export function getFontFamilyLabel(fontFamily?: string): string {
  const match = TEXT_FONT_OPTIONS.find((f) => f.value === fontFamily);
  return match?.label ?? 'Inter';
}

export function normalizeFontFamily(fontFamily?: string): string {
  if (!fontFamily) return 'Inter, sans-serif';
  const match = TEXT_FONT_OPTIONS.find(
    (f) => f.value === fontFamily || f.label === fontFamily
  );
  return match?.value ?? fontFamily;
}

export function clampFontSize(size: number): number {
  return Math.min(200, Math.max(8, Math.round(size)));
}

function wrapLine(line: string, maxWidth: number, ctx: CanvasRenderingContext2D): string[] {
  if (!line) return [''];
  if (ctx.measureText(line).width <= maxWidth) return [line];

  const words = line.split(/(\s+)/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const next = current + word;
    if (ctx.measureText(next).width > maxWidth && current) {
      lines.push(current.trimEnd());
      current = word.trimStart();
    } else {
      current = next;
    }
  }

  if (current) lines.push(current.trimEnd());
  return lines.length > 0 ? lines : [''];
}

export function measureTextBox(
  text: string,
  boxWidth: number,
  props: CanvasElement['props']
): { width: number; height: number } {
  const fontSize = props.fontSize || 24;
  const fontFamily = normalizeFontFamily(props.fontFamily);
  const fontStyle = getCanvasFontStyle(props);
  const width = Math.max(TEXT_MIN_WIDTH, boxWidth);

  if (typeof document === 'undefined') {
    return {
      width,
      height: Math.max(TEXT_MIN_HEIGHT, fontSize * TEXT_LINE_HEIGHT),
    };
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return {
      width,
      height: Math.max(TEXT_MIN_HEIGHT, fontSize * TEXT_LINE_HEIGHT),
    };
  }

  ctx.font = `${fontStyle} ${fontSize}px ${fontFamily}`;

  const paragraphs = text.split('\n');
  const lines: string[] = [];
  for (const paragraph of paragraphs) {
    lines.push(...wrapLine(paragraph, width, ctx));
  }

  const linePx = fontSize * TEXT_LINE_HEIGHT;
  const height = Math.max(TEXT_MIN_HEIGHT, Math.ceil(lines.length * linePx + 4));
  const contentWidth = Math.max(
    ...lines.map((line) => Math.ceil(ctx.measureText(line).width)),
    40
  );

  return {
    width: Math.max(TEXT_MIN_WIDTH, Math.min(width, contentWidth + 8)),
    height,
  };
}

export function getEditorStyles(
  element: CanvasElement,
  zoom: number
): CSSProperties {
  const props = element.props;
  const fontSize = (props.fontSize || 24) * zoom;

  return {
    fontSize,
    fontFamily: normalizeFontFamily(props.fontFamily),
    fontStyle: props.italic ? 'italic' : 'normal',
    fontWeight: props.bold ? '700' : '400',
    color: props.fill || '#111111',
    textAlign: props.align || 'left',
    textDecoration: [
      props.underline ? 'underline' : '',
      props.strikethrough ? 'line-through' : '',
    ]
      .filter(Boolean)
      .join(' '),
    lineHeight: TEXT_LINE_HEIGHT,
  };
}
