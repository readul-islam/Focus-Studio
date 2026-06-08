import { useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { NotificationItem, NotificationUnreadCount } from '@focuspilot/shared';
import { api } from '@/lib/api';
import { getNotificationConfig } from '@/lib/notifications';
import { showLocalNotification } from '@/lib/push-notifications';

const POLLING_INTERVAL = 2 * 60 * 1000;

async function fetchNotifications(): Promise<NotificationItem[]> {
  const response = await api.get<NotificationItem[]>('/notifications/');
  return response.data;
}

async function fetchUnreadCount(): Promise<NotificationUnreadCount> {
  const response = await api.get<NotificationUnreadCount>('/notifications/unread-count/');
  return response.data;
}

export function useNotifications() {
  const queryClient = useQueryClient();

  const notificationsQuery = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    refetchInterval: POLLING_INTERVAL,
  });

  const unreadQuery = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: fetchUnreadCount,
    refetchInterval: POLLING_INTERVAL,
  });

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    }, [queryClient])
  );

  const seenIdsRef = useRef<Set<number>>(new Set());
  const initializedRef = useRef(false);

  useEffect(() => {
    const items = notificationsQuery.data ?? [];
    if (!initializedRef.current) {
      seenIdsRef.current = new Set(items.map(n => n.id));
      initializedRef.current = true;
      return;
    }

    const fresh = items.filter(n => !seenIdsRef.current.has(n.id) && !n.is_read);
    seenIdsRef.current = new Set(items.map(n => n.id));

    if (fresh.length === 0 || AppState.currentState !== 'active') {
      return;
    }

    fresh.slice(0, 3).forEach(notification => {
      const config = getNotificationConfig(notification.notification_type);
      showLocalNotification(config.label, notification.message, {
        notification_id: notification.id,
        notification_type: notification.notification_type,
        task: notification.task ?? undefined,
        project: notification.project ?? undefined,
      });
    });
  }, [notificationsQuery.data]);

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: number) => api.patch(`/notifications/${notificationId}/read/`),
    onMutate: async notificationId => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      await queryClient.cancelQueries({ queryKey: ['notifications-unread-count'] });

      const previousNotifications = queryClient.getQueryData<NotificationItem[]>(['notifications']);
      const previousCount = queryClient.getQueryData<NotificationUnreadCount>(['notifications-unread-count']);

      queryClient.setQueryData<NotificationItem[]>(['notifications'], old =>
        old?.map(n => (n.id === notificationId ? { ...n, is_read: true } : n))
      );

      queryClient.setQueryData<NotificationUnreadCount>(['notifications-unread-count'], old => ({
        unread_count: Math.max(0, (old?.unread_count ?? 1) - 1),
      }));

      return { previousNotifications, previousCount };
    },
    onError: (_err, _id, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(['notifications'], context.previousNotifications);
      }
      if (context?.previousCount) {
        queryClient.setQueryData(['notifications-unread-count'], context.previousCount);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => api.patch('/notifications/mark-all-read/'),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      await queryClient.cancelQueries({ queryKey: ['notifications-unread-count'] });

      const previousNotifications = queryClient.getQueryData<NotificationItem[]>(['notifications']);
      const previousCount = queryClient.getQueryData<NotificationUnreadCount>(['notifications-unread-count']);

      queryClient.setQueryData<NotificationItem[]>(['notifications'], old => old?.map(n => ({ ...n, is_read: true })));
      queryClient.setQueryData<NotificationUnreadCount>(['notifications-unread-count'], { unread_count: 0 });

      return { previousNotifications, previousCount };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(['notifications'], context.previousNotifications);
      }
      if (context?.previousCount) {
        queryClient.setQueryData(['notifications-unread-count'], context.previousCount);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  return {
    notifications: notificationsQuery.data ?? [],
    unreadCount: unreadQuery.data?.unread_count ?? 0,
    isLoading: notificationsQuery.isLoading,
    isError: notificationsQuery.isError,
    refetch: notificationsQuery.refetch,
    isRefetching: notificationsQuery.isRefetching,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
  };
}
