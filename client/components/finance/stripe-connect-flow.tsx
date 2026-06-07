'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import useFetch from '@/hooks/useFetch';
import { usePost } from '@/hooks/usePost';
import useUser from '@/hooks/useUser';
import { usePermissions } from '@/hooks/usePermissions';
import { gooeyToast as toast } from 'goey-toast';
import { BrandLogo } from '@/components/brand/brand-logo';

function getApiErrorDetail(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const data = (error as { response?: { data?: { detail?: string; error?: string } } }).response?.data;
    if (data?.detail) return String(data.detail);
    if (data?.error) return String(data.error);
  }
  return fallback;
}

function getApiErrorCode(error: unknown): string | undefined {
  if (error && typeof error === 'object' && 'response' in error) {
    return (error as { response?: { data?: { code?: string } } }).response?.data?.code;
  }
  return undefined;
}

export type StripeConnectStatus = {
  configured: boolean;
  connected: boolean;
  charges_enabled: boolean;
  details_submitted: boolean;
  requires_action?: boolean;
  email?: string | null;
  studio_name?: string | null;
};

export function StripeConnectFlow() {
  const t = useTranslations('financeStripe');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const { can } = usePermissions();
  const canEdit = can('finance.edit');

  const [email, setEmail] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [setupErrorCode, setSetupErrorCode] = useState<string | null>(null);

  const {
    data: status,
    isLoading,
    refetch,
  } = useFetch<StripeConnectStatus>('finance/stripe-connect/status/');

  const { mutate: syncStatus } = usePost<StripeConnectStatus>({
    onSuccess: (payload) => {
      refetch();
      if (payload?.charges_enabled) {
        toast.success(t('toasts.connectedSuccess'));
      } else if (searchParams.get('return') === '1') {
        toast.message(t('toasts.setupIncomplete'));
      }
      setSyncing(false);
    },
    onError: () => {
      toast.error(t('toasts.syncFailed'));
      setSyncing(false);
    },
  });

  const { mutate: startOnboarding, isPending: isStarting } = usePost<{ url: string }>({
    onSuccess: (response) => {
      setSetupError(null);
      setSetupErrorCode(null);
      if (response?.url) {
        window.location.href = response.url;
        return;
      }
      toast.error(t('toasts.linkFailed'));
    },
    onError: (error) => {
      const code = getApiErrorCode(error);
      const detail = getApiErrorDetail(error, t('toasts.linkFailed'));
      setSetupErrorCode(code ?? null);
      setSetupError(detail);
      toast.error(code === 'connect_not_enabled' ? t('toasts.connectNotEnabled') : detail);
    },
  });

  useEffect(() => {
    if (user?.email && !email) {
      setEmail(user.email);
    }
  }, [user?.email, email]);

  useEffect(() => {
    if (status?.email && !email) {
      setEmail(status.email);
    }
  }, [status?.email, email]);

  const syncedRef = useRef(false);

  useEffect(() => {
    if (syncedRef.current) return;
    const shouldSync = searchParams.get('return') === '1' || searchParams.get('refresh') === '1';
    if (!shouldSync) return;
    syncedRef.current = true;
    setSyncing(true);
    syncStatus({ url: 'finance/stripe-connect/sync/', data: {} });
    router.replace('/finance/stripe-connect', { scroll: false });
  }, [searchParams, syncStatus, router]);

  const handleContinue = () => {
    if (!canEdit) {
      toast.error(t('toasts.noPermission'));
      return;
    }
    const trimmed = email.trim();
    if (!trimmed) {
      toast.error(t('toasts.emailRequired'));
      return;
    }
    setSetupError(null);
    setSetupErrorCode(null);
    startOnboarding({ url: 'finance/stripe-connect/onboard/', data: { email: trimmed } });
  };

  if (isLoading || syncing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          {syncing ? t('syncing') : t('loading')}
        </div>
      </div>
    );
  }

  if (!status?.configured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="max-w-md rounded-xl border border-border bg-card p-8 text-center shadow-sm">
          <p className="text-sm text-muted-foreground">{t('notConfigured')}</p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/finance/invoices">{t('backToInvoices')}</Link>
          </Button>
        </div>
      </div>
    );
  }

  const isComplete = Boolean(status.charges_enabled);

  return (
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      <aside className="flex flex-col border-b border-border bg-muted/40 px-6 py-8 lg:min-h-screen lg:w-[380px] lg:border-b-0 lg:border-r lg:px-10 lg:py-12">
        <BrandLogo showWordmark size={35} iconClassName="h-8 w-8 pl-1" />

        <div className="mt-10 flex-1">
          <h1 className="text-2xl font-semibold leading-snug tracking-tight text-foreground lg:text-3xl">
            {t('partnerHeading')}
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{t('partnerDescription')}</p>
        </div>

        <div className="mt-8 space-y-4">
          <Link
            href="/finance/invoices"
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:underline"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {t('backToInvoices')}
          </Link>
          <p className="text-xs text-muted-foreground">
            {t('poweredBy')}{' '}
            <span className="font-semibold text-foreground">Stripe</span>
          </p>
        </div>
      </aside>

      <main className="flex flex-1 items-center justify-center px-6 py-10 lg:px-16">
        <div className="w-full max-w-md">
          {isComplete ? (
            <div className="space-y-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-7 w-7" aria-hidden />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-foreground">{t('successTitle')}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t('successDescription')}</p>
              </div>
              <Button asChild className="w-full">
                <Link href="/finance/invoices">{t('backToInvoices')}</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">{t('getStartedTitle')}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t('getStartedDescription')}</p>
              </div>

              {status.connected && status.requires_action && (
                <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  <span>{t('continueSetupHint')}</span>
                </div>
              )}

              {setupError ? (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  <p>{setupError}</p>
                  {setupErrorCode === 'connect_not_enabled' ? (
                    <a
                      href="https://dashboard.stripe.com/connect"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block font-medium underline underline-offset-2"
                    >
                      {t('connectNotEnabledLink')}
                    </a>
                  ) : null}
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="stripe-email">{t('emailLabel')}</Label>
                <p className="text-xs text-muted-foreground">{t('emailHint')}</p>
                <Input
                  id="stripe-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!canEdit || isStarting}
                  placeholder={t('emailPlaceholder')}
                />
              </div>

              <Button
                className="h-11 w-full"
                onClick={handleContinue}
                disabled={!canEdit || isStarting || !email.trim()}
              >
                {isStarting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {status.connected && status.requires_action ? t('continueButton') : t('continueButton')}
              </Button>

              {!canEdit && (
                <p className="text-center text-xs text-muted-foreground">{t('adminOnly')}</p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
