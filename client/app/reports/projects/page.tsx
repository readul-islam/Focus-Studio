'use client';

import React, { useState, useMemo, useEffect } from 'react';
import useFetch from '@/hooks/useFetch';
import { TotalProjectTimeResponse, ProjectPhaseTimeResponse } from '@/types/reports';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, ChevronRight, FolderOpen, Timer, DollarSign } from 'lucide-react';
import { ReportPageLayout } from '@/components/reports/ReportInsights';
import { ReportPageHeader } from '@/components/reports/ReportPageHeader';
import { useCurrency } from '@/lib/getCurrencySymbol';
import ExportButton from '@/components/ui/ExportButton';
import { KpiCard } from '@/components/reports/KpiCard';
import { ViewCurrencySymbol } from '@/components/ViewCurrencySymbol';
import ProjectPhases from '@/components/reports/ProjectPhases';
import { ReportFilterBar } from '@/components/reports/ReportFilterBar';
import { useReportFilters } from '@/hooks/useReportFilters';
import { useTranslations } from 'next-intl';
import { PermissionGuard } from '@/components/PermissionGuard';

function ProjectReportContent() {
  const t = useTranslations('reportsProjectsPage');
  const { data, isLoading, error } = useFetch('/reports/total-project-time/');
  const reportData = data as TotalProjectTimeResponse;
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('time-desc');
  const [chartMetric, setChartMetric] = useState<'hours' | 'cost'>('hours');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const { period, setPeriod, setCustomRange, customRange, startDate, endDate } = useReportFilters('year');



  const { data: phasesDataRaw, isLoading: phasesLoading } = useFetch(
    selectedProjectId ? `/reports/project-phase-time/${selectedProjectId}/` : null,
    { enabled: !!selectedProjectId }
  );
  const phasesData = phasesDataRaw as ProjectPhaseTimeResponse;

  useEffect(() => {
    if (reportData?.projects?.length && !selectedProjectId) {
      setSelectedProjectId(reportData.projects[0].project_id.toString());
    }
  }, [reportData, selectedProjectId]);

  const [expandedPhases, setExpandedPhases] = useState<string[]>([]);

  const togglePhase = (phaseName: string) => {
    setExpandedPhases(prev =>
      prev.includes(phaseName)
        ? prev.filter(p => p !== phaseName)
        : [...prev, phaseName]
    );
  };

  const filteredProjects = useMemo(() => {
    if (!reportData?.projects) return [];
    let projects = reportData.projects.filter(p =>
      p.project_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return projects.sort((a, b) => {
      if (sortBy === 'time-desc') return b.total_seconds - a.total_seconds;
      if (sortBy === 'time-asc') return a.total_seconds - b.total_seconds;
      if (sortBy === 'cost-desc') return (b.cost || 0) - (a.cost || 0);
      if (sortBy === 'cost-asc') return (a.cost || 0) - (b.cost || 0);
      if (sortBy === 'name-asc') return a.project_name.localeCompare(b.project_name);
      if (sortBy === 'name-desc') return b.project_name.localeCompare(a.project_name);
      return 0;
    });
  }, [reportData, searchQuery, sortBy]);

  const chartData = useMemo(() => {
    if (!phasesData?.phases) return [];
    return phasesData.phases.map(p => {
      if (chartMetric === 'hours') {
        return {
          name: p.phase_name,
          actual: p.total_seconds ? parseFloat((p.total_seconds / 3600).toFixed(2)) : 0,
          budget: p.hour_budget_seconds ? parseFloat((p.hour_budget_seconds / 3600).toFixed(2)) : 0,
        };
      } else {
        return {
          name: p.phase_name,
          actual: p.cost || 0,
          budget: p.total_budget || 0,
        };
      }
    });
  }, [phasesData, chartMetric]);

  const chartConfig = {
    actual: {
      label: chartMetric === 'hours' ? "Actual Hours" : "Actual Cost",
      color: "#94A88C",
    },
    budget: {
      label: chartMetric === 'hours' ? "Budgeted Hours" : "Budgeted Cost",
      color: "#A59F96",
    }
  };

  const exportData = useMemo(() => {
    if (!reportData?.projects) return [];
    return reportData.projects.map(p => ({
      'Project ID': p.project_id,
      'Project Name': p.project_name,
      'Total Time': p.total_time.formatted,
      'Total Hours': parseFloat((p.total_seconds / 3600).toFixed(2)),
      'Cost': p.cost || 0,
      'Currency': reportData.currency || 'GBP'
    }));
  }, [reportData]);

  if (error) return (
    <main className="flex-1 bg-stone-50 p-6">
      <div className=" space-y-6">
        <div className="text-red-500">Failed to load project report. Please try again later.</div>
      </div>
    </main>
  );
  if (!reportData) return (
    <main className="flex-1 bg-stone-50 p-6">
      <div className=" space-y-6">
        <div className="text-gray-500">No data available.</div>
      </div>
    </main>
  );

  const currencyCode = reportData.currency || 'GBP';
  const totalTimeFormatted = `${reportData.studio_total_time.hours}h ${reportData.studio_total_time.minutes}m`;
  const totalCostFormatted = reportData.studio_total_cost !== undefined
    ? `£${reportData.studio_total_cost.toLocaleString()}`
    : '—';

  return (
    <ReportPageLayout>
      <div className="report-print-area  space-y-6">

        <ReportPageHeader
          title={t('title')}
          subtitle={t('subtitle')}
          printTitle={t('printTitle')}
        />

        <ReportFilterBar
          period={period}
          onPeriodChange={setPeriod}
          onCustomRange={setCustomRange}
          customFrom={customRange?.from}
          customTo={customRange?.to}
        />

        {isLoading ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
            </div>
            <Skeleton className="h-96 rounded-xl" />
          </>
        ) : <>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <KpiCard label={t('activeProjects')} value={reportData.projects.length} sub={t('inProgress')} icon={FolderOpen} />
          <KpiCard label={t('studioTotalTime')} value={totalTimeFormatted} sub={reportData.studio_name} icon={Timer} />
          <KpiCard label={t('studioTotalCost')} value={totalCostFormatted} sub={t('estimatedCost')} icon={DollarSign} />
        </div>



        {/* Filters */}
        <div className="flex flex-col md:flex-row justify-end gap-4">
          <div className="flex flex-wrap gap-4 justify-end items-center">
            <Select value={chartMetric} onValueChange={(v: 'hours' | 'cost') => setChartMetric(v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('metric')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hours">{t('hours')}</SelectItem>
                <SelectItem value="cost">{t('cost')}</SelectItem>
              </SelectContent>
            </Select>



            <ExportButton
              data={exportData}
              filename={`Project_Report_${reportData.studio_name.replace(/\s+/g, '_')}`}
              sheetName="Projects"
            />
          </div>
        </div>

        {/* Chart */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle>{t('phasePerformance')}</CardTitle>
              <CardDescription>{t('phasePerformanceSub')}</CardDescription>
            </div>
            <div className="w-[250px]">
              <Select value={selectedProjectId || ''} onValueChange={setSelectedProjectId}>
                {/* <SelectTrigger>
                            <SelectValue placeholder="Select Project" />
                        </SelectTrigger> */}
                <SelectTrigger className="w-[250px] bg-white border-gray-200">
                  <FolderOpen className="w-4 h-4 mr-2 text-gray-500" />
                  <SelectValue placeholder={t('selectProject')} />
                </SelectTrigger>
                <SelectContent>
                  {reportData.projects.map(p => (
                    <SelectItem key={p.project_id} value={p.project_id.toString()}>
                      {p.project_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              {phasesLoading ? (
                <div className="h-full w-full flex items-center justify-center">
                  <Skeleton className="h-[300px] w-full" />
                </div>
              ) : chartData.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-full w-full">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      tickMargin={10}
                      axisLine={false}
                      minTickGap={30}
                      interval={0} // Show all phases if possible
                      className="text-xs font-medium"
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => chartMetric === 'hours' ? `${value}h` : `£${value}`}
                      className="text-xs text-muted-foreground"
                    />
                    <ChartTooltip
                      cursor={{ fill: 'hsl(var(--muted)/0.4)' }}
                      content={<ChartTooltipContent />}
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar
                      dataKey="actual"
                      fill="var(--color-actual)"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={50}
                      name={chartMetric === 'hours' ? t('actualHours') : t('actualCost')}
                    />
                    <Bar
                      dataKey="budget"
                      fill="var(--color-budget)"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={50}
                      name={chartMetric === 'hours' ? t('budgetedHours') : t('budgetedCost')}
                    />
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  {t('noPhaseData')}
                </div>
              )}
            </div>
          </CardContent>
        </Card>



        {/* Sort */}
        <div className='flex justify-end'>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('sortBy')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="time-desc">{t('sortTimeDesc')}</SelectItem>
              <SelectItem value="time-asc">{t('sortTimeAsc')}</SelectItem>
              <SelectItem value="cost-desc">{t('sortCostDesc')}</SelectItem>
              <SelectItem value="cost-asc">{t('sortCostAsc')}</SelectItem>
              <SelectItem value="name-asc">{t('sortNameAsc')}</SelectItem>
              <SelectItem value="name-desc">{t('sortNameDesc')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="shadow-sm p-0">
          <CardHeader>
            <CardTitle className="text-base font-semibold">{t('projectDetails')}</CardTitle>
          </CardHeader>
          <CardContent className='p-0'>
            <div className="overflow-x-auto">
              <table className="w-full">
            <thead className="bg-muted/10 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide w-8"></th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {t('projectsCol')}
                </th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {t('fee')}
                </th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {t('budgetedHoursCol')}
                </th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {t('actualHoursCol')}
                </th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {t('variance')}
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide min-w-[140px]">
                  {t('hoursBurn')}
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide min-w-[140px]">
                  {t('feeBurn')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {!isLoading && (!filteredProjects || filteredProjects.length === 0) && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-sm text-gray-500">
                    {t('noProjectDataPeriod')}
                  </td>
                </tr>
              )}
              { !isLoading && filteredProjects?.map((project) => {
                const budgetHours = project.budget_hours || (project.budget_hours_seconds ? project.budget_hours_seconds / 3600 : 0);
                const actualHours = project.total_seconds / 3600;
                const variance = budgetHours - actualHours;
                const isExpanded = expandedPhases.includes(project.project_id);

                return (
                  <React.Fragment key={project.project_id}>
                    <tr
                      className="hover:bg-muted/10 cursor-pointer transition-colors"
                      onClick={() => togglePhase(project.project_id)}
                    >
                      <td className="px-4 py-3">
                        <button className="text-muted-foreground hover:text-foreground">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">{project.project_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-foreground tabular-nums">
                        <ViewCurrencySymbol code={reportData.currency || ''} />{ project?.total_budget ? project?.total_budget?.toLocaleString('en-GB', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : 0}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text- foreground tabular-nums">
                        {(Math.round(project.budget_hours )) || 0}h
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-foreground tabular-nums">
                        {Math.round(project.total_seconds / 3600)}h
                      </td>
                      <td
                        className={`px-4 py-3 text-right text-sm font-medium tabular-nums ${
                          variance >= 0 ? "text-[#748971]" : "text-red-700"
                        }`}
                      >
                        { variance > 0.1 ? "+" : ""}
                        {Math.round(variance)}h
                      </td>
                      {/* Hours Burn bar */}
                      <td className="px-4 py-3">
                        {budgetHours > 0 ? (() => {
                          const pct = Math.min((actualHours / budgetHours) * 100, 100);
                          const over = actualHours > budgetHours;
                          return (
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-white rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${over ? 'bg-red-500' : pct > 80 ? 'bg-amber-400' : 'bg-[#748971]'}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className={`text-xs tabular-nums w-8 text-right ${over ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                                {Math.round(pct)}%
                              </span>
                            </div>
                          );
                        })() : <span className="text-xs text-muted-foreground">—</span>}
                      </td>
                      {/* Fee Burn bar */}
                      <td className="px-4 py-3">
                        {(project.total_budget || 0) > 0 ? (() => {
                          const budget = project.total_budget!;
                          const cost = project.cost || 0;
                          const pct = Math.min((cost / budget) * 100, 100);
                          const over = cost > budget;
                          return (
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-white rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${over ? 'bg-red-500' : pct > 80 ? 'bg-amber-400' : 'bg-[#748971]'}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className={`text-xs tabular-nums w-8 text-right ${over ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                                {Math.round(pct)}%
                              </span>
                            </div>
                          );
                        })() : <span className="text-xs text-muted-foreground">—</span>}
                      </td>
                    </tr>
                    {isExpanded && (
                      <>
                        <tr className="bg-muted/5 border-b-0">
                          <td colSpan={9} className="px-4 py-2">
                            <p className="text-xs font-bold opacity-70 uppercase tracking-wide pl-12">
                              {t('phases')}
                            </p>
                          </td>
                        </tr>
                        <ProjectPhases projectId={project.project_id} />
                      
                      </>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
            {/* Footer Total */}
            {/* <tfoot className="bg-muted/20 border-t-2 border-gray-200 font-semibold">
              <tr>
                <td className="px-4 py-3"></td>
                <td className="px-4 py-3 text-sm text-foreground">Total</td>
                <td className="px-4 py-3 text-right text-sm text-foreground tabular-nums">
                  <ViewCurrencySymbol code={phaseData.currency || ''} />{formatGBP(totalFee)}
                </td>
                <td className="px-4 py-3 text-right text-sm text-foreground tabular-nums">
                   {(phaseData.budget_hours || 0).toFixed(1)}h
                </td>
                <td className="px-4 py-3 text-right text-sm text-foreground tabular-nums">
                  {(phaseData.project_total_seconds / 3600).toFixed(1)}h
                </td>
                <td className="px-4 py-3"></td>
                <td className="px-4 py-3"></td>
              </tr>
            </tfoot> */}
          </table>
            </div>
          </CardContent>
        </Card>
        </>}
      </div>
    </ReportPageLayout>
  );
};

export default function ProjectReport() {
  return (
    <PermissionGuard permission="reports.view" redirectTo="/">
      <ProjectReportContent />
    </PermissionGuard>
  );
}
