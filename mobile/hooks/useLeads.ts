import { useQuery } from '@tanstack/react-query';
import { fetchLeads, type CrmLead } from '@/lib/leads';

export function useLeads() {
  const query = useQuery<CrmLead[]>({
    queryKey: ['crm/leads'],
    queryFn: fetchLeads,
  });

  return {
    leads: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    isRefetching: query.isRefetching,
    refresh: query.refetch,
  };
}
