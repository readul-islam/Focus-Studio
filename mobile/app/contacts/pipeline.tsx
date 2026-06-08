import { useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { type Href, router } from 'expo-router';
import { CrmHubTabs } from '@/components/crm/CrmHubTabs';
import { LeadRow } from '@/components/crm/LeadRow';
import { SearchCreateRow } from '@/components/lists/SearchCreateRow';
import { FilterChips, KpiCard } from '@/components/design-system';
import { EmptyState, LoadingScreen } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useLeads } from '@/hooks/useLeads';
import {
  filterLeads,
  LEAD_STAGES,
  LEAD_STAGE_LABELS,
  pipelineSummary,
  type LeadStageFilter,
} from '@/lib/leads';

const stageFilters: { key: LeadStageFilter; label: string }[] = [
  { key: 'all', label: 'All stages' },
  ...LEAD_STAGES.map(stage => ({ key: stage, label: LEAD_STAGE_LABELS[stage] })),
];

export default function PipelineScreen() {
  const { user } = useAuth();
  const [stageFilter, setStageFilter] = useState<LeadStageFilter>('all');
  const [search, setSearch] = useState('');
  const { leads, isLoading, isError, isRefetching, refresh } = useLeads();

  const currency = user?.studio?.default_currency ?? 'GBP';
  const summary = useMemo(() => pipelineSummary(leads), [leads]);
  const items = useMemo(() => filterLeads(leads, stageFilter, search), [leads, stageFilter, search]);

  if (isLoading && leads.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={items.length === 0 ? styles.emptyContainer : styles.content}
      data={items}
      keyExtractor={item => String(item.id)}
      ListHeaderComponent={
        <View style={styles.header}>
          <CrmHubTabs />

          <View style={styles.kpiRow}>
            <View style={styles.kpiCell}>
              <KpiCard label="Active leads" value={summary.active} accent={colors.primary} />
            </View>
            <View style={styles.kpiCell}>
              <KpiCard
                label="Pipeline value"
                value={
                  summary.pipelineValue > 0
                    ? new Intl.NumberFormat('en-GB', {
                        style: 'currency',
                        currency,
                        maximumFractionDigits: 0,
                      }).format(summary.pipelineValue)
                    : '—'
                }
                accent={colors.success}
              />
            </View>
          </View>

          <View style={styles.kpiRow}>
            <View style={styles.kpiCell}>
              <KpiCard label="Won" value={summary.won} accent={colors.brand} />
            </View>
            <View style={styles.kpiCell}>
              <KpiCard label="Needs follow-up" value={summary.stale} accent={colors.warning} />
            </View>
          </View>

          <SearchCreateRow
            value={search}
            onChangeText={setSearch}
            placeholder="Search leads…"
            onCreate={() => router.push('/contacts/lead/new' as Href)}
            createAccessibilityLabel="Create lead"
          />

          <FilterChips options={stageFilters} value={stageFilter} onChange={setStageFilter} />

          {isError ? (
            <Text style={styles.errorHint}>Couldn't refresh. Pull down to try again.</Text>
          ) : null}
        </View>
      }
      renderItem={({ item }) => (
        <LeadRow
          lead={item}
          currency={currency}
          onPress={() => router.push(`/contacts/lead/${item.id}` as Href)}
        />
      )}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refresh} tintColor={colors.primary} />}
      ListEmptyComponent={
        <EmptyState
          title="No leads yet"
          message={
            search || stageFilter !== 'all'
              ? 'Try adjusting your filters.'
              : 'Add your first lead to start tracking your pipeline.'
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
  kpiCell: {
    flex: 1,
    minWidth: 0,
  },
  errorHint: {
    fontSize: 12,
    color: colors.danger,
  },
});
