import { LandingNav } from '@/components/landing/landing-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  ArrowRight,
  Building2,
  Check,
  Headphones,
  Layers,
  Sparkles,
  Wrench,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Pricing — Focuspilot',
  description:
    'SaaS subscription tiers for interior design studios: Starter, Professional, and Enterprise. Plus add-ons and services.',
};

const SUBSCRIPTION_TIERS = [
  {
    id: 'starter',
    name: 'Starter',
    priceRange: '£99–149',
    priceNote: 'per month',
    idealFor: 'Solo practitioners, small teams',
    features: [
      'Up to 5 team members',
      '10 active projects',
      'Basic invoicing',
      'Document storage (10GB)',
      'Email support',
      'Core CRM features',
    ],
    emphasis: false,
  },
  {
    id: 'professional',
    name: 'Professional',
    priceRange: '£299–399',
    priceNote: 'per month',
    idealFor: 'Mid-size studios (10–30 people)',
    features: [
      'Up to 20 team members',
      'Unlimited projects',
      'Advanced invoicing + Xero sync',
      'Document storage (100GB)',
      'Time tracking',
      'Advanced reports (3 months of history)',
      'Contractor portal (QR codes, 10 contractors)',
      'Priority email + chat support',
    ],
    emphasis: true,
    badge: 'Most popular',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    priceRange: 'Custom',
    priceNote: 'pricing',
    idealFor: 'Large studios, networks',
    features: [
      'Unlimited team members',
      'Unlimited projects',
      'Full feature set',
      'Unlimited storage',
      '24/7 dedicated support',
      'API access',
      'Custom integrations',
      'SSO / Advanced security',
    ],
    emphasis: false,
  },
] as const;

const REVENUE_STREAMS = [
  {
    title: 'Recurring SaaS revenue',
    badge: 'Primary',
    body: 'Monthly and annual subscriptions. Target: 80–100 studios within 12 months; indicative Year 1 ARR £150–300k.',
    icon: Layers,
    tint: 'bg-clay-500/15 text-clay-800',
  },
  {
    title: 'Premium features',
    badge: 'Secondary',
    body: 'Advanced AI tools (£49–99/mo add-on), extra storage, dedicated onboarding (£2–5k one-time).',
    icon: Sparkles,
    tint: 'bg-ochre-500/15 text-ochre-800',
  },
  {
    title: 'Implementation & training',
    badge: 'Tertiary',
    body: 'Studio setup and migration £1–3k per studio; team training workshops £500–1,500 per session.',
    icon: Wrench,
    tint: 'bg-sage-500/15 text-sage-800',
  },
  {
    title: 'Partner revenue',
    badge: 'Future',
    body: 'Resellers, API licensing, and an integration marketplace as the ecosystem matures.',
    icon: Building2,
    tint: 'bg-primary/10 text-primary',
  },
] as const;

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <LandingNav />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-6">
        {/* Hero */}
        <div className="relative mx-auto max-w-3xl text-center">
        
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Simple <span className="text-clay-700">subscription pricing</span> for studios
          </h1>
          <p className="mt-4 text-base leading-relaxed text-gray-600 sm:text-lg">
            <strong className="font-semibold text-gray-800">SaaS subscription model</strong> with tiered
            pricing — pick the capacity and depth that matches how your studio operates.
          </p>
        </div>

        {/* Tier cards */}
        <div className="mt-12 grid gap-6 lg:grid-cols-3 lg:items-stretch">
          {SUBSCRIPTION_TIERS.map((tier) => (
            <Card
              key={tier.id}
              className={cn(
                'relative flex flex-col overflow-hidden border bg-white shadow-sm transition-shadow',
                tier.emphasis
                  ? 'border-clay-400/90 shadow-md ring-1 ring-clay-200/80 lg:scale-[1.02] lg:z-10'
                  : 'border-gray-200/90'
              )}
            >
              {'badge' in tier && tier.badge ? (
                <div className="absolute right-4 top-4">
                  <span className="rounded-full bg-clay-600 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
                    {tier.badge}
                  </span>
                </div>
              ) : null}
              <CardHeader className="px-6 pb-2 pt-6">
                <CardTitle className="text-lg font-semibold text-gray-900">{tier.name}</CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  <span className="font-medium text-gray-800">Ideal for:</span> {tier.idealFor}
                </CardDescription>
                <div className="mt-4 flex flex-wrap items-baseline gap-x-1 gap-y-0">
                  <span className="text-3xl font-bold tracking-tight text-gray-900 tabular-nums">
                    {tier.priceRange}
                  </span>
                  <span className="text-sm font-medium text-gray-500">{tier.priceNote}</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-3 px-6 pb-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Includes</p>
                <ul className="space-y-2.5">
                  {tier.features.map((line) => (
                    <li key={line} className="flex gap-2.5 text-sm text-gray-600">
                      <Check
                        className={cn(
                          'mt-0.5 size-4 shrink-0',
                          tier.emphasis ? 'text-clay-600' : 'text-gray-400'
                        )}
                        strokeWidth={2.5}
                        aria-hidden
                      />
                      <span className="leading-snug">{line}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="border-t border-gray-100 bg-stone-50/50 px-6 py-4">
                <Button
                  asChild
                  className={cn('w-full rounded-lg', tier.emphasis ? 'shadow-sm' : '')}
                  variant={tier.emphasis ? 'default' : 'outline'}
                >
                  <Link href="/register">
                    {tier.id === 'enterprise' ? 'Discuss Enterprise' : 'Start with this plan'}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-xs leading-relaxed text-gray-500 sm:text-sm">
          Indicative ranges from our commercial model; published quotes, tax, annual billing discounts,
          and add-ons are confirmed during signup or sales.{' '}
          <Link href="/login" className="font-medium text-clay-700 underline-offset-2 hover:underline">
            Sign in
          </Link>{' '}
          if your studio already has an account.
        </p>

        {/* Revenue streams (README) */}
        <section className="mt-20 border-t border-gray-200/90 pt-14" aria-labelledby="streams-heading">
          <div className="mx-auto max-w-2xl text-center">
            <h2 id="streams-heading" className="text-2xl font-bold tracking-tight text-gray-900">
              Other revenue streams
            </h2>
            <p className="mt-3 text-sm text-gray-600 sm:text-base">
              Beyond core subscriptions, Focuspilot is designed for expansion through features, services,
              and long-term partnerships.
            </p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {REVENUE_STREAMS.map(({ title, badge, body, icon: Icon, tint }) => (
              <div
                key={title}
                className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div
                  className={cn(
                    'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                    tint
                  )}
                >
                  <Icon className="size-5" strokeWidth={2} />
                </div>
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-gray-900">{title}</h3>
                    <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-600">
                      {badge}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-gray-600">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA band */}
        <section
          className="mt-16 overflow-hidden rounded-2xl bg-primary px-6 py-10 text-center text-primary-foreground shadow-lg sm:px-10 sm:py-12"
          aria-labelledby="cta-heading"
        >
          <Headphones className="mx-auto size-9 opacity-90" strokeWidth={1.5} aria-hidden />
          <h2 id="cta-heading" className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
            Ready to align your team on one platform?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm opacity-95 sm:text-base">
            Create a workspace, invite your studio, and upgrade tiers as you grow.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="h-12 rounded-xl bg-white px-8 text-base font-semibold text-primary shadow-sm hover:bg-stone-50"
            >
              <Link href="/register">
                Get started
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-xl border-white/35 bg-transparent px-8 text-base text-primary-foreground hover:bg-white/10"
            >
              <Link href="/">Back to home</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
