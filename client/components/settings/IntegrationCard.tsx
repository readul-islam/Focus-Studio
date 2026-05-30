'use client';

import React from 'react';
import { CheckCircle2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

export type IntegrationCardStatus = 'connected' | 'configured';

type IntegrationCardProps = {
  icon?: React.ReactNode;
  title: string;
  description: string;
  isLoading?: boolean;
  /** When set, shows the green Connected / Configured badge */
  status?: IntegrationCardStatus | null;
  statusLabel?: string;
  /** Card actions: connect, disconnect, or manage link */
  footer: React.ReactNode;
  /** Optional settings gear + modal (only when connected and extra config exists) */
  showSettings?: boolean;
  settingsOpen?: boolean;
  onSettingsOpenChange?: (open: boolean) => void;
  settingsTitle?: string;
  settingsChildren?: React.ReactNode;
};

function StatusBadge({
  status,
  label,
}: {
  status: IntegrationCardStatus;
  label?: string;
}) {
  const t = useTranslations('settingsIntegrationsPage.card');
  const text = label || (status === 'configured' ? t('configured') : t('connected'));
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2 py-0.5">
      <CheckCircle2 className="h-3 w-3" aria-hidden />
      {text}
    </span>
  );
}

export function IntegrationCard({
  icon,
  title,
  description,
  isLoading,
  status = null,
  statusLabel,
  footer,
  showSettings = false,
  settingsOpen = false,
  onSettingsOpenChange,
  settingsTitle,
  settingsChildren,
}: IntegrationCardProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 animate-pulse">
        <div className="h-4 w-16 rounded bg-stone-200 mb-2" />
        <div className="h-3 w-48 rounded bg-stone-100 mb-5" />
        <div className="h-8 w-32 rounded bg-stone-200" />
      </div>
    );
  }

  const isLinked = status === 'connected' || status === 'configured';

  return (
    <>
      <div
        className={cn(
          'rounded-xl border p-5',
          isLinked ? 'border-gray-200 bg-white' : 'border-gray-200 bg-stone-50'
        )}
      >
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-sm font-semibold text-gray-900 flex items-center gap-2 min-w-0">
            {icon}
            <span className="truncate">{title}</span>
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {status ? <StatusBadge status={status} label={statusLabel} /> : null}
            {showSettings && onSettingsOpenChange ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-stone-500 hover:text-gray-900"
                onClick={() => onSettingsOpenChange(true)}
                aria-label={`${title} settings`}
              >
                <Settings className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        </div>
        <p className="text-xs text-stone-500 mb-4">{description}</p>
        {footer}
      </div>

      {showSettings && onSettingsOpenChange && settingsChildren ? (
        <Dialog open={settingsOpen} onOpenChange={onSettingsOpenChange}>
          <DialogContent className="max-w-lg max-h-[min(90vh,720px)] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {icon}
                {settingsTitle || title}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-1">{settingsChildren}</div>
          </DialogContent>
        </Dialog>
      ) : null}
    </>
  );
}
