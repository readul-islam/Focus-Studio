import { useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { type Href, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FinanceQuickActions } from '@/components/finance/FinanceQuickActions';
import { FinanceRow } from '@/components/finance/FinanceRow';
import { FilterChips, KpiCard } from '@/components/design-system';
import { EmptyState, Input, LoadingScreen } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';
import { useFinance } from '@/hooks/useFinance';
import { formatCurrency } from '@/lib/format';
import {
  buildFinanceList,
  financeSummary,
  type FinanceListItem,
  type FinanceStatusFilter,
  type FinanceTypeFilter,
} from '@/lib/finance';

const typeFilters: { key: FinanceTypeFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'invoices', label: 'Invoices' },
  { key: 'purchase_orders', label: 'POs' },
];

const statusFilters: { key: FinanceStatusFilter; label: string }[] = [
  { key: 'all', label: 'All statuses' },
  { key: 'DFT', label: 'Draft' },
  { key: 'SNT', label: 'Sent' },
  { key: 'APR', label: 'Approved' },
  { key: 'PD', label: 'Paid' },
  { key: 'OVD', label: 'Overdue' },
];

export default function FinanceScreen() {
  const [typeFilter, setTypeFilter] = useState<FinanceTypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<FinanceStatusFilter>('all');
  const [search, setSearch] = useState('');
  const { invoices, purchaseOrders, isLoading, isError, isRefetching, refresh } = useFinance();

  const summary = useMemo(
    () => financeSummary(invoices, purchaseOrders),
    [invoices, purchaseOrders],
  );

  const items = useMemo(
    () => buildFinanceList(invoices, purchaseOrders, typeFilter, statusFilter, search),
    [invoices, purchaseOrders, typeFilter, statusFilter, search],
  );

  const visibleStatusFilters = useMemo(() => {
    if (typeFilter === 'purchase_orders') {
      return statusFilters.filter(option => option.key !== 'OVD');
    }
    return statusFilters;
  }, [typeFilter]);

  const handleOpen = (item: FinanceListItem) => {
    if (item.kind === 'invoice') {
      router.push(`/finance/invoice/${item.data.id}` as Href);
    } else {
      router.push(`/finance/purchase-order/${item.data.id}` as Href);
    }
  };

  if (isLoading && invoices.length === 0 && purchaseOrders.length === 0) {
    return <LoadingScreen />;
  }

  const currency = invoices[0]?.currency ?? purchaseOrders[0]?.currency ?? 'GBP';

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={items.length === 0 ? styles.emptyContainer : styles.content}
      data={items}
      keyExtractor={item => `${item.kind}-${item.data.id}`}
      ListHeaderComponent={
        <View style={styles.header}>
          <FinanceQuickActions />
          <View style={styles.kpiRow}>
            <KpiCard label="Invoices" value={summary.invoiceCount} accent={colors.primary} />
            <KpiCard label="POs" value={summary.poCount} accent={colors.clay} />
          </View>
          <View style={styles.kpiRow}>
            <KpiCard
              label="Outstanding"
              value={formatCurrency(summary.outstanding, currency)}
              accent={colors.warning}
            />
            <KpiCard label="Open POs" value={summary.openPos} accent={colors.success} />
          </View>

          <Input
            value={search}
            onChangeText={setSearch}
            placeholder="Search ID, client, project…"
            leading={<Ionicons name="search-outline" size={18} color={colors.textMuted} />}
          />
          <FilterChips options={typeFilters} value={typeFilter} onChange={setTypeFilter} />
          <FilterChips options={visibleStatusFilters} value={statusFilter} onChange={setStatusFilter} />
          {isError ? (
            <Text style={styles.errorHint}>Couldn't refresh. Pull down to try again.</Text>
          ) : null}
        </View>
      }
      renderItem={({ item }) => <FinanceRow item={item} onPress={() => handleOpen(item)} />}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refresh} tintColor={colors.primary} />}
      ListEmptyComponent={
        <EmptyState
          title="Nothing here yet"
          message={
            search || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'Try adjusting your filters.'
              : 'Invoices and purchase orders from your studio appear here.'
          }
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
  errorHint: {
    fontSize: 13,
    color: colors.danger,
  },
});
