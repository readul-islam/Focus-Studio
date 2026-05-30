'use client';

import { LandingNav } from '@/components/landing/landing-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowRight, Building2, Check, Headphones, Layers, Sparkles, Wrench } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

const TIER_IDS = ['starter', 'professional', 'enterprise'] as const;
const STREAM_KEYS = ['saas', 'premium', 'services', 'partner'] as const;
const STREAM_ICONS = { saas: Layers, premium: Sparkles, services: Wrench, partner: Building2 };
const STREAM_TINTS = {
  saas: 'bg-clay-500/15 text-clay-800',
  premium: 'bg-ochre-500/15 text-ochre-800',
  services: 'bg-sage-500/15 text-sage-800',
  partner: 'bg-primary/10 text-primary',
};
const TIER_PRICES = { starter: '£149', professional: '£399', enterprise: '£999' };

export function PricingContent() {
  const t = useTranslations('pricingPage');
  const tt = useTranslations('pricingPage.tiers');
  const tf = useTranslations('pricingPage.tierFeatures');

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-stone-50">
      <div
        className="pointer-events-none absolute inset-0 min-h-full bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(224,122,87,0.14),transparent_55%),radial-gradient(ellipse_50%_45%_at_100%_0%,rgba(15,23,42,0.06),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 min-h-full opacity-[0.5]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(15 23 42 / 0.05) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
        aria-hidden
      />

      <LandingNav />

      <main className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-6">
        <div className="relative mx-auto max-w-3xl text-center">
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {t('heroTitleBeforeAccent')}
            <span className="text-clay-700">{t('heroTitleAccent')}</span>
            {t('heroTitleAfterAccent')}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-gray-600 sm:text-lg">{t('heroSubtitle')}</p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3 lg:items-stretch">
          {TIER_IDS.map((id) => {
            const emphasis = id === 'professional';
            const features = tf.raw(id) as string[];
            return (
              <Card
                key={id}
                className={cn(
                  'relative flex flex-col overflow-hidden border bg-white shadow-sm transition-shadow',
                  emphasis
                    ? 'border-clay-400/90 shadow-md ring-1 ring-clay-200/80 lg:scale-[1.02] lg:z-10'
                    : 'border-gray-200/90',
                )}
              >
                {emphasis ? (
                  <div className="absolute right-4 top-4">
                    <span className="rounded-full bg-clay-600 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
                      {tt(`${id}.badge`)}
                    </span>
                  </div>
                ) : null}
                <CardHeader className="px-6 pb-2 pt-6">
                  <CardTitle className="text-lg font-semibold text-gray-900">{tt(`${id}.name`)}</CardTitle>
                  <CardDescription className="text-sm font-medium text-gray-600">{tt(`${id}.tagline`)}</CardDescription>
                  <div className="mt-4 flex flex-wrap items-baseline gap-x-1 gap-y-0">
                    <span className="text-3xl font-bold tracking-tight text-gray-900 tabular-nums">
                      {TIER_PRICES[id]}
                    </span>
                    <span className="text-sm font-medium text-gray-500">{t('perMonth')}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-3 px-6 pb-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{t('includes')}</p>
                  <ul className="space-y-2.5">
                    {features.map((line) => (
                      <li key={line} className="flex gap-2.5 text-sm text-gray-600">
                        <Check
                          className={cn('mt-0.5 size-4 shrink-0', emphasis ? 'text-clay-600' : 'text-gray-400')}
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
                    className={cn('w-full rounded-lg', emphasis ? 'shadow-sm' : '')}
                    variant={emphasis ? 'default' : 'outline'}
                  >
                    <Link href="/register">
                      {id === 'enterprise' ? t('discussEnterprise') : t('startPlan')}
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-xs leading-relaxed text-gray-500 sm:text-sm">
          {t('trialNote')}{' '}
          <Link href="/login" className="font-medium text-clay-700 underline-offset-2 hover:underline">
            {t('signIn')}
          </Link>{' '}
          {t('trialNoteSuffix')}
        </p>

        <section className="mt-20 border-t border-gray-200/70 pt-14" aria-labelledby="streams-heading">
          <div className="mx-auto max-w-2xl text-center">
            <h2 id="streams-heading" className="text-2xl font-bold tracking-tight text-gray-900">
              {t('streamsTitle')}
            </h2>
            <p className="mt-3 text-sm text-gray-600 sm:text-base">{t('streamsSubtitle')}</p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {STREAM_KEYS.map((key) => {
              const Icon = STREAM_ICONS[key];
              return (
                <div key={key} className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', STREAM_TINTS[key])}>
                    <Icon className="size-5" strokeWidth={2} />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-gray-900">{t(`streams.${key}.title`)}</h3>
                      <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-600">
                        {t(`streams.${key}.badge`)}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-gray-600">{t(`streams.${key}.body`)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section
          className="mt-16 overflow-hidden rounded-2xl bg-primary px-6 py-10 text-center text-primary-foreground shadow-lg sm:px-10 sm:py-12"
          aria-labelledby="cta-heading"
        >
          <Headphones className="mx-auto size-9 opacity-90" strokeWidth={1.5} aria-hidden />
          <h2 id="cta-heading" className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
            {t('ctaTitle')}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm opacity-95 sm:text-base">{t('ctaSubtitle')}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="h-12 rounded-xl bg-white px-8 text-base font-semibold text-primary shadow-sm hover:bg-stone-50"
            >
              <Link href="/register">
                {t('getStarted')}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-xl border-white/35 bg-transparent px-8 text-base text-primary-foreground hover:bg-white/10"
            >
              <Link href="/">{t('backToHome')}</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
