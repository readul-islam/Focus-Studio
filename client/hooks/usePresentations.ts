'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteData, fetchData, patchData, postData } from '@/lib/Api';
import type { Presentation } from '@/components/presentations/types';

const PRESENTATIONS_KEY = ['presentations/presentations/'];

export function usePresentations(projectId?: string | number, search?: string) {
  const queryClient = useQueryClient();

  const queryKey = [
    ...PRESENTATIONS_KEY,
    projectId ? String(projectId) : 'all',
    search || '',
  ];

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (projectId) params.set('project_id', String(projectId));
      if (search?.trim()) params.set('q', search.trim());
      const qs = params.toString();
      const url = `/presentations/presentations/${qs ? `?${qs}` : ''}`;
      const data = await fetchData(url);
      return (Array.isArray(data) ? data : data?.results || []) as Presentation[];
    },
  });

  const createPresentation = useMutation({
    mutationFn: (data: { title: string; project: number }) =>
      postData({ url: '/presentations/presentations/', data }) as Promise<Presentation>,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PRESENTATIONS_KEY }),
  });

  const updatePresentation = useMutation({
    mutationFn: ({ id, ...data }: { id: number; title?: string }) =>
      patchData({ url: `/presentations/presentations/${id}/`, data }) as Promise<Presentation>,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PRESENTATIONS_KEY }),
  });

  const deletePresentation = useMutation({
    mutationFn: (id: number) => deleteData({ url: `/presentations/presentations/${id}/` }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PRESENTATIONS_KEY }),
  });

  const duplicatePresentation = useMutation({
    mutationFn: (id: number) =>
      postData({ url: `/presentations/presentations/${id}/duplicate/`, data: {} }) as Promise<Presentation>,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PRESENTATIONS_KEY }),
  });

  const publishPresentation = useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: number;
      client_dashboard_published?: boolean;
      web_published?: boolean;
      show_product_pricing?: boolean;
      show_supplier_info?: boolean;
    }) =>
      postData({
        url: `/presentations/presentations/${id}/publish/`,
        data,
      }) as Promise<Presentation>,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PRESENTATIONS_KEY }),
  });

  return {
    query,
    createPresentation,
    updatePresentation,
    deletePresentation,
    duplicatePresentation,
    publishPresentation,
    PRESENTATIONS_KEY,
  };
}

export function usePresentation(id: number | null) {
  return useQuery({
    queryKey: ['presentations/presentations/', id],
    queryFn: () => fetchData(`/presentations/presentations/${id}/`) as Promise<Presentation>,
    enabled: !!id,
  });
}
