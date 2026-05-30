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
import { TrendingUp, TrendingDown, DollarSign, Percent } from 'lucide-react';
import { ReportPageLayout } from '@/components/reports/ReportInsights';
import { ReportPageHeader } from '@/components/reports/ReportPageHeader';
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine, Cell } from 'recharts';

const C = '£';

function RevenuePLPageContent() {
  const t = useTranslations('reportsRevenuePage');
  const tr = useTranslations('reportsCommon');
  const { period, setPeriod, setCustomRange, customRange, startDate, endDate } = useReportFilters('year');
  const { data: financeRaw, isLoading: l1 } = useFetch('/finance/studio-finance/');
  const { data: teamRaw, isLoading: l2 } = useFetch(`/reports/users-time-report/?start_date=${startDate}&end_date=${endDate}`);
  const isLoading = l1 || l2;

  const finance = financeRaw as any;
  const team = teamRaw as any;
  const invoices = useMemo(() => finance?.invoices || [], [finance]);
  const pos = useMemo(() => finance?.purchase_orders || [], [finance]);

  const periodInvoices = useMemo(() => invoices.filter((i: any) => i.date && i.date >= startDate && i.date <= endDate), [invoices, startDate, endDate]);
  const periodPOs = useMemo(() => pos.filter((p: any) => p.date && p.date >= startDate && p.date <= endDate), [pos, startDate, endDate]);

  const revenue = useMemo(() => periodInvoices.reduce((s: number, i: any) => s + (Number(i.total_amount) || 0), 0), [periodInvoices]);
  const poSpend = useMemo(() => periodPOs.reduce((s: number, p: any) => s + (Number(p.total_amount) || 0), 0), [periodPOs]);
  const staffCost = team?.studio_total_cost || 0;
  const totalCosts = poSpend + staffCost;
  const net = revenue - totalCosts;
  const margin = revenue > 0 ? (net / revenue) * 100 : 0;

  const months12 = getLastNMonths(12);
  const monthlyData = useMemo(() => {
    const rev: Record<string, number> = {};
    const cost: Record<string, number> = {};
    months12.forEach(m => { rev[m.key] = 0; cost[m.key] = 0; });
    invoices.forEach((i: any) => { const k = getMonthKey(i.date); if (k && rev[k] !== undefined) rev[k] += Number(i.total_amount) || 0; });
    pos.forEach((p: any) => { const k = getMonthKey(p.date); if (k && cost[k] !== undefined) cost[k] += Number(p.total_amount) || 0; });
    return months12.map(m => {
      const r = rev[m.key], c = cost[m.key];
      return { name: m.label, Revenue: Math.round(r), Costs: Math.round(c), 'Margin %': r > 0 ? parseFloat(((r - c) / r * 100).toFixed(1)) : 0 };
    });
  }, [invoices, pos, months12]);

  const projectPL = useMemo(() => {
    const map: Record<string, { name: string; revenue: number; costs: number }> = {};
    periodInvoices.forEach((i: any) => { const k = i.project?.project_name || 'Unassigned'; if (!map[k]) map[k] = { name: k, revenue: 0, costs: 0 }; map[k].revenue += Number(i.total_amount) || 0; });
    periodPOs.forEach((p: any) => { const k = p.project?.project_name || 'Unassigned'; if (!map[k]) map[k] = { name: k, revenue: 0, costs: 0 }; map[k].costs += Number(p.total_amount) || 0; });
    return Object.values(map).map(r => ({ ...r, net: r.revenue - r.costs, margin: r.revenue > 0 ? (r.revenue - r.costs) / r.revenue * 100 : 0 })).sort((a, b) => b.net - a.net);
  }, [periodInvoices, periodPOs]);

  return (
    <ReportPageLayout>
      <div className="report-print-area max-w-7xl mx-auto space-y-6">

        <ReportPageHeader
          title={t('title')}
          subtitle={t('subtitle')}
          printTitle={t('title')}
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

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <KpiCard label={t('revenue')} value={formatCurrency(revenue, C)} sub={tr('invoicesCount', { count: periodInvoices.length })} icon={TrendingUp} />
          <KpiCard label={t('totalCosts')} value={formatCurrency(totalCosts, C)} sub={t('costsSub')} icon={TrendingDown} />
          <KpiCard label={t('netProfit')} value={formatCurrency(net, C)} sub={net >= 0 ? t('profitable') : t('lossMaking')} icon={DollarSign} alert={net < 0} />
          <KpiCard label={t('margin')} value={`${margin.toFixed(1)}%`} sub={t('marginSub')} icon={Percent} alert={margin < 0} />
        </div>

        {/* Trend chart */}
        <Card className="p-6 rounded-xl shadow-sm">
          <h3 className="font-semibold text-neutral-900 mb-1">Revenue, Costs & Margin — Last 12 Months</h3>
          <p className="text-xs text-neutral-500 mb-4">Bars = absolute values (left axis) · Line = margin % (right axis)</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyData} margin={{ top: 4, right: 40, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={v => `${C}${(v / 1000).toFixed(0)}k`} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={v => `${v}%`} domain={[-50, 100]} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: 12 }} formatter={(v: number, name: string) => name === 'Margin %' ? [`${v}%`, name] : [`${C}${v.toLocaleString('en-GB')}`, name]} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <ReferenceLine yAxisId="right" y={0} stroke="#d1d5db" strokeDasharray="4 2" />
                <Bar yAxisId="left" dataKey="Revenue" fill="#748971" radius={[3, 3, 0, 0]} maxBarSize={28} />
                <Bar yAxisId="left" dataKey="Costs" fill="#c4a882" radius={[3, 3, 0, 0]} maxBarSize={28} />
                <Bar yAxisId="right" dataKey="Margin %" radius={[3, 3, 0, 0]} maxBarSize={16}>
                  {monthlyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry['Margin %'] >= 20 ? '#10b981' : entry['Margin %'] >= 0 ? '#f59e0b' : '#ef4444'} />
                  ))}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Per-project P&L */}
        <Card className="p-6 rounded-xl shadow-sm">
          <h3 className="font-semibold text-neutral-900 mb-1">Per-Project P&L</h3>
          <p className="text-xs text-neutral-500 mb-4">Revenue vs. PO costs per project in selected period</p>
          {projectPL.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-8">{t('noDataPeriod')}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-neutral-100">
                  <tr>
                    {['Project', 'Revenue', 'Costs', 'Net', 'Margin', ''].map((h, i) => (
                      <th key={i} className={`pb-3 text-sm font-medium text-gray-500 ${i === 0 ? 'text-left' : 'text-right'} ${i === 5 ? 'text-left pl-4' : ''}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {projectPL.map(row => (
                    <tr key={row.name} className="hover:bg-stone-50 transition-colors">
                      <td className="py-3 font-medium text-neutral-800">{row.name}</td>
                      <td className="py-3 text-right text-neutral-600 tabular-nums">{formatCurrency(row.revenue, C)}</td>
                      <td className="py-3 text-right text-neutral-600 tabular-nums">{formatCurrency(row.costs, C)}</td>
                      <td className={`py-3 text-right font-semibold tabular-nums ${row.net >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{row.net >= 0 ? '+' : ''}{formatCurrency(row.net, C)}</td>
                      <td className="py-3 text-right text-neutral-500 tabular-nums">{row.revenue > 0 ? `${row.margin.toFixed(1)}%` : '—'}</td>
                      <td className="py-3 pl-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-white rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${row.margin >= 20 ? 'bg-emerald-500' : row.margin >= 0 ? 'bg-amber-400' : 'bg-red-500'}`} style={{ width: `${Math.min(Math.abs(row.margin), 100)}%` }} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <p className="text-xs text-neutral-400">Staff cost calculated from hours logged × pay_per_hour in selected period. Connect Xero for full P&L including bank transactions.</p>
        </>}
      </div>
    </ReportPageLayout>
  );
}

export default function RevenuePLPage() {
  return (
    <PermissionGuard permission="reports.view" redirectTo="/">
      <RevenuePLPageContent />
    </PermissionGuard>
  );
}