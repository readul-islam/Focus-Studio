import { colors } from '@/constants/theme';
import { api } from '@/lib/api';

export type LeadStage = 'new' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';

export type LeadStageFilter = 'all' | LeadStage;

export interface CrmLead {
  id: number;
  title: string;
  full_name?: string;
  email?: string | null;
  phone?: string | null;
  location?: string;
  owner?: number | null;
  source?: string;
  stage: LeadStage;
  stage_updated_at?: string;
  project_type?: string;
  property_type?: string;
  property_size?: number | null;
  budget_range?: string;
  estimated_value?: string | number | null;
  proposal_type?: string;
  proposal_sent_date?: string | null;
  negotiation_reason?: string;
  revised_value?: string | number | null;
  final_value?: string | number | null;
  deposit_received?: boolean;
  project_start_date?: string | null;
  project_created?: boolean;
  project?: number | null;
  notes?: string;
  loss_reason?: string;
}

export const LEAD_STAGES: LeadStage[] = ['new', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];

export const LEAD_STAGE_LABELS: Record<LeadStage, string> = {
  new: 'New',
  qualified: 'Qualified',
  proposal: 'Proposal',
  negotiation: 'Negotiation',
  won: 'Won',
  lost: 'Lost',
};

export const LEAD_SOURCES = [
  'Website',
  'Referral',
  'Instagram',
  'LinkedIn',
  'Trade Show',
  'Facebook',
  'Twitter',
  'Other',
] as const;

export function leadStageStyle(stage: LeadStage): { label: string; color: string; backgroundColor: string } {
  switch (stage) {
    case 'new':
      return { label: 'New', color: colors.textSecondary, backgroundColor: colors.surfaceElevated };
    case 'qualified':
      return { label: 'Qualified', color: colors.success, backgroundColor: '#ECFDF3' };
    case 'proposal':
      return { label: 'Proposal', color: colors.clay, backgroundColor: '#FFF7ED' };
    case 'negotiation':
      return { label: 'Negotiation', color: '#7C3AED', backgroundColor: '#F3E8FF' };
    case 'won':
      return { label: 'Won', color: colors.success, backgroundColor: '#DCFCE7' };
    case 'lost':
      return { label: 'Lost', color: colors.danger, backgroundColor: '#FEF2F2' };
    default:
      return { label: stage, color: colors.textSecondary, backgroundColor: colors.surfaceElevated };
  }
}

export function leadDisplayValue(lead: CrmLead): number {
  const raw = lead.final_value ?? lead.revised_value ?? lead.estimated_value ?? 0;
  return Number(raw) || 0;
}

export function leadDaysInStage(lead: CrmLead): number {
  if (!lead.stage_updated_at) return 0;
  const updated = new Date(lead.stage_updated_at).getTime();
  const now = Date.now();
  return Math.max(0, Math.ceil(Math.abs(now - updated) / (1000 * 60 * 60 * 24)));
}

export function leadStaleLevel(lead: CrmLead): 'fresh' | 'warm' | 'stale' {
  if (lead.stage === 'won' || lead.stage === 'lost') return 'fresh';
  const days = leadDaysInStage(lead);
  if (days < 7) return 'fresh';
  if (days <= 14) return 'warm';
  return 'stale';
}

export function filterLeads(leads: CrmLead[], stage: LeadStageFilter, search: string): CrmLead[] {
  const query = search.trim().toLowerCase();
  return leads.filter(lead => {
    if (stage !== 'all' && lead.stage !== stage) return false;
    if (!query) return true;
    const haystack = [lead.title, lead.full_name, lead.email, lead.source, lead.budget_range]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return haystack.includes(query);
  });
}

export function pipelineSummary(leads: CrmLead[]) {
  const active = leads.filter(lead => lead.stage !== 'won' && lead.stage !== 'lost');
  const pipelineValue = active.reduce((sum, lead) => sum + leadDisplayValue(lead), 0);
  const won = leads.filter(lead => lead.stage === 'won').length;
  const stale = active.filter(lead => leadStaleLevel(lead) === 'stale').length;

  return {
    total: leads.length,
    active: active.length,
    pipelineValue,
    won,
    stale,
  };
}

export async function fetchLeads(): Promise<CrmLead[]> {
  const response = await api.get<CrmLead[] | { results?: CrmLead[] }>('/crm/leads/');
  if (Array.isArray(response.data)) return response.data;
  return response.data.results ?? [];
}

export async function fetchLead(id: number): Promise<CrmLead> {
  const response = await api.get<CrmLead>(`/crm/leads/${id}/`);
  return response.data;
}

export async function updateLeadStage(id: number, stage: LeadStage): Promise<CrmLead> {
  const response = await api.patch<CrmLead>(`/crm/leads/${id}/`, { stage });
  return response.data;
}

export async function createLead(payload: {
  title: string;
  full_name: string;
  email?: string;
  phone?: string;
  source: string;
  studio: number;
  owner: number;
}): Promise<CrmLead> {
  const response = await api.post<CrmLead>('/crm/leads/', {
    ...payload,
    stage: 'new',
  });
  return response.data;
}

export async function convertLeadToProject(leadId: number, clientEmail?: string): Promise<{ id: number }> {
  const response = await api.post<{ id: number }>(`/crm/leads/${leadId}/create-project/`, {
    client_email: clientEmail,
  });
  return response.data;
}
