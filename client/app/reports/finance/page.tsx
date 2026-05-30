'use client';
import { PermissionGuard } from '@/components/PermissionGuard';

import React, { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import useFetch from '@/hooks/useFetch';
import { useReportFilters, formatCurrency, getLastNMonths, getMonthKey } from '@/hooks/useReportFilters';
import { ReportFilterBar } from '@/components/reports/ReportFilterBar';
import { KpiCard } from '@/components/reports/KpiCard';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, CheckCircle, AlertCircle, ShoppingCart } from 'lucide-react';
import { ReportPageLayout } from '@/components/reports/ReportInsights';
import { ReportPageHeader } from '@/components/reports/ReportPageHeader';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const C = '£';

function isOverdue(due?: string, status?: string) {
  if (status === 'PD') return false;
  return due ? new Date(due) < new Date() : false;
}

function FinancePageContent() {
  const t = useTranslations('reportsFinancePage');
  const tr = useTranslations('reportsCommon');
  const { period, setPeriod, setCustomRange, customRange, startDate, endDate } = useReportFilters('year');
  const { data: financeRaw, isLoading } = useFetch('/finance/studio-finance/');
  const finance = financeRaw as any;

  const invoices = useMemo(() => (finance?.invoices || []).map((i: any) => ({
    ...i, effectiveStatus: isOverdue(i.due_date, i.status) ? 'OVD' : (i.status || 'DFT'),
  })), [finance]);
  const pos = useMemo(() => finance?.purchase_orders || [], [finance]);

  const periodInvoices = useMemo(() => invoices.filter((i: any) => i.date && i.date >= startDate && i.date <= endDate), [invoices, startDate, endDate]);
  const periodPOs = useMemo(() => pos.filter((p: any) => p.date && p.date >= startDate && p.date <= endDate), [pos, startDate, endDate]);

  const revenue = useMemo(() => periodInvoices.reduce((s: number, i: any) => s + (parseFloat(i.total_amount) || 0), 0), [periodInvoices]);
  const collected = useMemo(() => periodInvoices.filter((i: any) => i.status === 'PD').reduce((s: number, i: any) => s + (parseFloat(i.total_amount) || 0), 0), [periodInvoices]);
  const outstanding = revenue - collected;
  const poSpend = useMemo(() => periodPOs.reduce((s: number, p: any) => s + (parseFloat(p.total_amount) || 0), 0), [periodPOs]);
  const overdueCount = useMemo(() => invoices.filter((i: any) => i.effectiveStatus === 'OVD').length, [invoices]);

  // Monthly revenue vs cost — last 12 months
  const months12 = getLastNMonths(12);
  const monthlyChart = useMemo(() => {
    const rev: Record<string, number> = {};
    const cost: Record<string, number> = {};
    months12.forEach(m => { rev[m.key] = 0; cost[m.key] = 0; });
    invoices.forEach((i: any) => { const k = getMonthKey(i.date); if (k && rev[k] !== undefined) rev[k] += parseFloat(i.total_amount) || 0; });
    pos.forEach((p: any) => { const k = getMonthKey(p.date); if (k && cost[k] !== undefined) cost[k] += parseFloat(p.total_amount) || 0; });
    return months12.map(m => ({ name: m.label, Revenue: Math.round(rev[m.key]), Costs: Math.round(cost[m.key]) }));
  }, [invoices, pos, months12]);

  // Invoice aging
  const aging = useMemo(() => {
    const now = new Date();
    const b = { current: 0, d30: 0, d60: 0, d90: 0 };
    invoices.filter((i: any) => i.status !== 'PD').forEach((i: any) => {
      if (!i.due_date) { b.current += parseFloat(i.total_amount) || 0; return; }
      const days = Math.floor((now.getTime() - new Date(i.due_date).getTime()) / 86400000);
      if (days <= 0) b.current += parseFloat(i.total_amount) || 0;
      else if (days <= 30) b.d30 += parseFloat(i.total_amount) || 0;
      else if (days <= 60) b.d60 += parseFloat(i.total_amount) || 0;
      else b.d90 += parseFloat(i.total_amount) || 0;
    });
    return b;
  }, [invoices]);

  // Revenue by project (top 6)
  const projectRevenue = useMemo(() => {
    const map: Record<string, { name: string; revenue: number }> = {};
    periodInvoices.forEach((i: any) => {
      const k = (typeof i.project === 'object' ? i.project?.project_name : i.project_name) || 'Unassigned';
      if (!map[k]) map[k] = { name: k, revenue: 0 };
      map[k].revenue += parseFloat(i.total_amount) || 0;
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 6);
  }, [periodInvoices]);

  const total = aging.current + aging.d30 + aging.d60 + aging.d90 || 1;

  return (
    <ReportPageLayout>
      <div className="report-print-area max-w-7xl mx-auto space-y-6">

        <ReportPageHeader
          title={t('title')}
          subtitle={t('subtitle')}
          printTitle={t('printTitle')}
        />

        <ReportFilterBar period={period} onPeriodChange={setPeriod} onCustomRange={setCustomRange} customFrom={customRange?.from} customTo={customRange?.to} />

        {isLoading ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
            </div>
            <Skeleton className="h-80 rounded-xl" />
            <Skeleton className="h-80 rounded-xl" />
          </>
        ) : <>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <KpiCard label={t('revenueInvoiced')} value={formatCurrency(revenue, C)} sub={tr('invoicesCount', { count: periodInvoices.length })} icon={TrendingUp} />
          <KpiCard label={t('collected')} value={formatCurrency(collected, C)} sub={revenue > 0 ? t('collectionRate', { percent: Math.round((collected / revenue) * 100) }) : '—'} icon={CheckCircle} />
          <KpiCard label={t('outstanding')} value={formatCurrency(outstanding, C)} sub={overdueCount > 0 ? t('overdueCount', { count: overdueCount }) : t('allCurrent')} icon={AlertCircle} alert={overdueCount > 0} />
          <KpiCard label={t('poSpend')} value={formatCurrency(poSpend, C)} sub={t('purchaseOrdersCount', { count: periodPOs.length })} icon={ShoppingCart} />
        </div>

        {/* Revenue vs Costs chart */}
        <Card className="p-6 rounded-xl shadow-sm">
          <h3 className="font-semibold text-neutral-900 mb-1">{t('revenueVsCosts')}</h3>
          <p className="text-xs text-neutral-500 mb-4">{t('revenueVsCostsSub')}</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChart} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={v => `${C}${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: 12 }} formatter={(v: number, name: string) => [`${C}${v.toLocaleString('en-GB')}`, name]} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Revenue" fill="#748971" radius={[3, 3, 0, 0]} maxBarSize={32} />
                <Bar dataKey="Costs" fill="#c4a882" radius={[3, 3, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Aging + Revenue by project */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Invoice aging */}
          <Card className="p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold text-neutral-900 mb-1">{t('agingTitle')}</h3>
            <p className="text-xs text-neutral-500 mb-5">{t('agingSubtitle')}</p>
            <div className="space-y-4">
              {[
                { label: 'Not yet due', amount: aging.current, color: '#748971', bg: '#f0f4f0' },
                { label: '1–30 days overdue', amount: aging.d30, color: '#f59e0b', bg: '#fef9ee' },
                { label: '31–60 days overdue', amount: aging.d60, color: '#f97316', bg: '#fff4ee' },
                { label: '60+ days overdue', amount: aging.d90, color: '#ef4444', bg: '#fef2f2' },
              ].map(row => (
                <div key={row.label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-neutral-600">{row.label}</span>
                    <span className="font-semibold text-neutral-900">{formatCurrency(row.amount, C)}</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ backgroundColor: row.bg }}>
                    <div className="h-full rounded-full transition-all" style={{ backgroundColor: row.color, width: `${(row.amount / total) * 100}%` }} />
                  </div>
                </div>
              ))}
              {total === 1 && <p className="text-sm text-neutral-400 text-center py-4">{t('noOutstanding')}</p>}
            </div>
          </Card>

          {/* Revenue by project */}
          <Card className="p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold text-neutral-900 mb-1">{t('revenueByProject')}</h3>
            <p className="text-xs text-neutral-500 mb-5">{t('revenueByProjectSub')}</p>
            <div className="space-y-4">
              {projectRevenue.length === 0 ? (
                <p className="text-sm text-neutral-400 text-center py-4">{t('noInvoicesPeriod')}</p>
              ) : projectRevenue.map((row, i) => {
                const pct = (row.revenue / (projectRevenue[0]?.revenue || 1)) * 100;
                return (
                  <div key={row.name}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-neutral-700 truncate max-w-[180px]" title={row.name}>{row.name}</span>
                      <span className="font-semibold text-neutral-900 tabular-nums">{formatCurrency(row.revenue, C)}</span>
                    </div>
                    <div className="h-1.5 bg-white rounded-full">
                      <div className="h-full bg-[#748971] rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
        </>}
      </div>
    </ReportPageLayout>
  );
}

export default function FinancePage() {
  return (
    <PermissionGuard permission="reports.view" redirectTo="/">
      <FinancePageContent />
    </PermissionGuard>
  );
}