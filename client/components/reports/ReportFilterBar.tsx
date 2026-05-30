'use client';

import React from 'react';
import { QUICK_PERIOD_KEYS, QuickPeriod } from '@/hooks/useReportFilters';
import { Input } from '@/components/ui/input';
import { useTranslations } from 'next-intl';

interface ReportFilterBarProps {
  period: QuickPeriod;
  onPeriodChange: (p: QuickPeriod) => void;
  onCustomRange?: (range: { from: Date; to: Date }) => void;
  customFrom?: Date;
  customTo?: Date;
  extra?: React.ReactNode;
}

function toDateStr(d?: Date): string {
  if (!d) return '';
  return d.toISOString().split('T')[0];
}

export function ReportFilterBar({
  period,
  onPeriodChange,
  onCustomRange,
  customFrom,
  customTo,
  extra,
}: ReportFilterBarProps) {
  const t = useTranslations('reportsCommon');
  const periodLabels: Record<QuickPeriod, string> = {
    week: t('periodWeek'),
    month: t('periodMonth'),
    quarter: t('periodQuarter'),
    year: t('periodYear'),
    custom: t('periodCustom'),
  };

  return (
    <div className="no-print flex flex-wrap items-center gap-3">
      {/* Period toggle */}
      <div className="flex items-center gap-1 bg-stone-100 rounded-lg p-1">
        {QUICK_PERIOD_KEYS.map(key => (
          <button
            key={key}
            onClick={() => onPeriodChange(key)}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              period === key
                ? 'bg-white text-neutral-900 shadow-sm font-medium'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            {periodLabels[key]}
          </button>
        ))}
      </div>

      {/* Inline date inputs when Custom is selected */}
      {period === 'custom' && onCustomRange && (
        <div className="flex items-center gap-2">
          <Input
            type="date"
            className="w-[140px] h-9 text-sm"
            value={toDateStr(customFrom)}
            onChange={e => {
              const from = new Date(e.target.value);
              const to = customTo || new Date();
              if (!isNaN(from.getTime())) onCustomRange({ from, to });
            }}
          />
          <span className="text-sm text-gray-400">→</span>
          <Input
            type="date"
            className="w-[140px] h-9 text-sm"
            value={toDateStr(customTo)}
            onChange={e => {
              const to = new Date(e.target.value);
              const from = customFrom || new Date(new Date().getFullYear(), 0, 1);
              if (!isNaN(to.getTime())) onCustomRange({ from, to });
            }}
          />
        </div>
      )}

      {extra}
    </div>
  );
}
