import type { IntegrationStatusPayload } from '@/lib/integrations/refresh-status';

type ConfirmConnectionArgs = {
  applyPatch: (patch: Partial<IntegrationStatusPayload>) => void;
  waitForStatus: (
    predicate: (s: IntegrationStatusPayload) => boolean,
    options?: { maxAttempts?: number; delayMs?: number; serverOnly?: boolean }
  ) => Promise<IntegrationStatusPayload | undefined>;
  patch: Partial<IntegrationStatusPayload>;
  predicate: (s: IntegrationStatusPayload) => boolean;
};

/**
 * Optimistically update the integrations UI, then poll until the server agrees.
 */
export async function confirmIntegrationConnection({
  applyPatch,
  waitForStatus,
  patch,
  predicate,
}: ConfirmConnectionArgs): Promise<boolean> {
  applyPatch(patch);
  const result = await waitForStatus(predicate, { serverOnly: true });
  return predicate(result ?? {});
}
