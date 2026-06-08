import { Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBadge } from '@/components/design-system';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { formatCurrency } from '@/lib/format';
import {
  leadDaysInStage,
  leadDisplayValue,
  leadStageStyle,
  leadStaleLevel,
  type CrmLead,
} from '@/lib/leads';

type LeadRowProps = {
  lead: CrmLead;
  currency?: string;
  onPress: () => void;
};

export function LeadRow({ lead, currency = 'GBP', onPress }: LeadRowProps) {
  const stageStyle = leadStageStyle(lead.stage);
  const value = leadDisplayValue(lead);
  const days = leadDaysInStage(lead);
  const stale = leadStaleLevel(lead);

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title} numberOfLines={1}>
            {lead.title}
          </Text>
          {lead.full_name ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {lead.full_name}
            </Text>
          ) : null}
        </View>
        <StatusBadge label={stageStyle.label} color={stageStyle.color} backgroundColor={stageStyle.backgroundColor} />
      </View>

      <View style={styles.metaRow}>
        {value > 0 ? (
          <Text style={styles.value}>{formatCurrency(value, currency)}</Text>
        ) : (
          <Text style={styles.valueMuted}>No value set</Text>
        )}
        <View style={styles.daysWrap}>
          {stale !== 'fresh' && lead.stage !== 'won' && lead.stage !== 'lost' ? (
            <View style={[styles.staleDot, stale === 'stale' ? styles.staleDotHot : styles.staleDotWarm]} />
          ) : null}
          <Text style={styles.days}>{days === 0 ? 'Today' : `${days}d in stage`}</Text>
        </View>
      </View>

      {lead.source ? (
        <Text style={styles.source} numberOfLines={1}>
          via {lead.source}
        </Text>
      ) : null}
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
  title: {
    ...typography.subheading,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  value: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  valueMuted: {
    fontSize: 14,
    color: colors.textMuted,
  },
  daysWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  staleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  staleDotWarm: {
    backgroundColor: colors.warning,
  },
  staleDotHot: {
    backgroundColor: colors.danger,
  },
  days: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  source: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
