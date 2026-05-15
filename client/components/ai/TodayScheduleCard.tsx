'use client'

import { Calendar, Clock, MapPin, Users, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export interface ScheduleItem {
  id: string;
  title: string;
  time: string;
  endTime?: string;
  location?: string;
  attendees?: number;
  type: 'meeting' | 'call' | 'site_visit' | 'deadline' | 'reminder';
  href?: string;
  isAllDay?: boolean;
}

interface TodayScheduleCardProps {
  items: ScheduleItem[];
  isLoading?: boolean;
}

const typeConfig = {
  meeting: {
    color: 'bg-slatex-500',
    icon: Users,
  },
  call: {
    color: 'bg-sage-500',
    icon: Users,
  },
  site_visit: {
    color: 'bg-clay-500',
    icon: MapPin,
  },
  deadline: {
    color: 'bg-terracotta-500',
    icon: Clock,
  },
  reminder: {
    color: 'bg-ochre-500',
    icon: Clock,
  },
};

export function TodayScheduleCard({ items, isLoading = false }: TodayScheduleCardProps) {
  if (isLoading) {
    return (
      <div className="h-full">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-5 h-5 bg-white rounded animate-pulse" />
          <div className="h-5 w-20 bg-white rounded animate-pulse" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 p-3 rounded-lg bg-white animate-pulse">
              <div className="w-12 h-12 bg-white rounded" />
              <div className="flex-1">
                <div className="h-4 bg-white rounded w-3/4 mb-2" />
                <div className="h-3 bg-white rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-slatex-600" />
        <h3 className="font-semibold text-neutral-900">Today</h3>
      </div>

      {/* Schedule List */}
      <div className="flex-1 space-y-2 overflow-y-auto">
        {items.length > 0 ? (
          items.slice(0, 5).map((item) => {
            const config = typeConfig[item.type];
            const Icon = config.icon;

            const content = (
              <div className="group flex gap-3 p-3 rounded-lg border border-neutral-200/80
                bg-white hover:bg-stone-50/50 hover:border-neutral-300 transition-all cursor-pointer">
                {/* Time Block */}
                <div className="flex-shrink-0 w-14 text-center">
                  {item.isAllDay ? (
                    <span className="text-xs font-medium text-neutral-500 uppercase">
                      All Day
                    </span>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-neutral-900">{item.time}</p>
                      {item.endTime && (
                        <p className="text-xs text-neutral-500">{item.endTime}</p>
                      )}
                    </>
                  )}
                </div>

                {/* Divider line with type colour */}
                <div className={`w-0.5 rounded-full ${config.color}`} />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-neutral-900 group-hover:text-neutral-700 line-clamp-1">
                      {item.title}
                    </p>
                    {item.href && (
                      <ExternalLink className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-600 flex-shrink-0" />
                    )}
                  </div>

                  <div className="flex items-center gap-3 mt-1">
                    {item.location && (
                      <span className="flex items-center gap-1 text-xs text-neutral-500">
                        <MapPin className="w-3 h-3" />
                        {item.location}
                      </span>
                    )}
                    {item.attendees && item.attendees > 0 && (
                      <span className="flex items-center gap-1 text-xs text-neutral-500">
                        <Icon className="w-3 h-3" />
                        {item.attendees} {item.attendees === 1 ? 'person' : 'people'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );

            return item.href ? (
              <Link key={item.id} href={item.href} target="_blank" rel="noopener noreferrer">
                {content}
              </Link>
            ) : (
              <div key={item.id}>{content}</div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <Calendar className="w-10 h-10 text-neutral-300 mb-3" />
            <p className="text-sm font-medium text-neutral-700">Clear schedule</p>
            <p className="text-xs text-neutral-500 mt-1">
              No meetings or events today
            </p>
          </div>
        )}
      </div>
    </div>
  );
}