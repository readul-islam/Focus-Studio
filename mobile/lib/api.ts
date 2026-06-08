import { createApiClient } from '@focuspilot/api-client';
import { getApiBaseUrl } from '@/lib/config';
import { secureTokenStorage } from '@/lib/token-storage';

let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: () => void) {
  unauthorizedHandler = handler;
}

export const api = createApiClient({
  baseURL: getApiBaseUrl(),
  storage: secureTokenStorage,
  onUnauthorized: () => unauthorizedHandler?.(),
});
