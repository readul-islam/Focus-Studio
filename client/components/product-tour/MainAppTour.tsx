'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import useUser from '@/hooks/useUser';
import { useProductTour } from '@/hooks/useProductTour';
import { MAIN_APP_TOUR_ID, mainAppTourSteps } from '@/lib/product-tour/main-app-tour';
import { ProductTour } from './ProductTour';

/** Auto-starts the main app tour once for first-time users on the dashboard. */
export function MainAppTour() {
  const pathname = usePathname();
  const { user, isLoading } = useUser();
  const { run, setRun, eligible, startTour, completeTour } = useProductTour(MAIN_APP_TOUR_ID);

  useEffect(() => {
    if (isLoading || !user?.studio) return;
    if (pathname !== '/home/dashboard') return;
    if (!eligible || run) return;

    const timer = window.setTimeout(() => startTour(), 1200);
    return () => window.clearTimeout(timer);
  }, [pathname, eligible, run, startTour, user?.studio, isLoading]);

  return (
    <ProductTour
      run={run}
      stepConfigs={mainAppTourSteps}
      onRunChange={setRun}
      onComplete={completeTour}
    />
  );
}
