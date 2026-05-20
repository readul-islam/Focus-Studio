'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export type DataCardItem = {
  title: string;
  value: string;
  subtitle?: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  tone?: 'neutral' | 'success' | 'warning' | 'danger';
};

type DataCardsGridProps = {
  items: DataCardItem[];
  className?: string;
  cols?: { base?: number; md?: number; lg?: number };
};

export function DataCardsGrid({ items, className }: DataCardsGridProps) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      {items.map(item => {
        const Icon = item.icon;
        return (
          <div key={item.title} className="surface-panel p-4">
            <div className="flex items-center gap-3">
              {Icon ? <Icon className="w-4 h-4 text-muted-foreground" aria-hidden="true" /> : null}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">{item.title}</p>
                <p className="text-lg font-semibold text-foreground tabular-nums leading-tight">
                  {item.value || 0}
                </p>
                {item.subtitle ? <p className="text-xs text-muted-foreground">{item.subtitle}</p> : null}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
