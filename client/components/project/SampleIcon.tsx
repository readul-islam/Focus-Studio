import React from 'react';
import { Minus, CircleDashed, CircleDot, CircleCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface SampleConfig {
  Icon: LucideIcon;
  color: string;
  label: string;
}

const SAMPLE_CONFIG: Record<string, SampleConfig> = {
  'None': { Icon: Minus,        color: 'text-neutral-400', label: 'Not required' },
  'REQ':  { Icon: CircleDashed, color: 'text-ochre-500',   label: 'Requested' },
  'REC':  { Icon: CircleDot,    color: 'text-sage-600',    label: 'Received' },
  'SUB':  { Icon: CircleCheck,  color: 'text-olive-600',   label: 'Submitted' },
};

// Cycle through statuses on click
// Returns API-friendly values: null, 'REQ', 'REC', 'SUB'
function nextStatus(current: string | null | undefined): string | null {
  const order: (string | null)[] = [null, 'REQ', 'REC', 'SUB'];
  const normalized = !current || current === '-' || current === 'None' ? null : current;
  const idx = order.indexOf(normalized);
  return order[(idx + 1) % order.length];
}

interface SampleIconProps {
  status: string | null | undefined;
  onChange?: (status: string | null) => void;
}

const SampleIcon = React.memo<SampleIconProps>(({ status, onChange }) => {
  const normalizedStatus = !status || status === '-' ? 'None' : status;
  const config = SAMPLE_CONFIG[normalizedStatus] || SAMPLE_CONFIG['None'];
  const { Icon, color, label } = config;

  const handleClick = () => {
    if (onChange) {
      const next = nextStatus(normalizedStatus);
      onChange(next);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={handleClick}
          className={cn(
            "w-6 h-6 flex items-center justify-center rounded hover:bg-stone-100 transition-colors",
            !onChange && "cursor-default"
          )}
        >
          <Icon className={cn('w-4 h-4', color)} />
        </button>
      </TooltipTrigger>
      <TooltipContent  side="top">
        <p className="font-medium">Sample: {label}</p>
        {onChange && (
          <p className="text-xs text-neutral-400">Click to change</p>
        )}
      </TooltipContent>
    </Tooltip>
  );
});

SampleIcon.displayName = 'SampleIcon';

export default SampleIcon;