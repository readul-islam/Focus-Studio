'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchData, postData, postFormData, deleteData } from '@/lib/Api';

export type DesignSession = {
  id: number;
  title: string;
  design_type: 'interior' | 'exterior';
  created_at: string;
  updated_at: string;
  message_count: number;
};

export type DesignMessage = {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  image_url: string | null;
  asset_id: number | null;
  created_at: string;
};

const SESSIONS_KEY = ['design/sessions/'];

export function useDesignSessions() {
  const queryClient = useQueryClient();

  const sessionsQuery = useQuery({
    queryKey: SESSIONS_KEY,
    queryFn: () => fetchData('/design/sessions/') as Promise<DesignSession[]>,
  });

  const createSession = useMutation({
    mutationFn: (data: { title?: string; design_type?: 'interior' | 'exterior' }) =>
      postData({ url: '/design/sessions/', data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SESSIONS_KEY }),
  });

  const deleteSession = useMutation({
    mutationFn: (id: number) => deleteData({ url: `/design/sessions/${id}/` }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SESSIONS_KEY }),
  });

  return { sessionsQuery, createSession, deleteSession, SESSIONS_KEY };
}

export function useDesignMessages(sessionId: number | null) {
  return useQuery({
    queryKey: ['design/sessions', sessionId, 'messages'],
    queryFn: () =>
      fetchData(`/design/sessions/${sessionId}/messages/`) as Promise<DesignMessage[]>,
    enabled: !!sessionId,
  });
}

export function useDesignChat(sessionId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (message: string) =>
      postData({
        url: '/design/chat/',
        data: { session_id: sessionId, message },
      }),
    onSuccess: () => {
      if (sessionId) {
        queryClient.invalidateQueries({ queryKey: ['design/sessions', sessionId, 'messages'] });
        queryClient.invalidateQueries({ queryKey: SESSIONS_KEY });
      }
    },
  });
}

export function useDesignGenerate(sessionId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      prompt: string;
      design_type: 'interior' | 'exterior';
      files: File[];
    }) => {
      const formData = new FormData();
      formData.append('session_id', String(sessionId));
      formData.append('prompt', params.prompt);
      formData.append('design_type', params.design_type);
      params.files.forEach(f => formData.append('files', f));
      return postFormData({ url: '/design/generate/', data: formData });
    },
    onSuccess: () => {
      if (sessionId) {
        queryClient.invalidateQueries({ queryKey: ['design/sessions', sessionId, 'messages'] });
        queryClient.invalidateQueries({ queryKey: SESSIONS_KEY });
      }
    },
  });
}

async function imageUrlToFile(imageUrl: string, filename: string): Promise<File> {
  const res = await fetch(imageUrl, { credentials: 'include' });
  if (!res.ok) throw new Error('Could not load design image');
  const blob = await res.blob();
  const type = blob.type || 'image/png';
  return new File([blob], filename, { type });
}

export { imageUrlToFile };
