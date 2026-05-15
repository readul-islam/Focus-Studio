import { useCallback } from 'react';
import { gooeyToast as toast } from 'goey-toast';
import { usePermissions } from './usePermissions';

export function useEditGuard(permission: string) {
  const { can } = usePermissions();

  const guard = useCallback(
    <T extends (...args: any[]) => any>(fn: T): T => {
      return ((...args: Parameters<T>) => {
        if (!can(permission)) {
          toast.error("You don't have permission to do this");
          return;
        }
        return fn(...args);
      }) as T;
    },
    [can, permission],
  );

  return { guard };
}
