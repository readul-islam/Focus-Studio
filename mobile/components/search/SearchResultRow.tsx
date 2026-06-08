import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { taskStatusLabel } from '@/lib/task-utils';
import { financeStatusLabel } from '@/lib/finance';
import type { SearchResult } from '@/lib/search';

const typeConfig = {
  task: { icon: 'checkbox-outline' as const, color: colors.brand },
  project: { icon: 'folder-outline' as const, color: colors.clay },
  message: { icon: 'mail-outline' as const, color: colors.success },
  contact: { icon: 'person-outline' as const, color: colors.primary },
  invoice: { icon: 'receipt-outline' as const, color: colors.warning },
  purchase_order: { icon: 'cart-outline' as const, color: colors.clay },
};

export function SearchResultRow({ result, onPress }: { result: SearchResult; onPress: () => void }) {
  const config = typeConfig[result.type];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <View style={[styles.iconWrap, { backgroundColor: `${config.color}14` }]}>
        <Ionicons name={config.icon} size={18} color={config.color} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {result.title}
        </Text>
        {result.subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {result.subtitle}
          </Text>
        ) : null}
      </View>
      {result.type === 'task' && result.meta ? (
        <Text style={styles.meta}>{taskStatusLabel(result.meta)}</Text>
      ) : result.meta && (result.type === 'invoice' || result.type === 'purchase_order') ? (
        <Text style={styles.meta}>{financeStatusLabel(result.meta)}</Text>
      ) : (
        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  rowPressed: {
    backgroundColor: colors.surfaceElevated,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
  },
  title: {
    ...typography.subheading,
    fontSize: 15,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  meta: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
});
