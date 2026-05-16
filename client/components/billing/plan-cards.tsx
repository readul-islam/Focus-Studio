'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { BillingPlan, PlanTier, SubscriptionState } from '@/lib/billing/types';
import { cn } from '@/lib/utils';
import { ArrowRight, Check, Loader2 } from 'lucide-react';

interface PlanCardsProps {
  plans: BillingPlan[];
  currentTier?: PlanTier | null;
  loadingTier?: PlanTier | null;
  onSelect: (tier: PlanTier) => void;
  disabled?: boolean;
  /** Tighter card styling for modals; still lays out plans in a horizontal row on md+. */
  compact?: boolean;
  trialLabel?: string;
  className?: string;
}

export function PlanCards({
  plans,
  currentTier,
  loadingTier,
  onSelect,
  disabled,
  compact,
  trialLabel = 'Start 14-day trial',
  className,
}: PlanCardsProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-4 md:grid-cols-3 md:items-stretch',
        !compact && 'lg:gap-5',
        className
      )}
    >
      {plans.map((plan) => {
        const isCurrent = currentTier === plan.id;
        const isLoading = loadingTier === plan.id;

        return (
          <Card
            key={plan.id}
            className={cn(
              'relative flex h-full flex-col border bg-white shadow-sm',
              plan.emphasis
                ? 'border-clay-400/90 shadow-md ring-1 ring-clay-200/80 md:z-10 md:scale-[1.02]'
                : 'border-gray-200/90',
              isCurrent && 'ring-2 ring-primary/20 border-primary/40'
            )}
          >
            {plan.badge && !isCurrent ? (
              <div className="absolute right-4 top-4">
                <span className="rounded-full bg-clay-600 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
                  {plan.badge}
                </span>
              </div>
            ) : null}
            {isCurrent ? (
              <div className="absolute right-4 top-4">
                <span className="rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary-foreground">
                  Current plan
                </span>
              </div>
            ) : null}

            <CardHeader className={cn('px-4 pb-2 pt-5', !compact && 'px-5 pt-6')}>
              <CardTitle className={cn('font-semibold text-gray-900', compact ? 'text-base' : 'text-lg')}>
                {plan.name}
              </CardTitle>
              {(plan.tagline || plan.ideal_for) ? (
                <CardDescription
                  className={cn('font-medium text-gray-600', compact ? 'text-xs' : 'text-sm')}
                >
                  {plan.tagline || plan.ideal_for}
                </CardDescription>
              ) : null}
              <div className="mt-2 flex flex-wrap items-baseline gap-x-1">
                <span
                  className={cn(
                    'font-bold tracking-tight text-gray-900 tabular-nums',
                    compact ? 'text-2xl' : 'text-3xl'
                  )}
                >
                  {plan.price_display}
                </span>
                <span className={cn('font-medium text-gray-500', compact ? 'text-xs' : 'text-sm')}>
                  {plan.price_note}
                </span>
              </div>
            </CardHeader>

            <CardContent className={cn('flex-1 space-y-2 px-4 pb-3', !compact && 'space-y-3 px-5 pb-4')}>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Includes</p>
              <ul className={cn('space-y-1.5', !compact && 'space-y-2')}>
                {plan.features.map((line) => (
                  <li
                    key={line}
                    className={cn('flex gap-2 text-gray-600', compact ? 'text-xs' : 'text-sm')}
                  >
                    <Check
                      className={cn(
                        'mt-0.5 size-4 shrink-0',
                        plan.emphasis ? 'text-clay-600' : 'text-gray-400'
                      )}
                      strokeWidth={2.5}
                    />
                    <span className="leading-snug">{line}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter
              className={cn(
                'mt-auto border-t border-gray-100 bg-stone-50/50 px-4 py-3',
                !compact && 'px-5 py-4'
              )}
            >
              {isCurrent ? (
                <Button variant="outline" className="w-full rounded-lg" disabled>
                  Current plan
                </Button>
              ) : plan.contact_sales && !plan.checkout_available ? (
                <Button variant="outline" asChild className="w-full rounded-lg">
                  <a href="mailto:sales@focuspilot.io?subject=Enterprise%20plan">
                    Contact sales
                  </a>
                </Button>
              ) : (
                <Button
                  className={cn('w-full rounded-lg', plan.emphasis && 'shadow-sm')}
                  variant={plan.emphasis ? 'default' : 'outline'}
                  disabled={disabled || isLoading || !plan.checkout_available}
                  onClick={() => onSelect(plan.id)}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Redirecting…
                    </>
                  ) : (
                    <>
                      {currentTier ? 'Upgrade' : trialLabel}
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}

export function CurrentPlanSummary({
  subscription,
  planName,
}: {
  subscription: SubscriptionState;
  planName?: string;
}) {
  const statusLabel =
    subscription.status === 'trialing'
      ? 'Free trial'
      : subscription.status === 'active'
        ? 'Active'
        : subscription.status === 'past_due'
          ? 'Past due'
          : subscription.status ?? 'No plan';

  return (
    <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-white via-stone-50 to-clay-50/50 p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Current plan</p>
      <p className="mt-1 text-xl font-bold text-gray-900">{planName ?? '—'}</p>
      <p className="mt-1 text-sm text-gray-600">
        Status: <span className="font-medium text-gray-800">{statusLabel}</span>
      </p>
      {subscription.trial_ends_at && subscription.status === 'trialing' ? (
        <p className="mt-1 text-xs text-clay-700">
          Trial ends{' '}
          {new Date(subscription.trial_ends_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
        </p>
      ) : null}
      {subscription.current_period_end && subscription.status === 'active' ? (
        <p className="mt-1 text-xs text-gray-500">
          Renews{' '}
          {new Date(subscription.current_period_end).toLocaleDateString(undefined, { dateStyle: 'medium' })}
          {subscription.cancel_at_period_end ? ' (cancels at period end)' : ''}
        </p>
      ) : null}
    </div>
  );
}
