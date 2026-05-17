// hooks/usePost.ts
import { postData } from '@/lib/Api';
import { useMutation } from '@tanstack/react-query';

export const usePost = (options = {}) => {
  return useMutation({
    mutationFn: ({ url, data }: { url: string; data: any }) => postData({ url, data }),
    ...options,
  });
};
