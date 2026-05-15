import { fetchData } from '@/lib/Api';
import { useQuery } from '@tanstack/react-query';
import { usePermissions } from './usePermissions';
import { viewPermissionFromUrl } from '@/lib/permissionFromUrl';

const useFetch = (url: string | null, options: any = {}) => {
  const { can, isLoading: permLoading } = usePermissions();

  const permission = url ? viewPermissionFromUrl(url) : null;
  const hasPermission = !permission || can(permission);

  const { data, isLoading, error, isError, refetch, isPending, isFetching } = useQuery({
    queryKey: [url],
    queryFn: () => fetchData(url),
    enabled: url !== null && options.enabled !== false && !permLoading && hasPermission,
    ...options,
  });

  return {
    data,
    isLoading: isLoading || permLoading,
    error,
    isError,
    refetch,
    isPending,
    isFetching,
  };
};

export default useFetch;
