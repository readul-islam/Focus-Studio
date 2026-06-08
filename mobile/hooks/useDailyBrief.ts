import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

const BRIEF_STALE_MS = 30 * 60 * 1000;

async function fetchDailyBrief(): Promise<string | null> {
  const response = await api.get<{ daily_brief?: string }>('/user/daily-brief/');
  return response.data.daily_brief ?? null;
}

export function useDailyBrief(enabled = true) {
  const query = useQuery({
    queryKey: ['user/daily-brief/'],
    queryFn: fetchDailyBrief,
    enabled,
    staleTime: BRIEF_STALE_MS,
    retry: 1,
  });

  return {
    brief: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
