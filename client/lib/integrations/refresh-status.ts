import { fetchData } from '@/lib/Api';
import type { QueryClient } from '@tanstack/react-query';

export const INTEGRATION_STATUS_QUERY_KEY = ['user/integration-status/'] as const;

export type IntegrationStatusPayload = {
  gmail_connected?: boolean;
  calendar_connected?: boolean;
  notion_connected?: boolean;
  xero_connected?: boolean;
  quickbooks_connected?: boolean;
  zapier_configured?: boolean;
};

type RefreshOptions = {
  /** Refetch until this returns true, or max attempts reached. */
  until?: (status: IntegrationStatusPayload) => boolean;
  maxAttempts?: number;
  delayMs?: number;
};

/**
 * Invalidate and refetch integration status until the server reflects the new connection.
 * Fixes OAuth UI lag where a single refetch ran before the backend finished saving.
 */
export async function refreshIntegrationStatus(
  queryClient: QueryClient,
  options: RefreshOptions = {}
): Promise<IntegrationStatusPayload | undefined> {
  const { until, maxAttempts = 12, delayMs = 450 } = options;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      await queryClient.refetchQueries({
        queryKey: [...INTEGRATION_STATUS_QUERY_KEY],
        type: 'active',
        cancelRefetch: false,
      });
      const result = queryClient.getQueryData<IntegrationStatusPayload>([
        ...INTEGRATION_STATUS_QUERY_KEY,
      ]);

      if (!until || (result && until(result))) {
        return result;
      }
    } catch {
      /* retry */
    }

    if (attempt < maxAttempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return queryClient.getQueryData<IntegrationStatusPayload>([...INTEGRATION_STATUS_QUERY_KEY]);
}

export function patchIntegrationStatus(
  queryClient: QueryClient,
  patch: Partial<IntegrationStatusPayload>
) {
  queryClient.setQueryData<IntegrationStatusPayload>(
    [...INTEGRATION_STATUS_QUERY_KEY],
    (prev) => ({ ...prev, ...patch })
  );
}
