import { useQuery } from '@tanstack/react-query';
import type {
  ProcurementSummary,
  ProjectTimeReport,
  StudioFinanceData,
  UsersTimeReport,
} from '@focuspilot/shared';
import { getReportDateRange, type ReportPeriod } from '@/lib/reports';
import { api } from '@/lib/api';

async function fetchProjectTime(): Promise<ProjectTimeReport> {
  const response = await api.get<ProjectTimeReport>('/reports/total-project-time/');
  return response.data;
}

async function fetchUsersTime(period: ReportPeriod): Promise<UsersTimeReport> {
  const { startDate, endDate } = getReportDateRange(period);
  const response = await api.get<UsersTimeReport>(
    `/reports/users-time-report/?start_date=${startDate}&end_date=${endDate}`,
  );
  return response.data;
}

async function fetchProcurement(): Promise<ProcurementSummary> {
  const response = await api.get<ProcurementSummary>('/reports/procurement-summary/');
  return response.data;
}

async function fetchFinance(): Promise<StudioFinanceData> {
  const response = await api.get<StudioFinanceData>('/finance/studio-finance/');
  return response.data;
}

export function useProjectTimeReport() {
  const query = useQuery({
    queryKey: ['reports/total-project-time'],
    queryFn: fetchProjectTime,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    isRefetching: query.isRefetching,
    refresh: query.refetch,
  };
}

export function useTeamTimeReport(period: ReportPeriod) {
  const query = useQuery({
    queryKey: ['reports/users-time-report', period],
    queryFn: () => fetchUsersTime(period),
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    isRefetching: query.isRefetching,
    refresh: query.refetch,
  };
}

export function useProcurementReport() {
  const query = useQuery({
    queryKey: ['reports/procurement-summary'],
    queryFn: fetchProcurement,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    isRefetching: query.isRefetching,
    refresh: query.refetch,
  };
}

export function useReportsOverview(period: ReportPeriod = 'month') {
  const projectQuery = useQuery({
    queryKey: ['reports/total-project-time'],
    queryFn: fetchProjectTime,
  });

  const teamQuery = useQuery({
    queryKey: ['reports/users-time-report', period],
    queryFn: () => fetchUsersTime(period),
  });

  const financeQuery = useQuery({
    queryKey: ['finance/studio-finance'],
    queryFn: fetchFinance,
  });

  const { startDate, endDate } = getReportDateRange(period);
  const invoices = financeQuery.data?.invoices ?? [];
  const periodRevenue = invoices
    .filter(inv => inv.date && inv.date >= startDate && inv.date <= endDate)
    .reduce((sum, inv) => sum + Number(inv.total_amount ?? 0), 0);
  const outstanding = invoices
    .filter(inv => inv.status !== 'PD')
    .reduce((sum, inv) => sum + Number(inv.total_amount ?? 0), 0);
  const overdueCount = invoices.filter(inv => inv.status === 'OVD').length;

  return {
    projectData: projectQuery.data,
    teamData: teamQuery.data,
    financeData: financeQuery.data,
    periodRevenue,
    outstanding,
    overdueCount,
    currency: teamQuery.data?.currency ?? invoices[0]?.currency ?? 'GBP',
    isLoading: projectQuery.isLoading || teamQuery.isLoading || financeQuery.isLoading,
    isError: projectQuery.isError || teamQuery.isError || financeQuery.isError,
    isRefetching: projectQuery.isRefetching || teamQuery.isRefetching || financeQuery.isRefetching,
    refresh: async () => {
      await Promise.all([projectQuery.refetch(), teamQuery.refetch(), financeQuery.refetch()]);
    },
  };
}
