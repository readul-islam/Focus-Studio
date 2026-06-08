import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient, type Query } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import Constants from 'expo-constants';

/** Bump when persisted shape changes to invalidate old caches. */
export const QUERY_CACHE_BUSTER = `fp-mobile-${Constants.expoConfig?.version ?? '0.1.0'}`;

const PERSISTED_QUERY_PREFIXES = [
  'user/dashboard/',
  'user/daily-brief/',
  'user/self/',
  'task/user-tasks',
  'task/tasks',
  'projects/user-projects',
  'projects/projects',
  'projects/project-overview',
  'projects/project-phases',
  'crm/studio-contacts',
  'crm/studio-clients',
  'crm/clients',
  'finance/studio-finance',
  'finance/invoices',
  'finance/purchase-orders',
  'reports/',
  'documents/root',
  'documents/folder-meta',
  'documents/folder-content',
] as const;

export function shouldPersistQuery(query: Query): boolean {
  if (query.state.status !== 'success') {
    return false;
  }

  const rootKey = query.queryKey[0];
  if (typeof rootKey !== 'string') {
    return false;
  }

  return PERSISTED_QUERY_PREFIXES.some(prefix => rootKey.startsWith(prefix));
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 1000 * 60 * 60 * 24,
      retry: 1,
      networkMode: 'offlineFirst',
    },
    mutations: {
      networkMode: 'online',
    },
  },
});

export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'FP_QUERY_CACHE',
  throttleTime: 1000,
});

export const persistOptions = {
  persister: asyncStoragePersister,
  buster: QUERY_CACHE_BUSTER,
  maxAge: 1000 * 60 * 60 * 24 * 7,
  dehydrateOptions: {
    shouldDehydrateQuery: shouldPersistQuery,
  },
};

export async function clearPersistedQueryCache(): Promise<void> {
  queryClient.clear();
  await asyncStoragePersister.removeClient();
}
