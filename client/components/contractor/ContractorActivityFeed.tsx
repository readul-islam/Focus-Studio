'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Package,
  Bell,
  MessageSquare,
  RefreshCw,
  Plus,
} from 'lucide-react';
import type { ContractorActivity } from '@/lib/contractor/types';

interface ContractorActivityFeedProps {
  activities: ContractorActivity[];
}

const activityConfig: Record<
  ContractorActivity['type'],
  { icon: typeof FileText; className: string }
> = {
  procurement_update: {
    icon: Package,
    className: 'bg-ochre-100 text-ochre-700',
  },
  drawing_revision: {
    icon: RefreshCw,
    className: 'bg-clay-100 text-clay-700',
  },
  drawing_added: {
    icon: Plus,
    className: 'bg-sage-100 text-sage-700',
  },
  message: {
    icon: MessageSquare,
    className: 'bg-slatex-100 text-slatex-700',
  },
  status_change: {
    icon: Bell,
    className: 'bg-stone-100 text-neutral-700',
  },
};

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) {
    return 'Just now';
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  } else {
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
    });
  }
}

export function ContractorActivityFeed({ activities }: ContractorActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <Card className="p-8 text-center border-greige-500/30">
        <Bell className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
        <p className="text-neutral-500">No activity yet.</p>
      </Card>
    );
  }

  return (
    <Card className="border-greige-500/30 overflow-hidden">
      <div className="divide-y divide-greige-500/20">
        {activities.map((activity) => {
          const config = activityConfig[activity.type];
          const Icon = config.icon;

          return (
            <div
              key={activity.id}
              className={`p-4 flex items-start gap-3 ${
                !activity.read ? 'bg-ochre-50/50' : ''
              }`}
            >
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${config.className}`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium text-neutral-900">
                    {activity.title}
                  </h4>
                  {!activity.read && (
                    <Badge className="bg-clay-600 text-white text-[10px] px-1.5 py-0">
                      New
                    </Badge>
                  )}
                </div>
                {activity.description && (
                  <p className="text-sm text-neutral-600 mt-0.5">
                    {activity.description}
                  </p>
                )}
                <p className="text-xs text-neutral-400 mt-1">
                  {formatTimestamp(activity.timestamp)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}