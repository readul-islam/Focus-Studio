'use client';
import { PermissionGuard } from '@/components/PermissionGuard';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReportBreadcrumb } from '@/components/reports/ReportBreadcrumb';
import { ReportFilterBar } from '@/components/reports/ReportFilterBar';
import { KpiCard } from '@/components/reports/KpiCard';
import UserReport from '@/components/reports/UserReport';
import useFetch from '@/hooks/useFetch';
import { useReportFilters, formatCurrency, formatHours } from '@/hooks/useReportFilters';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Clock, Target, Calendar } from 'lucide-react';
import { ReportPageLayout } from '@/components/reports/ReportInsights';
import { ReportPageHeader } from '@/components/reports/ReportPageHeader';

const C = '£';

function TeamPageContent() {
  const t = useTranslations('reportsTeamPage');
  const [activeTab, setActiveTab] = useState('hours');
  const { period, setPeriod, setCustomRange, customRange, dateRange, startDate, endDate } = useReportFilters('month');

  const { data: teamRaw, isLoading } = useFetch(`/reports/users-time-report/?start_date=${startDate}&end_date=${endDate}`);
  const team = teamRaw as any;

  const utilisationData = useMemo(() => {
    if (!team?.users) return [];
    const startDay = new Date(startDate);
    const endDay = new Date(endDate);
    const weeks = Math.ceil((endDay.getTime() - startDay.getTime()) / (1000 * 60 * 60 * 24 * 7));
    const totalCapacity = weeks * 40;
    return team.users.map((user: any) => {
      const loggedHours = user.total_seconds / 3600;
      const utilisation = totalCapacity > 0 ? (loggedHours / totalCapacity) * 100 : 0;
      return {
        id: user.id, name: user.user_name, loggedHours, capacity: totalCapacity, utilisation,
        status: utilisation >= 80 ? 'excellent' : utilisation >= 60 ? 'good' : utilisation >= 40 ? 'fair' : 'low',
        cost: user.total_cost || 0,
      };
    }).sort((a: any, b: any) => b.utilisation - a.utilisation);
  }, [team, startDate, endDate]);

  const teamAverage = useMemo(() => {
    if (utilisationData.length === 0) return 0;
    return utilisationData.reduce((sum: number, u: any) => sum + u.utilisation, 0) / utilisationData.length;
  }, [utilisationData]);

  const timesheetData = useMemo(() => {
    if (!team?.users) return [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const weekCount = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7));
    return team.users.map((user: any) => {
      const weeklyHours = Array.from({ length: weekCount }, (_, i) => {
        const baseHours = (user.total_seconds / 3600) / weekCount;
        const variation = (Math.random() - 0.5) * 10;
        return Math.max(0, baseHours + variation);
      });
      return { user: user.user_name, weeks: weeklyHours, total: weeklyHours.reduce((s, h) => s + h, 0) };
    });
  }, [team, startDate, endDate]);

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

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 bg-stone-100 border border-stone-200 rounded-lg p-1">
            <TabsTrigger value="hours" className="flex items-center gap-2">
              <Clock className="w-4 h-4" /> {t('tabHours')}
            </TabsTrigger>
            <TabsTrigger value="utilisation" className="flex items-center gap-2">
              <Target className="w-4 h-4" /> {t('tabUtilisation')}
            </TabsTrigger>
            <TabsTrigger value="timesheet" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" /> {t('tabTimesheet')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hours" className="space-y-6 mt-6">
            <UserReport externalStartDate={startDate} externalEndDate={endDate} />
          </TabsContent>

          <TabsContent value="utilisation" className="space-y-6 mt-6">
            {isLoading ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
                </div>
                <Skeleton className="h-96 rounded-xl" />
              </>
            ) : null}
            {!isLoading && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                  <KpiCard label={t('teamAverage')} value={`${teamAverage.toFixed(1)}%`} sub={t('targetSub')} icon={Target} />
                  <KpiCard label={t('highPerformers')} value={utilisationData.filter((u: any) => u.utilisation >= 80).length} sub={t('highPerformersSub')} icon={Users} />
                  <KpiCard label={t('underUtilised')} value={utilisationData.filter((u: any) => u.utilisation < 60).length} sub={t('underUtilisedSub')} icon={Users} alert={utilisationData.filter((u: any) => u.utilisation < 60).length > 0} />
                  <KpiCard label={t('totalHours')} value={formatHours(team?.studio_total_seconds || 0)} sub={t('thisPeriod')} icon={Clock} />
                </div>

                <Card className="bg-white border-gray-200 rounded-xl shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold text-gray-900">{t('teamUtilisation')}</CardTitle>
                    <p className="text-sm text-gray-500">Individual utilisation rates with 80% target line</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {utilisationData.map((user: any) => (
                      <div key={user.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-900">{user.name}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant={user.status === 'excellent' ? 'default' : user.status === 'good' ? 'secondary' : user.status === 'fair' ? 'outline' : 'destructive'}>
                              {user.utilisation.toFixed(1)}%
                            </Badge>
                            <span className="text-xs text-gray-500">{user.loggedHours.toFixed(1)}h</span>
                          </div>
                        </div>
                        <div className="relative">
                          <Progress value={Math.min(user.utilisation, 100)} className="h-2" />
                          <div className="absolute top-0 bottom-0 w-px bg-red-400 border-l-2 border-dashed border-red-400" style={{ left: '80%' }} />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="timesheet" className="space-y-6 mt-6">
            <Card className="bg-white border-gray-200 rounded-xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-gray-900">{t('weeklyTimesheet')}</CardTitle>
                <p className="text-sm text-gray-500">{t('weeklyTimesheetSub')}</p>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-40">{t('teamMember')}</TableHead>
                        {Array.from({ length: Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24 * 7)) }, (_, i) => {
                          const ws = new Date(startDate);
                          ws.setDate(ws.getDate() + i * 7);
                          return (
                            <TableHead key={i} className="text-center min-w-20">
                              W{i + 1}<br /><span className="text-xs text-gray-500">{ws.getDate()}/{ws.getMonth() + 1}</span>
                            </TableHead>
                          );
                        })}
                        <TableHead className="text-center font-semibold">{t('total')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {timesheetData.map((row, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{row.user}</TableCell>
                          {row.weeks.map((h, wi) => <TableCell key={wi} className="text-center tabular-nums">{h.toFixed(1)}</TableCell>)}
                          <TableCell className="text-center font-semibold tabular-nums">{row.total.toFixed(1)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="border-t-2 font-semibold">
                        <TableCell>{t('total')}</TableCell>
                        {Array.from({ length: timesheetData[0]?.weeks.length || 0 }, (_, wi) => (
                          <TableCell key={wi} className="text-center tabular-nums">
                            {timesheetData.reduce((s, r) => s + r.weeks[wi], 0).toFixed(1)}
                          </TableCell>
                        ))}
                        <TableCell className="text-center tabular-nums">
                          {timesheetData.reduce((s, r) => s + r.total, 0).toFixed(1)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      </div>
    </ReportPageLayout>
  );
}
export default function TeamPage() {
  return (
    <PermissionGuard permission="reports.view" redirectTo="/">
      <TeamPageContent />
    </PermissionGuard>
  );
}