import type { UserProject } from '@/lib/projects';
import { mapUserProject } from '@/lib/projects';

export type ProjectHubView = UserProject & {
  description?: string | null;
  clientId?: number | null;
};

export function mapProjectHub(raw: Record<string, unknown>): ProjectHubView {
  const base = mapUserProject(raw as Parameters<typeof mapUserProject>[0]);
  const description =
    (typeof raw.project_description === 'string' ? raw.project_description : null) ??
    (typeof raw.description === 'string' ? raw.description : null);
  const client = raw.client as { id?: number } | null | undefined;
  const clientId = typeof client?.id === 'number' ? client.id : null;

  return {
    ...base,
    description,
    clientId,
  };
}

export function projectLocationLabel(project: Pick<ProjectHubView, 'location'>): string | null {
  return project.location?.trim() || null;
}

export function isPhaseCurrent(start?: string | null, end?: string | null): boolean {
  if (!start || !end) return false;
  const now = new Date();
  const startDate = new Date(start);
  const endDate = new Date(end);
  return now >= startDate && now <= endDate;
}
