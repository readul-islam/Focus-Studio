
import React from "react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ApprovalPillProps {
  status: string;
  onChange: (status: string) => void;
}

const ApprovalPill = React.memo<ApprovalPillProps>(({ procurementPermission, status, onChange }) => {
  // If no status → default to Review
  const normalizedStatus = status || "RVW";

  const labels: Record<string, string> = {
    APR: "Approved",
    REJ: "Rejected",
    RVW: "Review",
  };

  const colors: Record<string, string> = {
    Approved: "bg-sage-300/50 text-olive-700 border-olive-700/20",
    Rejected:
      "bg-terracotta-600/10 text-terracotta-600 border-terracotta-600/30",
    Review: "bg-ochre-300/30 text-ochre-700 border-ochre-700/30",
  };

  const label = labels[normalizedStatus];

  if (onChange) {
    return (
      <Select disabled={!procurementPermission} value={normalizedStatus} onValueChange={onChange}>
        <SelectTrigger
          className={cn(
            "h-6 text-xs disabled:cursor-not-allowed disabled:opacity-100 font-medium border whitespace-nowrap w-auto",
            colors[label]
          )}>
          <SelectValue>{label}</SelectValue>
        </SelectTrigger>

        <SelectContent>
          {Object.entries(labels).map(([code, lbl]) => (
            <SelectItem key={code} value={code}>
              {lbl}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border h-6 px-2 text-xs font-medium whitespace-nowrap",
        colors[label]
      )}>
      {label}
    </span>
  );
});

ApprovalPill.displayName = 'ApprovalPill';

export default ApprovalPill;
