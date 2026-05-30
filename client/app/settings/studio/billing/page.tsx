'use client';

import { CurrentPlanSummary, PlanCards } from '@/components/billing/plan-cards';
import { PermissionGuard } from '@/components/PermissionGuard';
import { Section } from '@/components/settings/section';
import { Button } from '@/components/ui/button';
import { useBilling } from '@/hooks/useBilling';
import type { BillingPlan, PlanTier } from '@/lib/billing/types';
import { markProductTourPendingAfterPlan } from '@/lib/product-tour/pending-after-plan';
import { gooeyToast as toast } from 'goey-toast';
import { CreditCard, ExternalLink, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';

function BillingSettingsContent() {
  const t = useTranslations('settingsBillingPage');
  const router = useRouter();
  const {
    subscription,
    plans,
    isLoading,
    stripeConfigured,
    trialDays,
    checkout,
    activatePlan,
    invalidate,
    portal,
  } = useBilling();

  const [loadingTier, setLoadingTier] = useState<PlanTier | null>(null);

  const planByTier = useCallback(
    (tier: PlanTier) => plans.find((p: BillingPlan) => p.id === tier),
    [plans]
  );

  const currentPlan = plans.find((p) => p.id === subscription?.plan_tier);
  const hasActive = subscription?.is_active;

  const handleSelect = useCallback(
    async (tier: PlanTier) => {
      if (tier === subscription?.plan_tier) return;

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
          if (!subscription?.is_active) {
            markProductTourPendingAfterPlan();
            router.replace('/home/dashboard');
          } else {
            toast.success(t('toasts.betaActivated'));
          }
        } else {
          await checkout.mutateAsync(tier);
        }
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
          (noPayment ? t('toasts.activationFailed') : t('toasts.checkoutFailed'));
        toast.error(msg);
        setLoadingTier(null);
      }
    },
    [
      activatePlan,
      checkout,
      invalidate,
      planByTier,
      router,
      stripeConfigured,
      subscription?.is_active,
      subscription?.plan_tier,
      t,
    ]
  );

  const openPortal = async () => {
    try {
      await portal.mutateAsync();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        t('toasts.portalFailed');
      toast.error(msg);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-base font-semibold text-gray-900">{t('title')}</h1>
        <p className="mt-0.5 text-sm text-gray-600">
          {t('description')}
        </p>
      </div>

      {!stripeConfigured ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {t('stripeNotConfigured')}
        </div>
      ) : null}

      {subscription ? (
        <Section
          title={t('subscriptionTitle')}
          description={t('subscriptionDescription')}
          action={
            hasActive && subscription.has_subscription ? (
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg gap-1.5"
                onClick={openPortal}
                disabled={portal.isPending}
              >
                {portal.isPending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <ExternalLink className="size-3.5" />
                )}
                {t('manageBilling')}
              </Button>
            ) : null
          }
        >
          <CurrentPlanSummary
            subscription={subscription}
            planName={currentPlan?.name ?? (subscription.plan_tier ? String(subscription.plan_tier) : undefined)}
          />
        </Section>
      ) : null}

      <Section
        title={hasActive ? t('changePlanTitle') : t('choosePlanTitle')}
        description={
          hasActive
            ? t('changePlanDescription')
            : t('choosePlanDescription', { trialDays })
        }
      >
        <PlanCards
          plans={plans}
          currentTier={subscription?.plan_tier ?? null}
          loadingTier={loadingTier}
          onSelect={handleSelect}
          disabled={
            checkout.isPending ||
            activatePlan.isPending ||
            (!stripeConfigured && !plans.some((p) => p.no_payment_required))
          }
          trialLabel={t('trialLabel', { trialDays })}
        />
      </Section>

      <Section title={t('howBillingWorksTitle')} description={t('howBillingWorksDescription')}>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-gray-600">
          <li>{t('billingSteps.selectPlan', { trialDays })}</li>
          <li>{t('billingSteps.afterTrial')}</li>
          <li>{t('billingSteps.upgrade')}</li>
          <li>{t('billingSteps.enterprise')}</li>
        </ol>
        <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
          <CreditCard className="size-4" />
          {t('stripeFooter')}
        </div>
      </Section>
    </div>
  );
}

export default function BillingSettingsPage() {
  return (
    <PermissionGuard permission="settings.edit" redirectTo="/settings/user/profile">
      <BillingSettingsContent />
    </PermissionGuard>
  );
}
