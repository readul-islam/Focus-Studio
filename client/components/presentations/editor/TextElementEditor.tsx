'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CanvasElement } from '../types';
import { getEditorStyles, TEXT_LINE_HEIGHT, TEXT_MIN_WIDTH } from './textElementStyles';

type Props = {
  element: CanvasElement;
  left: number;
  top: number;
  width: number;
  zoom: number;
  onDraftChange: (text: string) => void;
  onCommit: (text: string) => void;
  onCancel: () => void;
};

export function TextElementEditor({
  element,
  left,
  top,
  width,
  zoom,
  onDraftChange,
  onCommit,
  onCancel,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [draft, setDraft] = useState(element.props.text ?? '');
  const props = element.props;
  const fontSize = (props.fontSize || 24) * zoom;

  const resize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = '0px';
    el.style.height = `${Math.max(fontSize * TEXT_LINE_HEIGHT, el.scrollHeight)}px`;
  }, [fontSize]);

  useLayoutEffect(() => {
    resize();
  }, [draft, props.fontSize, props.fontFamily, props.bold, props.italic, props.align, resize]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.focus();
    const len = el.value.length;
    el.setSelectionRange(len, len);
  }, []);

  useEffect(() => {
    setDraft(element.props.text ?? '');
  }, [element.id]);

  const handleChange = (value: string) => {
    setDraft(value);
    onDraftChange(value);
    resize();
  };

  return (
    <textarea
      ref={textareaRef}
      data-text-editor=""
      className="absolute z-40 resize-none overflow-hidden rounded-[2px] bg-white p-0 m-0 shadow-none pointer-events-auto caret-foreground"
      value={draft}
      placeholder="Add text here..."
      spellCheck
      onChange={(e) => handleChange(e.target.value)}
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === 'Escape') {
          e.preventDefault();
          onCancel();
        }
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          onCommit(draft);
        }
      }}
      style={{
        left,
        top,
        width: Math.max(TEXT_MIN_WIDTH, width * zoom),
        minHeight: fontSize * TEXT_LINE_HEIGHT,
        border: '2px solid hsl(var(--primary))',
        outline: 'none',
        padding: 0,
        margin: 0,
        ...getEditorStyles(element, zoom),
      }}
    />
  );
}
