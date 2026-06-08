import { useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { type Href, router } from 'expo-router';
import { FilterChips, KpiCard, ListCard, SectionHeader } from '@/components/design-system';
import { LoadingScreen } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';
import { useReportsOverview } from '@/hooks/useReports';
import { financeStatusLabel, financeStatusStyle, invoiceDisplayId } from '@/lib/finance';
import { formatCurrency } from '@/lib/format';
import { type ReportPeriod } from '@/lib/reports';

const periodOptions: { key: ReportPeriod; label: string }[] = [
  { key: 'week', label: 'This week' },
  { key: 'month', label: 'This month' },
  { key: 'year', label: 'This year' },
];

export default function FinanceReportScreen() {
  const [period, setPeriod] = useState<ReportPeriod>('month');
  const { financeData, periodRevenue, outstanding, overdueCount, currency, isLoading, isRefetching, refresh } =
    useReportsOverview(period);

  const statusBreakdown = useMemo(() => {
    const invoices = financeData?.invoices ?? [];
    const counts: Record<string, { count: number; total: number }> = {};
    for (const inv of invoices) {
      const status = inv.status ?? 'DFT';
      if (!counts[status]) counts[status] = { count: 0, total: 0 };
      counts[status].count += 1;
      counts[status].total += Number(inv.total_amount ?? 0);
    }
    return Object.entries(counts).sort((a, b) => b[1].total - a[1].total);
  }, [financeData?.invoices]);

  const recentInvoices = useMemo(() => {
    return [...(financeData?.invoices ?? [])]
      .sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime())
      .slice(0, 6);
  }, [financeData?.invoices]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refresh} tintColor={colors.primary} />}
    >
      <FilterChips options={periodOptions} value={period} onChange={setPeriod} />

      <View style={styles.kpiRow}>
        <View style={styles.kpiCell}>
          <KpiCard label="Period revenue" value={formatCurrency(periodRevenue, currency)} accent={colors.success} />
        </View>
        <View style={styles.kpiCell}>
          <KpiCard label="Outstanding" value={formatCurrency(outstanding, currency)} accent={colors.warning} />
        </View>
      </View>

      <View style={styles.kpiRow}>
        <View style={styles.kpiCell}>
          <KpiCard label="Invoices" value={financeData?.invoices.length ?? 0} accent={colors.primary} />
        </View>
        <View style={styles.kpiCell}>
          <KpiCard label="Overdue" value={overdueCount} accent={colors.danger} />
        </View>
      </View>

      {overdueCount > 0 ? (
        <View style={styles.alert}>
          <Text style={styles.alertText}>
            {overdueCount} invoice{overdueCount === 1 ? '' : 's'} overdue — follow up in Finance
          </Text>
        </View>
      ) : null}

      <SectionHeader title="By status" />
      {statusBreakdown.length === 0 ? (
        <Text style={styles.empty}>No invoices yet.</Text>
      ) : (
        statusBreakdown.map(([status, data]) => {
          const style = financeStatusStyle(status);
          return (
            <View key={status} style={styles.statusRow}>
              <View style={styles.statusLeft}>
                <Text style={styles.statusLabel}>{style.label}</Text>
                <Text style={styles.statusMeta}>
                  {data.count} invoice{data.count === 1 ? '' : 's'}
                </Text>
              </View>
              <Text style={styles.statusAmount}>{formatCurrency(data.total, currency)}</Text>
            </View>
          );
        })
      )}

      <SectionHeader
        title="Recent invoices"
        actionLabel="Finance"
        onAction={() => router.push('/finance' as Href)}
      />
      {recentInvoices.length === 0 ? (
        <Text style={styles.empty}>No invoices in this period.</Text>
      ) : (
        recentInvoices.map(invoice => {
          const statusStyle = financeStatusStyle(invoice.status);
          return (
            <ListCard
              key={invoice.id}
              title={invoiceDisplayId(invoice)}
              subtitle={financeStatusLabel(invoice.status)}
              meta={formatCurrency(invoice.total_amount, invoice.currency ?? currency)}
              badge={
                <View
                  style={[styles.badge, { backgroundColor: statusStyle.backgroundColor }]}
                >
                  <Text style={[styles.badgeText, { color: statusStyle.color }]}>{statusStyle.label}</Text>
                </View>
              }
              onPress={() => router.push(`/finance/invoice/${invoice.id}` as Href)}
            />
          );
        })
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
  kpiCell: {
    flex: 1,
    minWidth: 0,
  },
  alert: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  alertText: {
    fontSize: 13,
    color: colors.danger,
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.xs,
  },
  statusLeft: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  statusMeta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  statusAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  empty: {
    fontSize: 14,
    color: colors.textMuted,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
