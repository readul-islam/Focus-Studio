'use client';

import { useState, useEffect, useCallback } from 'react';
import { PermissionGuard } from '@/components/PermissionGuard';
import { DesignSessionList } from '@/components/design/DesignSessionList';
import { DesignChatPanel } from '@/components/design/DesignChatPanel';
import { Design3DChatPanel } from '@/components/design/Design3DChatPanel';
import { useDesignSessions } from '@/hooks/useDesignSessions';
import { usePermissions } from '@/hooks/usePermissions';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Palette, Box, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { gooeyToast as toast } from 'goey-toast';

type DesignMode = '2d' | '3d';

function DesignPageContent() {
  const [mode, setMode] = useState<DesignMode>('2d');
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [designType, setDesignType] = useState<'interior' | 'exterior'>('interior');
  const [mobileSessionsOpen, setMobileSessionsOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { can } = usePermissions();
  const canEdit = can('design.edit');

  const { sessionsQuery, createSession, deleteSession, renameSession } = useDesignSessions();
  const sessions = Array.isArray(sessionsQuery.data) ? sessionsQuery.data : [];

  useEffect(() => {
    if (!activeSessionId && sessions.length > 0) {
      setActiveSessionId(sessions[0].id);
      setDesignType(sessions[0].design_type);
    }
  }, [sessions, activeSessionId]);

  const handleNewSession = useCallback(() => {
    createSession.mutate(
      { title: 'New design', design_type: designType },
      {
        onSuccess: (data: { id: number; design_type?: 'interior' | 'exterior' }) => {
          setActiveSessionId(data.id);
          if (data.design_type) setDesignType(data.design_type);
          setMobileSessionsOpen(false);
        },
        onError: () => toast.error('Could not create design session'),
      }
    );
  }, [createSession, designType]);

  const handleSelectSession = (id: number) => {
    setActiveSessionId(id);
    const s = sessions.find(x => x.id === id);
    if (s) setDesignType(s.design_type);
    setMobileSessionsOpen(false);
  };

  const handleDeleteSession = (id: number) => {
    deleteSession.mutate(id, {
      onSuccess: () => {
        if (activeSessionId === id) {
          const remaining = sessions.filter(s => s.id !== id);
          setActiveSessionId(remaining[0]?.id ?? null);
        }
        toast.success('Design session deleted');
      },
      onError: () => toast.error('Failed to delete session'),
    });
  };

  const handleRenameSession = (id: number, title: string) => {
    renameSession.mutate(
      { id, title },
      {
        onError: () => toast.error('Failed to rename session'),
      }
    );
  };

  return (
    <div className="flex flex-col h-[calc(100svh-3.5rem)] min-h-0 bg-stone-50">
      <div className="shrink-0 px-4 sm:px-6 pt-4 sm:pt-6 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center">
              <Palette className="w-5 h-5 text-sage-700" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Design</h1>
              <p className="text-sm text-gray-500">
                AI-assisted interior and exterior design from sketches
              </p>
            </div>
          </div>
          <div className="flex rounded-lg border border-stone-200 p-1 bg-stone-100 self-start">
            <button
              type="button"
              onClick={() => setMode('2d')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                mode === '2d'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <Sparkles className="w-4 h-4" />
              2D Design
            </button>
            <button
              type="button"
              onClick={() => setMode('3d')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                mode === '3d'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <Box className="w-4 h-4" />
              3D Design
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex min-h-0 overflow-hidden px-4 sm:px-6 pb-4 sm:pb-6 gap-4">
        {isMobile ? (
          <>
            {mobileSessionsOpen && (
              <div
                className="fixed inset-0 z-40 bg-black/40"
                onClick={() => setMobileSessionsOpen(false)}
                aria-hidden
              />
            )}
            <div
              className={cn(
                'fixed inset-y-0 left-0 z-50 w-[280px] shadow-xl transition-transform pt-14 rounded-r-xl overflow-hidden border border-stone-200',
                mobileSessionsOpen ? 'translate-x-0' : '-translate-x-full'
              )}
            >
              <DesignSessionList
                sessions={sessions}
                activeId={activeSessionId}
                isLoading={sessionsQuery.isLoading}
                onSelect={handleSelectSession}
                onNew={handleNewSession}
                onDelete={canEdit ? handleDeleteSession : undefined}
                onRename={canEdit ? handleRenameSession : undefined}
                isCreating={createSession.isPending}
                isRenaming={renameSession.isPending}
              />
            </div>
            {!activeSessionId ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-white border border-stone-200 rounded-xl shadow-sm">
                <p className="text-gray-500 mb-4">Select or create a design session</p>
                <button
                  type="button"
                  onClick={() => setMobileSessionsOpen(true)}
                  className="text-sm text-sage-700 font-medium underline hover:text-sage-700/80"
                >
                  Open sessions
                </button>
                <button
                  type="button"
                  onClick={handleNewSession}
                  className="mt-4 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800"
                >
                  New design
                </button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col min-w-0 bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
                <button
                  type="button"
                  onClick={() => setMobileSessionsOpen(true)}
                  className="shrink-0 mx-4 mt-3 text-xs text-sage-700 font-medium text-left hover:text-gray-900"
                >
                  ← Sessions
                </button>
                {mode === '3d' ? (
                  <Design3DChatPanel
                    sessionId={activeSessionId}
                    designType={designType}
                    onDesignTypeChange={setDesignType}
                    canEdit={canEdit}
                  />
                ) : (
                  <DesignChatPanel
                    sessionId={activeSessionId}
                    designType={designType}
                    onDesignTypeChange={setDesignType}
                    canEdit={canEdit}
                  />
                )}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="w-[260px] shrink-0 hidden md:block rounded-xl border border-stone-200 bg-white shadow-sm overflow-hidden">
              <DesignSessionList
                sessions={sessions}
                activeId={activeSessionId}
                isLoading={sessionsQuery.isLoading}
                onSelect={handleSelectSession}
                onNew={handleNewSession}
                onDelete={canEdit ? handleDeleteSession : undefined}
                onRename={canEdit ? handleRenameSession : undefined}
                isCreating={createSession.isPending}
                isRenaming={renameSession.isPending}
              />
            </div>
            <div className="flex-1 min-w-0 rounded-xl border border-stone-200 bg-white shadow-sm overflow-hidden">
              {activeSessionId ? (
                mode === '3d' ? (
                  <Design3DChatPanel
                    sessionId={activeSessionId}
                    designType={designType}
                    onDesignTypeChange={setDesignType}
                    canEdit={canEdit}
                  />
                ) : (
                  <DesignChatPanel
                    sessionId={activeSessionId}
                    designType={designType}
                    onDesignTypeChange={setDesignType}
                    canEdit={canEdit}
                  />
                )
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                  <DesignStarPlaceholder />
                  <p className="text-gray-500 mt-4 mb-6">
                    Create a new design or select a session to start
                  </p>
                  <button
                    type="button"
                    onClick={handleNewSession}
                    disabled={createSession.isPending}
                    className="px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
                  >
                    New design
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function DesignStarPlaceholder() {
  return (
    <svg width={48} height={48} viewBox="0 0 24 24" fill="none" className="text-sage-500/50">
      <path
        d="M12 2C12 2 13.5 8.5 17 12C13.5 15.5 12 22 12 22C12 22 10.5 15.5 7 12C10.5 8.5 12 2 12 2Z"
        fill="currentColor"
      />
      <path
        d="M2 12C2 12 8.5 10.5 12 7C15.5 10.5 22 12 22 12C22 12 15.5 13.5 12 17C8.5 13.5 2 12 2 12Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function DesignPage() {
  return (
    <PermissionGuard permission="design.view" redirectTo="/">
      <DesignPageContent />
    </PermissionGuard>
  );
}
