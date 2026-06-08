import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '@/constants/theme';

export type FinancePickerOption = {
  id: number;
  label: string;
};

type FinancePickerFieldProps = {
  label: string;
  value: number | null;
  options: FinancePickerOption[];
  onChange: (id: number | null) => void;
  loading?: boolean;
  optional?: boolean;
};

export function FinancePickerField({
  label,
  value,
  options,
  onChange,
  loading,
  optional,
}: FinancePickerFieldProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>
        {label}
        {optional ? ' (optional)' : ''}
      </Text>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : options.length === 0 ? (
        <Text style={styles.empty}>None available</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {optional ? (
            <Pressable
              onPress={() => onChange(null)}
              style={[styles.chip, value == null && styles.chipActive]}
              accessibilityRole="button"
              accessibilityLabel={`Clear ${label}`}
            >
              <Text style={[styles.chipText, value == null && styles.chipTextActive]}>None</Text>
            </Pressable>
          ) : null}
          {options.map(option => {
            const active = value === option.id;
            return (
              <Pressable
                key={option.id}
                onPress={() => onChange(option.id)}
                style={[styles.chip, active && styles.chipActive]}
                accessibilityRole="button"
                accessibilityLabel={`Select ${option.label}`}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]} numberOfLines={1}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
  },
  label: {
    ...typography.label,
  },
  loader: {
    alignSelf: 'flex-start',
    marginVertical: spacing.sm,
  },
  empty: {
    fontSize: 13,
    color: colors.textMuted,
  },
  row: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  chip: {
    maxWidth: 180,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.primaryForeground,
  },
});
