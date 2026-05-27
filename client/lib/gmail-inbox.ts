import { postData } from '@/lib/Api';

export async function markGmailThreadRead(threadId: string) {
  return postData({ url: `gmail/thread/${threadId}/read/`, data: {} });
}

export async function markGmailThreadUnread(threadId: string) {
  return postData({ url: `gmail/thread/${threadId}/unread/`, data: {} });
}
