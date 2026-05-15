import { deleteData } from '@/lib/Api';
import { useMutation } from '@tanstack/react-query';
import { usePermissions } from './usePermissions';
import { permissionFromUrl } from '@/lib/permissionFromUrl';
import { gooeyToast as toast } from 'goey-toast';

const useDeleteData = (options: any = {}) => {
  const { can } = usePermissions();

  return useMutation<any, any, { url: string; data?: any }>({
    ...options,
    mutationFn: ({ url, data }: { url: string; data?: any }) => {
      const permission = permissionFromUrl(url);
      if (permission && !can(permission)) {
        toast.error("You don't have permission to perform this action");
        return Promise.reject(new Error("You don't have permission to perform this action"));
      }
      return deleteData({ url, data });
    },
  });
};

export default useDeleteData;
