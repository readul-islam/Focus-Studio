'use client';

import { create } from 'zustand';
import type { CanvasElement, PresentationSlide } from '@/components/presentations/types';
import {
  EMPTY_GUIDES,
  type SlideGuides,
  clampHorizontalGuide,
  clampVerticalGuide,
} from '@/components/presentations/editor/canvasGuides';
import { SLIDE_HEIGHT, SLIDE_WIDTH } from '@/components/presentations/types';

type HistoryEntry = {
  slideId: number;
  canvas_data: CanvasElement[];
};

type EditorState = {
  slides: PresentationSlide[];
  activeSlideId: number | null;
  selectedElementId: string | null;
  zoom: number;
  history: HistoryEntry[];
  redoStack: HistoryEntry[];
  isDirty: boolean;
  pinsPanelOpen: boolean;
  pinMode: boolean;
  slideGuides: Record<number, SlideGuides>;
  pendingTextEditId: string | null;
  setSlides: (slides: PresentationSlide[]) => void;
  setActiveSlideId: (id: number | null) => void;
  setSelectedElementId: (id: string | null) => void;
  setZoom: (zoom: number) => void;
  setPinsPanelOpen: (open: boolean) => void;
  setPinMode: (mode: boolean) => void;
  updateSlideCanvas: (slideId: number, canvas_data: CanvasElement[], pushHistory?: boolean) => void;
  updateSlideMeta: (slideId: number, patch: Partial<PresentationSlide>) => void;
  patchElement: (
    elementId: string,
    patch: Partial<CanvasElement>,
    pushHistory?: boolean
  ) => void;
  requestTextEdit: (elementId: string) => void;
  clearPendingTextEdit: () => void;
  removeElement: (elementId: string) => void;
  duplicateElement: (elementId: string) => void;
  toggleElementLock: (elementId: string) => void;
  bringElementForward: (elementId: string) => void;
  sendElementBackward: (elementId: string) => void;
  moveElementToSlide: (
    elementId: string,
    fromSlideId: number,
    toSlideId: number,
    x: number,
    y: number
  ) => void;
  getSlideGuides: (slideId: number) => SlideGuides;
  addHorizontalGuide: (slideId: number, y: number) => void;
  addVerticalGuide: (slideId: number, x: number) => void;
  moveHorizontalGuide: (slideId: number, index: number, y: number) => void;
  moveVerticalGuide: (slideId: number, index: number, x: number) => void;
  removeHorizontalGuide: (slideId: number, index: number) => void;
  removeVerticalGuide: (slideId: number, index: number) => void;
  undo: () => void;
  redo: () => void;
  setDirty: (dirty: boolean) => void;
  reset: () => void;
};

const PRESENTATION_EDITOR_ZOOM_KEY = 'presentation_editor_zoom';
const DEFAULT_ZOOM = 0.72;

function clampZoom(zoom: number) {
  return Math.min(2, Math.max(0.25, zoom));
}

function readStoredZoom(): number {
  if (typeof window === 'undefined') return DEFAULT_ZOOM;
  try {
    const raw = localStorage.getItem(PRESENTATION_EDITOR_ZOOM_KEY);
    if (!raw) return DEFAULT_ZOOM;
    const value = Number(raw);
    if (!Number.isFinite(value)) return DEFAULT_ZOOM;
    return clampZoom(value);
  } catch {
    return DEFAULT_ZOOM;
  }
}

function persistZoom(zoom: number) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PRESENTATION_EDITOR_ZOOM_KEY, String(clampZoom(zoom)));
  } catch {
    // ignore storage errors
  }
}

const initialState = {
  slides: [] as PresentationSlide[],
  activeSlideId: null as number | null,
  selectedElementId: null as string | null,
  zoom: DEFAULT_ZOOM,
  history: [] as HistoryEntry[],
  redoStack: [] as HistoryEntry[],
  isDirty: false,
  pinsPanelOpen: false,
  pinMode: false,
  slideGuides: {} as Record<number, SlideGuides>,
  pendingTextEditId: null as string | null,
};

export const usePresentationEditorStore = create<EditorState>((set, get) => ({
  ...initialState,
  zoom: readStoredZoom(),

  setSlides: (slides) => {
    const activeSlideId = get().activeSlideId;
    const firstId = slides[0]?.id ?? null;
    set({
      slides,
      activeSlideId: activeSlideId && slides.some((s) => s.id === activeSlideId)
        ? activeSlideId
        : firstId,
    });
  },

  setActiveSlideId: (id) => set({ activeSlideId: id, selectedElementId: null }),
  setSelectedElementId: (id) => set({ selectedElementId: id }),
  setZoom: (zoom) => {
    const next = clampZoom(zoom);
    persistZoom(next);
    set({ zoom: next });
  },
  setPinsPanelOpen: (open) => set({ pinsPanelOpen: open }),
  setPinMode: (mode) => set({ pinMode: mode }),
  setDirty: (dirty) => set({ isDirty: dirty }),

  updateSlideCanvas: (slideId, canvas_data, pushHistory = true) => {
    const { slides, history } = get();
    const slide = slides.find((s) => s.id === slideId);
    if (!slide) return;

    let newHistory = history;
    if (pushHistory) {
      const entry: HistoryEntry = { slideId, canvas_data: [...slide.canvas_data] };
      newHistory = [...history, entry].slice(-50);
    }

    set({
      slides: slides.map((s) =>
        s.id === slideId ? { ...s, canvas_data } : s
      ),
      history: newHistory,
      redoStack: pushHistory ? [] : get().redoStack,
      isDirty: true,
    });
  },

  updateSlideMeta: (slideId, patch) => {
    set({
      slides: get().slides.map((s) =>
        s.id === slideId ? { ...s, ...patch } : s
      ),
      isDirty: true,
    });
  },

  patchElement: (elementId, patch, pushHistory = false) => {
    const { slides, activeSlideId } = get();
    if (!activeSlideId) return;
    const slide = slides.find((s) => s.id === activeSlideId);
    if (!slide) return;
    get().updateSlideCanvas(
      activeSlideId,
      slide.canvas_data.map((el) =>
        el.id === elementId
          ? {
              ...el,
              ...patch,
              props: patch.props ? { ...el.props, ...patch.props } : el.props,
            }
          : el
      ),
      pushHistory
    );
  },

  requestTextEdit: (elementId) => {
    set({ pendingTextEditId: elementId, selectedElementId: elementId });
  },

  clearPendingTextEdit: () => set({ pendingTextEditId: null }),

  removeElement: (elementId) => {
    const { slides, activeSlideId, selectedElementId } = get();
    if (!activeSlideId) return;
    const slide = slides.find((s) => s.id === activeSlideId);
    if (!slide) return;
    get().updateSlideCanvas(
      activeSlideId,
      slide.canvas_data.filter((el) => el.id !== elementId)
    );
    if (selectedElementId === elementId) {
      set({ selectedElementId: null });
    }
  },

  duplicateElement: (elementId) => {
    const { slides, activeSlideId } = get();
    if (!activeSlideId) return;
    const slide = slides.find((s) => s.id === activeSlideId);
    if (!slide) return;
    const source = slide.canvas_data.find((el) => el.id === elementId);
    if (!source) return;
    const maxZ = slide.canvas_data.reduce((m, el) => Math.max(m, el.z), 0);
    const copy: CanvasElement = {
      ...source,
      id: `el-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      x: source.x + 24,
      y: source.y + 24,
      z: maxZ + 1,
      locked: false,
      props: { ...source.props },
    };
    get().updateSlideCanvas(activeSlideId, [...slide.canvas_data, copy]);
    set({ selectedElementId: copy.id });
  },

  toggleElementLock: (elementId) => {
    const { slides, activeSlideId } = get();
    if (!activeSlideId) return;
    const slide = slides.find((s) => s.id === activeSlideId);
    if (!slide) return;
    get().updateSlideCanvas(
      activeSlideId,
      slide.canvas_data.map((el) =>
        el.id === elementId ? { ...el, locked: !el.locked } : el
      )
    );
  },

  bringElementForward: (elementId) => {
    const { slides, activeSlideId } = get();
    if (!activeSlideId) return;
    const slide = slides.find((s) => s.id === activeSlideId);
    if (!slide) return;
    const sorted = [...slide.canvas_data].sort((a, b) => a.z - b.z);
    const index = sorted.findIndex((el) => el.id === elementId);
    if (index < 0 || index >= sorted.length - 1) return;
    const next = sorted[index + 1];
    const current = sorted[index];
    const updated = slide.canvas_data.map((el) => {
      if (el.id === current.id) return { ...el, z: next.z };
      if (el.id === next.id) return { ...el, z: current.z };
      return el;
    });
    get().updateSlideCanvas(activeSlideId, updated);
  },

  getSlideGuides: (slideId) => get().slideGuides[slideId] ?? EMPTY_GUIDES,

  addHorizontalGuide: (slideId, y) => {
    const guides = get().getSlideGuides(slideId);
    const nextY = clampHorizontalGuide(y, SLIDE_HEIGHT);
    if (guides.horizontal.includes(nextY)) return;
    set({
      slideGuides: {
        ...get().slideGuides,
        [slideId]: {
          ...guides,
          horizontal: [...guides.horizontal, nextY].sort((a, b) => a - b),
        },
      },
    });
  },

  addVerticalGuide: (slideId, x) => {
    const guides = get().getSlideGuides(slideId);
    const nextX = clampVerticalGuide(x, SLIDE_WIDTH);
    if (guides.vertical.includes(nextX)) return;
    set({
      slideGuides: {
        ...get().slideGuides,
        [slideId]: {
          ...guides,
          vertical: [...guides.vertical, nextX].sort((a, b) => a - b),
        },
      },
    });
  },

  moveHorizontalGuide: (slideId, index, y) => {
    const guides = get().getSlideGuides(slideId);
    if (index < 0 || index >= guides.horizontal.length) return;
    const nextY = clampHorizontalGuide(y, SLIDE_HEIGHT);
    const horizontal = [...guides.horizontal];
    horizontal[index] = nextY;
    set({
      slideGuides: {
        ...get().slideGuides,
        [slideId]: { ...guides, horizontal: horizontal.sort((a, b) => a - b) },
      },
    });
  },

  moveVerticalGuide: (slideId, index, x) => {
    const guides = get().getSlideGuides(slideId);
    if (index < 0 || index >= guides.vertical.length) return;
    const nextX = clampVerticalGuide(x, SLIDE_WIDTH);
    const vertical = [...guides.vertical];
    vertical[index] = nextX;
    set({
      slideGuides: {
        ...get().slideGuides,
        [slideId]: { ...guides, vertical: vertical.sort((a, b) => a - b) },
      },
    });
  },

  removeHorizontalGuide: (slideId, index) => {
    const guides = get().getSlideGuides(slideId);
    if (index < 0 || index >= guides.horizontal.length) return;
    set({
      slideGuides: {
        ...get().slideGuides,
        [slideId]: {
          ...guides,
          horizontal: guides.horizontal.filter((_, i) => i !== index),
        },
      },
    });
  },

  removeVerticalGuide: (slideId, index) => {
    const guides = get().getSlideGuides(slideId);
    if (index < 0 || index >= guides.vertical.length) return;
    set({
      slideGuides: {
        ...get().slideGuides,
        [slideId]: {
          ...guides,
          vertical: guides.vertical.filter((_, i) => i !== index),
        },
      },
    });
  },

  moveElementToSlide: (elementId, fromSlideId, toSlideId, x, y) => {
    const { slides, history } = get();
    const fromSlide = slides.find((s) => s.id === fromSlideId);
    const toSlide = slides.find((s) => s.id === toSlideId);
    if (!fromSlide || !toSlide) return;
    const element = fromSlide.canvas_data.find((el) => el.id === elementId);
    if (!element) return;

    const maxZ = toSlide.canvas_data.reduce((m, el) => Math.max(m, el.z), 0);
    const moved: CanvasElement = {
      ...element,
      x,
      y,
      z: maxZ + 1,
      props: { ...element.props },
    };

    set({
      slides: slides.map((s) => {
        if (s.id === fromSlideId) {
          return { ...s, canvas_data: s.canvas_data.filter((el) => el.id !== elementId) };
        }
        if (s.id === toSlideId) {
          return { ...s, canvas_data: [...s.canvas_data, moved] };
        }
        return s;
      }),
      history: [
        ...history,
        { slideId: fromSlideId, canvas_data: [...fromSlide.canvas_data] },
        { slideId: toSlideId, canvas_data: [...toSlide.canvas_data] },
      ].slice(-50),
      redoStack: [],
      isDirty: true,
    });
  },

  sendElementBackward: (elementId) => {
    const { slides, activeSlideId } = get();
    if (!activeSlideId) return;
    const slide = slides.find((s) => s.id === activeSlideId);
    if (!slide) return;
    const sorted = [...slide.canvas_data].sort((a, b) => a.z - b.z);
    const index = sorted.findIndex((el) => el.id === elementId);
    if (index <= 0) return;
    const prev = sorted[index - 1];
    const current = sorted[index];
    const updated = slide.canvas_data.map((el) => {
      if (el.id === current.id) return { ...el, z: prev.z };
      if (el.id === prev.id) return { ...el, z: current.z };
      return el;
    });
    get().updateSlideCanvas(activeSlideId, updated);
  },

  undo: () => {
    const { history, slides, redoStack } = get();
    if (history.length === 0) return;
    const entry = history[history.length - 1];
    const slide = slides.find((s) => s.id === entry.slideId);
    if (!slide) return;
    const redoEntry: HistoryEntry = {
      slideId: entry.slideId,
      canvas_data: [...slide.canvas_data],
    };
    set({
      slides: slides.map((s) =>
        s.id === entry.slideId ? { ...s, canvas_data: entry.canvas_data } : s
      ),
      history: history.slice(0, -1),
      redoStack: [...redoStack, redoEntry],
      isDirty: true,
    });
  },

  redo: () => {
    const { redoStack, slides, history } = get();
    if (redoStack.length === 0) return;
    const entry = redoStack[redoStack.length - 1];
    const slide = slides.find((s) => s.id === entry.slideId);
    if (!slide) return;
    const undoEntry: HistoryEntry = {
      slideId: entry.slideId,
      canvas_data: [...slide.canvas_data],
    };
    set({
      slides: slides.map((s) =>
        s.id === entry.slideId ? { ...s, canvas_data: entry.canvas_data } : s
      ),
      redoStack: redoStack.slice(0, -1),
      history: [...history, undoEntry],
      isDirty: true,
    });
  },

  reset: () => set({ ...initialState, zoom: readStoredZoom() }),
}));
