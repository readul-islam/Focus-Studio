import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: string | number, currency = 'GBP'): string {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  if (Number.isNaN(numericValue)) return '—';
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numericValue);
}

export function formatDate(value?: string | null): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

const ORDER_STATUS_LABELS: Record<string, string> = {
  RQ: 'Requested',
  CF: 'Confirmed',
  SH: 'Shipped',
  DL: 'Delivered',
  CN: 'Cancelled',
};

export function orderStatusLabel(status: string): string {
  return ORDER_STATUS_LABELS[status] ?? status;
}

export function orderStatusClass(status: string): string {
  switch (status) {
    case 'RQ':
      return 'bg-amber-100 text-amber-800';
    case 'CF':
      return 'bg-blue-100 text-blue-800';
    case 'SH':
      return 'bg-violet-100 text-violet-800';
    case 'DL':
      return 'bg-emerald-100 text-emerald-800';
    case 'CN':
      return 'bg-neutral-100 text-neutral-600';
    default:
      return 'bg-neutral-100 text-neutral-700';
  }
}
