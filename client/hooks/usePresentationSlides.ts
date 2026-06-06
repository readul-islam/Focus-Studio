'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteData, patchData, patchFormData, postData } from '@/lib/Api';
import type { CanvasElement, PresentationSlide } from '@/components/presentations/types';

export function usePresentationSlides(presentationId: number | null) {
  const queryClient = useQueryClient();
  const detailKey = ['presentations/presentations/', presentationId];

  const invalidate = () => {
    if (presentationId) {
      queryClient.invalidateQueries({ queryKey: detailKey });
    }
  };

  const createSlide = useMutation({
    mutationFn: (data: { presentation: number; title?: string }) =>
      postData({ url: '/presentations/slides/', data }) as Promise<PresentationSlide>,
    onSuccess: invalidate,
  });

  const updateSlide = useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: number;
      title?: string;
      background_color?: string;
      canvas_data?: CanvasElement[];
    }) =>
      patchData({ url: `/presentations/slides/${id}/`, data }) as Promise<PresentationSlide>,
  });

  const deleteSlide = useMutation({
    mutationFn: (id: number) => deleteData({ url: `/presentations/slides/${id}/` }),
    onSuccess: invalidate,
  });

  const reorderSlides = useMutation({
    mutationFn: (slideIds: number[]) =>
      postData({
        url: '/presentations/slides/reorder/',
        data: { slide_ids: slideIds },
      }),
    onSuccess: invalidate,
  });

  const uploadSlideBackground = useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) => {
      const fd = new FormData();
      fd.append('background_image', file);
      return patchFormData({
        url: `/presentations/slides/${id}/`,
        data: fd,
      }) as Promise<PresentationSlide>;
    },
    onSuccess: invalidate,
  });

  const setSlideBackgroundSrc = useMutation({
    mutationFn: ({ id, src }: { id: number; src: string }) =>
      patchData({
        url: `/presentations/slides/${id}/`,
        data: { background_src: src },
      }) as Promise<PresentationSlide>,
    onSuccess: invalidate,
  });

  const clearSlideBackground = useMutation({
    mutationFn: (id: number) =>
      patchData({
        url: `/presentations/slides/${id}/`,
        data: { background_image: null, background_src: '' },
      }) as Promise<PresentationSlide>,
    onSuccess: invalidate,
  });

  return {
    createSlide,
    updateSlide,
    deleteSlide,
    reorderSlides,
    uploadSlideBackground,
    setSlideBackgroundSrc,
    clearSlideBackground,
    invalidate,
  };
}
