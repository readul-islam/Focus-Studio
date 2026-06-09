'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldCheck, ArrowRight, CreditCard } from 'lucide-react';
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

  if (isLoading) {
    if (variant !== 'banner') return null;
    return (
      <div className={cn('flex items-center justify-center rounded-xl border border-border bg-card p-8', className)}>
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden />
        <span className="sr-only">{t('loading')}</span>
      </div>
    );
  }

  if (!data?.configured) return null;

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
      <div className={cn('rounded-xl border border-border bg-card p-6 shadow-sm', className)}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3 text-left">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CreditCard className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">{t('connectHeading')}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t('bannerDescription')}</p>
              <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                <li>{t('benefit1')}</li>
                <li>{t('benefit2')}</li>
                <li>{t('benefit3')}</li>
              </ul>
            </div>
          </div>
          <Button className="w-full shrink-0 sm:w-auto" onClick={goToConnect}>
            {label}
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
          </Button>
        </div>
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
