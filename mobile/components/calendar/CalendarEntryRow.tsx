import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '@/constants/theme';
import type { CalendarEntry } from '@/lib/calendar';

const typeConfig = {
  phase: { icon: 'layers-outline' as const, color: colors.brand, label: 'Phase' },
  delivery: { icon: 'cube-outline' as const, color: colors.clay, label: 'Delivery' },
  meeting: { icon: 'videocam-outline' as const, color: colors.success, label: 'Meeting' },
};

export function CalendarEntryRow({
  entry,
  onPress,
}: {
  entry: CalendarEntry;
  onPress?: () => void;
}) {
  const config = typeConfig[entry.type];

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.row, pressed && onPress && styles.rowPressed]}
    >
      <View style={[styles.iconWrap, { backgroundColor: `${config.color}14` }]}>
        <Ionicons name={config.icon} size={18} color={config.color} />
      </View>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.typeLabel}>{config.label}</Text>
          {entry.timeLabel ? <Text style={styles.time}>{entry.timeLabel}</Text> : null}
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {entry.title}
        </Text>
        {entry.subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {entry.subtitle}
          </Text>
        ) : null}
      </View>
      {onPress ? <Ionicons name="chevron-forward" size={16} color={colors.textMuted} /> : null}
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  typeLabel: {
    ...typography.label,
    fontSize: 10,
    color: colors.textMuted,
  },
  time: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  title: {
    ...typography.subheading,
    fontSize: 15,
    marginTop: 2,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
});
