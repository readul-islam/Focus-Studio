import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { postData } from '@/lib/Api';
import useUser from '@/hooks/useUser';

/**
 * Pull task updates from Notion when the tasks UI is open (and on tab focus).
 * Only runs when the studio has Notion enabled.
 */
export function useNotionTaskSync(enabled = true) {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const notionEnabled = enabled && Boolean(user?.studio?.notion);

  useEffect(() => {
    if (!notionEnabled) return;

    const invalidateTaskQueries = () => {
      queryClient.invalidateQueries({ queryKey: ['task/user-tasks/'] });
      queryClient.invalidateQueries({ queryKey: ['task/task-datacards/'] });
      queryClient.invalidateQueries({
        predicate: query =>
          typeof query.queryKey[0] === 'string' &&
          query.queryKey[0].startsWith('task/user-tasks-project'),
      });
    };

    const runSync = () => {
      postData({ url: 'notion/tasks/sync/', data: {} })
        .then(invalidateTaskQueries)
        .catch(() => {});
    };

    runSync();

    const onVisible = () => {
      if (document.visibilityState === 'visible') runSync();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [notionEnabled, queryClient]);
}
