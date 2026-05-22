'use client';

import { useIntegrationStatus } from '@/hooks/useIntegrationStatus';
import type { IntegrationStatusPayload } from '@/lib/integrations/refresh-status';
import { createContext, useContext, type ReactNode } from 'react';

type IntegrationStatusContextValue = {
  status: IntegrationStatusPayload;
  isLoading: boolean;
  isFetching: boolean;
  applyPatch: (patch: Partial<IntegrationStatusPayload>) => void;
  waitForStatus: (
    predicate: (s: IntegrationStatusPayload) => boolean,
    options?: { maxAttempts?: number; delayMs?: number; serverOnly?: boolean }
  ) => Promise<IntegrationStatusPayload | undefined>;
};

const IntegrationStatusContext = createContext<IntegrationStatusContextValue | null>(null);

export function IntegrationStatusProvider({ children }: { children: ReactNode }) {
  const value = useIntegrationStatus();
  return (
    <IntegrationStatusContext.Provider value={value}>{children}</IntegrationStatusContext.Provider>
  );
}

export function useIntegrationStatusContext() {
  const ctx = useContext(IntegrationStatusContext);
  if (!ctx) {
    throw new Error('useIntegrationStatusContext must be used within IntegrationStatusProvider');
  }
  return ctx;
}

/** Returns null outside Integrations page (e.g. Inbox compact connect). */
export function useIntegrationStatusContextOptional() {
  return useContext(IntegrationStatusContext);
}
