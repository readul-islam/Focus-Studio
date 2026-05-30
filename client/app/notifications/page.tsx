'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import {
  Bell,
  ClipboardCheck,
  FolderKanban,
  CheckCircle2,
  Search,
  Filter,
  Loader2,
  ChevronRight,
  Check,
  X,
  BellRing,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';
import { gooeyToast as toast } from 'goey-toast';
import { useTranslations } from 'next-intl';

function useNotificationTypeConfig() {
  const t = useTranslations('notificationsPage.types');
  return {
    task_assigned: { icon: ClipboardCheck, label: t('taskAssigned') },
    project_assigned: { icon: FolderKanban, label: t('projectAssigned') },
    default: { icon: Bell, label: t('default') },
  } as const;
}

function getNotificationConfig(
  type: string,
  configs: ReturnType<typeof useNotificationTypeConfig>
) {
  return configs[type as keyof typeof configs] || configs.default;
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

function formatNotificationDate(
  dateString: string,
  t: ReturnType<typeof useTranslations<'notificationsPage'>>
): string {
  try {
    const date = parseISO(dateString);
    if (isToday(date)) {
      return t('dateAt', { time: format(date, 'h:mm a') });
    }
    if (isYesterday(date)) {
      return t('yesterdayAt', { time: format(date, 'h:mm a') });
    }
    return format(date, 'MMM d, yyyy • h:mm a');
  } catch {
    return '';
  }
}

function getDateGroup(
  dateString: string,
  t: ReturnType<typeof useTranslations<'notificationsPage'>>
): string {
  try {
    const date = parseISO(dateString);
    if (isToday(date)) return t('dateGroups.today');
    if (isYesterday(date)) return t('dateGroups.yesterday');
    return format(date, 'MMMM yyyy');
  } catch {
    return t('dateGroups.other');
  }
}

function groupNotifications(
  notifications: Notification[],
  t: ReturnType<typeof useTranslations<'notificationsPage'>>
): Record<string, Notification[]> {
  return notifications.reduce((acc, notification) => {
    const group = getDateGroup(notification.created_at, t);
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(notification);
    return acc;
  }, {} as Record<string, Notification[]>);
}

// ── Notification Card ──────────────────────────────────────────────────────
function NotificationCard({
  notification,
  onMarkAsRead,
  onDelete,
}: {
  notification: Notification;
  onMarkAsRead: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const router = useRouter();
  const t = useTranslations('notificationsPage');
  const typeConfigs = useNotificationTypeConfig();
  const config = getNotificationConfig(notification.notification_type, typeConfigs);
  const Icon = config.icon;
  const link = getNotificationLink(notification);

  const handleClick = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
    if (link !== '#') {
      router.push(link);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(notification.id);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-200 group relative',
        notification.is_read
          ? 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50/50'
          : 'bg-[#efeae2]/50 border-[#e5dfd6]/50 hover:border-[#d9d2c8]/60 hover:bg-[#e8e2d9]/60'
      )}
    >
      {/* Icon */}
      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-white">
        <Icon className="w-5 h-5 text-gray-600" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white text-gray-700">
                {config.label}
              </span>
              {!notification.is_read && (
                <span className="w-2 h-2 rounded-full bg-terracotta-500 flex-shrink-0" />
              )}
            </div>
            <p
              className={cn(
                'text-sm leading-relaxed',
                notification.is_read ? 'text-gray-600' : 'text-gray-900 font-medium'
              )}
            >
              {notification.message}
            </p>
            <p className="text-xs text-gray-400 mt-1.5">
              {formatNotificationDate(notification.created_at, t)}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Delete button */}
            <button
              onClick={handleDelete}
              className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
              title={t('dismiss')}
            >
              <X className="w-4 h-4" />
            </button>

            {/* Arrow */}
            {link !== '#' && (
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const t = useTranslations('notificationsPage');
  const tc = useTranslations('common');
  const typeConfigs = useNotificationTypeConfig();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [readFilter, setReadFilter] = useState<string>('all');

  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    isMarkingAllAsRead,
    enableBrowserNotifications,
    getBrowserNotificationStatus,
  } = useNotifications();

  const browserNotificationStatus = getBrowserNotificationStatus();

  const handleEnableBrowserNotifications = async () => {
    const granted = await enableBrowserNotifications();
    if (granted) {
      toast.success(t('toasts.pushEnabled'));
    } else {
      toast.error(t('toasts.pushDenied'));
    }
  };

  const handleDelete = (id: number) => {
    deleteNotification(id);
    toast.success(t('toasts.dismissed'));
  };

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (typeFilter !== 'all' && n.notification_type !== typeFilter) {
        return false;
      }
      if (readFilter === 'unread' && n.is_read) {
        return false;
      }
      if (readFilter === 'read' && !n.is_read) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return n.message.toLowerCase().includes(query);
      }
      return true;
    });
  }, [notifications, typeFilter, readFilter, searchQuery]);

  const groupedNotifications = useMemo(
    () => groupNotifications(filteredNotifications, t),
    [filteredNotifications, t]
  );
  const groups = Object.keys(groupedNotifications);

  const notificationTypes = useMemo(() => {
    const types = new Set(notifications.map((n) => n.notification_type));
    return Array.from(types);
  }, [notifications]);

  return (
    <div className="space-y-8 mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t('title')}</h1>
          <p className="text-base text-gray-500">
            {unreadCount > 0
              ? t('unreadCount', { count: unreadCount })
              : t('allCaughtUp')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Browser notification toggle */}
          {browserNotificationStatus !== 'unsupported' && browserNotificationStatus !== 'granted' && (
            <Button
              variant="outline"
              onClick={handleEnableBrowserNotifications}
              className="flex items-center gap-2"
            >
              <BellRing className="w-4 h-4" />
              {t('enablePush')}
            </Button>
          )}

          {browserNotificationStatus === 'granted' && (
            <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-2.5 py-1.5 rounded-full">
              <BellRing className="w-3.5 h-3.5" />
              {t('pushEnabled')}
            </div>
          )}

          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={() => markAllAsRead()}
              disabled={isMarkingAllAsRead}
              className="flex items-center gap-2"
            >
              {isMarkingAllAsRead ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              {t('markAllRead')}
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center pb-6 border-b border-gray-100">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white border-gray-200"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder={t('allTypes')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allTypes')}</SelectItem>
              {notificationTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {getNotificationConfig(type, typeConfigs).label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={readFilter} onValueChange={setReadFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder={tc('all')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{tc('all')}</SelectItem>
              <SelectItem value="unread">{t('unread')}</SelectItem>
              <SelectItem value="read">{t('read')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="py-20 text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
          <p className="mt-3 text-sm text-gray-500">{t('loading')}</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredNotifications.length === 0 && (
        <div className="py-20 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-white flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7 text-gray-400" />
          </div>
          <h3 className="text-base font-medium text-gray-900 mb-1">{t('emptyTitle')}</h3>
          <p className="text-sm text-gray-500">
            {searchQuery || typeFilter !== 'all' || readFilter !== 'all'
              ? t('emptyFiltered')
              : t('emptyDefault')}
          </p>
        </div>
      )}

      {/* Notifications List */}
      {!isLoading && groups.length > 0 && (
        <div className="space-y-8">
          {groups.map((group) => (
            <div key={group}>
              {/* Group Header */}
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                {group}
              </h2>

              {/* Notifications in this group */}
              <div className="space-y-3">
                {groupedNotifications[group].map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
