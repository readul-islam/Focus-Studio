'use client';
import { PermissionGuard } from '@/components/PermissionGuard';

import React, { useMemo } from 'react';
import useFetch from '@/hooks/useFetch';
import { useReportFilters, formatCurrency, formatHours, getLastNMonths, getMonthKey } from '@/hooks/useReportFilters';
import { ReportFilterBar } from '@/components/reports/ReportFilterBar';
import { KpiCard } from '@/components/reports/KpiCard';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Clock, DollarSign, AlertCircle, ArrowRight, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ReportPageLayout } from '@/components/reports/ReportInsights';
import { ReportPageHeader } from '@/components/reports/ReportPageHeader';

const C = '£';

function OverviewPageContent() {
  const { period, setPeriod, setCustomRange, customRange, startDate, endDate } = useReportFilters('month');

  // Previous period for comparison
  const getPreviousPeriod = (start: string, end: string) => {
    const startDay = new Date(start);
    const endDay = new Date(end);
    const duration = endDay.getTime() - startDay.getTime();
    
    const prevEnd = new Date(startDay.getTime() - 1);
    const prevStart = new Date(prevEnd.getTime() - duration);
    
    return {
      startDate: prevStart.toISOString().split('T')[0],
      endDate: prevEnd.toISOString().split('T')[0]
    };
  };
  
  const { startDate: prevStartDate, endDate: prevEndDate } = getPreviousPeriod(startDate, endDate);

  const { data: teamRaw, isLoading: l1 } = useFetch(`/reports/users-time-report/?start_date=${startDate}&end_date=${endDate}`);
  const { data: prevTeamRaw, isLoading: l1p } = useFetch(`/reports/users-time-report/?start_date=${prevStartDate}&end_date=${prevEndDate}`);
  const { data: projectsRaw, isLoading: l2 } = useFetch('/reports/total-project-time/');
  const { data: financeRaw, isLoading: l3 } = useFetch('/finance/studio-finance/');
  
  const isLoading = l1 || l2 || l3 || l1p;

  const team = teamRaw as any;
  const prevTeam = prevTeamRaw as any;
  const projects = projectsRaw as any;
  const finance = financeRaw as any;

  // KPI calculations with previous period
  const hoursLogged = team?.studio_total_seconds || 0;
  const prevHoursLogged = prevTeam?.studio_total_seconds || 0;
  const studioCost = Number(team?.studio_total_cost) || 0;
  const prevStudioCost = Number(prevTeam?.studio_total_cost) || 0;
  
  const invoices = useMemo(() => finance?.invoices || [], [finance]);
  const revenue = useMemo(() => invoices
    .filter((i: any) => i.date && i.date >= startDate && i.date <= endDate)
    .reduce((s: number, i: any) => s + (parseFloat(i.total_amount) || 0), 0), [invoices, startDate, endDate]);

  const prevRevenue = useMemo(() => invoices
    .filter((i: any) => i.date && i.date >= prevStartDate && i.date <= prevEndDate)
    .reduce((s: number, i: any) => s + (parseFloat(i.total_amount) || 0), 0), [invoices, prevStartDate, prevEndDate]);

  const outstanding = useMemo(() => invoices.filter((i: any) => i.status !== 'PD').reduce((s: number, i: any) => s + (parseFloat(i.total_amount) || 0), 0), [invoices]);
  const netPosition = revenue - studioCost;
  const margin = revenue > 0 ? ((netPosition / revenue) * 100) : 0;

  // Studio P&L summary
  const studioSummary = useMemo(() => ({
    revenue,
    costs: studioCost + (finance?.purchase_orders?.reduce((s: number, po: any) => s + (parseFloat(po.total_amount) || 0), 0) || 0),
    net: netPosition,
    margin
  }), [revenue, studioCost, finance, netPosition, margin]);

  // Hours trend - last 12 weeks
  const hoursElevenWeeks = useMemo(() => {
    const weeks = [];
    const today = new Date();
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - (i * 7));
      weekStart.setHours(0, 0, 0, 0);
      weeks.push({
        week: weekStart.toISOString().split('T')[0],
        label: `Week ${12 - i}`,
        hours: Math.round(Math.random() * 40 + 20) // Placeholder - replace with real data
      });
    }
    return weeks;
  }, []);

  // Top 5 projects by budget burn
  const topProjectsBurn = useMemo(() => {
    if (!projects?.projects) return [];
    return projects.projects
      .filter((p: any) => p.total_seconds > 0)
      .map((p: any) => ({
        id: p.id,
        name: p.project_name,
        budgetHours: p.budget_hours || 120, // Placeholder
        actualHours: p.total_seconds / 3600,
        burnPercent: p.budget_hours ? ((p.total_seconds / 3600) / p.budget_hours * 100) : 0,
        status: p.budget_hours ? (
          ((p.total_seconds / 3600) / p.budget_hours * 100) > 90 ? 'danger' :
          ((p.total_seconds / 3600) / p.budget_hours * 100) > 75 ? 'warning' : 'success'
        ) : 'unknown'
      }))
      .sort((a: any, b: any) => b.burnPercent - a.burnPercent)
      .slice(0, 5);
  }, [projects]);

  // Top 5 overdue invoices
  const overdueInvoices = useMemo(() => {
    return invoices
      .filter((i: any) => {
        if (i.status === 'PD' || !i.due_date) return false;
        return new Date(i.due_date) < new Date();
      })
      .map((i: any) => ({
        project: i?.project?.project_name || 'Unknown Project',
        amount: parseFloat(i.total_amount) || 0,
        daysOverdue: Math.floor((new Date().getTime() - new Date(i.due_date).getTime()) / (1000 * 60 * 60 * 24))
      }))
      .sort((a: any, b: any) => b.daysOverdue - a.daysOverdue)
      .slice(0, 5);
  }, [invoices]);

  // Team capacity (utilization)
  const teamCapacity = useMemo(() => {
    if (!team?.users) return [];
    return team.users
      .map((u: any) => ({
        name: u?.user_name,
        hours: u.total_seconds / 3600,
        utilization: (u.total_seconds / 3600) / (40 * 4) * 100, // Assuming 40h/week capacity
        status: ((u.total_seconds / 3600) / (40 * 4) * 100) > 90 ? 'high' : 
                ((u.total_seconds / 3600) / (40 * 4) * 100) < 50 ? 'low' : 'normal'
      }))
      .sort((a: any, b: any) => b.utilization - a.utilization)
      .slice(0, 8);
  }, [team]);



  return (
    <ReportPageLayout>
      <div className="report-print-area mx-auto max-w-7xl space-y-6">

        <ReportPageHeader
          title="Studio Overview"
          subtitle="High-level snapshot of your studio's performance"
          printTitle="Studio Overview Report"
        />

        <ReportFilterBar period={period} onPeriodChange={setPeriod} onCustomRange={setCustomRange} customFrom={customRange?.from} customTo={customRange?.to} />

        {isLoading ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Skeleton className="h-80 rounded-xl" />
              <Skeleton className="h-80 rounded-xl" />
            </div>
          </>
        ) : <>

        {/* KPI Cards with period comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <KpiCard 
            label="Hours Logged" 
            value={formatHours(hoursLogged)} 
            prevValue={formatHours(prevHoursLogged)}
            sub={`${team?.users?.length || 0} team members`} 
            icon={Clock} 
          />
          <KpiCard 
            label="Studio Cost" 
            value={formatCurrency(studioCost, C)} 
            prevValue={formatCurrency(prevStudioCost, C)}
            sub="Staff costs this period" 
            icon={DollarSign} 
          />
          <KpiCard 
            label="Revenue" 
            value={formatCurrency(revenue, C)} 
            prevValue={formatCurrency(prevRevenue, C)}
            sub={`${invoices.filter((i: any) => i.date && i.date >= startDate && i.date <= endDate).length} invoices`} 
            icon={TrendingUp} 
          />
          <KpiCard 
            label="Outstanding" 
            value={formatCurrency(outstanding, C)} 
            sub={`${overdueInvoices.length} overdue`} 
            icon={AlertCircle} 
            alert={overdueInvoices.length > 0}
          />
        </div>

        {/* Studio P&L Summary */}
        <Card className="bg-white border-gray-200 rounded-xl shadow-sm">
          <div className="p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Studio P&L Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-500">Revenue</p>
                <p className="text-xl font-semibold text-emerald-600">{formatCurrency(studioSummary.revenue, C)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Costs</p>
                <p className="text-xl font-semibold text-red-600">{formatCurrency(studioSummary.costs, C)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Net Position</p>
                <p className={`text-xl font-semibold ${studioSummary.net >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {formatCurrency(studioSummary.net, C)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Margin</p>
                <p className={`text-xl font-semibold ${studioSummary.margin >= 20 ? 'text-emerald-600' : studioSummary.margin >= 10 ? 'text-amber-600' : 'text-red-600'}`}>
                  {studioSummary.margin.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Hours Logged Trend - 12 weeks */}
          <Card className="bg-white border-gray-200 rounded-xl shadow-sm">
            <div className="p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Hours Logged Trend</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={hoursElevenWeeks}>
                  <defs>
                    <linearGradient id="hoursGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#748971" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#748971" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="label" fontSize={12} stroke="#6b7280" />
                  <YAxis fontSize={12} stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="hours" 
                    stroke="#748971" 
                    fillOpacity={1} 
                    fill="url(#hoursGradient)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Top 5 Projects by Budget Burn */}
          <Card className="bg-white border-gray-200 rounded-xl shadow-sm">
            <div className="p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Top Projects by Budget Burn</h3>
              <div className="space-y-4">
                {topProjectsBurn.map((project, index) => (
                  <div key={project.id} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{project.name}</p>
                      <p className="text-xs text-gray-500">
                        {project.actualHours.toFixed(1)}h of {project.budgetHours}h
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        project.status === 'danger' ? 'destructive' :
                        project.status === 'warning' ? 'secondary' : 'default'
                      }>
                        {project.burnPercent.toFixed(0)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Top 5 Overdue Invoices */}
          <Card className="bg-white border-gray-200 rounded-xl shadow-sm">
            <div className="p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Overdue Invoices</h3>
              {overdueInvoices.length === 0 ? (
                <p className="text-sm text-gray-500">No overdue invoices 🎉</p>
              ) : (
                <div className="space-y-4">
                  {overdueInvoices.map((invoice, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{invoice?.project}</p>
                        <p className="text-xs text-gray-500">{invoice.daysOverdue} days overdue</p>
                      </div>
                      <div className="text-sm font-semibold text-red-600">
                        {formatCurrency(invoice.amount, C)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Team Capacity Heatmap */}
          <Card className="bg-white border-gray-200 rounded-xl shadow-sm">
            <div className="p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Team Capacity</h3>
              <div className="space-y-3">
                {teamCapacity.map((member, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.hours.toFixed(1)}h logged</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-white rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            member.status === 'high' ? 'bg-terracotta' :
                            member.status === 'low' ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(member.utilization, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-500 w-8 text-right">
                        {member.utilization.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

        </div>



        {/* Quick links */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 no-print">
          {[
            { href: '/reports/projects', label: 'Projects' },
            { href: '/reports/team', label: 'Team' },
            { href: '/reports/finance', label: 'Finance' },
            { href: '/reports/revenue', label: 'Revenue & P&L' },
          ].map(link => (
            <Link key={link.href} href={link.href}>
              <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 hover:border-gray-300 hover:shadow-sm transition-all flex items-center justify-between group">
                {link.label}
                <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-emerald-600" />
              </div>
            </Link>
          ))}
        </div>
        </>}
      </div>
    </ReportPageLayout>
  );
}
export default function OverviewPage() {
  return (
    <PermissionGuard permission="reports.view" redirectTo="/">
      <OverviewPageContent />
    </PermissionGuard>
  );
}