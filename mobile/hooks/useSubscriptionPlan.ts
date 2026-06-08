import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { planDisplayName } from '@/lib/workspace-menu';

type BillingStatusResponse = {
  subscription?: {
    plan_tier?: string | null;
    is_active?: boolean;
    status?: string | null;
  };
};

async function fetchPlanName(): Promise<string> {
  try {
    const response = await api.get<BillingStatusResponse>('/billing/status/');
    return planDisplayName(response.data.subscription?.plan_tier);
  } catch {
    return 'Studio workspace';
  }
}

export function useSubscriptionPlan() {
  const query = useQuery({
    queryKey: ['billing/status/'],
    queryFn: fetchPlanName,
    staleTime: 5 * 60 * 1000,
  });

  return {
    planName: query.data ?? 'Studio workspace',
    isLoading: query.isLoading,
  };
}
