import { useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { type Href, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { KpiCard, ListCard, StatusBadge } from '@/components/design-system';
import { EmptyState, Input, LoadingScreen } from '@/components/ui';
import { colors, spacing, typography } from '@/constants/theme';
import { useProcurementReport } from '@/hooks/useReports';
import { formatCurrency, formatDate } from '@/lib/format';
import { logisticStatusLabel } from '@/lib/reports';

export default function ReportsProcurementScreen() {
  const [search, setSearch] = useState('');
  const { data, isLoading, isRefetching, refresh } = useProcurementReport();

  const items = useMemo(() => {
    const list = data?.items ?? [];
    const query = search.trim().toLowerCase();
    if (!query) return list;
    return list.filter(
      item =>
        item.project_name?.toLowerCase().includes(query) ||
        item.product_name?.toLowerCase().includes(query) ||
        item.supplier_name?.toLowerCase().includes(query),
    );
  }, [data?.items, search]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  const summary = data?.summary;
  const currency = data?.currency ?? 'GBP';

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={items.length === 0 ? styles.emptyContainer : styles.content}
      data={items}
      keyExtractor={item => String(item.id)}
      ListHeaderComponent={
        <View style={styles.header}>
          <View style={styles.kpiRow}>
            <KpiCard label="Items" value={summary?.total_items ?? 0} accent={colors.brand} />
            <KpiCard
              label="Total spend"
              value={formatCurrency(summary?.total_spend, currency)}
              accent={colors.clay}
            />
          </View>
          <View style={styles.kpiRow}>
            <KpiCard label="Awaiting" value={summary?.awaiting_delivery ?? 0} accent={colors.warning} />
            <KpiCard label="Received" value={summary?.received ?? 0} accent={colors.success} />
          </View>
          <Input
            value={search}
            onChangeText={setSearch}
            placeholder="Search project, product, supplier…"
            leading={<Ionicons name="search-outline" size={18} color={colors.textMuted} />}
          />
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.itemCard}>
          <ListCard
            title={item.product_name || 'Procurement item'}
            subtitle={item.project_name}
            meta={[item.supplier_name, item.total_price != null ? formatCurrency(item.total_price, currency) : null]
              .filter(Boolean)
              .join(' · ')}
            onPress={item.project_id ? () => router.push(`/project/${item.project_id}` as Href) : undefined}
          />
          <View style={styles.itemMeta}>
            <StatusBadge
              label={logisticStatusLabel(item.logistic_status)}
              color={colors.textSecondary}
              backgroundColor={colors.surfaceElevated}
            />
            {item.eta ? <Text style={styles.eta}>ETA {formatDate(item.eta)}</Text> : null}
          </View>
        </View>
      )}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refresh} tintColor={colors.primary} />}
      ListEmptyComponent={
        <EmptyState
          title="No procurement data"
          message={search ? 'Try a different search term.' : 'Procurement items across your studio appear here.'}
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
  itemCard: {
    marginBottom: spacing.xs,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    marginTop: -spacing.xs,
    marginBottom: spacing.sm,
  },
  eta: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
