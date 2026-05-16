'use client';

import { CurrentPlanSummary, PlanCards } from '@/components/billing/plan-cards';
import { PermissionGuard } from '@/components/PermissionGuard';
import { Section } from '@/components/settings/section';
import { Button } from '@/components/ui/button';
import { useBilling } from '@/hooks/useBilling';
import type { PlanTier } from '@/lib/billing/types';
import { gooeyToast as toast } from 'goey-toast';
import { CreditCard, ExternalLink, Loader2 } from 'lucide-react';
import { useCallback, useState } from 'react';

function BillingSettingsContent() {
  const {
    subscription,
    plans,
    isLoading,
    stripeConfigured,
    trialDays,
    checkout,
    portal,
  } = useBilling();

  const [loadingTier, setLoadingTier] = useState<PlanTier | null>(null);

  const currentPlan = plans.find((p) => p.id === subscription?.plan_tier);
  const hasActive = subscription?.is_active;

  const handleSelect = useCallback(
    async (tier: PlanTier) => {
      if (tier === subscription?.plan_tier) return;
      if (!stripeConfigured) {
        toast.error('Billing is not configured.');
        return;
      }
      setLoadingTier(tier);
      try {
        await checkout.mutateAsync(tier);
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
          'Checkout failed.';
        toast.error(msg);
        setLoadingTier(null);
      }
    },
    [checkout, stripeConfigured, subscription?.plan_tier]
  );

  const openPortal = async () => {
    try {
      await portal.mutateAsync();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Could not open billing portal.';
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
        <h1 className="text-base font-semibold text-gray-900">Upgrade plan</h1>
        <p className="mt-0.5 text-sm text-gray-600">
          Manage your studio subscription, billing, and plan upgrades.
        </p>
      </div>

      {!stripeConfigured ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Stripe is not configured. Add API keys and price IDs to the server environment to enable
          checkout.
        </div>
      ) : null}

      {subscription ? (
        <Section
          title="Your subscription"
          description="Current plan and billing status for this studio."
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
                Manage billing
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
        title={hasActive ? 'Change plan' : 'Choose a plan'}
        description={
          hasActive
            ? 'Upgrade or switch tiers. Changes are handled securely via Stripe.'
            : `All plans include a ${trialDays}-day free trial. Pick the tier that fits your studio.`
        }
      >
        <PlanCards
          plans={plans}
          currentTier={subscription?.plan_tier ?? null}
          loadingTier={loadingTier}
          onSelect={handleSelect}
          disabled={!stripeConfigured || checkout.isPending}
          trialLabel={`Start ${trialDays}-day trial`}
        />
      </Section>

      <Section title="How billing works" description="Subscription lifecycle at a glance.">
        <ol className="list-decimal space-y-2 pl-5 text-sm text-gray-600">
          <li>Select a plan — you enter Stripe Checkout with a {trialDays}-day trial.</li>
          <li>After trial, your card is charged monthly for the selected tier.</li>
          <li>Upgrade anytime from this page; use Manage billing for invoices and cancellation.</li>
          <li>Enterprise teams can contact sales for custom pricing and SSO.</li>
        </ol>
        <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
          <CreditCard className="size-4" />
          Payments processed securely by Stripe.
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
