'use client';

import { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Activity,
  Mail,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Undo2,
  Eye,
  Send,
  Package,
  PackageX,
  MessageSquare,
  Truck,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { getAIActivities, type AIActivity } from './actions';
import { useTranslations } from 'next-intl';

type ActivityType =
  | 'daily_brief'
  | 'email_categorized'
  | 'procurement_followup'
  | 'procurement_escalation'
  | 'quote_reminder'
  | 'stock_change_detected'
  | 'client_feedback_received'
  | 'quote_received'
  | 'delivery_update';

const activityConfig: Record<
  ActivityType,
  {
    icon: typeof FileText;
    color: string;
    bgColor: string;
    borderColor: string;
  }
> = {
  daily_brief: {
    icon: FileText,
    color: 'text-sage-600',
    bgColor: 'bg-sage-50',
    borderColor: 'border-sage-200',
  },
  email_categorized: {
    icon: Mail,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  procurement_followup: {
    icon: Send,
    color: 'text-clay-600',
    bgColor: 'bg-clay-50',
    borderColor: 'border-clay-200',
  },
  procurement_escalation: {
    icon: AlertTriangle,
    color: 'text-terracotta-600',
    bgColor: 'bg-terracotta-50',
    borderColor: 'border-terracotta-200',
  },
  quote_reminder: {
    icon: Clock,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  stock_change_detected: {
    icon: PackageX,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  client_feedback_received: {
    icon: MessageSquare,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  quote_received: {
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  delivery_update: {
    icon: Truck,
    color: 'text-olive-600',
    bgColor: 'bg-olive-50',
    borderColor: 'border-olive-200',
  },
};

function ActivityItem({ activity }: { activity: AIActivity }) {
  const t = useTranslations('aiActivityPage');
  const config = activityConfig[activity.type as ActivityType] ?? activityConfig.daily_brief;
  const Icon = config.icon;

  const formatRelativeTime = (timestamp: string): string => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('relativeTime.justNow');
    if (diffMins < 60) return t('relativeTime.minutesAgo', { count: diffMins });
    if (diffHours < 24) return t('relativeTime.hoursAgo', { count: diffHours });
    if (diffDays === 1) return t('relativeTime.yesterday');
    if (diffDays < 7) return t('relativeTime.daysAgo', { count: diffDays });
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  return (
    <div
      className={cn(
        'p-4 rounded-lg border transition-all hover:shadow-sm',
        config.bgColor,
        config.borderColor
      )}
    >
      <div className="flex gap-3">
        <div className={cn('p-2 rounded-lg bg-white shadow-sm flex-shrink-0', config.color)}>
          <Icon className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-neutral-900 text-sm">{activity.title}</h4>
            <span className="text-xs text-neutral-500 flex-shrink-0">
              {formatRelativeTime(activity.timestamp)}
            </span>
          </div>

          <p className="text-sm text-neutral-600 mt-1">{activity.description}</p>

          <div className="flex flex-wrap items-center gap-2 mt-2">
            {activity.relatedProject && (
              <Link
                href={`/projects/${activity.relatedProjectId}`}
                className="inline-flex items-center gap-1 text-xs text-neutral-700 hover:text-primary transition-colors"
              >
                <Package className="w-3 h-3" />
                {activity.relatedProject}
              </Link>
            )}
            {activity.supplier && (
              <Badge variant="outline" className="text-xs">
                {activity.supplier}
              </Badge>
            )}
            {activity.product && (
              <Badge variant="secondary" className="text-xs bg-stone-100">
                {activity.product}
              </Badge>
            )}
            {activity.status === 'completed' && (
              <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                {t('status.completed')}
              </Badge>
            )}
            {activity.status === 'pending' && (
              <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {t('status.pending')}
              </Badge>
            )}
          </div>

          {(activity.actionable || activity.link || activity.canUndo) && (
            <div className="flex items-center gap-2 mt-3">
              {activity.link && (
                <Button variant="outline" size="sm" asChild className="h-7 text-xs">
                  <Link href={activity.link}>
                    <Eye className="w-3 h-3 mr-1" />
                    {t('view')}
                  </Link>
                </Button>
              )}
              {activity.relatedProjectId && (
                <Button variant="outline" size="sm" asChild className="h-7 text-xs">
                  <Link href={`/projects/${activity.relatedProjectId}`}>
                    <ExternalLink className="w-3 h-3 mr-1" />
                    {t('openProject')}
                  </Link>
                </Button>
              )}
              {activity.canUndo && (
                <Button variant="ghost" size="sm" className="h-7 text-xs text-neutral-500 hover:text-neutral-700">
                  <Undo2 className="w-3 h-3 mr-1" />
                  {t('undo')}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AIActivityPage() {
  const t = useTranslations('aiActivityPage');
  const [activities, setActivities] = useState<AIActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = t('documentTitle');
  }, [t]);

  const loadActivities = useCallback(async () => {
    setLoading(true);
    const result = await getAIActivities();
    if (result.success && result.data) {
      setActivities(result.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadActivities();
  }, [loadActivities]);

  const groupActivitiesByDate = (items: AIActivity[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups: { label: string; activities: AIActivity[] }[] = [
      { label: t('dateGroups.today'), activities: [] },
      { label: t('dateGroups.yesterday'), activities: [] },
      { label: t('dateGroups.earlier'), activities: [] },
    ];

    items.forEach(activity => {
      const activityDate = new Date(activity.timestamp);
      activityDate.setHours(0, 0, 0, 0);

      if (activityDate.getTime() === today.getTime()) {
        groups[0].activities.push(activity);
      } else if (activityDate.getTime() === yesterday.getTime()) {
        groups[1].activities.push(activity);
      } else {
        groups[2].activities.push(activity);
      }
    });

    return groups.filter(g => g.activities.length > 0);
  };

  const groupedActivities = groupActivitiesByDate(activities);

  return (
    <div className="flex flex-col h-[calc(100svh-3.5rem)] min-h-0 bg-stone-50 p-4 sm:p-6">
      <div className=" w-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1 min-h-0 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-neutral-900">{t('title')}</h1>
            <p className="text-sm text-neutral-500 mt-1">{t('subtitle')}</p>
          </div>
          <Button variant="outline" size="sm" onClick={loadActivities} disabled={loading} className="h-8">
            <RefreshCw className={cn('w-4 h-4 mr-2', loading && 'animate-spin')} />
            {t('refresh')}
          </Button>
        </div>

        {loading && activities.length === 0 && (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 text-neutral-300 mx-auto mb-3 animate-spin" />
            <p className="text-neutral-500">{t('loading')}</p>
          </div>
        )}

        {!loading &&
          groupedActivities.map(group => (
            <div key={group.label}>
              <h3 className="text-sm font-medium text-neutral-500 mb-3">{group.label}</h3>
              <div className="space-y-3">
                {group.activities.map(activity => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            </div>
          ))}

        {!loading && activities.length === 0 && (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-600 font-medium">{t('emptyTitle')}</p>
            <p className="text-sm text-neutral-500 mt-1">{t('emptySubtitle')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
