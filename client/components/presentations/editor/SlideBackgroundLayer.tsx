'use client';

import { Rect, Image as KonvaImage } from 'react-konva';
import { SLIDE_WIDTH, SLIDE_HEIGHT } from '../types';
import { useCanvasImage } from './useCanvasImage';

type Props = {
  backgroundColor: string;
  backgroundImageUrl?: string | null;
};

export function SlideBackgroundLayer({ backgroundColor, backgroundImageUrl }: Props) {
  const image = useCanvasImage(backgroundImageUrl || undefined);

  return (
    <>
      <Rect
        x={0}
        y={0}
        width={SLIDE_WIDTH}
        height={SLIDE_HEIGHT}
        fill={backgroundColor || '#FFFFFF'}
        listening={false}
      />
      {image && (
        <KonvaImage
          image={image}
          x={0}
          y={0}
          width={SLIDE_WIDTH}
          height={SLIDE_HEIGHT}
          listening={false}
        />
      )}
    </>
  );
}
