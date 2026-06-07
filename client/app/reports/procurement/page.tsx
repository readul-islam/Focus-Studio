'use client';
import { PermissionGuard } from '@/components/PermissionGuard';

import React, { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import useFetch from '@/hooks/useFetch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ReportFilterBar } from '@/components/reports/ReportFilterBar';
import { KpiCard } from '@/components/reports/KpiCard';
import { useReportFilters, formatCurrency, getLastNMonths, getMonthKey } from '@/hooks/useReportFilters';
import { ShoppingCart, Clock, CheckCircle2, TrendingDown } from 'lucide-react';
import { ReportPageLayout } from '@/components/reports/ReportInsights';
import { ReportPageHeader } from '@/components/reports/ReportPageHeader';
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const C = '£';

function ProcurementPageContent() {
  const t = useTranslations('reportsProcurementPage');
  const tr = useTranslations('reportsFinancePage');
  const { period, setPeriod, setCustomRange, customRange, startDate, endDate } = useReportFilters('year');
  const { data: financeRaw, isLoading } = useFetch('/finance/studio-finance/');
  const finance = financeRaw as any;

  const pos = useMemo(() => finance?.purchase_orders || [], [finance]);
  const invoices = useMemo(() => finance?.invoices || [], [finance]);
  const periodPOs = useMemo(() => pos.filter((p: any) => p.date && p.date >= startDate && p.date <= endDate), [pos, startDate, endDate]);
  const periodInvoices = useMemo(() => invoices.filter((i: any) => i.date && i.date >= startDate && i.date <= endDate), [invoices, startDate, endDate]);

  const getSupplierName = (po: any): string => {
    if (po.supplier_name && typeof po.supplier_name === 'string') return po.supplier_name;
    if (po.supplier) {
      if (typeof po.supplier === 'string') return po.supplier;
      if (typeof po.supplier === 'object') return po.supplier.company_name || `${po.supplier.name || ''} ${po.supplier.surname || ''}`.trim() || 'Unknown';
    }
    return 'Unknown';
  };

  const getProjectName = (po: any): string => {
    if (po.project_name && typeof po.project_name === 'string') return po.project_name;
    if (po.project) {
      if (typeof po.project === 'string') return po.project;
      if (typeof po.project === 'object') return po.project.project_name || po.project.name || 'Unassigned';
    }
    return 'Unassigned';
  };

  const totalSpend = useMemo(() => periodPOs.reduce((s: number, p: any) => s + (parseFloat(p.total_amount) || 0), 0), [periodPOs]);
  const paidPOs = useMemo(() => periodPOs.filter((p: any) => p.status === 'PD'), [periodPOs]);
  const paidAmount = useMemo(() => paidPOs.reduce((s: number, p: any) => s + (parseFloat(p.total_amount) || 0), 0), [paidPOs]);
  const unpaidPOs = useMemo(() => periodPOs.filter((p: any) => p.status !== 'PD' && p.status !== 'VO'), [periodPOs]);
  const unpaidAmount = useMemo(() => unpaidPOs.reduce((s: number, p: any) => s + (parseFloat(p.total_amount) || 0), 0), [unpaidPOs]);

  // Monthly spend vs revenue → margin %
  const months12 = useMemo(() => getLastNMonths(12), []);
  const monthlyData = useMemo(() => {
    const rev: Record<string, number> = {};
    const cost: Record<string, number> = {};
    months12.forEach(m => { rev[m.key] = 0; cost[m.key] = 0; });
    invoices.forEach((i: any) => { const k = getMonthKey(i.date); if (k && rev[k] !== undefined) rev[k] += parseFloat(i.total_amount) || 0; });
    pos.forEach((p: any) => { const k = getMonthKey(p.date); if (k && cost[k] !== undefined) cost[k] += parseFloat(p.total_amount) || 0; });
    return months12.map(m => {
      const r = rev[m.key], c = cost[m.key];
      const margin = r > 0 ? parseFloat(((r - c) / r * 100).toFixed(1)) : 0;
      return { month: m.label, Spend: Math.round(c), Revenue: Math.round(r), margin };
    });
  }, [invoices, pos, months12]);

  // Supplier breakdown with margin
  const supplierData = useMemo(() => {
    const spendMap: Record<string, { name: string; count: number; spend: number; revenue: number }> = {};
    periodPOs.forEach((po: any) => {
      const name = getSupplierName(po);
      if (!spendMap[name]) spendMap[name] = { name, count: 0, spend: 0, revenue: 0 };
      spendMap[name].count++;
      spendMap[name].spend += parseFloat(po.total_amount) || 0;
    });
    // Attribute invoice revenue to same project→supplier is hard without joins, so just show spend + % of total
    return Object.values(spendMap).sort((a, b) => b.spend - a.spend);
  }, [periodPOs]);

  // Project breakdown with margin
  const projectData = useMemo(() => {
    const map: Record<string, { name: string; spend: number; revenue: number }> = {};
    periodPOs.forEach((po: any) => {
      const k = getProjectName(po);
      if (!map[k]) map[k] = { name: k, spend: 0, revenue: 0 };
      map[k].spend += parseFloat(po.total_amount) || 0;
    });
    periodInvoices.forEach((i: any) => {
      const k = (typeof i.project === 'object' ? i.project?.project_name : i.project_name) || 'Unassigned';
      if (!map[k]) map[k] = { name: k, spend: 0, revenue: 0 };
      map[k].revenue += parseFloat(i.total_amount) || 0;
    });
    return Object.values(map)
      .map(r => ({ ...r, margin: r.revenue > 0 ? parseFloat(((r.revenue - r.spend) / r.revenue * 100).toFixed(1)) : null }))
      .sort((a, b) => b.spend - a.spend);
  }, [periodPOs, periodInvoices]);

  const chartConfig = { Spend: { label: 'PO Spend', color: '#c4a882' }, Revenue: { label: 'Revenue', color: '#748971' } };

  return (
    <ReportPageLayout>
      <div className="report-print-area  space-y-6">

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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Skeleton className="h-64 rounded-xl" />
              <Skeleton className="h-64 rounded-xl" />
            </div>
          </>
        ) : <>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <KpiCard label={t('totalPoSpend')} value={formatCurrency(totalSpend, C)} sub={tr('purchaseOrdersCount', { count: periodPOs.length })} icon={ShoppingCart} />
          <KpiCard label={t('paid')} value={formatCurrency(paidAmount, C)} sub={t('paidCount', { count: paidPOs.length })} icon={CheckCircle2} />
          <KpiCard label={t('outstanding')} value={formatCurrency(unpaidAmount, C)} sub={t('unpaidCount', { count: unpaidPOs.length })} icon={Clock} alert={unpaidPOs.length > 0} />
          <KpiCard label={t('avgPoValue')} value={formatCurrency(periodPOs.length > 0 ? totalSpend / periodPOs.length : 0, C)} sub={t('perPo')} icon={TrendingDown} />
        </div>

        {/* Monthly Spend vs Revenue */}
        <Card className="bg-white border-gray-200 rounded-xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-900">Monthly Spend vs Revenue — Last 12 Months</CardTitle>
            <p className="text-sm text-gray-500">PO spend vs invoiced revenue by month</p>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <BarChart data={monthlyData} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} tickMargin={8} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `£${(v / 1000).toFixed(0)}k`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="Revenue" fill="var(--color-Revenue)" radius={[3, 3, 0, 0]} maxBarSize={24} />
                  <Bar dataKey="Spend" fill="var(--color-Spend)" radius={[3, 3, 0, 0]} maxBarSize={24} />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* Supplier & Project breakdowns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* By Supplier */}
          <Card className="bg-white border-gray-200 rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-gray-900">{t('bySupplier')}</CardTitle>
              <p className="text-sm text-gray-500">{t('bySupplierSub')}</p>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="bg-white border-b border-gray-200">
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-2.5">{t('supplier')}</th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-2.5">{t('pos')}</th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-2.5">{t('spend')}</th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-2.5">% of Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {supplierData.length === 0 ? (
                    <tr><td colSpan={4} className="text-center text-gray-500 py-8 text-sm">No supplier data for this period.</td></tr>
                  ) : supplierData.map((s, i) => (
                    <tr key={i} className="hover:bg-stone-50">
                      <td className="px-4 py-2.5 text-gray-900 font-medium">{s.name}</td>
                      <td className="px-4 py-2.5 text-right text-gray-500">{s.count}</td>
                      <td className="px-4 py-2.5 text-right font-medium text-gray-900 tabular-nums">{formatCurrency(s.spend, C)}</td>
                      <td className="px-4 py-2.5 text-right text-gray-500 tabular-nums">
                        {totalSpend > 0 ? `${((s.spend / totalSpend) * 100).toFixed(1)}%` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* By Project — with margin */}
          <Card className="bg-white border-gray-200 rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-gray-900">{t('byProject')}</CardTitle>
              <p className="text-sm text-gray-500">{t('byProjectSub')}</p>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="bg-white border-b border-gray-200">
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-2.5">{t('project')}</th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-2.5">{t('spend')}</th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-2.5">{t('revenue')}</th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-2.5">{t('margin')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {projectData.length === 0 ? (
                    <tr><td colSpan={4} className="text-center text-gray-500 py-8 text-sm">No project data for this period.</td></tr>
                  ) : projectData.map((p, i) => (
                    <tr key={i} className="hover:bg-stone-50">
                      <td className="px-4 py-2.5 text-gray-900 font-medium">{p.name}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-gray-600">{formatCurrency(p.spend, C)}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-gray-600">{p.revenue > 0 ? formatCurrency(p.revenue, C) : '—'}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums font-medium">
                        {p.margin !== null ? (
                          <span className={p.margin >= 20 ? 'text-emerald-600' : p.margin >= 0 ? 'text-amber-600' : 'text-red-600'}>
                            {p.margin.toFixed(1)}%
                          </span>
                        ) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

        </div>
        </>}
      </div>
    </ReportPageLayout>
  );
}
export default function ProcurementPage() {
  return (
    <PermissionGuard permission="reports.view" redirectTo="/">
      <ProcurementPageContent />
    </PermissionGuard>
  );
}