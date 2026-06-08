import { useCallback, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  COLLAB_POLL_MS,
  fetchProjectPresence,
  fetchTeamMessages,
  PRESENCE_HEARTBEAT_MS,
  sendPresenceHeartbeat,
  sendTeamMessage,
  type ProjectPresenceEntry,
  type TeamMessage,
} from '@/lib/collaboration';

export function useProjectCollaboration(projectId: string, options?: { enabled?: boolean }) {
  const enabled = (options?.enabled ?? true) && Boolean(projectId);
  const queryClient = useQueryClient();

  const messagesQuery = useQuery<TeamMessage[]>({
    queryKey: ['collaboration/messages', projectId],
    queryFn: () => fetchTeamMessages(projectId),
    enabled,
    refetchInterval: enabled ? COLLAB_POLL_MS : false,
    refetchIntervalInBackground: false,
    retry: false,
  });

  const presenceQuery = useQuery<ProjectPresenceEntry[]>({
    queryKey: ['collaboration/presence', projectId],
    queryFn: () => fetchProjectPresence(projectId),
    enabled,
    refetchInterval: enabled ? COLLAB_POLL_MS : false,
    refetchIntervalInBackground: false,
    retry: false,
  });

  const sendHeartbeat = useCallback(async () => {
    if (!projectId) return;
    try {
      await sendPresenceHeartbeat(projectId);
      await queryClient.invalidateQueries({ queryKey: ['collaboration/presence', projectId] });
    } catch {
      // Heartbeat failures must not crash the screen
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
    mutationFn: (content: string) => sendTeamMessage(projectId, content),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['collaboration/messages', projectId] });
    },
  });

  return {
    messages: messagesQuery.data ?? [],
    messagesLoading: messagesQuery.isLoading,
    messagesError: messagesQuery.isError,
    presence: presenceQuery.data ?? [],
    sendMessage: sendMessageMutation.mutateAsync,
    isSending: sendMessageMutation.isPending,
    refetchMessages: messagesQuery.refetch,
    isRefetching: messagesQuery.isRefetching || presenceQuery.isRefetching,
    refetch: () => {
      messagesQuery.refetch();
      presenceQuery.refetch();
    },
  };
}
