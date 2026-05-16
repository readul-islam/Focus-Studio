'use client';

import { fetchData, postData } from '@/lib/Api';
import type { BillingStatusResponse, PlanTier } from '@/lib/billing/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const BILLING_KEY = ['billing', 'status'] as const;

export function useBilling({ enabled = true }: { enabled?: boolean } = {}) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: BILLING_KEY,
    queryFn: () => fetchData('billing/status/') as Promise<BillingStatusResponse>,
    enabled,
    staleTime: 60_000,
  });

  const checkoutMutation = useMutation({
    mutationFn: (planTier: PlanTier) =>
      postData({ url: 'billing/checkout/', data: { plan_tier: planTier } }) as Promise<{
        checkout_url: string;
      }>,
    onSuccess: (data) => {
      if (data?.checkout_url) {
        window.location.href = data.checkout_url;
      }
    },
  });

  const portalMutation = useMutation({
    mutationFn: () =>
      postData({ url: 'billing/portal/', data: {} }) as Promise<{ portal_url: string }>,
    onSuccess: (data) => {
      if (data?.portal_url) {
        window.location.href = data.portal_url;
      }
    },
  });

  const verifyMutation = useMutation({
    mutationFn: (sessionId: string) =>
      postData({ url: 'billing/verify-session/', data: { session_id: sessionId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BILLING_KEY });
    },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: BILLING_KEY });

  return {
    ...query,
    data: query.data,
    subscription: query.data?.subscription,
    plans: query.data?.plans ?? [],
    stripeConfigured: query.data?.stripe_configured ?? false,
    trialDays: query.data?.trial_days ?? 14,
    checkout: checkoutMutation,
    portal: portalMutation,
    verifySession: verifyMutation,
    invalidate,
  };
}
