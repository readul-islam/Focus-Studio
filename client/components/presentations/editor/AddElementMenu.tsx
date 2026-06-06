'use client';

import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Plus, Type, Square, ImageIcon, FileText, LayoutTemplate, MapPin, GripVertical, Upload } from 'lucide-react';
import { usePresentationEditorStore } from '@/store/presentationEditorStore';
import type { CanvasElement } from '../types';
import { useTranslations } from 'next-intl';
import { createShapeElement, createTextElement } from './canvasElementFactory';

type Props = {
  onUploadImage: () => void;
  onAddImage: () => void;
  onAddProduct: () => void;
  onAddScene: () => void;
  onAddNewPage: () => void;
};

type Position = { x: number; y: number };

export function AddElementMenu({
  onUploadImage,
  onAddImage,
  onAddProduct,
  onAddScene,
  onAddNewPage,
}: Props) {
  const t = useTranslations('presentationEditor');
  const [open, setOpen] = useState(false);
  const { slides, activeSlideId, updateSlideCanvas, setPinMode, requestTextEdit } =
    usePresentationEditorStore();

  const barRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<Position | null>(null);
  const dragRef = useRef({
    active: false,
    pointerId: -1,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
  });

  const clampPosition = useCallback((x: number, y: number): Position => {
    const bar = barRef.current;
    const parent = bar?.offsetParent as HTMLElement | null;
    if (!bar || !parent) return { x, y };
    const maxX = Math.max(0, parent.clientWidth - bar.offsetWidth);
    const maxY = Math.max(0, parent.clientHeight - bar.offsetHeight);
    return {
      x: Math.min(maxX, Math.max(0, x)),
      y: Math.min(maxY, Math.max(0, y)),
    };
  }, []);

  useLayoutEffect(() => {
    if (position !== null || !barRef.current) return;
    const bar = barRef.current;
    const parent = bar.offsetParent as HTMLElement | null;
    if (!parent) return;
    const x = (parent.clientWidth - bar.offsetWidth) / 2;
    const y = parent.clientHeight - bar.offsetHeight - 24;
    setPosition(clampPosition(x, y));
  }, [position, clampPosition]);

  useLayoutEffect(() => {
    const parent = barRef.current?.offsetParent as HTMLElement | null;
    if (!parent || position === null) return;

    const observer = new ResizeObserver(() => {
      setPosition((prev) => (prev ? clampPosition(prev.x, prev.y) : prev));
    });
    observer.observe(parent);
    return () => observer.disconnect();
  }, [position, clampPosition]);

  const handleDragStart = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (position === null) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      active: true,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: position.x,
      originY: position.y,
    };
  };

  const handleDragMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragRef.current.active || e.pointerId !== dragRef.current.pointerId) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPosition(clampPosition(dragRef.current.originX + dx, dragRef.current.originY + dy));
  };

  const handleDragEnd = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragRef.current.active || e.pointerId !== dragRef.current.pointerId) return;
    dragRef.current.active = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const addElement = (element: CanvasElement) => {
    const slide = slides.find((s) => s.id === activeSlideId);
    if (!slide) return;
    const maxZ = slide.canvas_data.reduce((m, el) => Math.max(m, el.z), 0);
    updateSlideCanvas(slide.id, [...slide.canvas_data, { ...element, z: maxZ + 1 }]);
    setOpen(false);
  };

  const handleAddText = () => {
    const element = createTextElement();
    addElement(element);
    requestTextEdit(element.id);
  };

  const handleAddShape = () => {
    addElement(createShapeElement());
  };

  return (
    <div
      ref={barRef}
      className="absolute z-10 flex items-center bg-neutral-900 text-white rounded-full shadow-lg select-none"
      style={
        position
          ? { left: position.x, top: position.y, transform: 'none' }
          : { left: '50%', bottom: 24, transform: 'translateX(-50%)' }
      }
    >
      <button
        type="button"
        aria-label={t('addMenu.drag')}
        className="flex items-center justify-center px-2.5 py-2.5 rounded-l-full cursor-grab active:cursor-grabbing text-white/70 hover:text-white touch-none"
        onPointerDown={handleDragStart}
        onPointerMove={handleDragMove}
        onPointerUp={handleDragEnd}
        onPointerCancel={handleDragEnd}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="w-px h-5 bg-white/20" />

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            className="rounded-none h-9 px-3 text-white hover:bg-white/10 hover:text-white"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            {t('addMenu.add')}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-52 p-1" align="center">
          <p className="px-2 py-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {t('addMenu.content')}
          </p>
          <Button variant="ghost" className="w-full justify-start" onClick={handleAddText}>
            <Type className="mr-2 h-4 w-4" />
            {t('addMenu.text')}
          </Button>
          <Button variant="ghost" className="w-full justify-start" onClick={handleAddShape}>
            <Square className="mr-2 h-4 w-4" />
            {t('addMenu.shape')}
          </Button>
          <Button variant="ghost" className="w-full justify-start" onClick={() => { setOpen(false); onUploadImage(); }}>
            <Upload className="mr-2 h-4 w-4" />
            {t('addMenu.uploadImage')}
          </Button>
          <Button variant="ghost" className="w-full justify-start" onClick={() => { setOpen(false); onAddImage(); }}>
            <ImageIcon className="mr-2 h-4 w-4" />
            {t('addMenu.imageLibrary')}
          </Button>
          <Button variant="ghost" className="w-full justify-start" onClick={() => { setOpen(false); onAddNewPage(); }}>
            <FileText className="mr-2 h-4 w-4" />
            {t('addMenu.newPage')}
          </Button>
          <div className="my-1 border-t" />
          <p className="px-2 py-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {t('addMenu.library')}
          </p>
          <Button variant="ghost" className="w-full justify-start" onClick={() => { setOpen(false); onAddProduct(); }}>
            <LayoutTemplate className="mr-2 h-4 w-4" />
            {t('addMenu.product')}
          </Button>
          <Button variant="ghost" className="w-full justify-start" onClick={() => { setOpen(false); onAddScene(); }}>
            <ImageIcon className="mr-2 h-4 w-4" />
            {t('addMenu.scene')}
          </Button>
        </PopoverContent>
      </Popover>

      <div className="w-px h-5 bg-white/20" />

      <Button
        size="sm"
        variant="ghost"
        className="rounded-r-full h-9 px-3 text-white hover:bg-white/10 hover:text-white"
        onClick={() => setPinMode(true)}
      >
        <MapPin className="mr-1.5 h-4 w-4" />
        {t('addMenu.pin')}
      </Button>
    </div>
  );
}
