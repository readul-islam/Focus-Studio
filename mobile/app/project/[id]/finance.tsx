import { useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { type Href, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FilterChips, KpiCard } from '@/components/design-system';
import { FinanceRow } from '@/components/finance/FinanceRow';
import { ProjectFinanceQuickActions } from '@/components/project/ProjectFinanceQuickActions';
import { EmptyState, Input } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';
import { useProjectHub } from '@/context/ProjectHubContext';
import { useProjectFinance } from '@/hooks/useProjectFinance';
import { formatCurrency } from '@/lib/format';
import {
  buildFinanceList,
  financeSummary,
  type FinanceListItem,
  type FinanceStatusFilter,
  type FinanceTypeFilter,
} from '@/lib/finance';
import { formatProjectBudget } from '@/lib/projects';

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

export default function ProjectFinanceTab() {
  const { projectId, hubProject, overview } = useProjectHub();
  const [typeFilter, setTypeFilter] = useState<FinanceTypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<FinanceStatusFilter>('all');
  const [search, setSearch] = useState('');
  const { invoices, purchaseOrders, isLoading, isError, isRefetching, refresh } = useProjectFinance(projectId);

  const currency = hubProject?.currency ?? invoices[0]?.currency ?? purchaseOrders[0]?.currency ?? 'GBP';
  const budget = overview?.budget_utilization;

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

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={items.length === 0 && !isLoading ? styles.emptyContainer : styles.content}
      data={items}
      keyExtractor={item => `${item.kind}-${item.data.id}`}
      ListHeaderComponent={
        <View style={styles.header}>
          <ProjectFinanceQuickActions projectId={projectId} />

          <View style={styles.kpiRow}>
            <View style={styles.kpiCell}>
              <KpiCard
                label="Budget"
                value={formatProjectBudget(budget?.total_budget, currency) ?? '—'}
                subtitle={
                  budget?.percentage != null
                    ? `${Math.round(budget.percentage)}% utilized`
                    : undefined
                }
                accent={colors.clay}
              />
            </View>
            <View style={styles.kpiCell}>
              <KpiCard
                label="Spent"
                value={formatProjectBudget(budget?.total_po_amount, currency) ?? '—'}
                accent={colors.brand}
              />
            </View>
          </View>

          <View style={styles.kpiRow}>
            <View style={styles.kpiCell}>
              <KpiCard label="Invoices" value={summary.invoiceCount} accent={colors.primary} />
            </View>
            <View style={styles.kpiCell}>
              <KpiCard label="POs" value={summary.poCount} accent={colors.success} />
            </View>
          </View>

          <View style={styles.kpiRow}>
            <View style={styles.kpiCell}>
              <KpiCard
                label="Outstanding"
                value={formatCurrency(summary.outstanding, currency)}
                accent={colors.warning}
              />
            </View>
            <View style={styles.kpiCell}>
              <KpiCard label="Open POs" value={summary.openPos} accent={colors.danger} />
            </View>
          </View>

          <Input
            value={search}
            onChangeText={setSearch}
            placeholder="Search ID, client, supplier…"
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
        isLoading ? null : (
          <EmptyState
            title="No finance documents"
            message={
              search || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your filters.'
                : 'Create an invoice or expense for this project.'
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
  errorHint: {
    fontSize: 12,
    color: colors.danger,
  },
});
