"use client"

import type React from "react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { Sparkles, Zap, Bug, Bell } from "lucide-react"
import { useTranslations } from "next-intl"
import { CtaButton } from "@/components/cta-button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { MarketingPageHero } from "@/components/marketing/marketing-page-hero"

const container = "mx-auto max-w-[1200px] px-6 sm:px-8"
const TITLE_H1 = "text-[30px] sm:text-5xl md:text-[56px] font-medium tracking-tight leading-[1.1]"
const TITLE_H2 = "text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight"

const UPDATE_VERSIONS = [
  { id: "v27", changeKeys: ["aiNoteTaker"] },
  { id: "v26", changeKeys: ["zapierApi", "notionIntegration", "integrationsSettings"] },
  { id: "v25", changeKeys: ["gmailIntegration", "googleCalendar", "projectCalendarEvents", "calendarEventDisplay", "projectCalendarFiltering"] },
  { id: "v24", changeKeys: ["aiEmailDrafting", "bulkPoGeneration", "fasterDashboard", "contractorPortal"] },
  { id: "v23", changeKeys: ["clientPortalPayments", "xeroTwoWaySync", "pdfExport", "mobileNavigation"] },
  { id: "v22", changeKeys: ["aiProductSourcing", "mobileExperience", "search", "calendarSync"] },
  { id: "v21", changeKeys: ["projectTemplates", "timeTracking", "clientPortal"] },
] as const

const RELATED_LINKS = [
  { key: "projects", href: "/platform/projects" },
  { key: "procurement", href: "/platform/procurement" },
  { key: "clientPortal", href: "/platform/client-portal" },
  { key: "finance", href: "/platform/finance" },
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

function TypeBadge({ type }: { type: string }) {
  const t = useTranslations("changelogPage.typeBadges")
  const variants: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
    new: { bg: "bg-emerald-50", text: "text-emerald-700", icon: Sparkles },
    improvement: { bg: "bg-blue-50", text: "text-blue-700", icon: Zap },
    fix: { bg: "bg-amber-50", text: "text-amber-700", icon: Bug },
  }
  const variant = variants[type] || variants.new
  const Icon = variant.icon
  const label = type === "new" || type === "improvement" || type === "fix" ? t(type) : type
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", variant.bg, variant.text)}>
      <Icon className="h-3 w-3" aria-hidden="true" />
      {label}
    </span>
  )
}

export function ChangelogPageContent() {
  const t = useTranslations("changelogPage")
  const ts = useTranslations("platformShared")

  return (
    <main className="bg-white">
      <MarketingPageHero contentClassName={cn(container, "pb-12 pt-12 sm:pb-16 md:pt-16")}>
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-stone-300/60 bg-white px-3 py-1 text-xs text-stone-700">
            <Bell className="h-3 w-3" aria-hidden="true" />
            {t("hero.badge")}
          </span>
          <h1 className={cn("mt-5 text-center", TITLE_H1)}>{t("hero.title")}</h1>
          <p className="mt-4 text-center text-base sm:text-lg text-stone-600">{t("hero.subtitle")}</p>
          <p className="mt-3 text-center text-sm text-stone-500">{t("hero.note")}</p>
        </Reveal>
      </MarketingPageHero>

      <section className="bg-stone-50 py-16 sm:py-20">
        <div className={container}>
          <div className="mx-auto max-w-4xl">
            <div className="space-y-12">
              {UPDATE_VERSIONS.map((update, updateIndex) => (
                <Reveal key={update.id} delay={updateIndex * 100}>
                  <div>
                    <div className="flex items-center gap-4 mb-6">
                      <h2 className={cn(TITLE_H2, "text-stone-900")}>{t(`updates.${update.id}.date`)}</h2>
                      <span className="inline-flex items-center rounded-full border border-stone-300 bg-white px-3 py-1 text-sm font-medium text-stone-700">
                        v{t(`updates.${update.id}.version`)}
                      </span>
                    </div>
                    <div className="space-y-4">
                      {update.changeKeys.map((changeKey) => {
                        const type = t(`updates.${update.id}.changes.${changeKey}.type`)
                        return (
                          <Card key={changeKey} className="border-stone-200 bg-white transition-all hover:shadow-md">
                            <CardContent className="p-5 sm:p-6">
                              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                                <TypeBadge type={type} />
                                <div className="flex-1">
                                  <h3 className="font-semibold text-stone-900">
                                    {t(`updates.${update.id}.changes.${changeKey}.title`)}
                                  </h3>
                                  <p className="mt-1 text-sm sm:text-base text-stone-600">
                                    {t(`updates.${update.id}.changes.${changeKey}.description`)}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className={container}>
          <div className="mx-auto max-w-4xl">
            <Reveal>
              <h2 className={cn(TITLE_H2, "text-center text-stone-900")}>{t("relatedLinks.title")}</h2>
              <p className="mt-3 text-center text-stone-600">{t("relatedLinks.subtitle")}</p>
            </Reveal>
            <Reveal delay={100}>
              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {RELATED_LINKS.map(({ key, href }) => (
                  <Link
                    key={key}
                    href={href}
                    className="group rounded-xl border border-stone-200 bg-white p-5 transition-all hover:border-stone-300 hover:shadow-md"
                  >
                    <h3 className="font-semibold text-stone-900 group-hover:text-stone-700">
                      {t(`relatedLinks.${key}.title`)}
                    </h3>
                    <p className="mt-1 text-sm text-stone-600">{t(`relatedLinks.${key}.desc`)}</p>
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
