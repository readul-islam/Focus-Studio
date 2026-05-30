'use client';

import { PlanCards } from '@/components/billing/plan-cards';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import useUser from '@/hooks/useUser';
import { useBilling } from '@/hooks/useBilling';
import type { BillingPlan, PlanTier } from '@/lib/billing/types';
import { markProductTourPendingAfterPlan } from '@/lib/product-tour/pending-after-plan';
import { gooeyToast as toast } from 'goey-toast';
import { CreditCard, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';

const BILLING_EXEMPT_PREFIXES = [
  '/billing/',
  '/settings/studio/billing',
  '/onboarding',
];

function isExemptPath(pathname: string | null): boolean {
  if (!pathname) return false;
  return BILLING_EXEMPT_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p)
  );
}

export function SubscriptionGate({ children }: { children: React.ReactNode }) {
  const t = useTranslations('subscriptionGate');
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();
  const exempt = isExemptPath(pathname);

  const {
    isLoading: billingLoading,
    subscription,
    plans,
    stripeConfigured,
    trialDays,
    checkout,
    activatePlan,
    invalidate,
  } = useBilling({
    enabled: !!user?.studio && !exempt,
  });

  const [loadingTier, setLoadingTier] = useState<PlanTier | null>(null);
  const isAdmin = user?.role === 'admin';

  const planByTier = useCallback(
    (tier: PlanTier) => plans.find((p: BillingPlan) => p.id === tier),
    [plans]
  );

  const needsPlan =
    !!user?.studio &&
    !exempt &&
    !billingLoading &&
    subscription?.needs_plan_selection === true;

  const handleSelect = useCallback(
    async (tier: PlanTier) => {
      if (!isAdmin) {
        toast.error(t('toasts.adminOnly'));
        return;
      }

      const plan = planByTier(tier);
      const noPayment = plan?.no_payment_required === true;

      if (!noPayment && !stripeConfigured) {
        toast.error(t('toasts.billingNotConfigured'));
        return;
      }

      setLoadingTier(tier);
      try {
        if (noPayment) {
          await activatePlan.mutateAsync(tier);
          invalidate();
          markProductTourPendingAfterPlan();
          toast.success(t('toasts.betaActivated'));
          router.replace('/home/dashboard');
        } else {
          await checkout.mutateAsync(tier);
        }
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
          (noPayment ? t('toasts.activateFailed') : t('toasts.checkoutFailed'));
        toast.error(msg);
        setLoadingTier(null);
      }
    },
    [activatePlan, checkout, invalidate, isAdmin, planByTier, router, stripeConfigured, t]
  );

  if (userLoading || (user?.studio && billingLoading && !exempt)) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <>
      {children}

      <Dialog open={needsPlan} onOpenChange={() => {}}>
        <DialogContent
          hideClose
          className="max-h-[92vh] w-[min(100vw-2rem,72rem)] max-w-[72rem] overflow-y-auto border-gray-200 p-0 gap-0 sm:rounded-2xl"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <div className="relative overflow-hidden border-b border-gray-100 bg-gradient-to-br from-white via-stone-50 to-clay-50/80 px-6 py-6 sm:px-8">
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(224,122,87,0.12),transparent_55%)]"
              aria-hidden
            />
            <DialogHeader className="relative space-y-2 text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-clay-200/80 bg-white/90 px-3 py-1 text-xs font-medium text-clay-800">
                <Sparkles className="size-3.5" />
                {t('betaBadge', { days: trialDays })}
              </div>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                {t('title')}
              </DialogTitle>
              <DialogDescription className="text-base text-gray-600">
                {isAdmin ? t('descriptionAdmin') : t('descriptionMember')}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="px-5 py-6 sm:px-8 sm:py-7">
            {!stripeConfigured ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                {t('stripeNotConfigured')}
              </div>
            ) : null}

            {isAdmin ? (
              <PlanCards
                plans={plans}
                loadingTier={loadingTier}
                onSelect={handleSelect}
                disabled={
                  checkout.isPending ||
                  activatePlan.isPending ||
                  (!stripeConfigured && !plans.some((p) => p.no_payment_required))
                }
                compact
                trialLabel={t('trialLabel', { days: trialDays })}
              />
            ) : (
              <div className="rounded-xl border border-gray-200 bg-stone-50 p-6 text-center text-sm text-gray-600">
                <CreditCard className="mx-auto mb-3 size-8 text-gray-400" />
                <p>{t('contactAdmin')}</p>
                <Button variant="outline" className="mt-4 rounded-lg" asChild>
                  <Link href="/home/dashboard">{t('backToDashboard')}</Link>
                </Button>
              </div>
            )}

            {isAdmin ? (
              <p className="mt-4 text-center text-xs text-gray-500">
                {t('stripeFooterBefore')}{' '}
                <Link href="/settings/studio/billing" className="font-medium text-clay-700 hover:underline">
                  {t('upgradePlanLink')}
                </Link>
                {t('stripeFooterAfter')}
              </p>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
