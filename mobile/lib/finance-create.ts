import type { AppUser } from '@focuspilot/shared';
import { api } from '@/lib/api';

function todayIso(): string {
  return new Date().toISOString().split('T')[0];
}

function dueInDaysIso(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

export async function createDraftInvoice(user: AppUser, projectId?: number): Promise<number> {
  const response = await api.post<{ id: number }>('/finance/invoices/', {
    status: 'DFT',
    studio: user.studio?.id ?? null,
    project: projectId ?? null,
    currency: user.studio?.default_currency ?? 'GBP',
    date: todayIso(),
    due_date: dueInDaysIso(30),
    line_items: [],
  });
  return response.data.id;
}

export async function createDraftPurchaseOrder(user: AppUser, projectId?: number): Promise<number> {
  const response = await api.post<{ id: number }>('/finance/purchase-orders/', {
    status: 'DFT',
    studio: user.studio?.id ?? null,
    project: projectId ?? null,
    currency: user.studio?.default_currency ?? 'GBP',
    line_items: [],
  });
  return response.data.id;
}
