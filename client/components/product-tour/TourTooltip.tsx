'use client';

import type { TooltipRenderProps } from 'react-joyride';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function TourTooltip({
  continuous,
  index,
  step,
  backProps,
  closeProps,
  primaryProps,
  skipProps,
  tooltipProps,
  isLastStep,
  size,
}: TooltipRenderProps) {
  const stepNum = index + 1;

  return (
    <div
      {...tooltipProps}
      className={cn(
        'w-[min(100vw-2rem,360px)] rounded-xl border border-border bg-card text-card-foreground shadow-xl',
        'animate-in fade-in-0 zoom-in-95 duration-200',
      )}
    >
      <div className="px-4 pt-4 pb-3 border-b border-border">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Step {stepNum} of {size}
        </p>
        <h3 className="text-base font-semibold text-foreground mt-1">{step.title}</h3>
      </div>
      <p className="px-4 py-3 text-sm text-muted-foreground leading-relaxed">{step.content}</p>
      <div className="flex items-center justify-between gap-2 px-4 pb-4">
        <button
          type="button"
          {...skipProps}
          className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Skip tour
        </button>
        <div className="flex items-center gap-2">
          {index > 0 && continuous ? (
            <Button type="button" variant="outline" size="sm" {...backProps}>
              Previous
            </Button>
          ) : null}
          {continuous ? (
            <Button type="button" size="sm" {...primaryProps}>
              {isLastStep ? 'Finish' : 'Next'}
            </Button>
          ) : (
            <Button type="button" size="sm" {...closeProps}>
              Close
            </Button>
          )}
        </div>
      </div>
      <p className="px-4 pb-3 text-[10px] text-muted-foreground text-center border-t border-border pt-2">
        Esc to skip · Enter for next
      </p>
    </div>
  );
}
