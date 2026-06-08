import { api } from '@/lib/api';

export type SupportMessage = {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
};

export async function fetchSupportConversation(): Promise<{
  conversation_id: number | null;
  messages: SupportMessage[];
}> {
  const response = await api.get<{ conversation_id: number | null; messages: SupportMessage[] }>(
    '/help/support/conversation/',
  );
  return response.data;
}

export async function sendSupportMessage(
  message: string,
  conversationId?: number | null,
): Promise<{ reply: string; conversation_id: number }> {
  const response = await api.post<{ reply: string; conversation_id: number }>('/help/support/chat/', {
    message,
    conversation_id: conversationId ?? undefined,
    page_path: 'mobile/help',
  });
  return response.data;
}

export async function clearSupportConversation(conversationId?: number | null): Promise<void> {
  await api.delete('/help/support/conversation/clear/', {
    data: { conversation_id: conversationId ?? undefined },
  });
}
