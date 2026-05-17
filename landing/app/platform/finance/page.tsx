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
import { FloorPlanBg } from "@/components/graphics/floorplan-bg"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"], weight: ["300", "400"] })

const container = "mx-auto max-w-[1200px] px-6 sm:px-8"
const H1 = "text-[30px] sm:text-5xl md:text-[56px] font-medium tracking-tight leading-[1.1]"
const H2 = "text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight"
const Lead = "text-base sm:text-lg text-stone-600"

// Palette accents
const CLAY = "#E07A57"
const SLATE = "#4B5960"
const OLIVE = "#6E7A58"
const OCHRE = "#C78A3B"

// Lighter panel for the AI block (closer to product cards)
const AI_PANEL_BG = "#EFEAE2" // Greige 100 (lighter than before)

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

/**
 * AiFinanceDemo — simplified, single-composer chat panel:
 * - One clean panel (no logos; lighter background)
 * - Output area in the middle
 * - Composer fixed to the bottom of the panel
 * - Refined typography (no heavy bold on body text)
 */
function AiFinanceDemo() {
  const [input, setInput] = useState("")
  const [answer, setAnswer] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const simulateAnswer = useCallback((prompt: string) => {
    setLoading(true)
    setAnswer("")
    const lower = prompt.toLowerCase()
    const canned = lower.includes("create invoice")
      ? `Drafted invoice INV-3281 for Oak House • 30% deposit • £12,600
Items pulled from: Phase 2 estimate
Status: Draft (unsent)
Next: Send to client portal • Sync to Xero • Schedule reminder`
      : lower.includes("reminder")
        ? `Reminder queued
Client: Jane Smith • INV-2053 • £2,180 • 7 days overdue
Email + portal notification at 9:00 AM
Follow up in 3 days if unpaid`
        : `Cash flow forecast (next 60 days)
Incoming: £86,400
Expected spend (POs + payroll): £64,900
Projection: Healthy
Tip: Close 2 pending approvals to improve Week 3 liquidity`

    let i = 0
    const id = setInterval(() => {
      setAnswer(canned.slice(0, i))
      i += Math.max(1, Math.round(Math.random() * 3))
      if (i >= canned.length) {
        clearInterval(id)
        setLoading(false)
      }
    }, 18)
  }, [])

  const onSubmit = useCallback(() => {
    const trimmed = input.trim()
    if (!trimmed) return
    simulateAnswer(trimmed)
    setInput("")
    // refocus for quicker follow-up prompts
    setTimeout(() => textareaRef.current?.focus(), 0)
  }, [input, simulateAnswer])

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      onSubmit()
    }
  }

  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-stone-300/60 p-4 sm:p-6 md:p-7"
      style={{ backgroundColor: AI_PANEL_BG }}
      role="region"
      aria-label="AI finance assistant"
    >
      {/* Output area (only show when there's something to show) */}
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

      {/* Composer at bottom */}
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
              Ask the AI finance assistant
            </label>
            <textarea
              id="ai-composer"
              ref={textareaRef}
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask to draft an invoice, forecast cash flow, or send a reminder…"
              className="w-full resize-none bg-transparent text-[15px] leading-6 text-stone-800 placeholder:text-stone-400 outline-none"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={onSubmit}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#3F4B51] px-4 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#39444A] focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-300"
          aria-label="Ask AI"
        >
          Ask AI
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-stone-900">
            <ArrowRight className="h-4 w-4" />
          </span>
        </button>
      </div>

      {/* Prompt suggestions */}
      <div className={`mt-3 ${inter.className} text-sm text-stone-500`}>
        <div className="flex flex-wrap gap-2">
          {[
            "Create an invoice for Oak House — 30% deposit from Phase 2 estimate",
            "Forecast cash flow for the next 60 days by project",
            "Send a payment reminder for INV-2053 (7 days overdue)",
            "Draft a PO for approved pendant lights and link to Project A",
          ].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setInput(s)}
              className="rounded-full border border-stone-300/60 px-3 py-1 text-stone-500 transition hover:bg-white"
              aria-label={`Use suggestion: ${s}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function FinancePage() {
  return (
    <main className="bg-white">
      {/* HERO */}
      <section className="relative isolate overflow-hidden pb-10 pt-12 sm:pb-12 sm:pt-16 md:pt-20">
        {/* Faint square floor‑plan tiles (match homepage) */}
        <FloorPlanBg mode="grid" tile={164} intensity={0.9} height="min(520px, 56vh)" fadeStop={0.5} />
        {/* Soft gradient + grain */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 0%, rgba(75,89,96,0.10) 0%, rgba(217,213,204,0.20) 40%, transparent 70%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-20 opacity-[0.06]"
          style={{ backgroundImage: "url('/textures/grain.png')", backgroundSize: "200px 200px" }}
        />
        <div className={cn(container)}>
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="outline" className="rounded-full border-stone-300 bg-stone-50 text-stone-700">
              Finance & Billing
            </Badge>
            <h1 className={cn("mt-4 text-center", H1)}>Finance & Invoicing Software for Interior Design Studios</h1>
            <p className={cn("mt-4 text-center", Lead)}>
              Budgets, POs, invoices and cash flow in one place all connected to projects, the client portal, and
              accounting. Automate the busywork and keep profitability clear.
            </p>
          </div>

          {/* Hero visual */}
          <div className="mx-auto mt-8 max-w-6xl">
            <Card className="overflow-hidden border-stone-200 shadow-xl">
              <CardContent className="p-0">
                <Image
                  src="/images/finance-dashboard.png"
                  alt="Finance dashboard showing KPIs, invoices and cash flow"
                  width={1600}
                  height={900}
                  className="h-auto w-full rounded-lg object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1200px"
                />
              </CardContent>
            </Card>
            <div className="mx-auto mt-6 flex items-center justify-center gap-5 sm:gap-8">
              <span className="text-sm text-stone-600">Integrates with</span>
              <img
                src="/logos/stripe-logo-new.png"
                alt="Stripe payment processing integration for interior design invoicing"
                width={100}
                height={28}
                className="h-6 w-auto opacity-80"
                decoding="async"
                loading="lazy"
              />
              <img
                src="/logos/xero-logo-new.png"
                alt="Xero accounting software integration for interior design finance"
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

      {/* KPIs */}
      <section className="bg-white py-14 sm:py-20">
        <div className={container}>
          <div className="grid gap-6 md:grid-cols-12">
            <div className="md:col-span-5">
              <h2 className={H2}>Clarity on cash flow, revenue and margins</h2>
              <p className={cn("mt-3", Lead)}>
                Stay on top of what matters: invoices issued and paid, upcoming POs, VAT, and projected runway all
                linked to projects and the studio view.
              </p>
              <ul className="mt-6 space-y-3">
                <Bullet>Real‑time cash flow with upcoming ins and outs</Bullet>
                <Bullet>Budget vs actual at project and studio level</Bullet>
                <Bullet>Automated payment reminders and notifications</Bullet>
              </ul>
              <div className="mt-6 flex gap-3">
                <CtaButton href="#ai" variant="slate" label="Try the AI assistant" showArrow arrowVariant="white" />
                <CtaButton href="#invoices" variant="white" label="See invoices" />
              </div>
            </div>
            <div className="md:col-span-7">
              <div className="grid gap-4 sm:grid-cols-2">
                <KpiTile label="Invoices paid (30d)" value="£48,320" sublabel="+12% vs last month" accent={OLIVE} />
                <KpiTile label="Outstanding" value="£18,560" sublabel="12 invoices • 7 overdue" accent={CLAY} />
                <KpiTile label="POs this month" value="£26,410" sublabel="On track" accent={OCHRE} />
                <KpiTile label="Gross margin (YTD)" value="42%" sublabel="+3 pts vs LY" accent={SLATE} />
              </div>
              <Card className="mt-4 overflow-hidden border-stone-200 shadow-sm">
                <CardContent className="p-1">
                  <Image
                    src="/images/finance-dashboard.png"
                    alt="Finance dashboard showing revenue metrics, targets, variance, and YoY comparison charts"
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

      {/* Invoices + payments */}
      <section id="invoices" className="bg-white py-14 sm:py-20">
        <div className={container}>
          <div className="grid items-start gap-10 md:grid-cols-12">
            <div className="md:col-span-6 md:order-2">
              <h2 className={H2}>Invoices and payments automated, synced, paid</h2>
              <p className={cn("mt-3", Lead)}>
                Create invoices from estimates in one click, send them to the client portal, accept cards or ACH via
                Stripe, and sync every update to Xero automatically.
              </p>
              <ul className="mt-6 space-y-3">
                <Bullet>1‑click Xero sync for new and updated invoices</Bullet>
                <Bullet>Payment links and reminders from the client portal</Bullet>
                <Bullet>Status chips and aging to keep collections tight</Bullet>
              </ul>
              <div className="mt-6">
                <CtaButton href="#ai" variant="white" label="Generate with AI" />
              </div>
            </div>
            <div className="md:col-span-6 md:order-1">
              <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
                {/* Left column: 3 smaller images stacked */}
                <div className="space-y-3">
                  {/* Summary cards */}
                  <Card className="overflow-hidden border-stone-200 shadow-sm">
                    <CardContent className="p-1">
                      <Image
                        src="/images/invoice-summary-cards.png"
                        alt="Invoice summary showing total invoices £425,000 and purchase orders £128,500"
                        width={400}
                        height={60}
                        className="h-auto w-full rounded-lg object-cover"
                      />
                    </CardContent>
                  </Card>

                  {/* Action buttons */}
                  <Card className="overflow-hidden border-stone-200 shadow-sm">
                    <CardContent className="p-1">
                      <Image
                        src="/images/invoice-buttons.png"
                        alt="Create Invoice and Sync with Xero action buttons"
                        width={300}
                        height={40}
                        className="h-auto w-full rounded-lg object-cover"
                      />
                    </CardContent>
                  </Card>

                  {/* Project cost tracking */}
                  <Card className="overflow-hidden border-stone-200 shadow-sm">
                    <CardContent className="p-1">
                      <Image
                        src="/images/project-cost-tracking.png"
                        alt="Project cost tracking showing total cost, delivery progress, and action buttons"
                        width={400}
                        height={100}
                        className="h-auto w-full rounded-lg object-cover"
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Right column: Invoice list with actions */}
                <div>
                  <Card className="overflow-hidden border-stone-200 shadow-sm h-full">
                    <CardContent className="p-1">
                      <Image
                        src="/images/invoice-list-actions.png"
                        alt="Invoice list showing amounts, status badges, and action dropdown menu"
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

      {/* Budgets, POs, Time → Profitability */}
      <section className="bg-white py-14 sm:py-20">
        <div className={container}>
          <div className="grid gap-6 md:grid-cols-12">
            <div className="md:col-span-7">
              <Card className="overflow-hidden border-stone-200 shadow-sm">
                <CardContent className="p-2 sm:p-3">
                  <Image
                    src="/images/budget-analysis-dashboard.png"
                    alt="Budget analysis dashboard showing cost by category, monthly cost vs budget, vendor spend, and cost overruns"
                    width={1200}
                    height={620}
                    className="h-auto w-full rounded-lg object-cover"
                  />
                </CardContent>
              </Card>
            </div>
            <div className="md:col-span-5">
              <h2 className={H2}>From budgets to real‑world profit</h2>
              <p className={cn("mt-3", Lead)}>
                Track budgets, approved spend and staff time to see accurate profitability by project and roll it up to
                the studio view.
              </p>
              <ul className="mt-6 space-y-3">
                <Bullet>Budget, spend and committed POs in one view</Bullet>
                <Bullet>Time tracking for accurate project margins</Bullet>
                <Bullet>Studio profitability and trend analysis</Bullet>
              </ul>
              <div className="mt-6 flex items-center gap-2 text-sm text-stone-700">
                <Clock className="h-4 w-4" />
                Track time by phase and task for true costs
              </div>
              <div className="mt-4">
                <Card className="overflow-hidden border-stone-200">
                  <CardContent className="p-2 sm:p-3">
                    <Image
                      src="/images/time-tracking-dashboard.png"
                      alt="Time tracking dashboard showing active timer, weekly hours breakdown, and recent project entries"
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

      {/* AI finance assistant (single neat panel) */}
      <section id="ai" className="bg-white py-14 sm:py-20">
        <div className={container}>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className={H2}>Your finance copilot, across every workflow</h2>
            <p className={cn("mt-3", Lead)}>
              Ask questions about budgets, invoices, and cash flow. Draft, send, and sync faster than ever.
            </p>
          </div>
          <div className="mx-auto mt-8 max-w-6xl">
            <AiFinanceDemo />
          </div>
        </div>
      </section>

      {/* Related Features */}
      <section className="bg-stone-50 py-16 sm:py-20">
        <div className={container}>
          <div className="mx-auto max-w-4xl">
            <h2 className="text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight text-center text-stone-900">
              Connected to your studio workflow
            </h2>
            <p className="mt-3 text-center text-stone-600">
              Finance syncs with projects, procurement, and client payments.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Link
                href="/platform/projects"
                className="group rounded-xl border border-stone-200 bg-white p-5 transition-all hover:border-stone-300 hover:shadow-md"
              >
                <ClipboardList className="h-6 w-6 text-stone-600 group-hover:text-stone-900" />
                <h3 className="mt-3 font-semibold text-stone-900">Projects</h3>
                <p className="mt-1 text-sm text-stone-600">Track budgets by project phase</p>
              </Link>
              <Link
                href="/platform/procurement"
                className="group rounded-xl border border-stone-200 bg-white p-5 transition-all hover:border-stone-300 hover:shadow-md"
              >
                <ShoppingCart className="h-6 w-6 text-stone-600 group-hover:text-stone-900" />
                <h3 className="mt-3 font-semibold text-stone-900">Procurement</h3>
                <p className="mt-1 text-sm text-stone-600">POs flow into your accounts</p>
              </Link>
              <Link
                href="/platform/client-portal"
                className="group rounded-xl border border-stone-200 bg-white p-5 transition-all hover:border-stone-300 hover:shadow-md"
              >
                <Users className="h-6 w-6 text-stone-600 group-hover:text-stone-900" />
                <h3 className="mt-3 font-semibold text-stone-900">Client Portal</h3>
                <p className="mt-1 text-sm text-stone-600">Clients pay invoices online</p>
              </Link>
              <Link
                href="/pricing"
                className="group rounded-xl border border-stone-200 bg-white p-5 transition-all hover:border-stone-300 hover:shadow-md"
              >
                <Sparkles className="h-6 w-6 text-stone-600 group-hover:text-stone-900" />
                <h3 className="mt-3 font-semibold text-stone-900">See Pricing</h3>
                <p className="mt-1 text-sm text-stone-600">Start free with all features</p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="relative isolate overflow-hidden py-24" style={{ backgroundColor: "#F1BBAA" }}>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: "url('/textures/grain.png')", backgroundSize: "200px 200px" }}
        />
        <div className={container}>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl sm:text-[28px] md:text-[32px] font-medium tracking-tight text-stone-950">
              Finance that keeps projects moving and profits clear
            </h2>
            <p className="mt-3 text-lg text-stone-900/80">
              Xero and Stripe integrations, automated invoices and POs, and an AI copilot for speed.
            </p>
            <div className="mt-8 flex justify-center">
              <CtaButton
                href="/signup"
                variant="slate"
                label="Start for free"
                showArrow
                arrowVariant="white"
              />
            </div>
            <p className="mt-3 text-xs sm:text-sm text-stone-900/60">No credit card required</p>
          </div>
        </div>
      </section>
    </main>
  )
}
