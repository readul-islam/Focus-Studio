import type { StudioUser } from '@focuspilot/shared';
import { getApiBaseUrl } from '@/lib/config';
import { formatDate } from '@/lib/format';

export type UserProject = {
  id: number;
  name: string;
  projectType: string;
  projectTypeCode?: string;
  status: string;
  statusLabel: string;
  code?: string;
  clientName?: string;
  location?: string;
  startDate?: string | null;
  endDate?: string | null;
  budget?: number | null;
  spent?: number;
  currency?: string | null;
  progress: number;
  bannerUrl?: string | null;
  nextPhase?: string | null;
  assignees: { id: number; name: string }[];
};

type ApiClient = {
  name?: string | null;
  surname?: string | null;
  company_name?: string | null;
};

type ApiPhase = {
  name?: string | null;
};

type ApiProject = {
  id: number;
  project_name?: string | null;
  project_type?: string | null;
  project_status?: string | null;
  project_code?: string | null;
  location?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  total_budget?: number | null;
  spent?: number;
  currency?: string | null;
  progress?: number;
  project_banner?: string | null;
  next_phase?: ApiPhase | null;
  client?: ApiClient | null;
  assignees?: StudioUser[];
};

const PROJECT_TYPE_LABELS: Record<string, string> = {
  RS: 'Residential',
  CM: 'Commercial',
  HS: 'Hospitality',
};

const PROJECT_STATUS_LABELS: Record<string, string> = {
  AC: 'Active',
  COM: 'Complete',
  ARC: 'Archived',
  WON: 'Won',
};

export function projectTypeLabel(code?: string | null): string {
  if (!code) return 'Project';
  return PROJECT_TYPE_LABELS[code] ?? code;
}

export function projectStatusLabel(code?: string | null): string {
  if (!code) return 'Active';
  return PROJECT_STATUS_LABELS[code] ?? code;
}

export function resolveMediaUrl(path?: string | null): string | null {
  if (!path?.trim()) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const base = getApiBaseUrl().replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

function clientDisplayName(client?: ApiClient | null): string | undefined {
  if (!client) return undefined;
  const full = [client.name, client.surname].filter(Boolean).join(' ').trim();
  if (full) return full;
  return client.company_name ?? undefined;
}

function assigneeName(user: StudioUser): string {
  if (user.name?.trim()) return user.name.trim();
  if (user.first_name?.trim()) return user.first_name.trim();
  return user.email.split('@')[0] ?? user.email;
}

export function mapUserProject(item: ApiProject): UserProject {
  const nextPhase =
    item.next_phase && typeof item.next_phase === 'object' ? item.next_phase.name ?? null : null;

  return {
    id: item.id,
    name: item.project_name ?? 'Untitled project',
    projectType: projectTypeLabel(item.project_type),
    projectTypeCode: item.project_type ?? undefined,
    status: item.project_status ?? 'AC',
    statusLabel: projectStatusLabel(item.project_status),
    code: item.project_code ?? undefined,
    clientName: clientDisplayName(item.client),
    location: item.location ?? undefined,
    startDate: item.start_date,
    endDate: item.end_date,
    budget: item.total_budget,
    spent: item.spent,
    currency: item.currency,
    progress: Math.round(item.progress ?? 0),
    bannerUrl: resolveMediaUrl(item.project_banner),
    nextPhase,
    assignees: (item.assignees ?? []).map(user => ({
      id: user.id,
      name: assigneeName(user),
    })),
  };
}

export function formatProjectBudget(amount?: number | null, currency?: string | null): string | null {
  if (amount == null || Number.isNaN(amount)) return null;
  const code = currency?.trim() || 'GBP';
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: code,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${code} ${amount.toLocaleString()}`;
  }
}

export function projectDateRange(start?: string | null, end?: string | null): string | null {
  if (!start && !end) return null;
  if (start && end) return `${formatDate(start)} – ${formatDate(end)}`;
  if (end) return `Due ${formatDate(end)}`;
  return `From ${formatDate(start)}`;
}

export type ProjectFilter = 'all' | 'active' | 'completed';

export function filterProjects(projects: UserProject[], filter: ProjectFilter, search: string): UserProject[] {
  const query = search.trim().toLowerCase();

  return projects.filter(project => {
    if (filter === 'active' && project.status !== 'AC') return false;
    if (filter === 'completed' && project.status !== 'COM') return false;

    if (!query) return true;

    return (
      project.name.toLowerCase().includes(query) ||
      (project.code?.toLowerCase().includes(query) ?? false) ||
      (project.clientName?.toLowerCase().includes(query) ?? false) ||
      project.projectType.toLowerCase().includes(query) ||
      (project.location?.toLowerCase().includes(query) ?? false)
    );
  });
}
