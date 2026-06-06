'use client';

import { Group, Line, Rect } from 'react-konva';
import type Konva from 'konva';
import { SLIDE_WIDTH, SLIDE_HEIGHT } from '../types';
import type { SlideGuides as SlideGuidesData } from './canvasGuides';
import { GUIDE_COLOR, clampHorizontalGuide, clampVerticalGuide } from './canvasGuides';

type Props = {
  guides: SlideGuidesData;
  onMoveHorizontal: (index: number, y: number) => void;
  onMoveVertical: (index: number, x: number) => void;
  onRemoveHorizontal: (index: number) => void;
  onRemoveVertical: (index: number) => void;
};

function GuideRow({
  y,
  onMove,
  onRemove,
}: {
  y: number;
  onMove: (y: number) => void;
  onRemove: () => void;
}) {
  const dragBoundFunc = (pos: Konva.Vector2d) => ({
    x: 0,
    y: clampHorizontalGuide(pos.y, SLIDE_HEIGHT),
  });

  return (
    <Group
      y={y}
      draggable
      dragBoundFunc={dragBoundFunc}
      onMouseDown={(e) => { e.cancelBubble = true; }}
      onDragEnd={(e) => onMove(e.target.y())}
      onDblClick={(e) => {
        e.cancelBubble = true;
        onRemove();
      }}
      onDblTap={(e) => {
        e.cancelBubble = true;
        onRemove();
      }}
    >
      <Line
        points={[0, 0, SLIDE_WIDTH, 0]}
        stroke={GUIDE_COLOR}
        strokeWidth={1}
        listening={false}
      />
      <Rect
        x={0}
        y={-5}
        width={SLIDE_WIDTH}
        height={10}
        fill="transparent"
      />
    </Group>
  );
}

function GuideColumn({
  x,
  onMove,
  onRemove,
}: {
  x: number;
  onMove: (x: number) => void;
  onRemove: () => void;
}) {
  const dragBoundFunc = (pos: Konva.Vector2d) => ({
    x: clampVerticalGuide(pos.x, SLIDE_WIDTH),
    y: 0,
  });

  return (
    <Group
      x={x}
      draggable
      dragBoundFunc={dragBoundFunc}
      onMouseDown={(e) => { e.cancelBubble = true; }}
      onDragEnd={(e) => onMove(e.target.x())}
      onDblClick={(e) => {
        e.cancelBubble = true;
        onRemove();
      }}
      onDblTap={(e) => {
        e.cancelBubble = true;
        onRemove();
      }}
    >
      <Line
        points={[0, 0, 0, SLIDE_HEIGHT]}
        stroke={GUIDE_COLOR}
        strokeWidth={1}
        listening={false}
      />
      <Rect
        x={-5}
        y={0}
        width={10}
        height={SLIDE_HEIGHT}
        fill="transparent"
      />
    </Group>
  );
}

export function SlideGuides({
  guides,
  onMoveHorizontal,
  onMoveVertical,
  onRemoveHorizontal,
  onRemoveVertical,
}: Props) {
  return (
    <>
      {guides.horizontal.map((y, index) => (
        <GuideRow
          key={`guide-h-${index}-${y}`}
          y={y}
          onMove={(nextY) => onMoveHorizontal(index, nextY)}
          onRemove={() => onRemoveHorizontal(index)}
        />
      ))}
      {guides.vertical.map((x, index) => (
        <GuideColumn
          key={`guide-v-${index}-${x}`}
          x={x}
          onMove={(nextX) => onMoveVertical(index, nextX)}
          onRemove={() => onRemoveVertical(index)}
        />
      ))}
    </>
  );
}
