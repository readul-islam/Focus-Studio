import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NotificationItem } from '@focuspilot/shared';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { formatTimeAgo } from '@/lib/format';
import { getNotificationConfig } from '@/lib/notifications';

export function NotificationRow({
  notification,
  onPress,
}: {
  notification: NotificationItem;
  onPress: () => void;
}) {
  const config = getNotificationConfig(notification.notification_type);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        !notification.is_read && styles.rowUnread,
        pressed && styles.rowPressed,
      ]}
    >
      <View style={styles.iconWrap}>
        <Ionicons name={config.icon} size={18} color={colors.textSecondary} />
      </View>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.label}>{config.label}</Text>
          {!notification.is_read ? <View style={styles.unreadDot} /> : null}
        </View>
        <Text style={styles.message} numberOfLines={2}>
          {notification.message}
        </Text>
        <Text style={styles.time}>{formatTimeAgo(notification.created_at)}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
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
  rowUnread: {
    borderColor: '#fcd9cc',
    backgroundColor: '#fffaf8',
  },
  rowPressed: {
    backgroundColor: colors.surfaceElevated,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  label: {
    ...typography.subheading,
    fontSize: 14,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: radius.full,
    backgroundColor: colors.clay,
  },
  message: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  time: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
});
