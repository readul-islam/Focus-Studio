import { useQuery } from '@tanstack/react-query';
import type { StudioFinanceData } from '@focuspilot/shared';
import { api } from '@/lib/api';

async function fetchStudioFinance(): Promise<StudioFinanceData> {
  const response = await api.get<StudioFinanceData>('/finance/studio-finance/');
  return response.data;
}

export function useFinance() {
  const query = useQuery({
    queryKey: ['finance/studio-finance'],
    queryFn: fetchStudioFinance,
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
