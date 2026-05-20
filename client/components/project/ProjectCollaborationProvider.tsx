'use client';

import { createContext, useContext, type ReactNode } from 'react';
import {
  useProjectCollaboration,
  type TeamMessage,
  type ProjectPresenceEntry,
} from '@/hooks/useProjectCollaboration';

type CollaborationContextValue = {
  messages: TeamMessage[];
  messagesLoading: boolean;
  presence: ProjectPresenceEntry[];
  presenceLoading: boolean;
  sendMessage: ReturnType<typeof useProjectCollaboration>['sendMessage'];
  isSending: boolean;
  toggleMessagePin: ReturnType<typeof useProjectCollaboration>['toggleMessagePin'];
  isTogglingPin: boolean;
};

const CollaborationContext = createContext<CollaborationContextValue | null>(null);

export function ProjectCollaborationProvider({
  projectId,
  enabled = true,
  children,
}: {
  projectId: string;
  enabled?: boolean;
  children: ReactNode;
}) {
  const value = useProjectCollaboration(projectId, { enabled });
  return (
    <CollaborationContext.Provider value={value}>{children}</CollaborationContext.Provider>
  );
}

export function useProjectCollaborationContext() {
  const ctx = useContext(CollaborationContext);
  if (!ctx) {
    throw new Error('useProjectCollaborationContext must be used within ProjectCollaborationProvider');
  }
  return ctx;
}

/** Safe hook when provider may be absent */
export function useOptionalProjectCollaborationContext() {
  return useContext(CollaborationContext);
}
