import { useMemo, useState } from 'react';
import { Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { NotificationItem } from '@focuspilot/shared';
import {
  ErrorState,
  FilterChips,
  LoadingInline,
  ScreenCanvas,
  ScreenScroll,
  SectionHeader,
} from '@/components/design-system';
import { StackHeaderActions } from '@/components/navigation/StackHeaderActions';
import { NotificationRow } from '@/components/notifications/NotificationRow';
import { PushSettingsCard } from '@/components/notifications/PushSettingsCard';
import { LoadingScreen } from '@/components/ui';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { useNotifications } from '@/hooks/useNotifications';
import { getNotificationRoute, groupNotificationsByDate } from '@/lib/notifications';

type FilterKey = 'all' | 'unread';

const filterOptions: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
];

export default function NotificationsScreen() {
  const [filter, setFilter] = useState<FilterKey>('all');
  const {
    notifications,
    unreadCount,
    isLoading,
    isError,
    refetch,
    isRefetching,
    markAsRead,
    markAllAsRead,
    isMarkingAllAsRead,
  } = useNotifications();

  const filtered = useMemo(() => {
    if (filter === 'unread') return notifications.filter(n => !n.is_read);
    return notifications;
  }, [notifications, filter]);

  const groups = useMemo(() => groupNotificationsByDate(filtered), [filtered]);

  const handlePress = (notification: NotificationItem) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    const route = getNotificationRoute(notification);
    if (route) router.push(route);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ScreenCanvas edges={[]}>
      <Stack.Screen
        options={{
          title: 'Notifications',
          headerRight: () => (
            <StackHeaderActions>
              {unreadCount > 0 ? (
                <Pressable
                  onPress={() => markAllAsRead()}
                  disabled={isMarkingAllAsRead}
                  style={({ pressed }) => [styles.markAllButton, pressed && styles.markAllPressed]}
                  hitSlop={8}
                >
                  <Text style={[styles.markAllText, isMarkingAllAsRead && styles.markAllDisabled]}>
                    Mark all read
                  </Text>
                </Pressable>
              ) : null}
            </StackHeaderActions>
          ),
        }}
      />

      <ScreenScroll
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
        }
      >
        {isError ? (
          <ErrorState title="Couldn't load notifications" onRetry={refetch} />
        ) : (
          <>
            <PushSettingsCard />

            <View style={styles.summaryRow}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>{unreadCount}</Text>
                <Text style={styles.summaryLabel}>Unread</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>{notifications.length}</Text>
                <Text style={styles.summaryLabel}>Total</Text>
              </View>
            </View>

            <FilterChips options={filterOptions} value={filter} onChange={setFilter} />

            {isRefetching && filtered.length === 0 ? <LoadingInline /> : null}

            {filtered.length === 0 ? (
              <View style={styles.emptyCard}>
                <View style={styles.emptyIcon}>
                  <Ionicons name="checkmark-circle-outline" size={28} color={colors.textMuted} />
                </View>
                <Text style={styles.emptyTitle}>
                  {filter === 'unread' ? 'No unread notifications' : "You're all caught up!"}
                </Text>
                <Text style={styles.emptyMessage}>
                  {filter === 'unread'
                    ? 'New activity will show up here.'
                    : 'Notifications about tasks and projects will appear here.'}
                </Text>
              </View>
            ) : (
              groups.map(group => (
                <View key={group.label}>
                  <SectionHeader title={group.label} />
                  {group.notifications.map(notification => (
                    <NotificationRow
                      key={notification.id}
                      notification={notification}
                      onPress={() => handlePress(notification)}
                    />
                  ))}
                </View>
              ))
            )}
          </>
        )}
      </ScreenScroll>
    </ScreenCanvas>
  );
}

const styles = StyleSheet.create({
  markAllButton: {
    marginRight: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  markAllPressed: {
    opacity: 0.7,
  },
  markAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.clay,
  },
  markAllDisabled: {
    opacity: 0.5,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  summaryLabel: {
    ...typography.label,
    marginTop: 4,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    ...typography.subheading,
    textAlign: 'center',
  },
  emptyMessage: {
    ...typography.caption,
    textAlign: 'center',
    marginTop: 4,
  },
});
