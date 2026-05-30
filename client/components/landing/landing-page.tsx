import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  FileText,
  Kanban,
  MessageSquare,
  Receipt,
  Shield,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LandingFooter } from '@/components/landing/landing-footer';
import { LandingNav } from '@/components/landing/landing-nav';

export async function LandingPage() {
  const t = await getTranslations('landingPage');

  const proofItems = [t('hero.proof1'), t('hero.proof2'), t('hero.proof3')];

  const mockNavItems = [
    t('hero.mockNavPlan'),
    t('hero.mockNavTasks'),
    t('hero.mockNavDocs'),
    t('hero.mockNavFinance'),
  ];

  const features = [
    {
      title: t('features.projectsTasksTitle'),
      description: t('features.projectsTasksDesc'),
      icon: Kanban,
      tint: 'bg-primary/10 text-primary',
    },
    {
      title: t('features.crmTitle'),
      description: t('features.crmDesc'),
      icon: Users,
      tint: 'bg-clay-500/15 text-clay-700',
    },
    {
      title: t('features.financeTitle'),
      description: t('features.financeDesc'),
      icon: Receipt,
      tint: 'bg-sage-500/15 text-sage-700',
    },
    {
      title: t('features.aiInboxTitle'),
      description: t('features.aiInboxDesc'),
      icon: BrainCircuit,
      tint: 'bg-ochre-500/15 text-ochre-700',
    },
    {
      title: t('features.calendarTitle'),
      description: t('features.calendarDesc'),
      icon: CalendarDays,
      tint: 'bg-primary/10 text-primary',
    },
    {
      title: t('features.reportsTitle'),
      description: t('features.reportsDesc'),
      icon: BarChart3,
      tint: 'bg-clay-500/15 text-clay-700',
    },
  ] as const;

  const productCards = [
    {
      title: t('product.creativeOpsTitle'),
      body: t('product.creativeOpsBody'),
      icon: Sparkles,
    },
    {
      title: t('product.clientGradeTitle'),
      body: t('product.clientGradeBody'),
      icon: FileText,
    },
    {
      title: t('product.scaleTitle'),
      body: t('product.scaleBody'),
      icon: BarChart3,
    },
  ] as const;

  const steps = [
    {
      step: '01',
      title: t('workflow.step1Title'),
      body: t('workflow.step1Body'),
      icon: Shield,
    },
    {
      step: '02',
      title: t('workflow.step2Title'),
      body: t('workflow.step2Body'),
      icon: Zap,
    },
    {
      step: '03',
      title: t('workflow.step3Title'),
      body: t('workflow.step3Body'),
      icon: FileText,
    },
  ] as const;

  return (
    <div className="min-h-screen bg-stone-50 text-gray-900 antialiased">
      <LandingNav />

      <main>
        <section className="relative overflow-hidden" aria-labelledby="landing-hero-heading">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(224,122,87,0.14),transparent_55%),radial-gradient(ellipse_50%_45%_at_100%_0%,rgba(15,23,42,0.06),transparent)]"
            aria-hidden
          />
          <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pt-14 lg:px-8 lg:pb-24 lg:pt-16">
            <div className="grid gap-12 lg:grid-cols-[1fr_minmax(0,1.05fr)] lg:gap-16 lg:items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-clay-200/80 bg-white/90 px-3 py-1 text-xs font-medium text-clay-800 shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-clay-400 opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-clay-500" />
                  </span>
                  {t('hero.badge')}
                </div>
                <div className="space-y-4">
                  <h1
                    id="landing-hero-heading"
                    className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-[3.35rem] lg:leading-[1.08]"
                  >
                    {t('hero.titleBefore')}{' '}
                    <span className="text-clay-700">{t('hero.titleAccent')}</span> {t('hero.titleAfter')}
                  </h1>
                  <p className="max-w-xl text-lg leading-relaxed text-gray-600 sm:text-xl">{t('hero.subtitle')}</p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button asChild size="lg" className="h-12 rounded-xl px-7 text-base shadow-md">
                    <Link href="/register">
                      {t('hero.startTrial')}
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="h-12 rounded-xl border-gray-200 bg-white/80 px-7 text-base hover:bg-white"
                  >
                    <Link href="/pricing">{t('hero.howWePrice')}</Link>
                  </Button>
                </div>
                <ul className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-8 sm:gap-y-2 text-sm text-gray-500">
                  {proofItems.map((text) => (
                    <li key={text} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-clay-500" aria-hidden />
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
                <div
                  className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-clay-200/40 via-transparent to-primary/10 blur-2xl"
                  aria-hidden
                />
                <div className="relative overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-xl shadow-gray-900/10">
                  <div className="flex items-center gap-2 border-b border-gray-100 bg-stone-50/80 px-4 py-3">
                    <div className="flex gap-1.5">
                      <span className="size-3 rounded-full bg-red-400/90" />
                      <span className="size-3 rounded-full bg-amber-400/90" />
                      <span className="size-3 rounded-full bg-emerald-400/90" />
                    </div>
                    <p className="ml-3 text-xs font-medium text-gray-500">{t('hero.mockProject')}</p>
                  </div>
                  <div className="grid gap-0 md:grid-cols-[minmax(0,7.5rem)_1fr]">
                    <div className="hidden border-r border-gray-100 bg-stone-50/50 p-3 md:block">
                      <div className="space-y-2">
                        {mockNavItems.map((item, i) => (
                          <div
                            key={item}
                            className={cn(
                              'rounded-lg px-2 py-1.5 text-[11px] font-medium',
                              i === 0 ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                            )}
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4 p-4 sm:p-5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                            {t('hero.mockThisWeek')}
                          </p>
                          <p className="text-sm font-semibold text-gray-900">{t('hero.mockMilestone')}</p>
                        </div>
                        <span className="rounded-full bg-clay-50 px-2.5 py-1 text-[11px] font-semibold text-clay-800 ring-1 ring-clay-200/80">
                          {t('hero.mockOnTrack')}
                        </span>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div className="rounded-xl border border-gray-100 bg-stone-50/80 p-3">
                          <p className="text-[11px] font-medium text-gray-500">{t('hero.mockNextInvoice')}</p>
                          <p className="mt-1 text-lg font-bold tabular-nums text-gray-900">£24,800</p>
                          <p className="text-[11px] text-gray-400">{t('hero.mockInvoiceStatus')}</p>
                        </div>
                        <div className="rounded-xl border border-gray-100 bg-stone-50/80 p-3">
                          <p className="text-[11px] font-medium text-gray-500">{t('hero.mockAiInbox')}</p>
                          <p className="mt-1 line-clamp-2 text-xs leading-snug text-gray-600">
                            {t('hero.mockAiSummary')}
                          </p>
                          <p className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-clay-700">
                            <Sparkles className="size-3.5" />
                            {t('hero.mockSuggestedReply')}
                          </p>
                        </div>
                      </div>
                      <div className="rounded-xl border border-dashed border-gray-200 bg-white p-3">
                        <div className="mb-2 flex items-center gap-2 text-[11px] font-medium text-gray-500">
                          <MessageSquare className="size-3.5" />
                          {t('hero.mockClientThread')}
                        </div>
                        <div className="space-y-2">
                          <div className="h-2 w-11/12 rounded-full bg-gray-100" />
                          <div className="h-2 w-4/5 rounded-full bg-gray-100" />
                          <div className="h-2 w-2/3 rounded-full bg-gray-50" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="product"
          className="scroll-mt-20 border-y border-gray-200/80 bg-white py-16 sm:py-20"
          aria-labelledby="product-heading"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2 id="product-heading" className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                {t('product.title')}
              </h2>
              <p className="mt-4 text-lg text-gray-600">{t('product.subtitle')}</p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {productCards.map(({ title, body, icon: Icon }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-gray-100 bg-stone-50/60 p-6 text-left shadow-sm"
                >
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-900 shadow-sm ring-1 ring-gray-100">
                    <Icon className="size-5" strokeWidth={2} />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="features"
          className="scroll-mt-20 py-16 sm:py-20"
          aria-labelledby="features-heading"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <h2 id="features-heading" className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                {t('features.title')}
              </h2>
              <p className="mt-4 text-lg text-gray-600">{t('features.subtitle')}</p>
            </div>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ title, description, icon: Icon, tint }) => (
                <Card
                  key={title}
                  className="border-gray-200/90 bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  <CardHeader className="space-y-4">
                    <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', tint)}>
                      <Icon className="size-5" strokeWidth={2} />
                    </div>
                    <CardTitle className="text-lg font-semibold leading-snug">{title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed text-gray-600">
                      {description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
            <div className="mt-12 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="h-12 rounded-xl px-6">
                <Link href="/register">
                  {t('features.createWorkspace')}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-xl border-gray-200 bg-white"
              >
                <Link href="/pricing">{t('features.seePricing')}</Link>
              </Button>
            </div>
          </div>
        </section>

        <section
          id="workflow"
          className="scroll-mt-20 border-t border-gray-200/80 bg-gradient-to-b from-white to-stone-50 py-16 sm:py-20"
          aria-labelledby="workflow-heading"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 id="workflow-heading" className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                {t('workflow.title')}
              </h2>
              <p className="mt-4 text-lg text-gray-600">{t('workflow.subtitle')}</p>
            </div>
            <ol className="mt-14 grid gap-8 lg:grid-cols-3">
              {steps.map(({ step, title, body, icon: Icon }) => (
                <li
                  key={step}
                  className="relative rounded-2xl border border-gray-200 bg-white p-6 pt-10 shadow-sm"
                >
                  <span className="absolute left-6 top-6 text-xs font-bold tabular-nums text-clay-600">
                    {step}
                  </span>
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-stone-100 text-gray-900">
                    <Icon className="size-5" strokeWidth={2} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="py-16 sm:py-20" aria-labelledby="quote-heading">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-gradient-to-br from-primary/[0.07] via-white to-clay-50/80 px-6 py-12 sm:px-12 sm:py-14 shadow-sm">
              <div
                className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-clay-400/20 blur-3xl"
                aria-hidden
              />
              <blockquote className="relative">
                <p id="quote-heading" className="text-xl font-medium leading-relaxed text-gray-900 sm:text-2xl">
                  &ldquo;{t('quote.textBefore')}{' '}
                  <span className="text-clay-800">{t('quote.textAccent')}</span>
                  &rdquo;
                </p>
                <footer className="mt-6 text-sm text-gray-600">
                  <cite className="not-italic font-medium text-gray-800">{t('quote.author')}</cite>
                  <span className="text-gray-400"> · {t('quote.role')}</span>
                </footer>
              </blockquote>
            </div>
          </div>
        </section>

        <section className="pb-20 pt-4" aria-labelledby="cta-heading">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-3xl bg-primary px-6 py-12 text-center text-primary-foreground shadow-xl sm:px-12 sm:py-16">
              <h2 id="cta-heading" className="text-3xl font-bold tracking-tight sm:text-4xl">
                {t('cta.title')}
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base opacity-95 sm:text-lg">{t('cta.subtitle')}</p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="h-12 rounded-xl bg-white px-8 text-base font-semibold text-primary shadow-sm hover:bg-stone-50"
                >
                  <Link href="/register">
                    {t('cta.getStarted')}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-xl border-white/40 bg-transparent px-8 text-base text-primary-foreground hover:bg-white/10"
                >
                  <Link href="/pricing">{t('cta.viewRevenueModel')}</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
