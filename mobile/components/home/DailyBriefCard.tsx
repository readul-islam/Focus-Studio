import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '@/constants/theme';

type DailyBriefCardProps = {
  brief?: string | null;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
};

export function DailyBriefCard({ brief, isLoading, isError, onRetry }: DailyBriefCardProps) {
  if (isLoading) {
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <Ionicons name="sparkles" size={18} color={colors.clay} />
          <Text style={styles.title}>Daily brief</Text>
        </View>
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      </View>
    );
  }

  if (isError || !brief) {
    return null;
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="sparkles" size={18} color={colors.clay} />
        <Text style={styles.title}>Daily brief</Text>
        {onRetry ? (
          <Pressable onPress={onRetry} hitSlop={8} style={styles.refresh}>
            <Ionicons name="refresh-outline" size={16} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>
      <Text style={styles.body}>{brief}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.subheading,
    flex: 1,
  },
  refresh: {
    padding: 4,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  loader: {
    marginVertical: spacing.sm,
  },
});
