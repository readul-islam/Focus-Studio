"use client"

import type React from "react"
import Link from "next/link"
import {
  ArrowRight,
  AudioLines,
  BookOpen,
  CheckCircle2,
  FileText,
  Mail,
  ShoppingCart,
  Sparkles,
  Sun,
} from "lucide-react"
import { useMemo } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { CtaButton } from "@/components/cta-button"
import { MarketingPageHero } from "@/components/marketing/marketing-page-hero"
import { Reveal } from "@/components/marketing/reveal"
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema"
import { UniformFrame } from "@/components/media/uniform-frame"
import { cn } from "@/lib/utils"

const container = "mx-auto max-w-[1200px] px-6 sm:px-8"
const TITLE_H1 = "text-[30px] sm:text-5xl md:text-[56px] font-medium tracking-tight leading-[1.1]"
const TITLE_H2 = "text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight text-stone-950"

const FEATURE_CARDS = [
  { key: "dailyBrief", icon: Sun, href: "#daily-brief", accent: "#E07A57" },
  { key: "noteTaker", icon: AudioLines, href: "#note-taker", accent: "#7A8FA8" },
  { key: "emailRouting", icon: Mail, href: "/platform/features/ai-email", accent: "#8FA58F" },
  { key: "procurementAssist", icon: ShoppingCart, href: "/platform/features/ai-procurement", accent: "#6E7A58" },
  { key: "proposalsDocuments", icon: FileText, href: "/platform/features/invoicing", accent: "#C78A3B" },
] as const

const SHOWCASES = [
  { key: "noteTaker", href: "#note-taker", src: "/images/platform/projects/docs-updated.png" },
  { key: "studioDashboard", href: "#daily-brief", src: "/images/app/dashboard-hero.png" },
  { key: "aiInbox", href: "/platform/features/ai-email", src: "/images/platform/projects/messages.png" },
  { key: "procurementAssist", href: "/platform/features/ai-procurement", src: "/images/procurement/ai-import-chair.png" },
  { key: "aiProposals", href: "/platform/features/invoicing", src: "/images/platform/crm/ai-proposal-wizard.png" },
] as const

const STEP_KEYS = ["projectContext", "draft", "humanApprove"] as const
const NOTE_TAKER_BULLETS = ["siteVisit", "liveMeetings", "reviewPublish"] as const
const DAILY_BRIEF_BULLETS = ["summarisesEmail", "highlightsRisks", "availableAfterSignup"] as const

function FeatureCard({
  icon: Icon,
  title,
  description,
  href,
  linkLabel,
  accent,
  delay = 0,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  href: string
  linkLabel: string
  accent: string
  delay?: number
}) {
  return (
    <Reveal delay={delay}>
      <Card className="h-full border-stone-200 bg-white transition-shadow hover:shadow-md">
        <CardContent className="flex h-full flex-col p-6">
          <div
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${accent}22`, color: accent }}
          >
            <Icon className="h-5 w-5 text-current" aria-hidden />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-stone-900">{title}</h3>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-stone-600">{description}</p>
          <Link
            href={href}
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-stone-900 hover:text-[#C96A4A]"
          >
            {linkLabel}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </CardContent>
      </Card>
    </Reveal>
  )
}

export default function AIPlatformPage() {
  const t = useTranslations("platformAI")
  const ts = useTranslations("platformShared")

  const breadcrumbItems = useMemo(
    () => [
      { name: ts("breadcrumb.home"), url: "https://focuspilot.io" },
      { name: ts("breadcrumb.platform"), url: "https://focuspilot.io/platform" },
      { name: t("breadcrumbLabel"), url: "https://focuspilot.io/platform/ai" },
    ],
    [t, ts],
  )

  return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />

      <main className="bg-white">
        <MarketingPageHero
          id="overview"
          gridHeight="min(560px, 62vh)"
          contentClassName={cn(container, "pb-12 pt-12 sm:pb-16 md:pt-16")}
        >
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-stone-300/60 bg-white px-3 py-1 text-xs text-stone-700">
                <Sparkles className="h-3 w-3 text-[#C96A4A]" aria-hidden />
                {t("hero.badge")}
              </span>
              <h1 className={cn("mt-5 lg:text-left", TITLE_H1)}>{t("hero.title")}</h1>
              <p className="mt-4 text-base leading-relaxed text-stone-600 sm:text-lg">{t("hero.subtitle")}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <CtaButton href="/signup" variant="slate" label={ts("startForFree")} showArrow arrowVariant="white" />
                <CtaButton href="#features" variant="grey" label={t("hero.seeAiFeatures")} />
              </div>
            </Reveal>
            <Reveal delay={100}>
              <UniformFrame
                src="/images/ui-hero-dashboard.png"
                alt={t("hero.imageAlt")}
                width={1200}
                height={720}
                priority
                className="shadow-lg"
              />
            </Reveal>
          </div>
        </MarketingPageHero>

        <section id="features" className="scroll-mt-24 py-14 sm:py-20" aria-labelledby="ai-features-heading">
          <div className={container}>
            <Reveal className="mx-auto max-w-3xl text-center">
              <h2 id="ai-features-heading" className={TITLE_H2}>
                {t("features.title")}
              </h2>
              <p className="mt-3 text-base text-stone-600">{t("features.subtitle")}</p>
            </Reveal>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURE_CARDS.map((f, i) => (
                <FeatureCard
                  key={f.key}
                  icon={f.icon}
                  title={t(`features.cards.${f.key}.title`)}
                  description={t(`features.cards.${f.key}.description`)}
                  href={f.href}
                  linkLabel={t(`features.cards.${f.key}.linkLabel`)}
                  accent={f.accent}
                  delay={i * 60}
                />
              ))}
            </div>

            <Reveal className="mt-16">
              <h3 className="text-center text-lg font-medium text-stone-900">{t("features.showcasesHeading")}</h3>
              <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-stone-600">{t("features.showcasesSubtitle")}</p>
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                {SHOWCASES.map((item, i) => (
                  <Reveal key={item.key} delay={i * 50}>
                    <Link
                      href={item.href}
                      className="group block overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md"
                    >
                      <UniformFrame
                        src={item.src}
                        alt={t(`features.showcases.${item.key}.alt`)}
                        width={800}
                        height={500}
                        variant="float"
                        className="rounded-b-none"
                      />
                      <div className="border-t border-stone-100 px-4 py-3">
                        <p className="font-medium text-stone-900 group-hover:text-[#C96A4A]">
                          {t(`features.showcases.${item.key}.title`)}
                        </p>
                        <p className="mt-0.5 text-xs text-stone-600">{t(`features.showcases.${item.key}.caption`)}</p>
                      </div>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <section
          id="note-taker"
          className="scroll-mt-24 border-t border-stone-200 bg-stone-50/80 py-14 sm:py-20"
          aria-labelledby="note-taker-heading"
        >
          <div className={cn(container, "grid items-center gap-10 lg:grid-cols-2 lg:gap-14")}>
            <Reveal>
              <h2 id="note-taker-heading" className={TITLE_H2}>
                {t("noteTaker.title")}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-stone-600">{t("noteTaker.description")}</p>
              <ul className="mt-6 space-y-3 text-sm text-stone-700">
                {NOTE_TAKER_BULLETS.map((key) => (
                  <li key={key} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#7A8FA8]" aria-hidden />
                    {t(`noteTaker.bullets.${key}`)}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <CtaButton href="/signup" variant="slate" label={t("noteTaker.cta")} showArrow arrowVariant="white" />
              </div>
            </Reveal>
            <Reveal delay={120}>
              <UniformFrame
                src="/images/platform/projects/docs-updated.png"
                alt={t("noteTaker.imageAlt")}
                width={1200}
                height={720}
                className="mx-auto max-w-lg shadow-md"
              />
            </Reveal>
          </div>
        </section>

        <section
          id="daily-brief"
          className="scroll-mt-24 border-t border-stone-200 py-14 sm:py-20"
          aria-labelledby="daily-brief-heading"
        >
          <div className={cn(container, "grid items-center gap-10 lg:grid-cols-2 lg:gap-14")}>
            <Reveal>
              <h2 id="daily-brief-heading" className={TITLE_H2}>
                {t("dailyBrief.title")}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-stone-600">{t("dailyBrief.description")}</p>
              <ul className="mt-6 space-y-3 text-sm text-stone-700">
                {DAILY_BRIEF_BULLETS.map((key) => (
                  <li key={key} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#8FA58F]" aria-hidden />
                    {t(`dailyBrief.bullets.${key}`)}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <CtaButton href="/signup" variant="slate" label={t("dailyBrief.cta")} showArrow arrowVariant="white" />
              </div>
            </Reveal>
            <Reveal delay={120}>
              <UniformFrame
                src="/images/app/dashboard-hero.png"
                alt={t("dailyBrief.imageAlt")}
                width={1200}
                height={720}
                className="mx-auto max-w-lg shadow-md"
              />
            </Reveal>
          </div>
        </section>

        <section className="py-14 sm:py-20" aria-labelledby="how-it-works-heading">
          <div className={container}>
            <Reveal className="mx-auto max-w-3xl text-center">
              <h2 id="how-it-works-heading" className={TITLE_H2}>
                {t("howItWorks.title")}
              </h2>
              <p className="mt-3 text-base text-stone-600">{t("howItWorks.subtitle")}</p>
            </Reveal>

            <ol className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-3">
              {STEP_KEYS.map((key, i) => (
                <Reveal key={key} delay={i * 80}>
                  <li className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-900 text-sm font-semibold text-white">
                      {i + 1}
                    </span>
                    <h3 className="mt-4 text-lg font-semibold text-stone-900">{t(`howItWorks.steps.${key}.title`)}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-stone-600">{t(`howItWorks.steps.${key}.body`)}</p>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        <section className="border-t border-stone-200 bg-stone-50 py-14 sm:py-20" aria-labelledby="playbook-heading">
          <div className={container}>
            <Reveal>
              <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-stone-200 bg-white p-8 sm:p-10 lg:flex lg:items-center lg:gap-10">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#FBEAE1]" aria-hidden>
                  <BookOpen className="h-7 w-7 text-[#C96A4A]" />
                </div>
                <div className="mt-6 flex-1 lg:mt-0">
                  <h2 id="playbook-heading" className="text-2xl font-medium tracking-tight text-stone-900 sm:text-3xl">
                    {t("playbook.title")}
                  </h2>
                  <p className="mt-3 text-stone-600">{t("playbook.description")}</p>
                  <Link
                    href="/resources/ai-playbook"
                    className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-stone-900 hover:text-[#C96A4A]"
                  >
                    {t("playbook.linkLabel")}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </div>
                <div className="mt-6 shrink-0 lg:mt-0">
                  <CtaButton
                    href="/resources/ai-playbook"
                    variant="outline"
                    label={t("playbook.cta")}
                    className="w-full justify-center sm:w-auto"
                  />
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section
          aria-label={t("finalCta.ariaLabel")}
          className="relative isolate overflow-hidden py-24 text-stone-100"
          style={{ backgroundColor: "#3F4B51" }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.05]"
            style={{ backgroundImage: "url('/textures/grain.png')", backgroundSize: "200px 200px" }}
          />
          <div className={container}>
            <Reveal className="mx-auto max-w-3xl text-center">
              <h2 className="text-2xl font-medium tracking-tight sm:text-[28px] md:text-[32px]">{t("finalCta.title")}</h2>
              <p className="mt-3 text-base text-stone-300 sm:text-lg">{t("finalCta.subtitle")}</p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <CtaButton href="/signup" variant="white" label={ts("startForFree")} showArrow arrowVariant="black" />
                <Link
                  href="/resources/ai-playbook"
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-white/30 px-4 text-sm font-medium text-white hover:bg-white/10"
                >
                  {t("finalCta.playbookLink")}
                </Link>
              </div>
              <p className="mt-3 text-xs text-stone-400 sm:text-sm">{ts("noCreditCardRequired")}</p>
            </Reveal>
          </div>
        </section>
      </main>
    </>
  )
}
