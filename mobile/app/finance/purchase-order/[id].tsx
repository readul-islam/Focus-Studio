import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import type { FinancePurchaseOrder } from '@focuspilot/shared';
import { FinanceStatusActions } from '@/components/finance/FinanceStatusActions';
import { PurchaseOrderDraftEditor } from '@/components/finance/PurchaseOrderDraftEditor';
import { Button } from '@/components/ui';
import { ErrorState, LoadingInline, SectionHeader, StatusBadge } from '@/components/design-system';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { formatCurrency, formatDate } from '@/lib/format';
import {
  financePartyName,
  financeStatusStyle,
  poDisplayId,
  projectName,
} from '@/lib/finance';
import { openStudioWebPath } from '@/lib/web';
import { api } from '@/lib/api';

async function fetchPurchaseOrder(id: string): Promise<FinancePurchaseOrder> {
  const response = await api.get<FinancePurchaseOrder>(`/finance/purchase-orders/${id}/`);
  return response.data;
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

export default function PurchaseOrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['finance/purchase-orders', id],
    queryFn: () => fetchPurchaseOrder(String(id)),
    enabled: Boolean(id),
  });

  if (isLoading && !data) {
    return <LoadingInline />;
  }

  if ((isError && !data) || !data) {
    return <ErrorState title="Couldn't load purchase order" onRetry={refetch} />;
  }

  const statusStyle = financeStatusStyle(data.status);
  const displayId = poDisplayId(data);
  const lineItems = data.line_items ?? [];
  const isDraft = data.status === 'DFT';

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
    >
      <Stack.Screen options={{ title: displayId }} />

      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <Text style={styles.heroId}>{displayId}</Text>
          <StatusBadge label={statusStyle.label} color={statusStyle.color} backgroundColor={statusStyle.backgroundColor} />
        </View>
        <Text style={styles.heroAmount}>
          {formatCurrency(data.total_amount, data.currency ?? 'GBP')}
        </Text>
      </View>

      {!isDraft ? (
        <>
          <SectionHeader title="Details" />
          <View style={styles.card}>
            <Field label="Supplier" value={financePartyName(data.supplier)} />
            <Field label="Project" value={projectName(data.project)} />
            <Field label="Date" value={data.date ? formatDate(data.date) : undefined} />
            <Field label="Due date" value={data.due_date ? formatDate(data.due_date) : undefined} />
            {data.inv_ref && data.inv_ref.length > 0 ? (
              <Field label="Linked invoices" value={data.inv_ref.map(ref => `INV-${ref}`).join(', ')} />
            ) : null}
            {data.xero_sync_status ? <Field label="Xero sync" value={data.xero_sync_status} /> : null}
          </View>
        </>
      ) : null}

      {isDraft ? (
        <PurchaseOrderDraftEditor purchaseOrder={data} onSaved={refetch} />
      ) : lineItems.length > 0 ? (
        <>
          <SectionHeader title="Line items" subtitle={`${lineItems.length} item${lineItems.length === 1 ? '' : 's'}`} />
          {lineItems.map(item => (
            <View key={item.id} style={styles.lineItem}>
              <Text style={styles.lineTitle}>{item.product?.name ?? item.description ?? 'Item'}</Text>
              <Text style={styles.lineMeta}>
                {[
                  item.quantity != null ? `Qty ${item.quantity}` : null,
                  item.unit_price != null ? formatCurrency(item.unit_price, data.currency ?? 'GBP') : null,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </Text>
              {item.total != null ? (
                <Text style={styles.lineTotal}>{formatCurrency(item.total, data.currency ?? 'GBP')}</Text>
              ) : null}
            </View>
          ))}
        </>
      ) : null}

      {!isDraft ? (
        <FinanceStatusActions
          kind="purchase_order"
          documentId={data.id}
          status={data.status}
          onUpdated={refetch}
        />
      ) : null}

      <Button
        label="Open in browser"
        variant="secondary"
        onPress={() => void openStudioWebPath(`/finance/purchase-order/${data.id}`)}
      />

      <Text style={styles.webHint}>
        {isDraft ? 'Save your draft, then approve or send from here.' : 'PDF download and Xero sync are in the web app.'}
      </Text>
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
  },
  hero: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  heroId: {
    ...typography.heading,
    fontSize: 22,
    flex: 1,
  },
  heroAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  field: {
    gap: 2,
  },
  fieldLabel: {
    ...typography.label,
  },
  fieldValue: {
    fontSize: 15,
    color: colors.text,
  },
  lineItem: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  lineTitle: {
    ...typography.subheading,
    marginBottom: 4,
  },
  lineMeta: {
    fontSize: 13,
    color: colors.textMuted,
  },
  lineTotal: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginTop: 6,
  },
  webHint: {
    textAlign: 'center',
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing.lg,
    lineHeight: 20,
  },
});
