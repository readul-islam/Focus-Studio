import { useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { FilterChips, KpiCard, ListCard } from '@/components/design-system';
import { EmptyState, LoadingScreen } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';
import { useTeamTimeReport } from '@/hooks/useReports';
import { formatCurrency } from '@/lib/format';
import { formatHours, type ReportPeriod } from '@/lib/reports';

const periodOptions: { key: ReportPeriod; label: string }[] = [
  { key: 'week', label: 'This week' },
  { key: 'month', label: 'This month' },
  { key: 'year', label: 'This year' },
];

export default function ReportsTeamScreen() {
  const [period, setPeriod] = useState<ReportPeriod>('month');
  const { data, isLoading, isRefetching, refresh } = useTeamTimeReport(period);

  const users = useMemo(
    () => [...(data?.users ?? [])].sort((a, b) => b.total_seconds - a.total_seconds),
    [data?.users],
  );

  if (isLoading) {
    return <LoadingScreen />;
  }

  const currency = data?.currency ?? 'GBP';

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={users.length === 0 ? styles.emptyContainer : styles.content}
      data={users}
      keyExtractor={item => String(item.user_id)}
      ListHeaderComponent={
        <View style={styles.header}>
          <FilterChips options={periodOptions} value={period} onChange={setPeriod} />
          <View style={styles.kpiRow}>
            <KpiCard label="Total hours" value={formatHours(data?.studio_total_seconds)} accent={colors.brand} />
            <KpiCard
              label="Labour cost"
              value={formatCurrency(data?.studio_total_cost, currency)}
              accent={colors.clay}
            />
          </View>
        </View>
      }
      renderItem={({ item }) => (
        <ListCard
          title={item.user_name}
          subtitle={formatHours(item.total_seconds)}
          meta={item.cost != null ? formatCurrency(item.cost, currency) : undefined}
          showChevron={false}
        />
      )}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refresh} tintColor={colors.primary} />}
      ListEmptyComponent={
        <EmptyState title="No team data" message="Hours logged by your team in this period will appear here." />
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  emptyContainer: {
    flexGrow: 1,
    padding: spacing.md,
  },
  header: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
