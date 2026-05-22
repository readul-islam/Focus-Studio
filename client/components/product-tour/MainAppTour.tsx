'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useBilling } from '@/hooks/useBilling';
import useUser from '@/hooks/useUser';
import { useProductTour } from '@/hooks/useProductTour';
import { MAIN_APP_TOUR_ID, mainAppTourSteps } from '@/lib/product-tour/main-app-tour';
import {
  consumeProductTourPendingAfterPlan,
  isProductTourPendingAfterPlan,
} from '@/lib/product-tour/pending-after-plan';
import { ProductTour } from './ProductTour';

/** Starts the main app tour once after the user has activated a plan (beta or paid). */
export function MainAppTour() {
  const pathname = usePathname();
  const { user, isLoading: userLoading } = useUser();
  const { subscription, isLoading: billingLoading } = useBilling({
    enabled: !!user?.studio,
  });
  const { run, setRun, eligible, startTour, completeTour } = useProductTour(MAIN_APP_TOUR_ID);

  const needsPlan = subscription?.needs_plan_selection === true;

  useEffect(() => {
    if (userLoading || billingLoading || !user?.studio) return;
    if (pathname !== '/home/dashboard') return;
    if (!eligible || run) return;
    if (needsPlan) return;
    if (!isProductTourPendingAfterPlan()) return;

    const timer = window.setTimeout(() => {
      consumeProductTourPendingAfterPlan();
      startTour();
    }, 500);

    return () => window.clearTimeout(timer);
  }, [
    pathname,
    eligible,
    run,
    startTour,
    user?.studio,
    userLoading,
    billingLoading,
    needsPlan,
  ]);

  return (
    <ProductTour
      run={run}
      stepConfigs={mainAppTourSteps}
      onRunChange={setRun}
      onComplete={completeTour}
    />
  );
}
