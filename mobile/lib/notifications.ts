import type { Href } from 'expo-router';
import type { NotificationItem } from '@focuspilot/shared';
import type { Ionicons } from '@expo/vector-icons';

export type NotificationTypeConfig = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
};

const notificationConfig: Record<string, NotificationTypeConfig> = {
  task_assigned: { icon: 'checkbox-outline', label: 'Task assigned' },
  project_assigned: { icon: 'folder-outline', label: 'Project assigned' },
  subtask_assigned: { icon: 'list-outline', label: 'Subtask assigned' },
  team_message: { icon: 'chatbubble-outline', label: 'Team message' },
  comment_mention: { icon: 'at-outline', label: 'Mention' },
};

const defaultConfig: NotificationTypeConfig = { icon: 'notifications-outline', label: 'Notification' };

export function getNotificationConfig(type: string): NotificationTypeConfig {
  return notificationConfig[type] ?? defaultConfig;
}

export function getNotificationRoute(notification: NotificationItem): Href | null {
  if (notification.task) return `/task/${notification.task}` as Href;
  if (notification.project) return `/project/${notification.project}` as Href;
  return null;
}

export function groupNotificationsByDate(notifications: NotificationItem[]) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups: { label: string; notifications: NotificationItem[] }[] = [];
  const todayItems: NotificationItem[] = [];
  const yesterdayItems: NotificationItem[] = [];
  const olderItems: NotificationItem[] = [];

  notifications.forEach(notification => {
    const date = new Date(notification.created_at);
    if (date.toDateString() === today.toDateString()) {
      todayItems.push(notification);
    } else if (date.toDateString() === yesterday.toDateString()) {
      yesterdayItems.push(notification);
    } else {
      olderItems.push(notification);
    }
  });

  if (todayItems.length > 0) groups.push({ label: 'Today', notifications: todayItems });
  if (yesterdayItems.length > 0) groups.push({ label: 'Yesterday', notifications: yesterdayItems });
  if (olderItems.length > 0) groups.push({ label: 'Earlier', notifications: olderItems });

  return groups;
}
