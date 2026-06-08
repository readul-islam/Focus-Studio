import type { FinanceDocStatus, FinanceInvoice, FinancePurchaseOrder } from '@focuspilot/shared';
import { colors } from '@/constants/theme';
import { api } from '@/lib/api';

export type FinanceDocumentKind = 'invoice' | 'purchase_order';

export type FinanceTypeFilter = 'all' | 'invoices' | 'purchase_orders';
export type FinanceStatusFilter = 'all' | 'DFT' | 'SNT' | 'APR' | 'PD' | 'OVD';

export type FinanceListItem =
  | { kind: 'invoice'; data: FinanceInvoice }
  | { kind: 'purchase_order'; data: FinancePurchaseOrder };

export function financeStatusLabel(status?: string | null): string {
  switch (status) {
    case 'DFT':
      return 'Draft';
    case 'SNT':
      return 'Sent';
    case 'APR':
      return 'Approved';
    case 'PD':
      return 'Paid';
    case 'OVD':
      return 'Overdue';
    default:
      return status ?? '—';
  }
}

export function financeStatusStyle(status?: string | null): { label: string; color: string; backgroundColor: string } {
  switch (status) {
    case 'DFT':
      return { label: 'Draft', color: colors.textSecondary, backgroundColor: colors.surfaceElevated };
    case 'SNT':
      return { label: 'Sent', color: '#2563EB', backgroundColor: '#EFF6FF' };
    case 'APR':
      return { label: 'Approved', color: '#7C3AED', backgroundColor: '#F3E8FF' };
    case 'PD':
      return { label: 'Paid', color: colors.success, backgroundColor: '#ECFDF3' };
    case 'OVD':
      return { label: 'Overdue', color: colors.danger, backgroundColor: '#FEF2F2' };
    default:
      return { label: financeStatusLabel(status), color: colors.textSecondary, backgroundColor: colors.surfaceElevated };
  }
}

export function invoiceDisplayId(invoice: FinanceInvoice): string {
  return invoice.display_invoice ?? `INV-${String(invoice.id).padStart(3, '0')}`;
}

export function poDisplayId(po: FinancePurchaseOrder): string {
  return po.display_po ?? `PO-${String(po.id).padStart(3, '0')}`;
}

export function financePartyName(party?: { name?: string | null; company_name?: string | null } | null): string {
  if (!party) return '—';
  return party.company_name || party.name || '—';
}

export function projectName(project?: { project_name?: string; name?: string } | null): string | undefined {
  return project?.project_name ?? project?.name;
}

export function buildFinanceList(
  invoices: FinanceInvoice[],
  purchaseOrders: FinancePurchaseOrder[],
  typeFilter: FinanceTypeFilter,
  statusFilter: FinanceStatusFilter,
  search: string,
): FinanceListItem[] {
  const query = search.trim().toLowerCase();
  const items: FinanceListItem[] = [];

  if (typeFilter === 'all' || typeFilter === 'invoices') {
    for (const invoice of invoices) {
      if (statusFilter !== 'all' && invoice.status !== statusFilter) continue;
      if (query) {
        const haystack = [
          invoiceDisplayId(invoice),
          financePartyName(invoice.client),
          projectName(invoice.project),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(query)) continue;
      }
      items.push({ kind: 'invoice', data: invoice });
    }
  }

  if (typeFilter === 'all' || typeFilter === 'purchase_orders') {
    for (const po of purchaseOrders) {
      if (statusFilter !== 'all' && po.status !== statusFilter) continue;
      if (statusFilter === 'OVD') continue;
      if (query) {
        const haystack = [
          poDisplayId(po),
          financePartyName(po.supplier),
          projectName(po.project),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(query)) continue;
      }
      items.push({ kind: 'purchase_order', data: po });
    }
  }

  return items.sort((a, b) => {
    const dateA = a.kind === 'invoice' ? a.data.date : a.data.date;
    const dateB = b.kind === 'invoice' ? b.data.date : b.data.date;
    return String(dateB ?? '').localeCompare(String(dateA ?? ''));
  });
}

export function canSendInvoice(invoice: FinanceInvoice): boolean {
  return invoice.status !== 'SNT' && invoice.status !== 'PD';
}

export type FinanceStatusAction = {
  status: FinanceDocStatus;
  label: string;
  primary?: boolean;
};

export function getFinanceStatusActions(
  kind: FinanceDocumentKind,
  status?: string | null,
): FinanceStatusAction[] {
  const current = status ?? 'DFT';

  if (kind === 'purchase_order') {
    switch (current) {
      case 'DFT':
        return [
          { status: 'SNT', label: 'Mark sent', primary: true },
          { status: 'APR', label: 'Approve' },
        ];
      case 'SNT':
        return [{ status: 'APR', label: 'Approve', primary: true }];
      case 'APR':
        return [{ status: 'PD', label: 'Mark paid', primary: true }];
      default:
        return [];
    }
  }

  switch (current) {
    case 'DFT':
      return [{ status: 'APR', label: 'Approve', primary: true }];
    case 'SNT':
      return [
        { status: 'APR', label: 'Approve', primary: true },
        { status: 'PD', label: 'Mark paid' },
      ];
    case 'APR':
      return [{ status: 'PD', label: 'Mark paid', primary: true }];
    case 'OVD':
      return [{ status: 'PD', label: 'Mark paid', primary: true }];
    default:
      return [];
  }
}

export async function updateFinanceDocumentStatus(
  kind: FinanceDocumentKind,
  documentId: number,
  status: FinanceDocStatus,
): Promise<void> {
  const path =
    kind === 'invoice'
      ? `/finance/invoices/${documentId}/`
      : `/finance/purchase-orders/${documentId}/`;
  await api.patch(path, { status });
}

export async function sendInvoice(invoiceId: number): Promise<string> {
  const response = await api.post<{ message?: string }>(`/finance/invoices/${invoiceId}/send-invoice/`, {
    id: invoiceId,
  });
  return response.data.message ?? 'Invoice marked as sent.';
}

export function financeSummary(invoices: FinanceInvoice[], purchaseOrders: FinancePurchaseOrder[]) {
  const outstanding = invoices
    .filter(inv => inv.status === 'SNT' || inv.status === 'OVD')
    .reduce((sum, inv) => sum + Number(inv.total_amount ?? 0), 0);
  const paidInvoices = invoices.filter(inv => inv.status === 'PD').length;
  const openPos = purchaseOrders.filter(po => po.status !== 'PD').length;

  return {
    invoiceCount: invoices.length,
    poCount: purchaseOrders.length,
    outstanding,
    paidInvoices,
    openPos,
  };
}
