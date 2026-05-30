"use client"

import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { useCallback, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { CtaButton } from "@/components/cta-button"
import { cn } from "@/lib/utils"
import { Clock, CheckCircle2, Sparkles, ArrowRight, ClipboardList, ShoppingCart, Users } from "lucide-react"
import { useTranslations } from "next-intl"
import { LandingHeroBackground } from "@/components/landing-hero-background"
import { BreadcrumbSchema, usePlatformBreadcrumbs } from "@/components/seo/breadcrumb-schema"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"], weight: ["300", "400"] })

const container = "mx-auto max-w-[1200px] px-6 sm:px-8"
const H1 = "text-[30px] sm:text-5xl md:text-[56px] font-medium tracking-tight leading-[1.1]"
const H2 = "text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight"
const Lead = "text-base sm:text-lg text-stone-600"

const CLAY = "#E07A57"
const SLATE = "#4B5960"
const OLIVE = "#6E7A58"
const OCHRE = "#C78A3B"
const AI_PANEL_BG = "#EFEAE2"

const KPI_TILES = [
  { key: "invoicesPaid", accent: OLIVE },
  { key: "outstanding", accent: CLAY },
  { key: "posThisMonth", accent: OCHRE },
  { key: "grossMargin", accent: SLATE },
] as const

const KPI_BULLETS = ["cashFlow", "budgetVsActual", "reminders"] as const
const INVOICE_BULLETS = ["xeroSync", "paymentLinks", "statusChips"] as const
const PROFIT_BULLETS = ["budgetView", "timeTracking", "studioProfit"] as const

const SUGGESTION_KEYS = ["invoice", "forecast", "reminder", "po"] as const
type ResponseKey = "invoice" | "reminder" | "default"

const RELATED_LINKS = [
  { key: "projects", href: "/platform/projects", icon: ClipboardList },
  { key: "procurement", href: "/platform/procurement", icon: ShoppingCart },
  { key: "clientPortal", href: "/platform/client-portal", icon: Users },
  { key: "pricing", href: "/pricing", icon: Sparkles },
] as const

function KpiTile({
  label,
  value,
  sublabel,
  accent = SLATE,
}: {
  label: string
  value: string
  sublabel?: string
  accent?: string
}) {
  return (
    <Card className="overflow-hidden border-stone-200 shadow-sm">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-medium tracking-wide text-stone-600">{label}</div>
            <div className="mt-1 text-2xl font-semibold text-stone-950">{value}</div>
            {sublabel ? <div className="mt-1 text-xs text-stone-500">{sublabel}</div> : null}
          </div>
          <span aria-hidden className="mt-1 inline-block h-1.5 w-10 rounded-full" style={{ backgroundColor: accent }} />
        </div>
      </CardContent>
    </Card>
  )
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-stone-800">
      <CheckCircle2 className="mt-0.5 h-5 w-5 text-stone-900" />
      <span className="text-base">{children}</span>
    </li>
  )
}

function AiFinanceDemo() {
  const t = useTranslations("platformFinance.aiAssistant")
  const [input, setInput] = useState("")
  const [answer, setAnswer] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const pendingResponseKey = useRef<ResponseKey>("default")

  const getResponseText = useCallback(
    (key: ResponseKey) => {
      if (key === "invoice") return t("responses.invoice")
      if (key === "reminder") return t("responses.reminder")
      return t("responses.default")
    },
    [t],
  )

  const inferResponseKey = useCallback(
    (prompt: string): ResponseKey => {
      const lower = prompt.toLowerCase()
      if (lower.includes("create invoice") || lower.includes("請求書")) return "invoice"
      if (lower.includes("reminder") || lower.includes("リマインダー")) return "reminder"
      return "default"
    },
    [],
  )

  const simulateAnswer = useCallback(
    (responseKey: ResponseKey) => {
      setLoading(true)
      setAnswer("")
      const canned = getResponseText(responseKey)
      let i = 0
      const id = setInterval(() => {
        setAnswer(canned.slice(0, i))
        i += Math.max(1, Math.round(Math.random() * 3))
        if (i >= canned.length) {
          clearInterval(id)
          setLoading(false)
        }
      }, 18)
    },
    [getResponseText],
  )

  const onSubmit = useCallback(() => {
    const trimmed = input.trim()
    if (!trimmed) return
    const key = pendingResponseKey.current !== "default" ? pendingResponseKey.current : inferResponseKey(trimmed)
    pendingResponseKey.current = "default"
    simulateAnswer(key)
    setInput("")
    setTimeout(() => textareaRef.current?.focus(), 0)
  }, [input, inferResponseKey, simulateAnswer])

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      onSubmit()
    }
  }

  const onSuggestionClick = (suggestionKey: (typeof SUGGESTION_KEYS)[number]) => {
    const text = t(`suggestions.${suggestionKey}`)
    setInput(text)
    if (suggestionKey === "invoice") pendingResponseKey.current = "invoice"
    else if (suggestionKey === "reminder") pendingResponseKey.current = "reminder"
    else pendingResponseKey.current = "default"
  }

  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-stone-300/60 p-4 sm:p-6 md:p-7"
      style={{ backgroundColor: AI_PANEL_BG }}
      role="region"
      aria-label={t("panelAria")}
    >
      {answer || loading ? (
        <div className="mt-5 rounded-2xl bg-white p-4 ring-1 ring-stone-300">
          <pre className="whitespace-pre-wrap text-[15px] leading-relaxed text-stone-900">{answer}</pre>
          {loading ? (
            <div className="mt-3 h-1 w-full overflow-hidden rounded bg-stone-100" aria-hidden>
              <div className="h-1 w-1/2 animate-[pulse_900ms_ease_infinite] rounded bg-stone-300" />
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
        <div className="flex items-start gap-3 rounded-2xl bg-white px-3 py-2 ring-1 ring-stone-300">
          <span
            className="mt-1 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl"
            style={{
              backgroundColor: "rgba(224,122,87,0.10)",
              boxShadow: "inset 0 0 0 1px rgba(224,122,87,0.24)",
              color: CLAY,
            }}
            aria-hidden="true"
            title="AI"
          >
            <Sparkles className="h-4 w-4" />
          </span>
          <div className="flex-1">
            <label htmlFor="ai-composer" className="sr-only">
              {t("composerLabel")}
            </label>
            <textarea
              id="ai-composer"
              ref={textareaRef}
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={t("placeholder")}
              className="w-full resize-none bg-transparent text-[15px] leading-6 text-stone-800 placeholder:text-stone-400 outline-none"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={onSubmit}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#3F4B51] px-4 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#39444A] focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-300"
          aria-label={t("askAiAria")}
        >
          {t("askAi")}
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-stone-900">
            <ArrowRight className="h-4 w-4" />
          </span>
        </button>
      </div>

      <div className={`mt-3 ${inter.className} text-sm text-stone-500`}>
        <div className="flex flex-wrap gap-2">
          {SUGGESTION_KEYS.map((key) => {
            const suggestion = t(`suggestions.${key}`)
            return (
              <button
                key={key}
                type="button"
                onClick={() => onSuggestionClick(key)}
                className="rounded-full border border-stone-300/60 px-3 py-1 text-stone-500 transition hover:bg-white"
                aria-label={t("useSuggestionAria", { suggestion })}
              >
                {suggestion}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function FinancePageContent() {
  const t = useTranslations("platformFinance")
  const ts = useTranslations("platformShared")
  const breadcrumbs = usePlatformBreadcrumbs("finance")

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      <main className="bg-white">
        <section className="relative isolate overflow-hidden bg-stone-50 pb-10 pt-12 sm:pb-12 sm:pt-16 md:pt-20">
          <LandingHeroBackground gridHeight="min(520px, 56vh)" gridFadeStop={0.58} />
          <div className={cn(container, "relative z-10")}>
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="outline" className="rounded-full border-stone-300 bg-stone-50 text-stone-700">
                {t("hero.badge")}
              </Badge>
              <h1 className={cn("mt-4 text-center", H1)}>{t("hero.title")}</h1>
              <p className={cn("mt-4 text-center", Lead)}>{t("hero.subtitle")}</p>
            </div>

            <div className="mx-auto mt-8 max-w-6xl">
              <Card className="overflow-hidden border-stone-200 shadow-xl">
                <CardContent className="p-0">
                  <Image
                    src="/images/finance-dashboard.png"
                    alt={t("hero.imageAlt")}
                    width={1600}
                    height={900}
                    className="h-auto w-full rounded-lg object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1200px"
                  />
                </CardContent>
              </Card>
              <div className="mx-auto mt-6 flex items-center justify-center gap-5 sm:gap-8">
                <span className="text-sm text-stone-600">{t("hero.integratesWith")}</span>
                <img
                  src="/logos/stripe-logo-new.png"
                  alt={t("hero.stripeAlt")}
                  width={100}
                  height={28}
                  className="h-6 w-auto opacity-80"
                  decoding="async"
                  loading="lazy"
                />
                <img
                  src="/logos/xero-logo-new.png"
                  alt={t("hero.xeroAlt")}
                  width={88}
                  height={28}
                  className="h-6 w-auto opacity-80"
                  decoding="async"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-14 sm:py-20">
          <div className={container}>
            <div className="grid gap-6 md:grid-cols-12">
              <div className="md:col-span-5">
                <h2 className={H2}>{t("kpis.title")}</h2>
                <p className={cn("mt-3", Lead)}>{t("kpis.description")}</p>
                <ul className="mt-6 space-y-3">
                  {KPI_BULLETS.map((key) => (
                    <Bullet key={key}>{t(`kpis.bullets.${key}`)}</Bullet>
                  ))}
                </ul>
                <div className="mt-6 flex gap-3">
                  <CtaButton href="#ai" variant="slate" label={t("kpis.tryAiAssistant")} showArrow arrowVariant="white" />
                  <CtaButton href="#invoices" variant="white" label={t("kpis.seeInvoices")} />
                </div>
              </div>
              <div className="md:col-span-7">
                <div className="grid gap-4 sm:grid-cols-2">
                  {KPI_TILES.map((tile) => (
                    <KpiTile
                      key={tile.key}
                      label={t(`kpis.tiles.${tile.key}.label`)}
                      value={t(`kpis.tiles.${tile.key}.value`)}
                      sublabel={t(`kpis.tiles.${tile.key}.sublabel`)}
                      accent={tile.accent}
                    />
                  ))}
                </div>
                <Card className="mt-4 overflow-hidden border-stone-200 shadow-sm">
                  <CardContent className="p-1">
                    <Image
                      src="/images/finance-dashboard.png"
                      alt={t("kpis.chartImageAlt")}
                      width={1200}
                      height={560}
                      className="h-auto w-full rounded-lg object-cover"
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section id="invoices" className="bg-white py-14 sm:py-20">
          <div className={container}>
            <div className="grid items-start gap-10 md:grid-cols-12">
              <div className="md:col-span-6 md:order-2">
                <h2 className={H2}>{t("invoices.title")}</h2>
                <p className={cn("mt-3", Lead)}>{t("invoices.description")}</p>
                <ul className="mt-6 space-y-3">
                  {INVOICE_BULLETS.map((key) => (
                    <Bullet key={key}>{t(`invoices.bullets.${key}`)}</Bullet>
                  ))}
                </ul>
                <div className="mt-6">
                  <CtaButton href="#ai" variant="white" label={t("invoices.generateWithAi")} />
                </div>
              </div>
              <div className="md:col-span-6 md:order-1">
                <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
                  <div className="space-y-3">
                    <Card className="overflow-hidden border-stone-200 shadow-sm">
                      <CardContent className="p-1">
                        <Image
                          src="/images/invoice-summary-cards.png"
                          alt={t("invoices.imageAlts.summaryCards")}
                          width={400}
                          height={60}
                          className="h-auto w-full rounded-lg object-cover"
                        />
                      </CardContent>
                    </Card>
                    <Card className="overflow-hidden border-stone-200 shadow-sm">
                      <CardContent className="p-1">
                        <Image
                          src="/images/invoice-buttons.png"
                          alt={t("invoices.imageAlts.actionButtons")}
                          width={300}
                          height={40}
                          className="h-auto w-full rounded-lg object-cover"
                        />
                      </CardContent>
                    </Card>
                    <Card className="overflow-hidden border-stone-200 shadow-sm">
                      <CardContent className="p-1">
                        <Image
                          src="/images/project-cost-tracking.png"
                          alt={t("invoices.imageAlts.costTracking")}
                          width={400}
                          height={100}
                          className="h-auto w-full rounded-lg object-cover"
                        />
                      </CardContent>
                    </Card>
                  </div>
                  <div>
                    <Card className="overflow-hidden border-stone-200 shadow-sm h-full">
                      <CardContent className="p-1">
                        <Image
                          src="/images/invoice-list-actions.png"
                          alt={t("invoices.imageAlts.invoiceList")}
                          width={350}
                          height={200}
                          className="h-auto w-full rounded-lg object-cover"
                        />
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-14 sm:py-20">
          <div className={container}>
            <div className="grid gap-6 md:grid-cols-12">
              <div className="md:col-span-7">
                <Card className="overflow-hidden border-stone-200 shadow-sm">
                  <CardContent className="p-2 sm:p-3">
                    <Image
                      src="/images/budget-analysis-dashboard.png"
                      alt={t("profitability.budgetImageAlt")}
                      width={1200}
                      height={620}
                      className="h-auto w-full rounded-lg object-cover"
                    />
                  </CardContent>
                </Card>
              </div>
              <div className="md:col-span-5">
                <h2 className={H2}>{t("profitability.title")}</h2>
                <p className={cn("mt-3", Lead)}>{t("profitability.description")}</p>
                <ul className="mt-6 space-y-3">
                  {PROFIT_BULLETS.map((key) => (
                    <Bullet key={key}>{t(`profitability.bullets.${key}`)}</Bullet>
                  ))}
                </ul>
                <div className="mt-6 flex items-center gap-2 text-sm text-stone-700">
                  <Clock className="h-4 w-4" />
                  {t("profitability.timeTrackingNote")}
                </div>
                <div className="mt-4">
                  <Card className="overflow-hidden border-stone-200">
                    <CardContent className="p-2 sm:p-3">
                      <Image
                        src="/images/time-tracking-dashboard.png"
                        alt={t("profitability.timeImageAlt")}
                        width={1200}
                        height={560}
                        className="h-auto w-full rounded-lg object-cover"
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="ai" className="bg-white py-14 sm:py-20">
          <div className={container}>
            <div className="mx-auto max-w-3xl text-center">
              <h2 className={H2}>{t("aiAssistant.title")}</h2>
              <p className={cn("mt-3", Lead)}>{t("aiAssistant.subtitle")}</p>
            </div>
            <div className="mx-auto mt-8 max-w-6xl">
              <AiFinanceDemo />
            </div>
          </div>
        </section>

        <section className="bg-stone-50 py-16 sm:py-20">
          <div className={container}>
            <div className="mx-auto max-w-4xl">
              <h2 className="text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight text-center text-stone-900">
                {t("relatedLinks.title")}
              </h2>
              <p className="mt-3 text-center text-stone-600">{t("relatedLinks.subtitle")}</p>
              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {RELATED_LINKS.map((link) => {
                  const Icon = link.icon
                  return (
                    <Link
                      key={link.key}
                      href={link.href}
                      className="group rounded-xl border border-stone-200 bg-white p-5 transition-all hover:border-stone-300 hover:shadow-md"
                    >
                      <Icon className="h-6 w-6 text-stone-600 group-hover:text-stone-900" />
                      <h3 className="mt-3 font-semibold text-stone-900">{t(`relatedLinks.${link.key}.title`)}</h3>
                      <p className="mt-1 text-sm text-stone-600">{t(`relatedLinks.${link.key}.desc`)}</p>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="relative isolate overflow-hidden py-24" style={{ backgroundColor: "#F1BBAA" }}>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{ backgroundImage: "url('/textures/grain.png')", backgroundSize: "200px 200px" }}
          />
          <div className={container}>
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-2xl sm:text-[28px] md:text-[32px] font-medium tracking-tight text-stone-950">
                {t("finalCta.title")}
              </h2>
              <p className="mt-3 text-lg text-stone-900/80">{t("finalCta.subtitle")}</p>
              <div className="mt-8 flex justify-center">
                <CtaButton href="/signup" variant="slate" label={ts("startForFree")} showArrow arrowVariant="white" />
              </div>
              <p className="mt-3 text-xs sm:text-sm text-stone-900/60">{ts("noCreditCardRequired")}</p>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
