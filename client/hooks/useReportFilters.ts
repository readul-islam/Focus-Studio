'use client';

import { useState, useMemo } from 'react';

export type QuickPeriod = 'week' | 'month' | 'quarter' | 'year' | 'custom';

export interface DateRange {
  from: Date;
  to: Date;
}

export function getDateRange(period: QuickPeriod, custom?: DateRange): DateRange {
  const now = new Date();
  switch (period) {
    case 'week': {
      const day = now.getDay();
      const mon = new Date(now);
      mon.setDate(now.getDate() - ((day + 6) % 7));
      mon.setHours(0, 0, 0, 0);
      return { from: mon, to: now };
    }
    case 'month':
      return {
        from: new Date(now.getFullYear(), now.getMonth(), 1),
        to: new Date(now.getFullYear(), now.getMonth() + 1, 0),
      };
    case 'quarter': {
      const q = Math.floor(now.getMonth() / 3);
      return {
        from: new Date(now.getFullYear(), q * 3, 1),
        to: new Date(now.getFullYear(), q * 3 + 3, 0),
      };
    }
    case 'year':
      return {
        from: new Date(now.getFullYear(), 0, 1),
        to: new Date(now.getFullYear(), 11, 31),
      };
    case 'custom':
      return custom || { from: new Date(now.getFullYear(), now.getMonth(), 1), to: now };
  }
}

export const QUICK_PERIOD_KEYS: QuickPeriod[] = ['week', 'month', 'quarter', 'year', 'custom'];

/** @deprecated Use QUICK_PERIOD_KEYS with reportsCommon translations in UI */
export const QUICK_PERIODS: { key: QuickPeriod; label: string }[] = [
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'quarter', label: 'This Quarter' },
  { key: 'year', label: 'This Year' },
  { key: 'custom', label: 'Custom' },
];

export function useReportFilters(defaultPeriod: QuickPeriod = 'month') {
  const [period, setPeriod] = useState<QuickPeriod>(defaultPeriod);
  const [customRange, setCustomRange] = useState<DateRange | undefined>();

  const dateRange = useMemo(() => getDateRange(period, customRange), [period, customRange]);

  const startDate = dateRange.from.toISOString().split('T')[0];
  const endDate = dateRange.to.toISOString().split('T')[0];

  return { period, setPeriod, customRange, setCustomRange, dateRange, startDate, endDate };
}

// Get last N months for chart data bucketing
export function getLastNMonths(n: number): { key: string; label: string }[] {
  const months = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
    months.push({ key, label });
  }
  return months;
}

export function getMonthKey(dateStr?: string): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function formatCurrency(amount: number | null | undefined, symbol = '£'): string {
  // Handle NaN, null, undefined
  if (amount == null || isNaN(amount)) {
    return `${symbol}0.00`;
  }
  
  // Format as £X,XXX.XX with proper comma separators and 2 decimal places
  return `${symbol}${amount.toLocaleString('en-GB', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
}

export function formatHours(seconds: number): string {
  const h = seconds / 3600;
  if (h >= 1000) return `${(h / 1000).toFixed(1)}k hrs`;
  return `${h % 1 === 0 ? h.toFixed(0) : h.toFixed(1)} hrs`;
}
