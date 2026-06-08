import { Alert, StyleSheet, Text, View } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { FinanceDocStatus } from '@focuspilot/shared';
import { Button } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';
import { getApiErrorMessage } from '@/lib/api-errors';
import { hapticSuccess } from '@/lib/haptics';
import {
  financeStatusLabel,
  getFinanceStatusActions,
  updateFinanceDocumentStatus,
  type FinanceDocumentKind,
} from '@/lib/finance';

type FinanceStatusActionsProps = {
  kind: FinanceDocumentKind;
  documentId: number;
  status?: FinanceDocStatus | string | null;
  onUpdated: () => void;
};

export function FinanceStatusActions({ kind, documentId, status, onUpdated }: FinanceStatusActionsProps) {
  const queryClient = useQueryClient();
  const actions = getFinanceStatusActions(kind, status);

  const mutation = useMutation({
    mutationFn: (nextStatus: FinanceDocStatus) => updateFinanceDocumentStatus(kind, documentId, nextStatus),
    onSuccess: async (_data, nextStatus) => {
      const listKey = kind === 'invoice' ? 'finance/invoices' : 'finance/purchase-orders';
      await queryClient.invalidateQueries({ queryKey: [listKey, String(documentId)] });
      await queryClient.invalidateQueries({ queryKey: ['finance/studio-finance'] });
      await queryClient.invalidateQueries({ queryKey: ['finance/project-finance'] });
      hapticSuccess();
      const label = financeStatusLabel(nextStatus);
      Alert.alert('Status updated', `Marked as ${label.toLowerCase()}.`);
      onUpdated();
    },
    onError: error => {
      Alert.alert('Could not update status', getApiErrorMessage(error));
    },
  });

  const confirm = (nextStatus: FinanceDocStatus, label: string) => {
    Alert.alert('Update status?', `Mark this document as ${label.toLowerCase()}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: label, onPress: () => mutation.mutate(nextStatus) },
    ]);
  };

  if (actions.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Update status</Text>
      <View style={styles.row}>
        {actions.map(action => (
          <Button
            key={action.status}
            label={action.label}
            variant={action.primary ? 'primary' : 'secondary'}
            onPress={() => confirm(action.status, action.label)}
            loading={mutation.isPending}
            accessibilityLabel={action.label}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  row: {
    gap: spacing.xs,
  },
});
