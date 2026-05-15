import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format } from 'date-fns';

interface EventBarProps {
  item: any;
  startOffset: number;
  duration: number;
  colorClass: string;
  showLabel?: boolean;
  label: string;
  tooltipContent: React.ReactNode;
}

export function EventBar({ item, startOffset, duration, colorClass, showLabel = true, label, tooltipContent }: EventBarProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`absolute h-7 rounded-[12px] px-3 flex items-center truncate text-white pointer-events-auto cursor-pointer transition-all hover:opacity-90 hover:scale-[1.01] ${colorClass}`}
            style={{
              left: `${(startOffset / 7) * 100}%`,
              width: `calc(${(duration / 7) * 100}% - 0px)`,
              marginLeft: '0px',
              marginRight: '0px',
            }}
          >
            {showLabel && label}
          </div>
        </TooltipTrigger>
        <TooltipContent>{tooltipContent}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
