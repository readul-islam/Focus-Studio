import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type RefreshControlProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, shadows, spacing, typography } from '@/constants/theme';

type ScreenCanvasProps = {
  children: React.ReactNode;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  style?: StyleProp<ViewStyle>;
};

export function ScreenCanvas({ children, edges = ['top'], style }: ScreenCanvasProps) {
  return (
    <SafeAreaView style={[styles.canvas, style]} edges={edges}>
      {children}
    </SafeAreaView>
  );
}

type ScreenScrollProps = {
  children: React.ReactNode;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  contentStyle?: StyleProp<ViewStyle>;
};

export function ScreenScroll({ children, refreshControl, contentStyle }: ScreenScrollProps) {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.scrollContent, contentStyle]}
      showsVerticalScrollIndicator={false}
      refreshControl={refreshControl}
    >
      {children}
    </ScrollView>
  );
}

export function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
}: {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderText}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={styles.sectionAction}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function ListCard({
  title,
  subtitle,
  meta,
  badge,
  onPress,
  showChevron = true,
}: {
  title: string;
  subtitle?: string;
  meta?: string;
  badge?: React.ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.listCard, pressed && onPress && styles.listCardPressed]}
    >
      <View style={styles.listCardBody}>
        <View style={styles.listCardTop}>
          <Text style={styles.listCardTitle} numberOfLines={2}>
            {title}
          </Text>
          {badge}
        </View>
        {subtitle ? (
          <Text style={styles.listCardSubtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
        {meta ? (
          <Text style={styles.listCardMeta} numberOfLines={1}>
            {meta}
          </Text>
        ) : null}
      </View>
      {showChevron && onPress ? (
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} style={styles.chevron} />
      ) : null}
    </Pressable>
  );
}

export function StatusBadge({
  label,
  color,
  backgroundColor,
}: {
  label: string;
  color: string;
  backgroundColor?: string;
}) {
  return (
    <View style={[styles.statusBadge, { borderColor: color, backgroundColor: backgroundColor ?? colors.white }]}>
      <Text style={[styles.statusBadgeText, { color }]}>{label}</Text>
    </View>
  );
}

export function KpiCard({
  label,
  value,
  subtitle,
  accent,
}: {
  label: string;
  value: string | number;
  subtitle?: string;
  accent?: string;
}) {
  return (
    <View style={[styles.kpiCard, accent ? { borderLeftColor: accent, borderLeftWidth: 3 } : null]}>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={styles.kpiValue}>{value}</Text>
      {subtitle ? <Text style={styles.kpiSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function ProgressBar({ value, color = colors.clay }: { value: number; color?: string }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${clamped}%`, backgroundColor: color }]} />
    </View>
  );
}

export function ErrorState({ title, message, onRetry }: { title: string; message?: string; onRetry?: () => void }) {
  return (
    <View style={styles.errorState}>
      <Ionicons name="cloud-offline-outline" size={40} color={colors.textMuted} />
      <Text style={styles.errorTitle}>{title}</Text>
      {message ? <Text style={styles.errorMessage}>{message}</Text> : null}
      {onRetry ? (
        <Pressable onPress={onRetry} style={styles.retryButton}>
          <Text style={styles.retryText}>Try again</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function MenuRow({
  icon,
  label,
  value,
  onPress,
  destructive,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.menuRow, pressed && onPress && styles.menuRowPressed]}
    >
      <View style={[styles.menuIconWrap, destructive && styles.menuIconDestructive]}>
        <Ionicons name={icon} size={18} color={destructive ? colors.danger : colors.textSecondary} />
      </View>
      <View style={styles.menuRowBody}>
        <Text style={[styles.menuRowLabel, destructive && styles.menuRowDestructive]}>{label}</Text>
        {value ? <Text style={styles.menuRowValue}>{value}</Text> : null}
      </View>
      {onPress ? <Ionicons name="chevron-forward" size={16} color={colors.textMuted} /> : null}
    </Pressable>
  );
}

export function FilterChips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { key: T; label: string }[];
  value: T;
  onChange: (key: T) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
      {options.map(option => {
        const active = option.key === value;
        return (
          <Pressable
            key={option.key}
            onPress={() => onChange(option.key)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function LoadingInline() {
  return (
    <View style={styles.loadingInline}>
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}

export function AvatarCircle({ name, size = 40 }: { name?: string; size?: number }) {
  const initials = (name ?? '?')
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.34 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  scroll: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionTitle: {
    ...typography.subheading,
    fontSize: 17,
  },
  sectionSubtitle: {
    ...typography.caption,
    marginTop: 2,
  },
  sectionAction: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.clay,
  },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  listCardPressed: {
    backgroundColor: colors.surfaceElevated,
    transform: [{ scale: 0.995 }],
  },
  listCardBody: {
    flex: 1,
  },
  listCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  listCardTitle: {
    flex: 1,
    ...typography.subheading,
    fontSize: 15,
  },
  listCardSubtitle: {
    ...typography.caption,
    marginTop: 4,
    color: colors.textSecondary,
  },
  listCardMeta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  chevron: {
    marginLeft: spacing.sm,
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  kpiCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...shadows.sm,
  },
  kpiLabel: {
    ...typography.label,
    fontSize: 11,
    marginBottom: spacing.xs,
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
  },
  kpiSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
  },
  progressTrack: {
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.borderSoft,
    overflow: 'hidden',
    marginTop: spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.full,
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  errorTitle: {
    ...typography.subheading,
    textAlign: 'center',
  },
  errorMessage: {
    ...typography.caption,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  retryText: {
    color: colors.primaryForeground,
    fontWeight: '600',
    fontSize: 14,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  menuRowPressed: {
    backgroundColor: colors.surfaceElevated,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuIconDestructive: {
    backgroundColor: colors.dangerSurface,
  },
  menuRowBody: {
    flex: 1,
  },
  menuRowLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  menuRowDestructive: {
    color: colors.danger,
  },
  menuRowValue: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  chipsRow: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
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
  loadingInline: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.primaryForeground,
    fontWeight: '700',
  },
});
