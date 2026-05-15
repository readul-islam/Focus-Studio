'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchData, patchData, deleteData } from '@/lib/Api';

// ── Types ──────────────────────────────────────────────────────────────────
export interface Notification {
  id: number;
  notification_type: string;
  message: string;
  is_read: boolean;
  project: number | null;
  task: number | null;
  subtask: number | null;
  created_at: string;
}

interface UnreadCountResponse {
  unread_count: number;
}

// ── Polling interval (2 minutes for good responsiveness) ──────────────────
const POLLING_INTERVAL = 2 * 60 * 1000;

// ── Browser Push Notification Helper ───────────────────────────────────────
const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  task_assigned: 'Task Assigned',
  project_assigned: 'Project Assigned',
};

function getNotificationTitle(type: string): string {
  return NOTIFICATION_TYPE_LABELS[type] || 'New Notification';
}

async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
}

function showBrowserNotification(notification: Notification) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const title = getNotificationTitle(notification.notification_type);

  new window.Notification(title, {
    body: notification.message,
    icon: '/favicon.ico',
    tag: `notification-${notification.id}`,
    requireInteraction: false,
  });
}

// ── Hook ───────────────────────────────────────────────────────────────────
export function useNotifications() {
  const queryClient = useQueryClient();
  const previousNotificationsRef = useRef<Notification[]>([]);
  const hasRequestedPermission = useRef(false);

  // Fetch all notifications
  const {
    data: notifications = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: () => fetchData('/notifications/'),
    refetchInterval: POLLING_INTERVAL,
    refetchIntervalInBackground: false,
  });

  // Fetch unread count (lighter endpoint for badge updates)
  const { data: unreadData } = useQuery<UnreadCountResponse>({
    queryKey: ['notifications-unread-count'],
    queryFn: () => fetchData('/notifications/unread-count/'),
    refetchInterval: POLLING_INTERVAL,
    refetchIntervalInBackground: false,
  });

  // Request notification permission on mount
  useEffect(() => {
    if (!hasRequestedPermission.current) {
      hasRequestedPermission.current = true;
      requestNotificationPermission();
    }
  }, []);

  // Check for new notifications and show browser notification
  useEffect(() => {
    if (notifications.length === 0) return;

    const previousIds = new Set(previousNotificationsRef.current.map((n) => n.id));
    const newNotifications = notifications.filter(
      (n) => !previousIds.has(n.id) && !n.is_read
    );

    // Show browser notification for each new notification
    newNotifications.forEach((notification) => {
      showBrowserNotification(notification);
    });

    previousNotificationsRef.current = notifications;
  }, [notifications]);

  // Mark single notification as read
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: number) =>
      patchData({ url: `/notifications/${notificationId}/read/` }),
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      await queryClient.cancelQueries({ queryKey: ['notifications-unread-count'] });

      const previousNotifications = queryClient.getQueryData<Notification[]>(['notifications']);
      const previousCount = queryClient.getQueryData<UnreadCountResponse>(['notifications-unread-count']);

      queryClient.setQueryData<Notification[]>(['notifications'], (old) =>
        old?.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );

      queryClient.setQueryData<UnreadCountResponse>(['notifications-unread-count'], (old) => ({
        unread_count: Math.max(0, (old?.unread_count || 1) - 1),
      }));

      return { previousNotifications, previousCount };
    },
    onError: (_err, _notificationId, context) => {
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

  // Mark all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: () => patchData({ url: '/notifications/mark-all-read/' }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      await queryClient.cancelQueries({ queryKey: ['notifications-unread-count'] });

      const previousNotifications = queryClient.getQueryData<Notification[]>(['notifications']);
      const previousCount = queryClient.getQueryData<UnreadCountResponse>(['notifications-unread-count']);

      queryClient.setQueryData<Notification[]>(['notifications'], (old) =>
        old?.map((n) => ({ ...n, is_read: true }))
      );
      queryClient.setQueryData<UnreadCountResponse>(['notifications-unread-count'], { unread_count: 0 });

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

  // Delete/dismiss notification
  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId: number) =>
      deleteData({ url: `/notifications/${notificationId}/`, data: null }),
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      await queryClient.cancelQueries({ queryKey: ['notifications-unread-count'] });

      const previousNotifications = queryClient.getQueryData<Notification[]>(['notifications']);
      const previousCount = queryClient.getQueryData<UnreadCountResponse>(['notifications-unread-count']);

      // Find if the notification being deleted is unread
      const notificationToDelete = previousNotifications?.find((n) => n.id === notificationId);
      const wasUnread = notificationToDelete && !notificationToDelete.is_read;

      // Optimistically remove from list
      queryClient.setQueryData<Notification[]>(['notifications'], (old) =>
        old?.filter((n) => n.id !== notificationId)
      );

      // Update unread count if it was unread
      if (wasUnread) {
        queryClient.setQueryData<UnreadCountResponse>(['notifications-unread-count'], (old) => ({
          unread_count: Math.max(0, (old?.unread_count || 1) - 1),
        }));
      }

      return { previousNotifications, previousCount };
    },
    onError: (_err, _notificationId, context) => {
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

  // Enable/disable browser notifications
  const enableBrowserNotifications = useCallback(async () => {
    return await requestNotificationPermission();
  }, []);

  const getBrowserNotificationStatus = useCallback((): 'granted' | 'denied' | 'default' | 'unsupported' => {
    if (!('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  }, []);

  return {
    notifications,
    unreadCount: unreadData?.unread_count ?? 0,
    isLoading,
    error,
    refetch,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteNotification: deleteNotificationMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
    isDeleting: deleteNotificationMutation.isPending,
    // Browser notification helpers
    enableBrowserNotifications,
    getBrowserNotificationStatus,
  };
}
