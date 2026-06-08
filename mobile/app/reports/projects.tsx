import { useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { type Href, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { KpiCard, ListCard, ProgressBar } from '@/components/design-system';
import { EmptyState, Input, LoadingScreen } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';
import { useProjectTimeReport } from '@/hooks/useReports';
import { formatCurrency } from '@/lib/format';
import { budgetBurnPercent, formatHours } from '@/lib/reports';

export default function ReportsProjectsScreen() {
  const [search, setSearch] = useState('');
  const { data, isLoading, isRefetching, refresh } = useProjectTimeReport();

  const projects = useMemo(() => {
    const list = [...(data?.projects ?? [])].sort((a, b) => b.total_seconds - a.total_seconds);
    const query = search.trim().toLowerCase();
    if (!query) return list;
    return list.filter(project => project.project_name.toLowerCase().includes(query));
  }, [data?.projects, search]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  const totalHours = formatHours(data?.studio_total_seconds);
  const totalCost = data?.studio_total_cost;

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={projects.length === 0 ? styles.emptyContainer : styles.content}
      data={projects}
      keyExtractor={item => String(item.project_id)}
      ListHeaderComponent={
        <View style={styles.header}>
          <View style={styles.kpiRow}>
            <KpiCard label="Studio hours" value={totalHours} accent={colors.brand} />
            <KpiCard
              label="Labour cost"
              value={totalCost != null ? formatCurrency(totalCost) : '—'}
              accent={colors.clay}
            />
          </View>
          <Input
            value={search}
            onChangeText={setSearch}
            placeholder="Search projects…"
            leading={<Ionicons name="search-outline" size={18} color={colors.textMuted} />}
          />
        </View>
      }
      renderItem={({ item }) => {
        const burn = budgetBurnPercent(item.total_seconds, item.budget_hours);
        return (
          <View style={styles.cardWrap}>
            <ListCard
              title={item.project_name}
              subtitle={formatHours(item.total_seconds)}
              meta={item.cost != null ? formatCurrency(item.cost) : undefined}
              onPress={() => router.push(`/project/${item.project_id}` as Href)}
            />
            {burn != null ? (
              <View style={styles.burn}>
                <Text style={styles.burnLabel}>Budget burn · {burn}%</Text>
                <ProgressBar value={Math.min(burn, 100)} color={burn > 90 ? colors.danger : burn > 75 ? colors.warning : colors.success} />
              </View>
            ) : null}
          </View>
        );
      }}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refresh} tintColor={colors.primary} />}
      ListEmptyComponent={
        <EmptyState
          title="No project data"
          message={search ? 'Try a different search term.' : 'Time logged on projects will appear here.'}
        />
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
  cardWrap: {
    marginBottom: spacing.xs,
  },
  burn: {
    marginTop: -spacing.xs,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  burnLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 4,
  },
});
