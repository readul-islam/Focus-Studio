import { patchData } from '@/lib/Api';

const STORAGE_PREFIX = 'fp_tour_completed';

function storageKey(tourId: string, userId: number | string) {
  return `${STORAGE_PREFIX}:${tourId}:${userId}`;
}

export function readLocalTourCompleted(tourId: string, userId: number | string): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(storageKey(tourId, userId)) === '1';
}

export function writeLocalTourCompleted(tourId: string, userId: number | string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(storageKey(tourId, userId), '1');
}

export async function syncTourCompletedToServer(
  tourId: string,
  existing: Record<string, boolean> | null | undefined,
) {
  const merged = { ...(existing || {}), [tourId]: true };
  try {
    await patchData({
      url: '/user/self/appearance/',
      data: { product_tours_completed: merged },
    });
  } catch {
    // localStorage remains source of truth offline
  }
  return merged;
}

export function isTourCompletedLocally(
  tourId: string,
  userId: number | string,
  serverTours?: Record<string, boolean> | null,
): boolean {
  if (readLocalTourCompleted(tourId, userId)) return true;
  return Boolean(serverTours?.[tourId]);
}

export async function markTourCompleted(
  tourId: string,
  userId: number | string,
  serverTours?: Record<string, boolean> | null,
) {
  writeLocalTourCompleted(tourId, userId);
  return syncTourCompletedToServer(tourId, serverTours);
}

export function clearLocalTourCompleted(tourId: string, userId: number | string) {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(storageKey(tourId, userId));
}

/** Clear completion so the tour can run again (local + server). */
export async function resetTourCompletion(
  tourId: string,
  userId: number | string,
  serverTours?: Record<string, boolean> | null,
) {
  clearLocalTourCompleted(tourId, userId);
  const merged = { ...(serverTours || {}) };
  delete merged[tourId];
  try {
    await patchData({
      url: '/user/self/appearance/',
      data: { product_tours_completed: merged },
    });
  } catch {
    /* ignore */
  }
  return merged;
}
