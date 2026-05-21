'use client';

import { Plus, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DesignSession } from '@/hooks/useDesignSessions';

type Props = {
  sessions: DesignSession[];
  activeId: number | null;
  isLoading: boolean;
  onSelect: (id: number) => void;
  onNew: () => void;
  onDelete?: (id: number) => void;
  isCreating?: boolean;
};

export function DesignSessionList({
  sessions,
  activeId,
  isLoading,
  onSelect,
  onNew,
  onDelete,
  isCreating,
}: Props) {
  return (
    <div className="flex flex-col h-full border-r border-gray-200 bg-white">
      <div className="p-3 border-b border-gray-100">
        <button
          type="button"
          onClick={onNew}
          disabled={isCreating}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#748971] text-white text-sm font-medium hover:bg-[#5f7560] transition-colors disabled:opacity-50"
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
          <div
            key={s.id}
            className={cn(
              'group flex items-center gap-1 rounded-lg transition-colors',
              activeId === s.id ? 'bg-[#748971]/10' : 'hover:bg-gray-50'
            )}
          >
            <button
              type="button"
              onClick={() => onSelect(s.id)}
              className="flex-1 text-left px-3 py-2.5 min-w-0"
            >
              <p className="text-sm font-medium text-gray-900 truncate">{s.title}</p>
              <p className="text-[11px] text-gray-400 capitalize">
                {s.design_type} · {s.message_count} messages
              </p>
            </button>
            {onDelete && (
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  onDelete(s.id);
                }}
                className="p-1.5 mr-1 rounded opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                title="Delete session"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
