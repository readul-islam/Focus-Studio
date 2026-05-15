
import React from "react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SamplePillProps {
  status: string | null;
  onChange: (status: string) => void;
}

const SamplePill = React.memo<SamplePillProps>(({ status, onChange }) => {
  // Default to "None" if status is null, undefined, or empty string
  const currentStatus = status ?? "None";

  const labels: Record<string, string> = {
    None: "Not requested",
    REQ: "Requested",
    REC: "Received",
    SUB: "Submitted",
  };

  const colors: Record<string, string> = {
    None: "bg-greige-100 text-taupe-700 border-greige-500",
    REQ: "bg-ochre-300/30 text-ochre-700 border-ochre-700/30",
    SUB: "bg-slatex-500/10 text-slatex-700 border-slatex-500/20",
    REC: "bg-sage-300/50 text-olive-700 border-olive-700/20",
  };

  if (onChange) {
    return (
      <Select value={currentStatus} onValueChange={onChange}>
        <SelectTrigger
          className={cn(
            "h-6 text-xs font-medium border whitespace-nowrap w-auto",
            colors[currentStatus]
          )}>
          <SelectValue>{labels[currentStatus]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="REQ">Requested</SelectItem>
          <SelectItem value="REC">Received</SelectItem>
          <SelectItem value="SUB">Submitted</SelectItem>
        </SelectContent>
      </Select>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border h-6 px-2 text-xs font-medium whitespace-nowrap",
        colors[currentStatus]
      )}>
      {labels[currentStatus]}
    </span>
  );
});

SamplePill.displayName = 'SamplePill';

export default SamplePill;