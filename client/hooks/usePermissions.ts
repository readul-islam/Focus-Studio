import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchData } from '@/lib/Api';
import useUser from './useUser';

export type PermMatrix = Record<string, { admin: boolean; manager: boolean; member: boolean }>;

export function usePermissions() {
  const { user, isLoading: userLoading } = useUser();

  const hasCapabilityTokens = Array.isArray(user?.permissions) && (user.permissions as string[]).length > 0;

  // Use useQuery directly to avoid the useFetch → usePermissions circular dependency
  const { data: matrix, isLoading: matrixLoading } = useQuery({
    queryKey: ['/user/studio/roles/'],
    queryFn: () => fetchData('/user/studio/roles/'),
    enabled: !userLoading && !hasCapabilityTokens,
  });

  const can = useCallback(
    (permission: string): boolean => {
      if (!user) return false;

      if (hasCapabilityTokens) {
        return (user.permissions as string[]).includes(permission);
      }

      if (!user.role || !matrix) return false;
      const entry = (matrix as PermMatrix)[permission];
      if (!entry) return false;
      return entry[user.role as keyof typeof entry] ?? false;
    },
    [user, hasCapabilityTokens, matrix],
  );

  return {
    can,
    matrix: matrix as PermMatrix | undefined,
    isLoading: userLoading || (!hasCapabilityTokens && matrixLoading),
    userRole: user?.role as string | undefined,
  };
}
