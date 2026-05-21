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
  sketch_url?: string | null;
  image_url: string | null;
  model_url?: string | null;
  model_view_url?: string | null;
  asset_id: number | null;
  asset_type?: 'image' | 'model_3d' | null;
  created_at: string;
};

export type DesignGenerate3DResponse = {
  reply: string;
  asset_id: number;
  model_url: string;
  meshy_task_id: string;
  test_mode: boolean;
  messages: DesignMessage[];
};

export type DesignGenerateResponse = {
  reply: string;
  asset_id: number;
  image_url: string;
  messages: DesignMessage[];
};

export type DesignChatResponse = {
  reply: string;
  messages: DesignMessage[];
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

function messagesQueryKey(sessionId: number) {
  return ['design/sessions', sessionId, 'messages'] as const;
}

export function useDesignChat(sessionId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (message: string) =>
      postData({
        url: '/design/chat/',
        data: { session_id: sessionId, message },
      }) as Promise<DesignChatResponse>,
    onSuccess: (data) => {
      if (sessionId && data?.messages) {
        queryClient.setQueryData(messagesQueryKey(sessionId), data.messages);
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
      return postFormData({ url: '/design/generate/', data: formData }) as Promise<DesignGenerateResponse>;
    },
    onSuccess: (data) => {
      if (sessionId && data?.messages) {
        queryClient.setQueryData(messagesQueryKey(sessionId), data.messages);
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

export function useDesignGenerate3d(sessionId: number | null) {
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
      return postFormData({
        url: '/design/generate-3d/',
        data: formData,
      }) as Promise<DesignGenerate3DResponse>;
    },
    onSuccess: (data) => {
      if (sessionId && data?.messages) {
        queryClient.setQueryData(messagesQueryKey(sessionId), data.messages);
        queryClient.invalidateQueries({ queryKey: SESSIONS_KEY });
      }
    },
  });
}

export function useMeshyStatus() {
  return useQuery({
    queryKey: ['design/meshy-status'],
    queryFn: () =>
      fetchData('/design/meshy-status/') as Promise<{ test_mode: boolean; configured: boolean }>,
  });
}

async function urlToFile(url: string, filename: string, assetId?: number): Promise<File> {
  if (assetId && filename.endsWith('.glb')) {
    const { fetchDesignModelBlob } = await import('@/lib/design-model-api');
    const blob = await fetchDesignModelBlob(assetId);
    return new File([blob], filename, { type: 'model/gltf-binary' });
  }
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error('Could not load file');
  const blob = await res.blob();
  const type = blob.type || (filename.endsWith('.glb') ? 'model/gltf-binary' : 'image/png');
  return new File([blob], filename, { type });
}

export { imageUrlToFile, urlToFile };
