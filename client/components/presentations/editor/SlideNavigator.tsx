'use client';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, MoreHorizontal, Trash2, Copy, GripVertical } from 'lucide-react';
import { usePresentationEditorStore } from '@/store/presentationEditorStore';
import type { PresentationSlide } from '../types';
import { SlideThumbnail } from './SlideThumbnail';
import { SlideFormatPanel } from './SlideFormatPanel';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

function SortableSlide({
  slide,
  index,
  isActive,
  onSelect,
  onDelete,
  onDuplicate,
}: {
  slide: PresentationSlide;
  index: number;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const t = useTranslations('presentationEditor');
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: slide.id });

  const style = {
    transform: CSS.Transform.toString(
      transform ? { ...transform, x: 0, scaleX: 1, scaleY: 1 } : null
    ),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative rounded-lg border bg-background p-1.5',
        isActive ? 'border-primary ring-1 ring-primary/40' : 'border-border',
        isDragging && 'z-10 shadow-md opacity-90'
      )}
    >
      <div className="flex items-start gap-1">
        <button
          type="button"
          ref={setActivatorNodeRef}
          className="mt-1 shrink-0 flex h-6 w-5 items-center justify-center cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
          aria-label={t('slide.drag')}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          className="min-w-0 flex-1 text-left"
          onClick={onSelect}
        >
          <SlideThumbnail slide={slide} index={index} isActive={isActive} />
          <p className="mt-1 truncate px-0.5 text-[10px] text-muted-foreground">
            {slide.title || t('slide.defaultTitle', { n: index + 1 })}
          </p>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 opacity-0 group-hover/slide-item:opacity-100 hover:opacity-100 focus:opacity-100 data-[state=open]:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicate(); }}>
              <Copy className="mr-2 h-3 w-3" />
              {t('slide.duplicate')}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
            >
              <Trash2 className="mr-2 h-3 w-3" />
              {t('slide.delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

type Props = {
  onAddSlide: () => void;
  onDeleteSlide: (id: number) => void;
  onDuplicateSlide: (id: number) => void;
  onReorder: (ids: number[]) => void;
  onBackgroundColorChange: (slideId: number, color: string) => void;
};

export function SlideNavigator({
  onAddSlide,
  onDeleteSlide,
  onDuplicateSlide,
  onReorder,
  onBackgroundColorChange,
}: Props) {
  const t = useTranslations('presentationEditor');
  const { slides, activeSlideId, setActiveSlideId, setSlides } = usePresentationEditorStore();
  const activeSlide = slides.find((s) => s.id === activeSlideId);

  const sortedSlides = useMemo(
    () => [...slides].sort((a, b) => a.order - b.order),
    [slides]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sortedSlides.findIndex((s) => s.id === active.id);
    const newIndex = sortedSlides.findIndex((s) => s.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const reordered = [...sortedSlides];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    setSlides(reordered.map((s, i) => ({ ...s, order: i })));
    onReorder(reordered.map((s) => s.id));
  };

  return (
    <div className="flex w-52 shrink-0 flex-col border-l bg-background min-h-0">
      <div className="shrink-0 border-b px-3 py-2 text-xs font-medium text-muted-foreground">
        {t('slideNavigator.title')}
      </div>
      {activeSlide && (
        <SlideFormatPanel
          backgroundColor={activeSlide.background_color || '#FFFFFF'}
          onBackgroundColorChange={(color) => onBackgroundColorChange(activeSlide.id, color)}
        />
      )}
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-2 py-2">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={sortedSlides.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-2">
              {sortedSlides.map((slide, index) => (
                <div key={slide.id} className="group/slide-item">
                  <SortableSlide
                    slide={slide}
                    index={index}
                    isActive={slide.id === activeSlideId}
                    onSelect={() => setActiveSlideId(slide.id)}
                    onDelete={() => onDeleteSlide(slide.id)}
                    onDuplicate={() => onDuplicateSlide(slide.id)}
                  />
                </div>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
      <div className="shrink-0 border-t p-2">
        <Button variant="outline" size="sm" className="w-full" onClick={onAddSlide}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
