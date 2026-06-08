export type ReportPeriod = 'week' | 'month' | 'year';

export function getReportDateRange(period: ReportPeriod): { startDate: string; endDate: string } {
  const end = new Date();
  const start = new Date(end);

  if (period === 'week') {
    start.setDate(end.getDate() - 7);
  } else if (period === 'month') {
    start.setMonth(end.getMonth() - 1);
  } else {
    start.setFullYear(end.getFullYear() - 1);
  }

  const format = (date: Date) => date.toISOString().split('T')[0]!;
  return { startDate: format(start), endDate: format(end) };
}

export function formatHours(seconds?: number | null): string {
  const total = Math.max(0, Number(seconds ?? 0));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

export function budgetBurnPercent(totalSeconds: number, budgetHours?: number | null): number | null {
  if (!budgetHours || budgetHours <= 0) return null;
  return Math.round((totalSeconds / 3600 / budgetHours) * 100);
}

export function logisticStatusLabel(status?: string | null): string {
  switch (status) {
    case 'IT':
      return 'In transit';
    case 'SH':
      return 'Shipped';
    case 'DL':
      return 'Delivered';
    default:
      return status ?? '—';
  }
}
