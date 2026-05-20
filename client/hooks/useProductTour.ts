'use client';

import { useCallback, useEffect, useState } from 'react';
import useFetch from '@/hooks/useFetch';
import useUser from '@/hooks/useUser';
import {
  isTourCompletedLocally,
  markTourCompleted,
  resetTourCompletion,
} from '@/lib/product-tour/storage';
import type { ProductTourId } from '@/lib/product-tour/types';

type AppearancePrefs = {
  product_tours_completed?: Record<string, boolean>;
};

export function useProductTour(tourId: ProductTourId) {
  const { user } = useUser();
  const userId = user?.id;
  const { data: appearance } = useFetch(userId ? '/user/self/appearance/' : null) as {
    data?: AppearancePrefs;
  };

  const [run, setRun] = useState(false);
  const [eligible, setEligible] = useState(false);

  useEffect(() => {
    if (!userId) {
      setEligible(false);
      return;
    }
    const serverTours = appearance?.product_tours_completed;
    setEligible(!isTourCompletedLocally(tourId, userId, serverTours));
  }, [userId, tourId, appearance?.product_tours_completed]);

  const startTour = useCallback(() => {
    setRun(true);
  }, []);

  const completeTour = useCallback(async () => {
    if (!userId) return;
    await markTourCompleted(tourId, userId, appearance?.product_tours_completed);
    setEligible(false);
    setRun(false);
  }, [userId, tourId, appearance?.product_tours_completed]);

  const restartTour = useCallback(async () => {
    if (!userId) return;
    await resetTourCompletion(tourId, userId, appearance?.product_tours_completed);
    setEligible(true);
    setRun(true);
  }, [userId, tourId, appearance?.product_tours_completed]);

  return {
    run,
    setRun,
    eligible,
    startTour,
    completeTour,
    restartTour,
  };
}
