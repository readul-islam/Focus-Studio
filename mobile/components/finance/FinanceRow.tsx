import { Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBadge } from '@/components/design-system';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { formatCurrency, formatDate } from '@/lib/format';
import {
  financePartyName,
  financeStatusStyle,
  invoiceDisplayId,
  poDisplayId,
  projectName,
  type FinanceListItem,
} from '@/lib/finance';

type FinanceRowProps = {
  item: FinanceListItem;
  onPress: () => void;
};

export function FinanceRow({ item, onPress }: FinanceRowProps) {
  const isInvoice = item.kind === 'invoice';
  const doc = item.data;
  const displayId = isInvoice ? invoiceDisplayId(item.data) : poDisplayId(item.data);
  const party = isInvoice ? financePartyName(item.data.client) : financePartyName(item.data.supplier);
  const project = projectName(doc.project);
  const statusStyle = financeStatusStyle(doc.status);
  const kindLabel = isInvoice ? 'Invoice' : 'Purchase order';

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.id}>{displayId}</Text>
          <Text style={styles.kind}>{kindLabel}</Text>
        </View>
        <StatusBadge label={statusStyle.label} color={statusStyle.color} backgroundColor={statusStyle.backgroundColor} />
      </View>
      <Text style={styles.amount}>
        {formatCurrency(doc.total_amount, doc.currency ?? 'GBP')}
      </Text>
      {party !== '—' ? (
        <Text style={styles.party} numberOfLines={1}>
          {party}
        </Text>
      ) : null}
      <Text style={styles.meta} numberOfLines={1}>
        {[project, doc.date ? formatDate(doc.date) : null].filter(Boolean).join(' · ')}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  rowPressed: {
    backgroundColor: colors.surfaceElevated,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  headerLeft: {
    flex: 1,
    minWidth: 0,
  },
  id: {
    ...typography.subheading,
  },
  kind: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  amount: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  party: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  meta: {
    fontSize: 13,
    color: colors.textMuted,
  },
});
