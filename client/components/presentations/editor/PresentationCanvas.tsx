'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Stage, Layer, Group, Rect, Text, Circle, Image as KonvaImage, Transformer } from 'react-konva';
import type Konva from 'konva';
import { usePresentationEditorStore } from '@/store/presentationEditorStore';
import type { CanvasElement, PresentationSlide } from '../types';
import { SLIDE_WIDTH, SLIDE_HEIGHT } from '../types';
import { useCanvasImage } from './useCanvasImage';
import { ElementContextToolbar } from './ElementContextToolbar';
import { TextElementToolbar } from './TextElementToolbar';
import { TextElementEditor } from './TextElementEditor';
import {
  getKonvaFontStyle,
  getTextDecoration,
  measureTextBox,
  normalizeFontFamily,
  TEXT_LINE_HEIGHT,
} from './textElementStyles';
import { CanvasRulers } from './CanvasRulers';
import { RulerGuideInteraction } from './RulerGuideInteraction';
import { SlideGuides } from './SlideGuides';
import {
  clampPan,
  getActiveSlideIndex,
  computeViewerFitZoom,
  getCanvasLayout,
  getSlideIndexFromDeckY,
  getSlideYOffset,
  getViewerCanvasLayout,
  panForSlideIndex,
  RULER_HEIGHT,
  RULER_WIDTH,
  screenToSlideCoords,
  slideToScreenCoords,
  type Pan,
} from './canvasViewport';
import { useTranslations } from 'next-intl';
import { SlideBackgroundLayer } from './SlideBackgroundLayer';
import { CanvasEmptyState } from './CanvasEmptyState';
import {
  SLIDE_ACTIVE_STROKE,
  SLIDE_ACTIVE_STROKE_OPACITY,
  SLIDE_PIN_FILL,
  SLIDE_SHADOW,
  WORKSPACE_BG,
} from './canvasConstants';

function applyNodeTransform(
  node: Konva.Node,
  element: CanvasElement,
  onChange: (patch: Partial<CanvasElement>) => void
) {
  const scaleX = node.scaleX();
  const scaleY = node.scaleY();
  node.scaleX(1);
  node.scaleY(1);

  if (element.type === 'text') {
    onChange({
      x: node.x(),
      y: node.y(),
      w: Math.max(40, node.width() * scaleX),
      props: {
        ...element.props,
        fontSize: Math.max(8, Math.round((element.props.fontSize || 24) * scaleY)),
      },
    });
    return;
  }

  if (element.type === 'shape' && element.props.shapeType === 'circle') {
    const circle = node as Konva.Circle;
    const scale = Math.max(scaleX, scaleY);
    const radius = Math.max(10, circle.radius() * scale);
    circle.radius(radius);
    onChange({
      x: circle.x() - radius,
      y: circle.y() - radius,
      w: radius * 2,
      h: radius * 2,
    });
    return;
  }

  onChange({
    x: node.x(),
    y: node.y(),
    w: Math.max(20, (node.width?.() ?? element.w) * scaleX),
    h: Math.max(20, (node.height?.() ?? element.h) * scaleY),
  });
}

function getElementLocalPosAfterDrag(element: CanvasElement, node: Konva.Node) {
  if (element.type === 'shape' && element.props.shapeType === 'circle') {
    const radius = Math.min(element.w, element.h) / 2;
    return { x: node.x() - radius, y: node.y() - radius };
  }
  return { x: node.x(), y: node.y() };
}

type ElementDragProps = {
  editable: boolean;
  onDragStart?: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onDragEnd?: (e: Konva.KonvaEventObject<DragEvent>) => void;
};

function CanvasImageElement({
  element,
  locked,
  editable,
  onSelect,
  onChange,
  onDragStart,
  onDragEnd,
}: {
  element: CanvasElement;
  locked: boolean;
  editable: boolean;
  onSelect: () => void;
  onChange: (patch: Partial<CanvasElement>) => void;
} & ElementDragProps) {
  const image = useCanvasImage(element.props.src);
  const shapeRef = useRef<Konva.Image>(null);

  return (
    <KonvaImage
      id={`element-${element.id}`}
      ref={shapeRef}
      image={image || undefined}
      x={element.x}
      y={element.y}
      width={element.w}
      height={element.h}
      draggable={editable && !locked}
      listening={editable}
      onClick={editable ? onSelect : undefined}
      onTap={editable ? onSelect : undefined}
      onDragStart={onDragStart}
      onDragEnd={
        onDragEnd ??
        ((e) => onChange({ x: e.target.x(), y: e.target.y() }))
      }
      onTransformEnd={() => {
        if (!editable) return;
        const node = shapeRef.current;
        if (!node) return;
        applyNodeTransform(node, element, onChange);
      }}
    />
  );
}

function CanvasTextElement({
  element,
  locked,
  editable,
  isEditing,
  onSelect,
  onEditStart,
  onChange,
  onDragStart,
  onDragEnd,
}: {
  element: CanvasElement;
  locked: boolean;
  editable: boolean;
  isEditing: boolean;
  onSelect: () => void;
  onEditStart: () => void;
  onChange: (patch: Partial<CanvasElement>) => void;
} & ElementDragProps) {
  const shapeRef = useRef<Konva.Text>(null);
  const displayText = element.props.text?.trim() ? element.props.text : 'Add text here...';
  const isPlaceholder = !element.props.text?.trim();

  return (
    <Text
      id={`element-${element.id}`}
      ref={shapeRef}
      x={element.x}
      y={element.y}
      width={element.w}
      height={element.h}
      text={displayText}
      fontSize={element.props.fontSize || 24}
      fill={isPlaceholder && !isEditing ? '#9CA3AF' : element.props.fill || '#111111'}
      fontFamily={normalizeFontFamily(element.props.fontFamily)}
      fontStyle={getKonvaFontStyle(element)}
      align={element.props.align || 'left'}
      textDecoration={getTextDecoration(element)}
      lineHeight={TEXT_LINE_HEIGHT}
      wrap="word"
      verticalAlign="top"
      opacity={isEditing ? 0 : 1}
      listening={editable && !isEditing}
      draggable={editable && !locked && !isEditing}
      onMouseDown={(e) => {
        e.cancelBubble = true;
      }}
      onClick={(e) => {
        e.cancelBubble = true;
        onSelect();
      }}
      onTap={(e) => {
        e.cancelBubble = true;
        onSelect();
      }}
      onDblClick={(e) => {
        e.cancelBubble = true;
        if (!locked) onEditStart();
      }}
      onDblTap={(e) => {
        e.cancelBubble = true;
        if (!locked) onEditStart();
      }}
      onDragStart={onDragStart}
      onDragEnd={
        onDragEnd ??
        ((e) => onChange({ x: e.target.x(), y: e.target.y() }))
      }
      onTransformEnd={() => {
        if (!editable) return;
        const node = shapeRef.current;
        if (!node) return;
        applyNodeTransform(node, element, onChange);
      }}
    />
  );
}

function CanvasShapeElement({
  element,
  locked,
  editable,
  onSelect,
  onChange,
  onDragStart,
  onDragEnd,
}: {
  element: CanvasElement;
  locked: boolean;
  editable: boolean;
  onSelect: () => void;
  onChange: (patch: Partial<CanvasElement>) => void;
} & ElementDragProps) {
  const rectRef = useRef<Konva.Rect>(null);
  const circleRef = useRef<Konva.Circle>(null);

  if (element.props.shapeType === 'circle') {
    const radius = Math.min(element.w, element.h) / 2;
    return (
      <Circle
        id={`element-${element.id}`}
        ref={circleRef}
        x={element.x + radius}
        y={element.y + radius}
        radius={radius}
        fill={element.props.fill || '#e5e7eb'}
        stroke={element.props.stroke || '#9ca3af'}
        strokeWidth={element.props.strokeWidth || 1}
        draggable={editable && !locked}
        listening={editable}
        onClick={editable ? onSelect : undefined}
        onTap={editable ? onSelect : undefined}
        onDragStart={onDragStart}
        onDragEnd={
          onDragEnd ??
          ((e) => {
            const r = Math.min(element.w, element.h) / 2;
            onChange({ x: e.target.x() - r, y: e.target.y() - r });
          })
        }
        onTransformEnd={() => {
          if (!editable) return;
          const node = circleRef.current;
          if (!node) return;
          applyNodeTransform(node, element, onChange);
        }}
      />
    );
  }

  return (
    <Rect
      id={`element-${element.id}`}
      ref={rectRef}
      x={element.x}
      y={element.y}
      width={element.w}
      height={element.h}
      fill={element.props.fill || '#e5e7eb'}
      stroke={element.props.stroke || '#9ca3af'}
      strokeWidth={element.props.strokeWidth || 1}
      draggable={editable && !locked}
      listening={editable}
      onClick={editable ? onSelect : undefined}
      onTap={editable ? onSelect : undefined}
      onDragStart={onDragStart}
      onDragEnd={
        onDragEnd ??
        ((e) => onChange({ x: e.target.x(), y: e.target.y() }))
      }
      onTransformEnd={() => {
        if (!editable) return;
        const node = rectRef.current;
        if (!node) return;
        applyNodeTransform(node, element, onChange);
      }}
    />
  );
}

function renderElement(
  element: CanvasElement,
  onSelect: () => void,
  onChange: (patch: Partial<CanvasElement>) => void,
  options?: {
    editable?: boolean;
    editingTextId?: string | null;
    onEditStart?: () => void;
    onDragStart?: (e: Konva.KonvaEventObject<DragEvent>) => void;
    onDragEnd?: (e: Konva.KonvaEventObject<DragEvent>) => void;
  }
) {
  const locked = !!element.locked;
  const editable = options?.editable ?? true;

  if (element.type === 'text') {
    return (
      <CanvasTextElement
        key={element.id}
        element={element}
        locked={locked}
        editable={editable}
        isEditing={options?.editingTextId === element.id}
        onSelect={onSelect}
        onEditStart={options?.onEditStart ?? (() => {})}
        onChange={onChange}
        onDragStart={options?.onDragStart}
        onDragEnd={options?.onDragEnd}
      />
    );
  }

  if (element.type === 'shape') {
    return (
      <CanvasShapeElement
        key={element.id}
        element={element}
        locked={locked}
        editable={editable}
        onSelect={onSelect}
        onChange={onChange}
        onDragStart={options?.onDragStart}
        onDragEnd={options?.onDragEnd}
      />
    );
  }

  if (element.type === 'image' || element.type === 'pdf') {
    return (
      <CanvasImageElement
        key={element.id}
        element={element}
        locked={locked}
        editable={editable}
        onSelect={onSelect}
        onChange={onChange}
        onDragStart={options?.onDragStart}
        onDragEnd={options?.onDragEnd}
      />
    );
  }

  return null;
}

type Props = {
  readOnly?: boolean;
  /** Single-slide centered layout for public share and present mode */
  viewMode?: 'editor' | 'viewer';
  onPinPlace?: (x: number, y: number) => void;
  pins?: { id: number; x: number; y: number; label: string }[];
  onAddText?: () => void;
  onUploadImage?: () => void;
  onAddImage?: () => void;
  onAddShape?: () => void;
  onApplyTheme?: (backgroundColor: string) => void;
  onDropImageFiles?: (files: File[]) => void;
  onSetImageAsBackground?: () => void;
  onDetachSlideBackground?: () => void;
};

export function PresentationCanvas({
  readOnly = false,
  viewMode = 'editor',
  onPinPlace,
  pins = [],
  onAddText,
  onUploadImage,
  onAddImage,
  onAddShape,
  onApplyTheme,
  onDropImageFiles,
  onSetImageAsBackground,
  onDetachSlideBackground,
}: Props) {
  const t = useTranslations('presentationEditor');
  const {
    slides,
    activeSlideId,
    selectedElementId,
    zoom,
    pinMode,
    setActiveSlideId,
    setSelectedElementId,
    updateSlideCanvas,
    removeElement,
    duplicateElement,
    toggleElementLock,
    bringElementForward,
    sendElementBackward,
    getSlideGuides,
    addHorizontalGuide,
    addVerticalGuide,
    moveHorizontalGuide,
    moveVerticalGuide,
    removeHorizontalGuide,
    removeVerticalGuide,
    patchElement,
    pendingTextEditId,
    clearPendingTextEdit,
    moveElementToSlide,
  } = usePresentationEditorStore();

  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 500 });
  const [pan, setPan] = useState<Pan>({ x: 0, y: 0 });
  const panRef = useRef<Pan>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const activeSlideFromScrollRef = useRef(false);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [isFileDragOver, setIsFileDragOver] = useState(false);
  const editingDraftRef = useRef<string>('');
  const editingOriginalRef = useRef<string>('');

  panRef.current = pan;

  const isViewer = viewMode === 'viewer';
  const activeSlideIndex = slides.findIndex((s) => s.id === activeSlideId);
  const activeSlide = activeSlideIndex >= 0 ? slides[activeSlideIndex] : undefined;
  const elements = activeSlide?.canvas_data || [];
  const selectedElement = elements.find((el) => el.id === selectedElementId);

  const viewerZoom = isViewer
    ? computeViewerFitZoom(containerSize.width, containerSize.height)
    : zoom;
  const effectiveZoom = isViewer ? viewerZoom : zoom;

  const layout = isViewer
    ? getViewerCanvasLayout(containerSize.width, containerSize.height, effectiveZoom)
    : getCanvasLayout(containerSize.width, containerSize.height, effectiveZoom, pan, slides.length);
  const { offsetX, offsetY } = layout;

  const renderedSlides = isViewer
    ? activeSlide
      ? [{ slide: activeSlide, slideIndex: 0, deckIndex: activeSlideIndex }]
      : []
    : slides.map((slide, slideIndex) => ({ slide, slideIndex, deckIndex: slideIndex }));

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setContainerSize({ width, height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (isViewer) return;
    if (activeSlideFromScrollRef.current) {
      activeSlideFromScrollRef.current = false;
      return;
    }
    if (activeSlideIndex < 0 || slides.length === 0) return;
    setPan(
      panForSlideIndex(
        activeSlideIndex,
        containerSize.width,
        containerSize.height,
        zoom,
        slides.length
      )
    );
  }, [isViewer, activeSlideId, activeSlideIndex, slides.length, containerSize.width, containerSize.height, zoom]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || readOnly) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const { width, height } = el.getBoundingClientRect();
      setPan((prev) => {
        const next = clampPan(
          { x: 0, y: prev.y - e.deltaY },
          width,
          height,
          zoom,
          slides.length
        );

        const idx = getActiveSlideIndex(next.y, width, height, zoom, slides.length);
        const nextSlide = slides[idx];
        if (nextSlide && nextSlide.id !== activeSlideId) {
          activeSlideFromScrollRef.current = true;
          setActiveSlideId(nextSlide.id);
          setSelectedElementId(null);
        }

        return next;
      });
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [readOnly, zoom, slides, activeSlideId, setActiveSlideId, setSelectedElementId]);

  useEffect(() => {
    setEditingTextId((current) =>
      current && current === selectedElementId ? current : null
    );
  }, [selectedElementId]);

  useEffect(() => {
    setEditingTextId(null);
    editingDraftRef.current = '';
  }, [activeSlideId]);

  useEffect(() => {
    if (!pendingTextEditId) return;
    setEditingTextId(pendingTextEditId);
    const slide = slides.find((s) => s.id === activeSlideId);
    const el = slide?.canvas_data.find((item) => item.id === pendingTextEditId);
    const initial = el?.props.text ?? '';
    editingDraftRef.current = initial;
    editingOriginalRef.current = initial;
    clearPendingTextEdit();
  }, [pendingTextEditId, slides, activeSlideId, clearPendingTextEdit]);

  const commitTextEdit = useCallback(
    (text?: string) => {
      if (!editingTextId || !activeSlideId) {
        setEditingTextId(null);
        return;
      }

      const slide = slides.find((s) => s.id === activeSlideId);
      const element = slide?.canvas_data.find((el) => el.id === editingTextId);
      if (!element || element.type !== 'text') {
        setEditingTextId(null);
        editingDraftRef.current = '';
        return;
      }

      const nextText = (text ?? editingDraftRef.current).trim();
      const nextProps = { ...element.props, text: nextText };
      const measured = measureTextBox(nextText, element.w, nextProps);

      patchElement(
        editingTextId,
        {
          props: nextProps,
          w: measured.width,
          h: measured.height,
        },
        true
      );

      setEditingTextId(null);
      editingDraftRef.current = '';
    },
    [editingTextId, activeSlideId, slides, patchElement]
  );

  useEffect(() => {
    if (!editingTextId || readOnly) return;

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-text-editor]') || target.closest('[data-text-toolbar]')) {
        return;
      }
      commitTextEdit();
    };

    window.addEventListener('pointerdown', onPointerDown, true);
    return () => window.removeEventListener('pointerdown', onPointerDown, true);
  }, [editingTextId, readOnly, commitTextEdit]);

  useEffect(() => {
    if (!transformerRef.current || !stageRef.current || readOnly) return;
    if (editingTextId) {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer()?.batchDraw();
      return;
    }
    const selectedNode = selectedElement?.locked
      ? null
      : stageRef.current.findOne(`#element-${selectedElementId}`);
    if (selectedNode) {
      transformerRef.current.nodes([selectedNode]);
    } else {
      transformerRef.current.nodes([]);
    }
    transformerRef.current.getLayer()?.batchDraw();
  }, [selectedElementId, selectedElement?.locked, elements, readOnly, activeSlideId, editingTextId]);

  useEffect(() => {
    if (readOnly || !selectedElementId) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (
        selectedElement?.type === 'text' &&
        e.key === 'Enter' &&
        !editingTextId &&
        !selectedElement.locked
      ) {
        e.preventDefault();
        setEditingTextId(selectedElementId);
        return;
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && !editingTextId) {
        e.preventDefault();
        removeElement(selectedElementId);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [readOnly, selectedElementId, selectedElement, editingTextId, removeElement]);

  const handleElementChange = useCallback(
    (slideId: number, elementId: string, patch: Partial<CanvasElement>) => {
      if (readOnly) return;
      const slide = slides.find((s) => s.id === slideId);
      if (!slide) return;
      const updated = slide.canvas_data.map((el) =>
        el.id === elementId
          ? {
              ...el,
              ...patch,
              props: patch.props ? { ...el.props, ...patch.props } : el.props,
            }
          : el
      );
      updateSlideCanvas(slide.id, updated);
    },
    [slides, readOnly, updateSlideCanvas]
  );

  const isEditable = !readOnly && !isViewer;

  const handleElementDragStart = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      if (!isEditable) return;
      const parent = e.target.getParent();
      if (parent) parent.moveToTop();
    },
    [isEditable]
  );

  const handleElementDragEnd = useCallback(
    (
      slideId: number,
      slideIndex: number,
      element: CanvasElement,
      e: Konva.KonvaEventObject<DragEvent>
    ) => {
      if (!isEditable) return;
      const { x: localX, y: localY } = getElementLocalPosAfterDrag(element, e.target);
      const deckY = getSlideYOffset(slideIndex) + localY;
      const targetIndex = getSlideIndexFromDeckY(deckY, slides.length);
      const targetSlide = slides[targetIndex];

      if (targetSlide && targetSlide.id !== slideId) {
        const newLocalY = deckY - getSlideYOffset(targetIndex);
        moveElementToSlide(element.id, slideId, targetSlide.id, localX, newLocalY);
        setActiveSlideId(targetSlide.id);
        setSelectedElementId(element.id);
        return;
      }

      handleElementChange(slideId, element.id, { x: localX, y: localY });
    },
    [
      isEditable,
      slides,
      moveElementToSlide,
      setActiveSlideId,
      setSelectedElementId,
      handleElementChange,
    ]
  );

  const handleSlideBackgroundClick = (
    slide: PresentationSlide,
    slideIndex: number,
    e: Konva.KonvaEventObject<MouseEvent | TouchEvent>
  ) => {
    e.cancelBubble = true;
    if (slide.id !== activeSlideId) {
      setActiveSlideId(slide.id);
      setSelectedElementId(null);
      return;
    }
    if (pinMode && onPinPlace) {
      const pos = e.target.getStage()?.getPointerPosition();
      if (pos) {
        const { x, y } = screenToSlideCoords(
          slideIndex,
          pos.x,
          pos.y,
          offsetX,
          offsetY,
          zoom
        );
        onPinPlace(x, y);
      }
      return;
    }
    if (editingTextId) {
      commitTextEdit();
      return;
    }
    setSelectedElementId(null);
  };

  const textEditorPos =
    editingTextId && activeSlideIndex >= 0
      ? (() => {
          const el = elements.find((item) => item.id === editingTextId);
          if (!el) return null;
          const screen = slideToScreenCoords(
            activeSlideIndex,
            el.x,
            el.y,
            offsetX,
            offsetY,
            zoom
          );
          return { element: el, left: screen.x, top: screen.y, width: el.w };
        })()
      : null;

  const textToolbarPos =
    selectedElement?.type === 'text' && activeSlideIndex >= 0
      ? (() => {
          const screen = slideToScreenCoords(
            activeSlideIndex,
            selectedElement.x,
            selectedElement.y,
            offsetX,
            offsetY,
            zoom
          );
          const toolbarWidth = 560;
          const centeredLeft = screen.x + (selectedElement.w * zoom) / 2 - toolbarWidth / 2;
          const editorOffset = editingTextId === selectedElement.id ? 0 : 0;
          return {
            left: Math.min(
              containerSize.width - toolbarWidth - 8,
              Math.max(8, centeredLeft)
            ),
            top: Math.max(
              RULER_HEIGHT + 4,
              screen.y - (editingTextId === selectedElement.id ? 56 : 52) + editorOffset
            ),
          };
        })()
      : null;

  const toolbarPos = selectedElement && activeSlideIndex >= 0 && selectedElement.type !== 'text'
    ? (() => {
        const screen = slideToScreenCoords(
          activeSlideIndex,
          selectedElement.x + selectedElement.w,
          selectedElement.y,
          offsetX,
          offsetY,
          zoom
        );
        return {
          left: Math.min(containerSize.width - 160, Math.max(8, screen.x - 140)),
          top: Math.max(40, screen.y - 44),
        };
      })()
    : null;

  const patchTextProps = useCallback(
    (props: Partial<CanvasElement['props']>, pushHistory = true) => {
      if (!selectedElement || selectedElement.type !== 'text') return;
      const nextProps = { ...selectedElement.props, ...props };
      const text = nextProps.text ?? '';
      const measured = measureTextBox(text, selectedElement.w, nextProps);
      patchElement(
        selectedElement.id,
        { props: nextProps, h: measured.height },
        pushHistory
      );
    },
    [selectedElement, patchElement]
  );

  const hasSlideBackground = !!(
    activeSlide?.background_image_url?.trim() || activeSlide?.background_src?.trim()
  );
  const isEmpty = elements.length === 0 && pins.length === 0 && !hasSlideBackground;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden transition-colors ${isViewer ? 'h-full w-full' : 'flex-1'}`}
      style={{ backgroundColor: isViewer ? '#F1F3F5' : WORKSPACE_BG }}
      onDragOver={(e) => {
        if (readOnly || !onDropImageFiles) return;
        if (!e.dataTransfer.types.includes('Files')) return;
        e.preventDefault();
        setIsFileDragOver(true);
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) setIsFileDragOver(false);
      }}
      onDrop={(e) => {
        if (readOnly || !onDropImageFiles) return;
        e.preventDefault();
        setIsFileDragOver(false);
        const files = Array.from(e.dataTransfer.files).filter((f) =>
          f.type.startsWith('image/')
        );
        if (files.length > 0) onDropImageFiles(files);
      }}
    >
      {isFileDragOver && !readOnly && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-primary/10 backdrop-blur-[1px] pointer-events-none">
          <div className="rounded-xl border-2 border-dashed border-primary bg-background/90 px-6 py-4 text-sm font-medium text-primary shadow-lg">
            {t('emptyState.dropActive')}
          </div>
        </div>
      )}
      {!isViewer && (
        <CanvasRulers
          containerWidth={containerSize.width}
          containerHeight={containerSize.height}
          offsetX={offsetX}
          offsetY={offsetY}
          zoom={effectiveZoom}
          slideCount={slides.length}
        />
      )}

      {!readOnly && !isViewer && activeSlide && activeSlideIndex >= 0 && (
        <RulerGuideInteraction
          containerWidth={containerSize.width}
          containerHeight={containerSize.height}
          offsetX={offsetX}
          offsetY={offsetY}
          zoom={zoom}
          activeSlideIndex={activeSlideIndex}
          onAddHorizontalGuide={(y) => addHorizontalGuide(activeSlide.id, y)}
          onAddVerticalGuide={(x) => addVerticalGuide(activeSlide.id, x)}
        />
      )}

      <div className="absolute inset-0 z-[5]">
      <Stage
        ref={stageRef}
        width={containerSize.width}
        height={containerSize.height}
        scaleX={effectiveZoom}
        scaleY={effectiveZoom}
        x={offsetX}
        y={offsetY}
      >
        <Layer>
          {renderedSlides.map(({ slide, slideIndex, deckIndex }) => {
            const isActive = slide.id === activeSlideId;
            const slideElements = Array.isArray(slide.canvas_data) ? slide.canvas_data : [];
            const slidePins = isActive ? pins : [];
            const slideY = isViewer ? 0 : getSlideYOffset(deckIndex);

            return (
              <Group key={slide.id} y={slideY}>
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
                  listening={!readOnly}
                  onClick={(e) => handleSlideBackgroundClick(slide, slideIndex, e)}
                  onTap={(e) => handleSlideBackgroundClick(slide, slideIndex, e)}
                />
                <SlideBackgroundLayer
                  backgroundColor={slide.background_color || '#FFFFFF'}
                  backgroundImageUrl={slide.background_image_url}
                />
                {isActive && !readOnly && !isViewer && (
                  <Rect
                    x={-1}
                    y={-1}
                    width={SLIDE_WIDTH + 2}
                    height={SLIDE_HEIGHT + 2}
                    stroke={SLIDE_ACTIVE_STROKE}
                    strokeWidth={2}
                    listening={false}
                    opacity={SLIDE_ACTIVE_STROKE_OPACITY}
                  />
                )}
                {slideElements
                  .sort((a, b) => a.z - b.z)
                  .map((el) =>
                    renderElement(
                      el,
                      () => {
                        if (!isEditable) return;
                        if (!isActive) {
                          setActiveSlideId(slide.id);
                        }
                        setSelectedElementId(el.id);
                      },
                      (patch) => handleElementChange(slide.id, el.id, patch),
                      {
                        editable: isEditable,
                        editingTextId,
                        onDragStart: handleElementDragStart,
                        onDragEnd: (e) => handleElementDragEnd(slide.id, deckIndex, el, e),
                        onEditStart:
                          el.type === 'text' && isEditable && !el.locked
                            ? () => {
                                setSelectedElementId(el.id);
                                const initial = el.props.text ?? '';
                                editingDraftRef.current = initial;
                                editingOriginalRef.current = initial;
                                setEditingTextId(el.id);
                              }
                            : undefined,
                      }
                    )
                  )}
                {isActive && !readOnly && !isViewer && (
                  <SlideGuides
                    guides={getSlideGuides(slide.id)}
                    onMoveHorizontal={(index, y) => moveHorizontalGuide(slide.id, index, y)}
                    onMoveVertical={(index, x) => moveVerticalGuide(slide.id, index, x)}
                    onRemoveHorizontal={(index) => removeHorizontalGuide(slide.id, index)}
                    onRemoveVertical={(index) => removeVerticalGuide(slide.id, index)}
                  />
                )}
                {slidePins.map((pin) => (
                  <Circle
                    key={`pin-${pin.id}`}
                    x={pin.x}
                    y={pin.y}
                    radius={8}
                    fill={SLIDE_PIN_FILL}
                    stroke="#fff"
                    strokeWidth={2}
                  />
                ))}
              </Group>
            );
          })}
          {!readOnly && (
            <Transformer
              ref={transformerRef}
              rotateEnabled={false}
              enabledAnchors={
                selectedElement?.locked
                  ? []
                  : selectedElement?.type === 'text'
                    ? ['middle-left', 'middle-right', 'top-left', 'top-right', 'bottom-left', 'bottom-right']
                    : ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'middle-left', 'middle-right', 'top-center', 'bottom-center']
              }
              boundBoxFunc={(oldBox, newBox) => {
                if (newBox.width < 20 || newBox.height < 20) return oldBox;
                return newBox;
              }}
            />
          )}
        </Layer>
      </Stage>
      </div>

      {!readOnly && selectedElement?.type === 'text' && textToolbarPos && (
        <TextElementToolbar
          left={textToolbarPos.left}
          top={textToolbarPos.top}
          element={selectedElement}
          locked={!!selectedElement.locked}
          isEditing={editingTextId === selectedElement.id}
          onPatch={patchTextProps}
          onToggleLock={() => toggleElementLock(selectedElement.id)}
          onDelete={() => {
            if (editingTextId === selectedElement.id) {
              setEditingTextId(null);
              editingDraftRef.current = '';
            }
            removeElement(selectedElement.id);
          }}
        />
      )}

      {!readOnly && selectedElement && selectedElement.type !== 'text' && toolbarPos && (
        <ElementContextToolbar
          left={toolbarPos.left}
          top={toolbarPos.top}
          locked={!!selectedElement.locked}
          isImage={selectedElement.type === 'image' || selectedElement.type === 'pdf'}
          hasSlideBackground={!!activeSlide?.background_image_url}
          onDeselect={() => setSelectedElementId(null)}
          onToggleLock={() => toggleElementLock(selectedElement.id)}
          onDelete={() => removeElement(selectedElement.id)}
          onDuplicate={() => duplicateElement(selectedElement.id)}
          onBringForward={() => bringElementForward(selectedElement.id)}
          onSendBackward={() => sendElementBackward(selectedElement.id)}
          onSetAsBackground={onSetImageAsBackground}
          onDetachBackground={onDetachSlideBackground}
        />
      )}

      {!readOnly && textEditorPos && (
        <TextElementEditor
          element={textEditorPos.element}
          left={textEditorPos.left}
          top={textEditorPos.top}
          width={textEditorPos.width}
          zoom={zoom}
          onDraftChange={(text) => {
            editingDraftRef.current = text;
            const measured = measureTextBox(
              text,
              textEditorPos.element.w,
              { ...textEditorPos.element.props, text }
            );
            patchElement(
              textEditorPos.element.id,
              { props: { text }, h: measured.height },
              false
            );
          }}
          onCommit={(text) => commitTextEdit(text)}
          onCancel={() => {
            const original = editingOriginalRef.current;
            const measured = measureTextBox(
              original,
              textEditorPos.element.w,
              { ...textEditorPos.element.props, text: original }
            );
            patchElement(
              textEditorPos.element.id,
              { props: { text: original }, w: measured.width, h: measured.height },
              false
            );
            setEditingTextId(null);
            editingDraftRef.current = '';
          }}
        />
      )}

      {isEmpty && !readOnly && !isViewer && activeSlideIndex >= 0 && onAddText && onUploadImage && onAddImage && onAddShape && onApplyTheme && (
        <div
          className="absolute z-10"
          style={{
            left: offsetX,
            top: offsetY + getSlideYOffset(activeSlideIndex) * zoom,
            width: SLIDE_WIDTH * zoom,
            height: SLIDE_HEIGHT * zoom,
          }}
        >
          <CanvasEmptyState
            onAddText={onAddText}
            onUploadImage={onUploadImage}
            onAddImage={onAddImage}
            onAddShape={onAddShape}
            onApplyTheme={onApplyTheme}
          />
        </div>
      )}
    </div>
  );
}
