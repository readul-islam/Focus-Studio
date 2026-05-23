'use client';

import { useEffect, useRef, useState } from 'react';
import { Plus, Trash2, Loader2, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DesignSession } from '@/hooks/useDesignSessions';

type Props = {
  sessions: DesignSession[];
  activeId: number | null;
  isLoading: boolean;
  onSelect: (id: number) => void;
  onNew: () => void;
  onDelete?: (id: number) => void;
  onRename?: (id: number, title: string) => void | Promise<void>;
  isCreating?: boolean;
  isRenaming?: boolean;
};

function SessionRow({
  session,
  isActive,
  canRename,
  canDelete,
  onSelect,
  onDelete,
  onRename,
  isRenaming,
}: {
  session: DesignSession;
  isActive: boolean;
  canRename: boolean;
  canDelete: boolean;
  onSelect: () => void;
  onDelete?: () => void;
  onRename?: (title: string) => void | Promise<void>;
  isRenaming?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(session.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) setDraft(session.title);
  }, [session.title, editing]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const startEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canRename) return;
    setDraft(session.title);
    setEditing(true);
  };

  const cancelEdit = () => {
    setDraft(session.title);
    setEditing(false);
  };

  const saveEdit = async () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      cancelEdit();
      return;
    }
    if (trimmed === session.title) {
      setEditing(false);
      return;
    }
    await onRename?.(trimmed);
    setEditing(false);
  };

  return (
    <div
      className={cn(
        'group flex items-center gap-0.5 rounded-lg transition-colors',
        isActive ? 'bg-stone-100' : 'hover:bg-stone-50'
      )}
    >
      {editing ? (
        <div className="flex-1 px-2 py-2 min-w-0" onClick={e => e.stopPropagation()}>
          <input
            ref={inputRef}
            type="text"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                void saveEdit();
              }
              if (e.key === 'Escape') {
                e.preventDefault();
                cancelEdit();
              }
            }}
            onBlur={() => void saveEdit()}
            disabled={isRenaming}
            maxLength={255}
            className="w-full text-sm font-medium text-gray-900 border border-stone-200 rounded-md px-2 py-1 outline-none focus:ring-2 focus:ring-sage-500/30"
            aria-label="Session name"
          />
          <p className="text-[11px] text-gray-400 capitalize mt-1 px-0.5">
            {session.design_type} · {session.message_count} messages
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={onSelect}
          onDoubleClick={canRename ? startEdit : undefined}
          className="flex-1 text-left px-3 py-2.5 min-w-0"
          title={canRename ? 'Double-click to rename' : undefined}
        >
          <p className="text-sm font-medium text-gray-900 truncate">{session.title}</p>
          <p className="text-[11px] text-gray-400 capitalize">
            {session.design_type} · {session.message_count} messages
          </p>
        </button>
      )}
      {!editing && canRename && (
        <button
          type="button"
          onClick={startEdit}
          className="p-1.5 rounded opacity-0 group-hover:opacity-100 text-gray-400 hover:text-sage-700 hover:bg-stone-100 transition-all"
          title="Rename"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      )}
      {!editing && canDelete && onDelete && (
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1.5 mr-1 rounded opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
          title="Delete session"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

export function DesignSessionList({
  sessions,
  activeId,
  isLoading,
  onSelect,
  onNew,
  onDelete,
  onRename,
  isCreating,
  isRenaming,
}: Props) {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-3 border-b border-stone-200">
        <button
          type="button"
          onClick={onNew}
          disabled={isCreating}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          New design
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {isLoading && (
          <p className="text-xs text-gray-400 px-2 py-4 text-center">Loading sessions…</p>
        )}
        {!isLoading && sessions.length === 0 && (
          <p className="text-xs text-gray-400 px-2 py-4 text-center">No designs yet. Start a new one.</p>
        )}
        {sessions.map(s => (
          <SessionRow
            key={s.id}
            session={s}
            isActive={activeId === s.id}
            canRename={!!onRename}
            canDelete={!!onDelete}
            onSelect={() => onSelect(s.id)}
            onDelete={onDelete ? () => onDelete(s.id) : undefined}
            onRename={onRename ? title => onRename(s.id, title) : undefined}
            isRenaming={isRenaming}
          />
        ))}
      </div>
    </div>
  );
}
