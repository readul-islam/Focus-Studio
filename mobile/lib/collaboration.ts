import { api } from '@/lib/api';

export interface TeamMessageUser {
  id: number;
  name: string;
  email?: string;
  profile_picture?: string | null;
}

export interface TeamChatAttachment {
  id: number;
  file_name: string;
  file_size?: number;
  content_type?: string;
  file_type?: string;
  file_url?: string | null;
  created_at?: string;
}

export interface TeamMessage {
  id: number;
  project: number;
  user: TeamMessageUser | null;
  content: string;
  parent: number | null;
  attachments?: TeamChatAttachment[];
  is_pinned?: boolean;
  pinned_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectPresenceEntry {
  id: number;
  project: number;
  user: TeamMessageUser;
  last_seen: string;
}

export const COLLAB_POLL_MS = 5000;
export const PRESENCE_HEARTBEAT_MS = 30000;

function normalizeList<T>(data: T[] | { results?: T[] } | null | undefined): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === 'object' && Array.isArray(data.results)) return data.results;
  return [];
}

export async function fetchTeamMessages(projectId: string): Promise<TeamMessage[]> {
  const response = await api.get<TeamMessage[] | { results?: TeamMessage[] }>('/collaboration/messages/', {
    params: { project_id: projectId },
  });
  return normalizeList(response.data);
}

export async function fetchProjectPresence(projectId: string): Promise<ProjectPresenceEntry[]> {
  const response = await api.get<ProjectPresenceEntry[] | { results?: ProjectPresenceEntry[] }>(
    '/collaboration/presence/',
    { params: { project_id: projectId } },
  );
  return normalizeList(response.data);
}

export async function sendTeamMessage(projectId: string, content: string): Promise<void> {
  await api.post('/collaboration/messages/', {
    project_id: Number(projectId) || projectId,
    content,
    parent_id: null,
  });
}

export async function sendPresenceHeartbeat(projectId: string): Promise<void> {
  await api.post('/collaboration/presence/heartbeat/', {
    project_id: Number(projectId) || projectId,
  });
}
