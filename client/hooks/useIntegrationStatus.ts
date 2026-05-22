'use client';

import { fetchData } from '@/lib/Api';
import {
  INTEGRATION_STATUS_QUERY_KEY,
  type IntegrationStatusPayload,
} from '@/lib/integrations/refresh-status';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const EMPTY_STATUS: IntegrationStatusPayload = {};

export function useIntegrationStatus() {
  const queryClient = useQueryClient();
  const [optimistic, setOptimistic] = useState<Partial<IntegrationStatusPayload>>({});
  const optimisticRef = useRef(optimistic);
  optimisticRef.current = optimistic;

  const query = useQuery({
    queryKey: [...INTEGRATION_STATUS_QUERY_KEY],
    queryFn: () => fetchData('user/integration-status/') as Promise<IntegrationStatusPayload>,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const serverStatus = query.data ?? EMPTY_STATUS;

  const status = useMemo(
    () => ({ ...serverStatus, ...optimistic }),
    [serverStatus, optimistic]
  );

  // Drop optimistic overrides once the server matches.
  useEffect(() => {
    setOptimistic((prev) => {
      if (!Object.keys(prev).length) return prev;
      const next: Partial<IntegrationStatusPayload> = { ...prev };
      let changed = false;
      (Object.keys(next) as (keyof IntegrationStatusPayload)[]).forEach((key) => {
        if (serverStatus[key] === next[key]) {
          delete next[key];
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [serverStatus]);

  const applyPatch = useCallback(
    (patch: Partial<IntegrationStatusPayload>) => {
      setOptimistic((prev) => ({ ...prev, ...patch }));
      queryClient.setQueryData<IntegrationStatusPayload>(
        [...INTEGRATION_STATUS_QUERY_KEY],
        (old) => ({ ...(old ?? {}), ...patch })
      );
    },
    [queryClient]
  );

  const waitForStatus = useCallback(
    async (
      predicate: (s: IntegrationStatusPayload) => boolean,
      options?: { maxAttempts?: number; delayMs?: number; serverOnly?: boolean }
    ): Promise<IntegrationStatusPayload | undefined> => {
      const maxAttempts = options?.maxAttempts ?? 12;
      const delayMs = options?.delayMs ?? 450;
      const serverOnly = options?.serverOnly ?? false;

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          const { data } = await query.refetch({ cancelRefetch: false });
          const snapshot = data ?? {};
          const check = serverOnly ? snapshot : { ...snapshot, ...optimisticRef.current };
          if (predicate(check)) {
            return { ...status, ...snapshot };
          }
        } catch {
          /* retry on network errors / broken pipe */
        }
        if (attempt < maxAttempts - 1) {
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }

      const server = queryClient.getQueryData<IntegrationStatusPayload>([
        ...INTEGRATION_STATUS_QUERY_KEY,
      ]);
      return { ...(server ?? {}), ...optimisticRef.current };
    },
    [query, queryClient, status]
  );

  return {
    status,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    applyPatch,
    waitForStatus,
    refetch: query.refetch,
  };
}
