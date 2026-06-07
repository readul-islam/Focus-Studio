'use client';

import { BrandLogo } from '@/components/brand/brand-logo';
import { cn } from '@/lib/utils';
import { MoreHorizontal, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type SupportWidgetHeaderProps = {
  subtitle: string;
  onClose: () => void;
  onNewConversation?: () => void;
  newConversationLabel?: string;
  emailSupportLabel?: string;
  className?: string;
};

export function SupportWidgetHeader({
  subtitle,
  onClose,
  onNewConversation,
  newConversationLabel,
  emailSupportLabel,
  className,
}: SupportWidgetHeaderProps) {
  return (
    <div className={cn('shrink-0 border-b border-border bg-background px-4 py-3', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <BrandLogo size={36} iconClassName="h-9 w-9 pl-0.5" />
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold leading-tight text-foreground">FocusPilot AI</p>
            <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          {(onNewConversation && newConversationLabel) || emailSupportLabel ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="More options"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {onNewConversation && newConversationLabel ? (
                  <DropdownMenuItem onClick={onNewConversation}>{newConversationLabel}</DropdownMenuItem>
                ) : null}
                {emailSupportLabel ? (
                  <DropdownMenuItem asChild>
                    <a href="mailto:support@focuspilot.io">{emailSupportLabel}</a>
                  </DropdownMenuItem>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
