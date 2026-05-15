
import React from "react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const getInitials = (name: string) =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

interface StatusPillProps {
  value: string;
  onChange: (value: string) => void;
  approvedBy?: string;
  approvedByImage?: string;
  procurementPermission?: boolean;
}

const StatusPill = React.memo<StatusPillProps>(({ value, onChange, approvedBy, approvedByImage ,procurementPermission }) => {
  const labels: Record<string, string> = {
    QT: "Quoting",
    IR: "Internal Review",
    OS: "Out of Stock",
    CR: "Client Review",
    ORD: "Ordered",
    PD: "Payment Due",
    IT: "In Transit",
    INS: "Installed",
    DEL: "Delivered",
    IA: "Internally Approved",
  };

  const colors: Record<string, string> = {
    Quoting: "bg-sage-200/40 text-olive-700 border-olive-300",
    "Internal Review": "bg-ochre-200/30 text-ochre-700 border-ochre-500/20",
    "Out of Stock":
      "bg-terracotta-600/10 text-terracotta-600 border-terracotta-600/30",
    "Client Review": "bg-greige-100 text-taupe-700 border-greige-500",
    Ordered: "bg-blue-200/40 text-blue-700 border-blue-700/20",
    "Payment Due": "bg-amber-200/40 text-amber-700 border-amber-700/20",
    "In Transit": "bg-purple-200/40 text-purple-700 border-purple-700/20",
    Installed: "bg-emerald-200/40 text-emerald-700 border-emerald-700/20",
    Delivered: "bg-green-200/40 text-green-700 border-green-700/20",
  };

  const currentLabel = labels[value];

  return (
    <div className="flex items-center gap-1.5">
      <Select disabled={!procurementPermission} value={value} onValueChange={onChange}>
        <SelectTrigger
          className={cn(
            "h-6 text-xs font-medium border disabled:cursor-not-allowed disabled:opacity-100 whitespace-nowrap w-auto",
            colors[currentLabel]
          )}>
          <SelectValue>{currentLabel}</SelectValue>
        </SelectTrigger>

        <SelectContent>
          {Object.entries(labels).map(([code, label]) => (
            <SelectItem key={code} value={code}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {value === 'IA' && approvedBy && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar className="h-[22px] w-[22px] shrink-0 cursor-default">
                <AvatarImage src={approvedByImage} />
                <AvatarFallback className="text-[9px] text-[#7f7a70] border border-[#b6b0a4] bg-[#efeae2] font-semibold">
                  {getInitials(approvedBy)}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent side="top">
              Internally approved by {approvedBy}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
});

StatusPill.displayName = 'StatusPill';

export default StatusPill;
