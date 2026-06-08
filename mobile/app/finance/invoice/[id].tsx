import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { FinanceInvoice } from '@focuspilot/shared';
import { FinanceStatusActions } from '@/components/finance/FinanceStatusActions';
import { InvoiceDraftEditor } from '@/components/finance/InvoiceDraftEditor';
import { ErrorState, LoadingInline, SectionHeader, StatusBadge } from '@/components/design-system';
import { Button } from '@/components/ui';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { formatCurrency, formatDate } from '@/lib/format';
import {
  canSendInvoice,
  financePartyName,
  financeStatusStyle,
  invoiceDisplayId,
  projectName,
  sendInvoice,
} from '@/lib/finance';
import { getApiErrorMessage } from '@/lib/api-errors';
import { hapticSuccess } from '@/lib/haptics';
import { openStudioWebPath } from '@/lib/web';
import { api } from '@/lib/api';

async function fetchInvoice(id: string): Promise<FinanceInvoice> {
  const response = await api.get<FinanceInvoice>(`/finance/invoices/${id}/`);
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

export default function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['finance/invoices', id],
    queryFn: () => fetchInvoice(String(id)),
    enabled: Boolean(id),
  });

  const sendMutation = useMutation({
    mutationFn: () => sendInvoice(Number(id)),
    onSuccess: async message => {
      await queryClient.invalidateQueries({ queryKey: ['finance/invoices', id] });
      await queryClient.invalidateQueries({ queryKey: ['finance/studio-finance'] });
      hapticSuccess();
      Alert.alert('Invoice sent', message);
      refetch();
    },
    onError: error => {
      Alert.alert('Could not send invoice', getApiErrorMessage(error));
    },
  });

  const confirmSend = () => {
    Alert.alert(
      'Send to client?',
      'This marks the invoice as sent and updates linked procurement items.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send', onPress: () => sendMutation.mutate() },
      ],
    );
  };

  if (isLoading && !data) {
    return <LoadingInline />;
  }

  if ((isError && !data) || !data) {
    return <ErrorState title="Couldn't load invoice" onRetry={refetch} />;
  }

  const statusStyle = financeStatusStyle(data.status);
  const displayId = invoiceDisplayId(data);
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
            <Field label="Client" value={financePartyName(data.client)} />
            <Field label="Project" value={projectName(data.project)} />
            <Field label="Date" value={data.date ? formatDate(data.date) : undefined} />
            <Field label="Due date" value={data.due_date ? formatDate(data.due_date) : undefined} />
            {data.xero_sync_status ? <Field label="Xero sync" value={data.xero_sync_status} /> : null}
          </View>
        </>
      ) : null}

      {isDraft ? (
        <InvoiceDraftEditor invoice={data} onSaved={refetch} />
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

      {canSendInvoice(data) ? (
        <Button
          label="Send to client"
          onPress={confirmSend}
          loading={sendMutation.isPending}
          accessibilityLabel="Mark invoice as sent"
        />
      ) : null}

      {!isDraft ? (
        <FinanceStatusActions
          kind="invoice"
          documentId={data.id}
          status={data.status}
          onUpdated={refetch}
        />
      ) : null}

      <Button
        label="Open in browser"
        variant="secondary"
        onPress={() => void openStudioWebPath(`/finance/invoices/${data.id}`)}
      />

      <Text style={styles.webHint}>
        {isDraft
          ? 'Save your draft above, then send. PDF download and Xero sync are in the web app.'
          : 'Download PDF and full email delivery options are in the web app.'}
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
