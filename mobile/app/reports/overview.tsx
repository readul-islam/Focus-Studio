import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { type Href, router } from 'expo-router';
import { FilterChips, KpiCard, ListCard, SectionHeader } from '@/components/design-system';
import { LoadingScreen } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';
import { useReportsOverview } from '@/hooks/useReports';
import { formatCurrency } from '@/lib/format';
import { formatHours, type ReportPeriod } from '@/lib/reports';

const periodOptions: { key: ReportPeriod; label: string }[] = [
  { key: 'week', label: 'This week' },
  { key: 'month', label: 'This month' },
  { key: 'year', label: 'This year' },
];

export default function ReportsOverviewScreen() {
  const [period, setPeriod] = useState<ReportPeriod>('month');
  const {
    teamData,
    projectData,
    periodRevenue,
    outstanding,
    overdueCount,
    currency,
    isLoading,
    isRefetching,
    refresh,
  } = useReportsOverview(period);

  if (isLoading) {
    return <LoadingScreen />;
  }

  const studioCost = Number(teamData?.studio_total_cost ?? 0);
  const hoursLogged = teamData?.studio_total_seconds ?? 0;
  const topProjects = [...(projectData?.projects ?? [])]
    .sort((a, b) => b.total_seconds - a.total_seconds)
    .slice(0, 5);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refresh} tintColor={colors.primary} />}
    >
      <FilterChips options={periodOptions} value={period} onChange={setPeriod} />

      <View style={styles.kpiRow}>
        <KpiCard label="Revenue" value={formatCurrency(periodRevenue, currency)} accent={colors.success} />
        <KpiCard label="Labour cost" value={formatCurrency(studioCost, currency)} accent={colors.clay} />
      </View>
      <View style={styles.kpiRow}>
        <KpiCard label="Hours logged" value={formatHours(hoursLogged)} accent={colors.brand} />
        <KpiCard label="Outstanding" value={formatCurrency(outstanding, currency)} accent={colors.warning} />
      </View>

      {overdueCount > 0 ? (
        <View style={styles.alert}>
          <Text style={styles.alertText}>
            {overdueCount} overdue invoice{overdueCount === 1 ? '' : 's'} — view in Finance
          </Text>
        </View>
      ) : null}

      <SectionHeader
        title="Top projects by hours"
        actionLabel="See all"
        onAction={() => router.push('/reports/projects' as Href)}
      />
      {topProjects.length === 0 ? (
        <Text style={styles.empty}>No project time logged yet.</Text>
      ) : (
        topProjects.map(project => (
          <ListCard
            key={project.project_id}
            title={project.project_name}
            subtitle={formatHours(project.total_seconds)}
            meta={project.cost != null ? formatCurrency(project.cost, currency) : undefined}
            onPress={() => router.push(`/project/${project.project_id}` as Href)}
          />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  alert: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: spacing.md,
  },
  alertText: {
    fontSize: 14,
    color: colors.danger,
  },
  empty: {
    fontSize: 14,
    color: colors.textMuted,
    paddingVertical: spacing.sm,
  },
});
