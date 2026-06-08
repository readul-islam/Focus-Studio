import { useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { FilterChips, KpiCard, LoadingInline } from '@/components/design-system';
import { ProcurementItemRow } from '@/components/project/ProcurementItemRow';
import { Button, EmptyState, Input } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';
import { useProjectHub } from '@/context/ProjectHubContext';
import { formatCurrency } from '@/lib/format';
import {
  fetchProjectProcurements,
  filterProcurementItems,
  procurementPoRoute,
  procurementSummary,
  type ProcurementStatusFilter,
} from '@/lib/procurement';
import { openStudioWebPath } from '@/lib/web';

const filterOptions: { key: ProcurementStatusFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'action', label: 'Needs action' },
  { key: 'ordered', label: 'Ordered' },
  { key: 'delivered', label: 'Delivered' },
];

export default function ProjectProcurementTab() {
  const { projectId, hubProject } = useProjectHub();
  const [filter, setFilter] = useState<ProcurementStatusFilter>('all');
  const [search, setSearch] = useState('');

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['projects/project-procurements', projectId],
    queryFn: () => fetchProjectProcurements(projectId),
    enabled: Boolean(projectId),
  });

  const items = useMemo(
    () => filterProcurementItems(data ?? [], filter, search),
    [data, filter, search],
  );
  const summary = useMemo(() => procurementSummary(data ?? []), [data]);
  const currency = hubProject?.currency ?? 'GBP';

  const handleItemPress = (poId?: number | null) => {
    if (poId) {
      router.push(procurementPoRoute(poId));
      return;
    }
    void openStudioWebPath(`/projects/${projectId}/procurement`).catch(() => {});
  };

  if (isError) {
    return (
      <View style={styles.centered}>
        <EmptyState title="Couldn't load procurement" message="Pull down to try again." />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={items.length === 0 && !isLoading ? styles.emptyContainer : styles.content}
      data={items}
      keyExtractor={item => String(item.id)}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
      }
      ListHeaderComponent={
        <View style={styles.header}>
          <View style={styles.kpiRow}>
            <View style={styles.kpiCell}>
              <KpiCard label="Items" value={summary.total} accent={colors.clay} />
            </View>
            <View style={styles.kpiCell}>
              <KpiCard label="Needs action" value={summary.action} accent={colors.danger} />
            </View>
            <View style={styles.kpiCell}>
              <KpiCard
                label="Est. cost"
                value={formatCurrency(summary.totalCost, currency)}
                accent={colors.brand}
              />
            </View>
          </View>

          <Input
            value={search}
            onChangeText={setSearch}
            placeholder="Search products, suppliers, PO…"
          />
          <FilterChips options={filterOptions} value={filter} onChange={setFilter} />

          <Button
            label="Browse supplier catalog"
            variant="secondary"
            onPress={() => router.push(`/project/${projectId}/catalog`)}
          />

          <Text style={styles.hint}>
            Tap an item with a PO to open it. Full editing and approvals are on the web app.
          </Text>

          {isLoading && !data ? <LoadingInline /> : null}
        </View>
      }
      renderItem={({ item }) => (
        <ProcurementItemRow
          item={item}
          projectId={projectId}
          currency={currency}
          onPress={() => handleItemPress(item.po)}
        />
      )}
      ListEmptyComponent={
        isLoading ? null : (
          <EmptyState
            title={search || filter !== 'all' ? 'No matching items' : 'No procurement items'}
            message={
              search || filter !== 'all'
                ? 'Try another filter or search term.'
                : 'Browse the supplier catalog or add products from the web app.'
            }
          />
        )
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.md,
    backgroundColor: colors.canvas,
  },
  header: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  kpiCell: {
    flex: 1,
    minWidth: 0,
  },
  hint: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 16,
  },
});
