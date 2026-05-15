'use client';

import { Bell, ClipboardCheck, FolderKanban, CheckCircle2, ExternalLink, Loader2 } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { useState } from 'react';
import Link from 'next/link';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';

// ── Notification type config (extensible for future types) ─────────────────
const notificationConfig: Record<string, { icon: React.ElementType; label: string }> = {
  task_assigned: { icon: ClipboardCheck, label: 'Task assigned' },
  project_assigned: { icon: FolderKanban, label: 'Project assigned' },
  // Add new notification types here as they are added to the API
  default: { icon: Bell, label: 'Notification' },
};

function getNotificationConfig(type: string) {
  return notificationConfig[type] || notificationConfig.default;
}

function getNotificationLink(notification: Notification): string {
  if (notification.task && notification.project) {
    return `/projects/${notification.project}/tasks?task=${notification.task}`;
  }
  if (notification.subtask && notification.project) {
    return `/projects/${notification.project}/tasks?subtask=${notification.subtask}`;
  }
  if (notification.project) {
    return `/projects/${notification.project}`;
  }
  return '#';
}

function formatTime(dateString: string): string {
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch {
    return '';
  }
}

// ── Group notifications by date ────────────────────────────────────────────
function groupNotificationsByDate(notifications: Notification[]) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups: { label: string; notifications: Notification[] }[] = [];
  const todayNotifications: Notification[] = [];
  const yesterdayNotifications: Notification[] = [];
  const olderNotifications: Notification[] = [];

  notifications.forEach((n) => {
    const date = new Date(n.created_at);
    if (date.toDateString() === today.toDateString()) {
      todayNotifications.push(n);
    } else if (date.toDateString() === yesterday.toDateString()) {
      yesterdayNotifications.push(n);
    } else {
      olderNotifications.push(n);
    }
  });

  if (todayNotifications.length > 0) {
    groups.push({ label: 'Today', notifications: todayNotifications });
  }
  if (yesterdayNotifications.length > 0) {
    groups.push({ label: 'Yesterday', notifications: yesterdayNotifications });
  }
  if (olderNotifications.length > 0) {
    groups.push({ label: 'Earlier', notifications: olderNotifications });
  }

  return groups;
}

// ── Notification Item ──────────────────────────────────────────────────────
function NotificationItem({
  notification,
  onMarkAsRead,
}: {
  notification: Notification;
  onMarkAsRead: (id: number) => void;
}) {
  const config = getNotificationConfig(notification.notification_type);
  const Icon = config.icon;
  const link = getNotificationLink(notification);

  const handleClick = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <Link
      href={link}
      onClick={handleClick}
      className="flex items-start gap-3 px-4 py-3 hover:bg-stone-50 cursor-pointer transition-colors relative"
    >
      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-gray-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{config.label}</p>
        <p className="text-xs text-gray-500 line-clamp-2">{notification.message}</p>
        <p className="text-xs text-gray-400 mt-0.5">{formatTime(notification.created_at)}</p>
      </div>
      {!notification.is_read && (
        <span className="w-2 h-2 rounded-full bg-terracotta-500 flex-shrink-0 mt-1.5" />
      )}
    </Link>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export const NotificationButton = () => {
  const [open, setOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    isMarkingAllAsRead,
  } = useNotifications();

  const groupedNotifications = groupNotificationsByDate(notifications);
  const hasNotifications = notifications.length > 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="bg-stone-50 hover:bg-stone-100 text-ink focus-visible:ring-neutral-300 w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 relative focus-visible:outline-none focus-visible:ring-2"
          aria-label="Notifications"
        >
          <span className="relative">
            <Bell className="w-4 h-4 stroke-[1.75]" />
            {unreadCount > 0 && (
              <span className="absolute -top-[5px] -right-1 font-medium w-[15px] h-[15px] text-[10px] rounded-full bg-red-500 text-white flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </span>
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        alignOffset={-40}
        className="w-[340px] mt-1 rounded-xl bg-white border border-gray-200 shadow-lg p-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <p className="text-sm font-semibold text-gray-900">Notifications</p>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              disabled={isMarkingAllAsRead}
              className="text-xs text-terracotta-600 hover:text-terracotta-700 font-medium transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              {isMarkingAllAsRead && <Loader2 className="w-3 h-3 animate-spin" />}
              Mark all read
            </button>
          )}
        </div>

        {/* Body */}
        <div className="max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="p-6 text-center">
              <Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-400" />
            </div>
          ) : !hasNotifications ? (
            <div className="p-6 text-center">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">You're all caught up!</p>
            </div>
          ) : (
            groupedNotifications.map((group) => (
              <div key={group.label}>
                <div className="px-4 py-2 bg-stone-50 border-t border-gray-100 first:border-t-0">
                  <span className="text-xs font-medium text-gray-500">{group.label}</span>
                </div>
                {group.notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                  />
                ))}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {hasNotifications && (
          <div className="border-t px-4 py-2.5">
            <Link
              href="/notifications"
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 transition-colors"
            >
              View all notifications
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationButton;
