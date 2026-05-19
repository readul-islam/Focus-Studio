"use client"

import type React from "react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { Plug, Check, Calendar, Mail, CreditCard, Calculator, ArrowRight, Zap, BookOpen } from "lucide-react"
import { CtaButton } from "@/components/cta-button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { MarketingPageHero } from "@/components/marketing/marketing-page-hero"

const container = "mx-auto max-w-[1200px] px-6 sm:px-8"
const TITLE_H1 = "text-[30px] sm:text-5xl md:text-[56px] font-medium tracking-tight leading-[1.1]"

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

const integrations = [
  {
    name: "Xero",
    category: "Accounting",
    description: "Two-way sync for invoices, payments, and expenses. Keep your books up to date automatically.",
    available: true,
    icon: Calculator,
    popular: true,
  },
  {
    name: "QuickBooks",
    category: "Accounting",
    description: "Sync invoices and payments automatically. Works with QuickBooks Online.",
    available: true,
    icon: Calculator,
    popular: true,
  },
  {
    name: "Stripe",
    category: "Payments",
    description: "Accept client payments through the portal. Automatic reconciliation with invoices.",
    available: true,
    icon: CreditCard,
    popular: true,
  },
  {
    name: "Google Calendar",
    category: "Scheduling",
    description: "Sync project milestones, meetings, and deadlines to your calendar.",
    available: true,
    icon: Calendar,
    popular: false,
  },
  {
    name: "Outlook Calendar",
    category: "Scheduling",
    description: "Keep your Outlook calendar in sync with project timelines and appointments.",
    available: true,
    icon: Calendar,
    popular: false,
  },
  {
    name: "Gmail",
    category: "Email",
    description: "Unified inbox with AI categorisation. Route emails to projects automatically.",
    available: true,
    icon: Mail,
    popular: false,
  },
  {
    name: "Zapier",
    category: "Automation",
    description:
      "Connect Focuspilot to 5,000+ apps with studio API keys and signed webhooks. Automate projects, clients, and invoices.",
    available: true,
    icon: Zap,
    popular: true,
  },
  {
    name: "Notion",
    category: "Productivity",
    description:
      "Link your Notion workspace to Focuspilot. Connect once and use pages and databases in your automations.",
    available: true,
    icon: BookOpen,
    popular: false,
  },
]

const comingSoon = [
  { name: "Sage", category: "Accounting" },
  { name: "FreeAgent", category: "Accounting" },
  { name: "Slack", category: "Communication" },
]

function Hero() {
  return (
    <MarketingPageHero contentClassName={cn(container, "pb-12 pt-12 sm:pb-16 md:pt-16")}>
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-stone-300/60 bg-white px-3 py-1 text-xs text-stone-700">
            <Plug className="h-3 w-3" aria-hidden="true" />
            Connect your tools
          </span>
          <h1 className={cn("mt-5 text-center", TITLE_H1)}>Integrations</h1>
          <p className="mt-4 text-center text-base sm:text-lg text-stone-600">
            Connect Focuspilot with the tools you already use. Automate your workflow and keep everything in sync.
          </p>
          <p className="mt-3 text-center text-sm text-stone-500">
            All integrations included on every plan.
          </p>
        </Reveal>
    </MarketingPageHero>
  )
}

function IntegrationGrid() {
  return (
    <section className="bg-stone-50 py-16 sm:py-20">
      <div className={container}>
        <Reveal>
          <h2 className="text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight text-center text-stone-900 mb-10">
            Available integrations
          </h2>
        </Reveal>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {integrations.map((integration, index) => {
            const Icon = integration.icon
            return (
              <Reveal key={integration.name} delay={index * 50}>
                <Card className="h-full border-stone-200 bg-white transition-all hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-stone-100 p-2.5">
                          <Icon className="h-5 w-5 text-stone-600" aria-hidden="true" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-stone-900">{integration.name}</h3>
                          <p className="text-xs text-stone-500">{integration.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {integration.popular && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                            Popular
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                          <Check className="h-3 w-3" aria-hidden="true" />
                          Available
                        </span>
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-stone-600">{integration.description}</p>
                  </CardContent>
                </Card>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function ComingSoon() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className={container}>
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight text-stone-900">
              Coming soon
            </h2>
            <p className="mt-3 text-stone-600">
              We're always adding new integrations. Have a request? Let us know.
            </p>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {comingSoon.map((integration) => (
              <span
                key={integration.name}
                className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-stone-600"
              >
                {integration.name}
                <span className="text-xs text-stone-400">({integration.category})</span>
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
              Request an integration
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function RelatedLinks() {
  return (
    <section className="bg-stone-50 py-16 sm:py-20">
      <div className={container}>
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <h2 className="text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight text-center text-stone-900">
              Explore the platform
            </h2>
            <p className="mt-3 text-center text-stone-600">
              See how everything works together.
            </p>
          </Reveal>
          <Reveal delay={100}>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Link
                href="/platform/finance"
                className="group rounded-xl border border-stone-200 bg-white p-5 transition-all hover:border-stone-300 hover:shadow-md"
              >
                <h3 className="font-semibold text-stone-900 group-hover:text-stone-700">Finance</h3>
                <p className="mt-1 text-sm text-stone-600">Invoicing and accounting</p>
              </Link>
              <Link
                href="/platform/client-portal"
                className="group rounded-xl border border-stone-200 bg-white p-5 transition-all hover:border-stone-300 hover:shadow-md"
              >
                <h3 className="font-semibold text-stone-900 group-hover:text-stone-700">Client Portal</h3>
                <p className="mt-1 text-sm text-stone-600">Share and get approvals</p>
              </Link>
              <Link
                href="/knowledge"
                className="group rounded-xl border border-stone-200 bg-white p-5 transition-all hover:border-stone-300 hover:shadow-md"
              >
                <h3 className="font-semibold text-stone-900 group-hover:text-stone-700">Knowledge Centre</h3>
                <p className="mt-1 text-sm text-stone-600">Guides and tutorials</p>
              </Link>
              <Link
                href="/pricing"
                className="group rounded-xl border border-stone-200 bg-white p-5 transition-all hover:border-stone-300 hover:shadow-md"
              >
                <h3 className="font-semibold text-stone-900 group-hover:text-stone-700">Pricing</h3>
                <p className="mt-1 text-sm text-stone-600">Start free today</p>
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function FinalCTA() {
  return (
    <section
      aria-label="Get started"
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
          <h2 className="text-2xl sm:text-[28px] md:text-[32px] font-medium tracking-tight">
            Connect everything you use
          </h2>
          <p className="mt-3 text-base sm:text-lg text-stone-300">
            All integrations are included on every plan. Start free and connect your tools.
          </p>
          <div className="mt-8 flex items-center justify-center">
            <CtaButton href="/signup" variant="white" label="Start for free" showArrow arrowVariant="black" />
          </div>
          <p className="mt-3 text-xs sm:text-sm text-stone-400">No credit card required</p>
        </Reveal>
      </div>
    </section>
  )
}

export default function IntegrationsPage() {
  return (
    <main className="bg-white">
      <Hero />
      <IntegrationGrid />
      <ComingSoon />
      <RelatedLinks />
      <FinalCTA />
    </main>
  )
}
