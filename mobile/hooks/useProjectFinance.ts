import { useQuery } from '@tanstack/react-query';
import type { StudioFinanceData } from '@focuspilot/shared';
import { api } from '@/lib/api';

async function fetchProjectFinance(projectId: string): Promise<StudioFinanceData> {
  const response = await api.get<StudioFinanceData>('/finance/project-finance/', {
    params: { project_id: projectId },
  });
  return response.data;
}

export function useProjectFinance(projectId: string) {
  const query = useQuery({
    queryKey: ['finance/project-finance', projectId],
    queryFn: () => fetchProjectFinance(projectId),
    enabled: Boolean(projectId),
  });

  return {
    invoices: query.data?.invoices ?? [],
    purchaseOrders: query.data?.purchase_orders ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    isRefetching: query.isRefetching,
    refresh: query.refetch,
  };
}
