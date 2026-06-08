import type { InboxThread, InboxThreadsResponse } from '@focuspilot/shared';

export type InboxFilter = 'all' | 'unread';

export function parseInboxThreads(data: InboxThread[] | InboxThreadsResponse | unknown): InboxThread[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && 'results' in data) {
    return (data as InboxThreadsResponse).results ?? [];
  }
  return [];
}

export function senderDisplayName(sender: string): string {
  const name = sender.split('<')[0]?.trim().replace(/^["']|["']$/g, '');
  return name || sender;
}

export function filterInboxThreads(threads: InboxThread[], filter: InboxFilter, search: string): InboxThread[] {
  const q = search.trim().toLowerCase();
  return threads.filter(thread => {
    if (filter === 'unread' && thread.is_read) return false;
    if (!q) return true;
    return (
      thread.subject.toLowerCase().includes(q) ||
      thread.snippet.toLowerCase().includes(q) ||
      thread.sender.toLowerCase().includes(q) ||
      (thread.project?.name?.toLowerCase().includes(q) ?? false)
    );
  });
}

export function inboxUnreadCount(threads: InboxThread[]): number {
  return threads.filter(thread => !thread.is_read).length;
}
