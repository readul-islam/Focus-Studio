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
import type { PlanTier } from '@/lib/billing/types';
import { gooeyToast as toast } from 'goey-toast';
import { CreditCard, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useState } from 'react';

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
  const pathname = usePathname();
  const { user, isLoading: userLoading } = useUser();
  const exempt = isExemptPath(pathname);

  const {
    isLoading: billingLoading,
    subscription,
    plans,
    stripeConfigured,
    trialDays,
    checkout,
  } = useBilling({
    enabled: !!user?.studio && !exempt,
  });

  const [loadingTier, setLoadingTier] = useState<PlanTier | null>(null);
  const isAdmin = user?.role === 'admin';

  const needsPlan =
    !!user?.studio &&
    !exempt &&
    !billingLoading &&
    subscription?.needs_plan_selection === true;

  const handleSelect = useCallback(
    async (tier: PlanTier) => {
      if (!isAdmin) {
        toast.error('Only studio admins can choose a subscription plan.');
        return;
      }
      if (!stripeConfigured) {
        toast.error('Billing is not configured. Contact support.');
        return;
      }
      setLoadingTier(tier);
      try {
        await checkout.mutateAsync(tier);
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
          'Could not start checkout.';
        toast.error(msg);
        setLoadingTier(null);
      }
    },
    [checkout, isAdmin, stripeConfigured]
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
                {trialDays}-day free trial on all plans
              </div>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Choose your studio plan
              </DialogTitle>
              <DialogDescription className="text-base text-gray-600">
                {isAdmin
                  ? 'Select a plan to unlock Focuspilot. You will not be charged until your trial ends.'
                  : 'Your studio needs an active subscription. Please ask a studio admin to choose a plan.'}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="px-5 py-6 sm:px-8 sm:py-7">
            {!stripeConfigured ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Stripe billing is not configured for this environment. Set{' '}
                <code className="text-xs">STRIPE_*</code> variables on the server.
              </div>
            ) : null}

            {isAdmin ? (
              <PlanCards
                plans={plans}
                loadingTier={loadingTier}
                onSelect={handleSelect}
                disabled={!stripeConfigured || checkout.isPending}
                compact
                trialLabel={`Start ${trialDays}-day trial`}
              />
            ) : (
              <div className="rounded-xl border border-gray-200 bg-stone-50 p-6 text-center text-sm text-gray-600">
                <CreditCard className="mx-auto mb-3 size-8 text-gray-400" />
                <p>Contact your studio administrator to subscribe.</p>
                <Button variant="outline" className="mt-4 rounded-lg" asChild>
                  <Link href="/home/dashboard">Back to dashboard</Link>
                </Button>
              </div>
            )}

            {isAdmin ? (
              <p className="mt-4 text-center text-xs text-gray-500">
                Secure checkout powered by Stripe. Cancel anytime from{' '}
                <Link href="/settings/studio/billing" className="font-medium text-clay-700 hover:underline">
                  Upgrade plan
                </Link>
                .
              </p>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
