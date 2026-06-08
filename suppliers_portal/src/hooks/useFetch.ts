import { fetchData } from '@/lib/api';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

export function useFetch<T>(
  url: string | null,
  options?: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<T>({
    queryKey: [url],
    queryFn: () => fetchData<T>(url!),
    enabled: !!url && options?.enabled !== false,
    ...options,
  });
}
