import { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { InboxThread, InboxThreadsResponse, IntegrationStatus } from '@focuspilot/shared';
import { parseInboxThreads } from '@/lib/inbox';
import { api } from '@/lib/api';

async function fetchThreads(): Promise<InboxThread[]> {
  const response = await api.get<InboxThread[] | InboxThreadsResponse>('/gmail/threads/');
  return parseInboxThreads(response.data);
}

async function fetchIntegrationStatus(): Promise<IntegrationStatus> {
  const response = await api.get<IntegrationStatus>('/user/integration-status/');
  return response.data;
}

async function syncGmail(): Promise<void> {
  await api.post('/gmail/fetch/', {});
}

export function useInbox() {
  const queryClient = useQueryClient();

  const integrationQuery = useQuery({
    queryKey: ['user/integration-status/'],
    queryFn: fetchIntegrationStatus,
  });

  const threadsQuery = useQuery({
    queryKey: ['gmail/threads'],
    queryFn: fetchThreads,
    enabled: integrationQuery.data?.gmail_connected ?? false,
  });

  const markReadMutation = useMutation({
    mutationFn: (threadId: string) => api.post(`/gmail/thread/${threadId}/read/`, {}),
    onMutate: async threadId => {
      await queryClient.cancelQueries({ queryKey: ['gmail/threads'] });
      const previous = queryClient.getQueryData<InboxThread[]>(['gmail/threads']);
      queryClient.setQueryData<InboxThread[]>(['gmail/threads'], old =>
        old?.map(thread => (thread.thread_id === threadId ? { ...thread, is_read: true } : thread)),
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['gmail/threads'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['gmail/threads'] });
    },
  });

  const syncMutation = useMutation({
    mutationFn: syncGmail,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gmail/threads'] });
    },
  });

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ['gmail/threads'] });
    }, [queryClient]),
  );

  const refetch = () => {
    integrationQuery.refetch();
    if (integrationQuery.data?.gmail_connected) {
      threadsQuery.refetch();
    }
  };

  const refresh = async () => {
    if (integrationQuery.data?.gmail_connected) {
      await syncMutation.mutateAsync();
    }
    await refetch();
  };

  return {
    threads: threadsQuery.data ?? [],
    gmailConnected: integrationQuery.data?.gmail_connected ?? false,
    isLoading: integrationQuery.isLoading || threadsQuery.isLoading,
    isError: threadsQuery.isError,
    isRefetching: threadsQuery.isRefetching || syncMutation.isPending,
    refetch,
    refresh,
    markAsRead: markReadMutation.mutate,
    isSyncing: syncMutation.isPending,
  };
}
