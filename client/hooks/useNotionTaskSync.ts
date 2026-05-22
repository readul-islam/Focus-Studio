import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { postData } from '@/lib/Api';
import useFetch from '@/hooks/useFetch';

const SYNC_INTERVAL_MS = 45_000;

/**
 * Pull task updates from Notion when the tasks UI is open.
 * Waits for sync to finish before refreshing task queries (fixes stale UI).
 */
export function useNotionTaskSync(enabled = true) {
  const queryClient = useQueryClient();
  const syncingRef = useRef(false);

  const { data: notionStatus } = useFetch(enabled ? 'notion/status/' : null);
  const notionConnected = Boolean(
    enabled && (notionStatus as { connected?: boolean } | undefined)?.connected
  );

  useEffect(() => {
    if (!notionConnected) return;

    const invalidateTaskQueries = async () => {
      await queryClient.invalidateQueries({
        queryKey: ['task/user-tasks/'],
        refetchType: 'active',
      });
      await queryClient.invalidateQueries({
        queryKey: ['task/task-datacards/'],
        refetchType: 'active',
      });
      await queryClient.invalidateQueries({
        predicate: query =>
          typeof query.queryKey[0] === 'string' &&
          query.queryKey[0].startsWith('task/user-tasks-project'),
        refetchType: 'active',
      });
    };

    const runSync = async () => {
      if (syncingRef.current) return;
      syncingRef.current = true;
      try {
        await postData({ url: 'notion/tasks/sync/', data: {} });
        await invalidateTaskQueries();
      } catch {
        /* backend may return 400 when Notion disconnected */
      } finally {
        syncingRef.current = false;
      }
    };

    void runSync();

    const onVisible = () => {
      if (document.visibilityState === 'visible') void runSync();
    };
    document.addEventListener('visibilitychange', onVisible);

    const interval = window.setInterval(() => {
      void runSync();
    }, SYNC_INTERVAL_MS);

    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.clearInterval(interval);
    };
  }, [notionConnected, queryClient]);
}
