'use client';

import { useCallback, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchData, postData, postFormData } from '@/lib/Api';
import type { TeamChatAttachment } from '@/components/project/TeamChatAttachmentView';

export const COLLAB_POLL_MS = 5000;
export const PRESENCE_HEARTBEAT_MS = 30000;

export interface TeamMessageUser {
  id: number;
  name: string;
  email?: string;
  profile_picture?: string | null;
}

export interface TeamMessage {
  id: number;
  project: number;
  user: TeamMessageUser | null;
  content: string;
  parent: number | null;
  attachments?: TeamChatAttachment[];
  is_pinned?: boolean;
  pinned_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectPresenceEntry {
  id: number;
  project: number;
  user: TeamMessageUser;
  last_seen: string;
}

function normalizeList<T>(data: T[] | { results?: T[] } | null | undefined): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === 'object' && Array.isArray(data.results)) return data.results;
  return [];
}

export function useProjectCollaboration(projectId: string | null, options?: { enabled?: boolean }) {
  const enabled = (options?.enabled ?? true) && !!projectId;
  const queryClient = useQueryClient();

  const messagesQuery = useQuery<TeamMessage[]>({
    queryKey: ['collaboration-messages', projectId],
    queryFn: async () => {
      try {
        const data = await fetchData(`/collaboration/messages/?project_id=${projectId}`);
        return normalizeList<TeamMessage>(data);
      } catch {
        return [];
      }
    },
    enabled,
    refetchInterval: enabled ? COLLAB_POLL_MS : false,
    refetchIntervalInBackground: false,
    retry: false,
    throwOnError: false,
  });

  const presenceQuery = useQuery<ProjectPresenceEntry[]>({
    queryKey: ['collaboration-presence', projectId],
    queryFn: async () => {
      try {
        const data = await fetchData(`/collaboration/presence/?project_id=${projectId}`);
        return normalizeList<ProjectPresenceEntry>(data);
      } catch {
        return [];
      }
    },
    enabled,
    refetchInterval: enabled ? COLLAB_POLL_MS : false,
    refetchIntervalInBackground: false,
    retry: false,
    throwOnError: false,
  });

  const sendHeartbeat = useCallback(async () => {
    if (!projectId) return;
    try {
      await postData({
        url: '/collaboration/presence/heartbeat/',
        data: { project_id: Number(projectId) || projectId },
      });
      queryClient.invalidateQueries({ queryKey: ['collaboration-presence', projectId] });
    } catch {
      // Heartbeat failures must not crash the page
    }
  }, [projectId, queryClient]);

  useEffect(() => {
    if (!enabled) return;
    void sendHeartbeat();
    const interval = setInterval(() => {
      void sendHeartbeat();
    }, PRESENCE_HEARTBEAT_MS);
    return () => clearInterval(interval);
  }, [enabled, sendHeartbeat]);

  const sendMessageMutation = useMutation({
    mutationFn: async ({
      content,
      parentId,
      files,
    }: {
      content: string;
      parentId?: number | null;
      files?: File[];
    }) => {
      const project_id = Number(projectId) || projectId;
      if (files && files.length > 0) {
        const form = new FormData();
        form.append('project_id', String(project_id));
        form.append('content', content);
        if (parentId != null) form.append('parent_id', String(parentId));
        files.forEach(file => form.append('files', file));
        return postFormData({ url: '/collaboration/messages/', data: form });
      }
      return postData({
        url: '/collaboration/messages/',
        data: {
          project_id,
          content,
          parent_id: parentId ?? null,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaboration-messages', projectId] });
    },
  });

  const togglePinMutation = useMutation({
    mutationFn: async ({ messageId, pin }: { messageId: number; pin: boolean }) => {
      return postData({
        url: `/collaboration/messages/${messageId}/${pin ? 'pin' : 'unpin'}/`,
        data: {},
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaboration-messages', projectId] });
    },
  });

  return {
    messages: messagesQuery.data ?? [],
    messagesLoading: messagesQuery.isLoading,
    messagesError: messagesQuery.error,
    presence: presenceQuery.data ?? [],
    presenceLoading: presenceQuery.isLoading,
    sendMessage: sendMessageMutation.mutateAsync,
    isSending: sendMessageMutation.isPending,
    toggleMessagePin: togglePinMutation.mutateAsync,
    isTogglingPin: togglePinMutation.isPending,
    refetchMessages: messagesQuery.refetch,
  };
}
