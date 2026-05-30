"use client"

import type React from "react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { Plug, Check, Calendar, CreditCard, Calculator, ArrowRight, Zap, BookOpen } from "lucide-react"
import { useTranslations } from "next-intl"
import { CtaButton } from "@/components/cta-button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { MarketingPageHero } from "@/components/marketing/marketing-page-hero"
import { GmailIcon } from "@/components/icons/GmailIcon"

const container = "mx-auto max-w-[1200px] px-6 sm:px-8"
const TITLE_H1 = "text-[30px] sm:text-5xl md:text-[56px] font-medium tracking-tight leading-[1.1]"

const INTEGRATIONS = [
  { key: "xero", name: "Xero", categoryKey: "accounting", icon: Calculator, popular: true },
  { key: "quickbooks", name: "QuickBooks", categoryKey: "accounting", icon: Calculator, popular: true },
  { key: "stripe", name: "Stripe", categoryKey: "payments", icon: CreditCard, popular: true },
  { key: "googleCalendar", name: "Google Calendar", categoryKey: "scheduling", icon: Calendar, popular: false },
  { key: "outlookCalendar", name: "Outlook Calendar", categoryKey: "scheduling", icon: Calendar, popular: false },
  { key: "gmail", name: "Gmail", categoryKey: "email", icon: GmailIcon, popular: true, isGmail: true },
  { key: "zapier", name: "Zapier", categoryKey: "automation", icon: Zap, popular: true },
  { key: "notion", name: "Notion", categoryKey: "productivity", icon: BookOpen, popular: false },
] as const

const COMING_SOON = [
  { name: "Sage", categoryKey: "accounting" },
  { name: "FreeAgent", categoryKey: "accounting" },
  { name: "Slack", categoryKey: "communication" },
] as const

const RELATED_LINKS = [
  { key: "finance", href: "/platform/finance" },
  { key: "clientPortal", href: "/platform/client-portal" },
  { key: "knowledgeCentre", href: "/knowledge" },
  { key: "pricing", href: "/pricing" },
] as const

function useReveal({ threshold = 0.12, delay = 0 } = {}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [show, setShow] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReduced) {
      setShow(true)
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setShow(true), delay)
          io.disconnect()
        }
      },
      { threshold },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold, delay])
  return { ref, show }
}

function Reveal({
  children,
  className,
  delay = 0,
  threshold = 0.12,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  threshold?: number
}) {
  const { ref, show } = useReveal({ threshold, delay })
  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out",
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function IntegrationsPageContent() {
  const t = useTranslations("integrationsPage")
  const ts = useTranslations("platformShared")

  return (
    <main className="bg-white">
      <MarketingPageHero contentClassName={cn(container, "pb-12 pt-12 sm:pb-16 md:pt-16")}>
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-stone-300/60 bg-white px-3 py-1 text-xs text-stone-700">
            <Plug className="h-3 w-3" aria-hidden="true" />
            {t("hero.badge")}
          </span>
          <h1 className={cn("mt-5 text-center", TITLE_H1)}>{t("hero.title")}</h1>
          <p className="mt-4 text-center text-base sm:text-lg text-stone-600">{t("hero.subtitle")}</p>
          <p className="mt-3 text-center text-sm text-stone-500">{t("hero.note")}</p>
        </Reveal>
      </MarketingPageHero>

      <section className="bg-stone-50 py-16 sm:py-20">
        <div className={container}>
          <Reveal>
            <h2 className="text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight text-center text-stone-900 mb-10">
              {t("grid.title")}
            </h2>
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {INTEGRATIONS.map((integration, index) => {
              const Icon = integration.icon
              const isGmail = "isGmail" in integration && integration.isGmail
              return (
                <Reveal key={integration.key} delay={index * 50}>
                  <Card className="h-full border-stone-200 bg-white transition-all hover:shadow-md">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-stone-100 p-2.5">
                            <Icon
                              className={isGmail ? "h-5 w-5" : "h-5 w-5 text-stone-600"}
                              aria-hidden="true"
                            />
                          </div>
                          <div>
                            <h3 className="font-semibold text-stone-900">{integration.name}</h3>
                            <p className="text-xs text-stone-500">{t(`categories.${integration.categoryKey}`)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {integration.popular && (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                              {t("grid.popular")}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                            <Check className="h-3 w-3" aria-hidden="true" />
                            {t("grid.available")}
                          </span>
                        </div>
                      </div>
                      <p className="mt-4 text-sm text-stone-600">{t(`items.${integration.key}.description`)}</p>
                    </CardContent>
                  </Card>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className={container}>
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight text-stone-900">
                {t("comingSoon.title")}
              </h2>
              <p className="mt-3 text-stone-600">{t("comingSoon.subtitle")}</p>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              {COMING_SOON.map((integration) => (
                <span
                  key={integration.name}
                  className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-stone-600"
                >
                  {integration.name}
                  <span className="text-xs text-stone-400">({t(`categories.${integration.categoryKey}`)})</span>
                </span>
              ))}
            </div>
          </Reveal>
          <Reveal delay={200}>
            <div className="mt-10 text-center">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-5 py-2.5 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50"
              >
                {t("comingSoon.requestLink")}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-stone-50 py-16 sm:py-20">
        <div className={container}>
          <div className="mx-auto max-w-4xl">
            <Reveal>
              <h2 className="text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight text-center text-stone-900">
                {t("relatedLinks.title")}
              </h2>
              <p className="mt-3 text-center text-stone-600">{t("relatedLinks.subtitle")}</p>
            </Reveal>
            <Reveal delay={100}>
              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {RELATED_LINKS.map((link) => (
                  <Link
                    key={link.key}
                    href={link.href}
                    className="group rounded-xl border border-stone-200 bg-white p-5 transition-all hover:border-stone-300 hover:shadow-md"
                  >
                    <h3 className="font-semibold text-stone-900 group-hover:text-stone-700">
                      {t(`relatedLinks.${link.key}.title`)}
                    </h3>
                    <p className="mt-1 text-sm text-stone-600">{t(`relatedLinks.${link.key}.desc`)}</p>
                  </Link>
                ))}
              </div>
            </Reveal>
          </div>
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
            <h2 className="text-2xl sm:text-[28px] md:text-[32px] font-medium tracking-tight">{t("finalCta.title")}</h2>
            <p className="mt-3 text-base sm:text-lg text-stone-300">{t("finalCta.subtitle")}</p>
            <div className="mt-8 flex items-center justify-center">
              <CtaButton href="/signup" variant="white" label={ts("startForFree")} showArrow arrowVariant="black" />
            </div>
            <p className="mt-3 text-xs sm:text-sm text-stone-400">{ts("noCreditCardRequired")}</p>
          </Reveal>
        </div>
      </section>
    </main>
  )
}
