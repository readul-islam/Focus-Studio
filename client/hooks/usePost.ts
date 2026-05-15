import { postData } from '@/lib/Api';
import { useMutation } from '@tanstack/react-query';
import { usePermissions } from './usePermissions';
import { permissionFromUrl } from '@/lib/permissionFromUrl';
import { gooeyToast as toast } from 'goey-toast';

export const usePost = (options: any = {}) => {
  const { can } = usePermissions();

  return useMutation<any, any, { url: string; data: any; config?: any }>({
    ...options,
    mutationFn: ({ url, data, config }: { url: string; data: any; config?: any }) => {
      const permission = permissionFromUrl(url);
      if (permission && !can(permission)) {
        toast.error("You don't have permission to do this");
        return Promise.reject(new Error('Permission denied'));
      }
      return postData({ url, data, config });
    },
  });
};
