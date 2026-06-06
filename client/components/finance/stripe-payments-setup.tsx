'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldCheck, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import useFetch from '@/hooks/useFetch';
import { cn } from '@/lib/utils';
import type { StripeConnectStatus } from '@/components/finance/stripe-connect-flow';

type Props = {
  variant?: 'banner' | 'button';
  className?: string;
};

export function StripePaymentsSetup({ variant = 'button', className }: Props) {
  const t = useTranslations('financeStripe');
  const router = useRouter();
  const { data, isLoading } = useFetch<StripeConnectStatus>('finance/stripe-connect/status/');

  if (isLoading || !data?.configured) return null;

  if (data.charges_enabled) {
    if (variant === 'banner') {
      return (
        <div
          className={cn(
            'flex flex-col gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between',
            className
          )}
        >
          <div className="flex items-center gap-2 text-sm text-emerald-900 dark:text-emerald-100">
            <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden />
            <span>{t('connected')}</span>
          </div>
          <Button asChild variant="outline" size="sm" className="border-emerald-500/40 bg-background/80">
            <Link href="/finance/stripe-connect">{t('manageConnection')}</Link>
          </Button>
        </div>
      );
    }
    return null;
  }

  const label = data.connected && data.requires_action ? t('continueSetupButton') : t('setupButton');

  const goToConnect = () => router.push('/finance/stripe-connect');

  if (variant === 'banner') {
    return (
      <div className={cn('rounded-xl border border-border bg-card p-6 text-center shadow-sm', className)}>
        <p className="mb-4 text-sm text-muted-foreground">{t('bannerDescription')}</p>
        <Button className="w-full sm:w-auto" onClick={goToConnect}>
          {label}
          <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
        </Button>
      </div>
    );
  }

  return (
    <Button className={cn(className)} onClick={goToConnect}>
      {label}
      <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
    </Button>
  );
}
