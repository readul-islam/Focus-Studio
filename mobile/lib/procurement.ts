import type { Href } from 'expo-router';
import { colors } from '@/constants/theme';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/format';

export type ProcurementStatusFilter = 'all' | 'action' | 'ordered' | 'delivered';

export type ProcurementProductImage = {
  image?: string | null;
  is_primary?: boolean;
};

export type ProcurementProduct = {
  id?: number;
  name?: string | null;
  images?: ProcurementProductImage[];
};

export type ProcurementSupplier = {
  name?: string | null;
  surname?: string | null;
  company_name?: string | null;
};

export type ProcurementRoom = {
  id?: number;
  name?: string | null;
};

export type ProcurementItem = {
  id: number;
  status?: string | null;
  logistic_status?: string | null;
  client_approval?: string | null;
  quantity?: number | null;
  unit_price?: string | number | null;
  lead_time?: string | null;
  ETA?: string | null;
  order_date?: string | null;
  display_po?: string | null;
  display_invoice?: string | null;
  po?: number | null;
  invoice?: number | null;
  product?: ProcurementProduct | null;
  supplier?: ProcurementSupplier | null;
  room?: ProcurementRoom | null;
};

const STATUS_LABELS: Record<string, string> = {
  QT: 'Quoting',
  IR: 'Internal review',
  IA: 'Internally approved',
  OS: 'Out of stock',
  CR: 'Client review',
  ORD: 'Ordered',
  PD: 'Payment due',
  IT: 'In transit',
  INS: 'Installed',
  DEL: 'Delivered',
};

const LOGISTICS_LABELS: Record<string, string> = {
  NO: 'Not ordered',
  IT: 'In transit',
  DD: 'Delivered',
};

export function procurementStatusLabel(status?: string | null): string {
  if (!status) return '—';
  return STATUS_LABELS[status] ?? status;
}

export function procurementLogisticsLabel(status?: string | null): string {
  if (!status) return '—';
  return LOGISTICS_LABELS[status] ?? status;
}

export function procurementProductName(item: ProcurementItem): string {
  return item.product?.name?.trim() || 'Unnamed item';
}

export function procurementSupplierName(item: ProcurementItem): string {
  const supplier = item.supplier;
  if (!supplier) return 'No supplier';
  return supplier.company_name || [supplier.name, supplier.surname].filter(Boolean).join(' ') || 'No supplier';
}

export function procurementProductImageUrl(item: ProcurementItem): string | null {
  const images = item.product?.images ?? [];
  const primary = images.find(image => image.is_primary && image.image);
  return primary?.image ?? images.find(image => image.image)?.image ?? null;
}

export function procurementLineTotal(item: ProcurementItem): number | null {
  if (item.quantity == null || item.unit_price == null) return null;
  const unit = typeof item.unit_price === 'string' ? parseFloat(item.unit_price) : item.unit_price;
  if (Number.isNaN(unit)) return null;
  return item.quantity * unit;
}

export function procurementStatusStyle(status?: string | null): {
  label: string;
  color: string;
  backgroundColor: string;
} {
  switch (status) {
    case 'DEL':
    case 'INS':
      return { label: procurementStatusLabel(status), color: colors.success, backgroundColor: '#ECFDF3' };
    case 'IT':
    case 'ORD':
      return { label: procurementStatusLabel(status), color: '#2563EB', backgroundColor: '#EFF6FF' };
    case 'PD':
    case 'OS':
      return { label: procurementStatusLabel(status), color: colors.danger, backgroundColor: '#FEF2F2' };
    case 'CR':
    case 'IR':
      return { label: procurementStatusLabel(status), color: colors.clay, backgroundColor: '#FFF7ED' };
    default:
      return {
        label: procurementStatusLabel(status),
        color: colors.textSecondary,
        backgroundColor: colors.surfaceElevated,
      };
  }
}

export function procurementNeedsAction(item: ProcurementItem): boolean {
  return (
    item.status === 'PD' ||
    item.status === 'OS' ||
    item.logistic_status === 'IT' ||
    item.client_approval === 'RVW' ||
    (!item.po && item.status !== 'DEL' && item.status !== 'INS')
  );
}

export function filterProcurementItems(
  items: ProcurementItem[],
  statusFilter: ProcurementStatusFilter,
  search: string,
): ProcurementItem[] {
  const query = search.trim().toLowerCase();

  return items.filter(item => {
    if (statusFilter === 'action' && !procurementNeedsAction(item)) return false;
    if (statusFilter === 'ordered' && !['ORD', 'IT', 'PD'].includes(item.status ?? '')) return false;
    if (statusFilter === 'delivered' && !['DEL', 'INS'].includes(item.status ?? '')) return false;

    if (!query) return true;

    const haystack = [
      procurementProductName(item),
      procurementSupplierName(item),
      item.room?.name,
      item.display_po,
      item.display_invoice,
      procurementStatusLabel(item.status),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(query);
  });
}

export function procurementSummary(items: ProcurementItem[]) {
  const total = items.length;
  const action = items.filter(procurementNeedsAction).length;
  const totalCost = items.reduce((sum, item) => sum + (procurementLineTotal(item) ?? 0), 0);
  return { total, action, totalCost };
}

export function procurementEtaLabel(item: ProcurementItem): string | undefined {
  if (item.ETA) return `ETA ${formatDate(item.ETA)}`;
  if (item.order_date) return `Ordered ${item.order_date}`;
  if (item.lead_time) return `Lead time ${item.lead_time}`;
  return undefined;
}

export async function fetchProjectProcurements(projectId: string): Promise<ProcurementItem[]> {
  const response = await api.get<ProcurementItem[]>('/projects/project-procurements/', {
    params: { project_id: projectId },
  });
  return response.data;
}

export function procurementPoRoute(poId: number): Href {
  return `/finance/purchase-order/${poId}` as Href;
}
