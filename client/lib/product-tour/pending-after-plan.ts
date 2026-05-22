const PENDING_TOUR_KEY = 'fp_show_tour_after_plan';

export function markProductTourPendingAfterPlan() {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(PENDING_TOUR_KEY, '1');
}

export function isProductTourPendingAfterPlan(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(PENDING_TOUR_KEY) === '1';
}

export function consumeProductTourPendingAfterPlan(): boolean {
  if (typeof window === 'undefined') return false;
  const pending = sessionStorage.getItem(PENDING_TOUR_KEY) === '1';
  if (pending) sessionStorage.removeItem(PENDING_TOUR_KEY);
  return pending;
}
