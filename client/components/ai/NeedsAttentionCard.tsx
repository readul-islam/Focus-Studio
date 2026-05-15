'use client'

import { AlertCircle, Clock, FileText, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export interface AttentionItem {
  id: string;
  type: 'quote' | 'decision' | 'task' | 'followup';
  title: string;
  subtitle?: string;
  priority: 'high' | 'medium' | 'low';
  dueText?: string;
  href?: string;
}

interface NeedsAttentionCardProps {
  items: AttentionItem[];
  isLoading?: boolean;
}

const priorityConfig = {
  high: {
    dot: 'bg-terracotta-500',
    text: 'text-terracotta-600',
    bg: 'bg-terracotta-50/50',
  },
  medium: {
    dot: 'bg-clay-500',
    text: 'text-clay-600',
    bg: 'bg-clay-50/50',
  },
  low: {
    dot: 'bg-sage-500',
    text: 'text-sage-600',
    bg: 'bg-sage-50/50',
  },
};

const typeIcons = {
  quote: FileText,
  decision: AlertCircle,
  task: CheckCircle2,
  followup: Clock,
};

export function NeedsAttentionCard({ items, isLoading = false }: NeedsAttentionCardProps) {
  if (isLoading) {
    return (
      <div className="h-full">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-5 h-5 bg-white rounded animate-pulse" />
          <div className="h-5 w-32 bg-white rounded animate-pulse" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-3 rounded-lg bg-white animate-pulse">
              <div className="h-4 bg-white rounded w-3/4 mb-2" />
              <div className="h-3 bg-white rounded w-1/2" />
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
        <AlertCircle className="w-5 h-5 text-terracotta-600" />
        <h3 className="font-semibold text-neutral-900">Needs Attention</h3>
        {items.length > 0 && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-terracotta-100 text-terracotta-700">
            {items.length}
          </span>
        )}
      </div>

      {/* Items List */}
      <div className="flex-1 space-y-2 overflow-y-auto">
        {items.length > 0 ? (
          items.slice(0, 5).map((item) => {
            const config = priorityConfig[item.priority];
            const Icon = typeIcons[item.type];
            const content = (
              <div
                className={`group p-3 rounded-lg border border-neutral-200/80 hover:border-neutral-300
                  bg-white hover:bg-stone-50/50 transition-all cursor-pointer`}
              >
                <div className="flex items-start gap-3">
                  {/* Priority indicator */}
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${config.dot}`} />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-neutral-900 truncate group-hover:text-neutral-700">
                        {item.title}
                      </p>
                      <Icon className={`w-4 h-4 flex-shrink-0 ${config.text}`} />
                    </div>
                    {item.subtitle && (
                      <p className="text-xs text-neutral-500 mt-0.5 truncate">
                        {item.subtitle}
                      </p>
                    )}
                    {item.dueText && (
                      <p className={`text-xs mt-1 ${config.text}`}>
                        {item.dueText}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );

            return item.href ? (
              <Link key={item.id} href={item.href}>
                {content}
              </Link>
            ) : (
              <div key={item.id}>{content}</div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <CheckCircle2 className="w-10 h-10 text-sage-400 mb-3" />
            <p className="text-sm font-medium text-neutral-700">All caught up</p>
            <p className="text-xs text-neutral-500 mt-1">
              Nothing needs your attention right now
            </p>
          </div>
        )}
      </div>
    </div>
  );
}