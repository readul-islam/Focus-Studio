'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteData, fetchData, patchData, postData } from '@/lib/Api';
import type { PresentationPin } from '@/components/presentations/types';

export function usePresentationPins(presentationId: number | null) {
  const queryClient = useQueryClient();
  const detailKey = ['presentations/presentations/', presentationId];

  const query = useQuery({
    queryKey: ['presentations/pins/', presentationId],
    queryFn: async () => {
      const data = await fetchData(
        `/presentations/pins/?presentation_id=${presentationId}`
      );
      return (Array.isArray(data) ? data : data?.results || []) as PresentationPin[];
    },
    enabled: !!presentationId,
  });

  const createPin = useMutation({
    mutationFn: (data: {
      slide: number;
      pin_type: 'product' | 'scene';
      product?: number | null;
      design_asset?: number | null;
      x: number;
      y: number;
      label?: string;
      show_pricing?: boolean;
    }) => postData({ url: '/presentations/pins/', data }) as Promise<PresentationPin>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presentations/pins/', presentationId] });
      queryClient.invalidateQueries({ queryKey: detailKey });
    },
  });

  const updatePin = useMutation({
    mutationFn: ({ id, ...data }: { id: number; label?: string; show_pricing?: boolean; x?: number; y?: number }) =>
      patchData({ url: `/presentations/pins/${id}/`, data }) as Promise<PresentationPin>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presentations/pins/', presentationId] });
      queryClient.invalidateQueries({ queryKey: detailKey });
    },
  });

  const deletePin = useMutation({
    mutationFn: (id: number) => deleteData({ url: `/presentations/pins/${id}/` }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presentations/pins/', presentationId] });
      queryClient.invalidateQueries({ queryKey: detailKey });
    },
  });

  return { query, createPin, updatePin, deletePin };
}
