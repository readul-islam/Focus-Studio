"use client"

import type React from "react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { Sparkles, Zap, Bug, Bell } from "lucide-react"
import { CtaButton } from "@/components/cta-button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { FloorPlanBg } from "@/components/graphics/floorplan-bg"

const container = "mx-auto max-w-[1200px] px-6 sm:px-8"
const TITLE_H1 = "text-[30px] sm:text-5xl md:text-[56px] font-medium tracking-tight leading-[1.1]"
const TITLE_H2 = "text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight"

// Metadata needs to be in a separate layout or use generateMetadata for client components
// For now, we'll add it via the layout

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

const updates = [
  {
    date: "January 2025",
    version: "2.4",
    changes: [
      { type: "new", title: "AI Email Drafting", description: "Let AI draft client emails based on project context and communication history" },
      { type: "new", title: "Bulk PO Generation", description: "Create multiple purchase orders at once from your procurement schedule" },
      { type: "improvement", title: "Faster Dashboard", description: "50% faster loading for project dashboards with optimized data fetching" },
      { type: "new", title: "Contractor Portal", description: "Give contractors secure access to specs, schedules, and communication" },
    ],
  },
  {
    date: "December 2024",
    version: "2.3",
    changes: [
      { type: "new", title: "Client Portal Payments", description: "Clients can pay invoices directly in the portal with Stripe integration" },
      { type: "new", title: "Xero Two-Way Sync", description: "Full bidirectional sync with Xero accounting for invoices and expenses" },
      { type: "fix", title: "PDF Export", description: "Fixed formatting issues in proposal PDFs affecting tables and images" },
      { type: "improvement", title: "Mobile Navigation", description: "Redesigned mobile menu for faster access to key features" },
    ],
  },
  {
    date: "November 2024",
    version: "2.2",
    changes: [
      { type: "new", title: "AI Product Sourcing", description: "Find alternative products and trade pricing automatically from supplier catalogs" },
      { type: "improvement", title: "Mobile Experience", description: "Redesigned mobile interface for on-site use with offline support" },
      { type: "improvement", title: "Search", description: "Much faster search across projects, products, and contacts with fuzzy matching" },
      { type: "fix", title: "Calendar Sync", description: "Resolved sync issues with Google Calendar for project milestones" },
    ],
  },
  {
    date: "October 2024",
    version: "2.1",
    changes: [
      { type: "new", title: "Project Templates", description: "Create and share project templates across your team for consistent workflows" },
      { type: "new", title: "Time Tracking", description: "Track billable hours per task with automatic invoice generation" },
      { type: "improvement", title: "Client Portal", description: "New approval workflow with comment threads and revision history" },
    ],
  },
]

function TypeBadge({ type }: { type: string }) {
  const variants: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
    new: { bg: "bg-emerald-50", text: "text-emerald-700", icon: Sparkles },
    improvement: { bg: "bg-blue-50", text: "text-blue-700", icon: Zap },
    fix: { bg: "bg-amber-50", text: "text-amber-700", icon: Bug },
  }
  const variant = variants[type] || variants.new
  const Icon = variant.icon
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", variant.bg, variant.text)}>
      <Icon className="h-3 w-3" aria-hidden="true" />
      {type}
    </span>
  )
}

function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-white">
      <FloorPlanBg mode="grid" tile={164} intensity={0.9} height="min(420px, 50vh)" fadeStop={0.5} className="" />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10" />
      <div className={cn(container, "pb-12 pt-12 sm:pb-16 md:pt-16")}>
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-stone-300/60 bg-white px-3 py-1 text-xs text-stone-700">
            <Bell className="h-3 w-3" aria-hidden="true" />
            Product updates
          </span>
          <h1 className={cn("mt-5 text-center", TITLE_H1)}>Changelog</h1>
          <p className="mt-4 text-center text-base sm:text-lg text-stone-600">
            See what's new in Focuspilot. We ship updates weekly to help you manage projects, procurement, and client relationships more efficiently.
          </p>
          <p className="mt-3 text-center text-sm text-stone-500">
            Subscribe to our newsletter to get updates delivered to your inbox.
          </p>
        </Reveal>
      </div>
    </section>
  )
}

function UpdatesList() {
  return (
    <section className="bg-stone-50 py-16 sm:py-20">
      <div className={container}>
        <div className="mx-auto max-w-4xl">
          <div className="space-y-12">
            {updates.map((update, updateIndex) => (
              <Reveal key={update.version} delay={updateIndex * 100}>
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <h2 className="text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight text-stone-900">{update.date}</h2>
                    <span className="inline-flex items-center rounded-full border border-stone-300 bg-white px-3 py-1 text-sm font-medium text-stone-700">
                      v{update.version}
                    </span>
                  </div>
                  <div className="space-y-4">
                    {update.changes.map((change, index) => (
                      <Card key={index} className="border-stone-200 bg-white transition-all hover:shadow-md">
                        <CardContent className="p-5 sm:p-6">
                          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                            <TypeBadge type={change.type} />
                            <div className="flex-1">
                              <h3 className="font-semibold text-stone-900">{change.title}</h3>
                              <p className="mt-1 text-sm sm:text-base text-stone-600">{change.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function RelatedLinks() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className={container}>
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <h2 className="text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight text-center text-stone-900">
              Explore the platform
            </h2>
            <p className="mt-3 text-center text-stone-600">
              Discover how Focuspilot can transform your design studio workflow.
            </p>
          </Reveal>
          <Reveal delay={100}>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Link
                href="/platform/projects"
                className="group rounded-xl border border-stone-200 bg-white p-5 transition-all hover:border-stone-300 hover:shadow-md"
              >
                <h3 className="font-semibold text-stone-900 group-hover:text-stone-700">Projects</h3>
                <p className="mt-1 text-sm text-stone-600">Manage timelines and tasks</p>
              </Link>
              <Link
                href="/platform/procurement"
                className="group rounded-xl border border-stone-200 bg-white p-5 transition-all hover:border-stone-300 hover:shadow-md"
              >
                <h3 className="font-semibold text-stone-900 group-hover:text-stone-700">Procurement</h3>
                <p className="mt-1 text-sm text-stone-600">Source and track products</p>
              </Link>
              <Link
                href="/platform/client-portal"
                className="group rounded-xl border border-stone-200 bg-white p-5 transition-all hover:border-stone-300 hover:shadow-md"
              >
                <h3 className="font-semibold text-stone-900 group-hover:text-stone-700">Client Portal</h3>
                <p className="mt-1 text-sm text-stone-600">Share and get approvals</p>
              </Link>
              <Link
                href="/platform/finance"
                className="group rounded-xl border border-stone-200 bg-white p-5 transition-all hover:border-stone-300 hover:shadow-md"
              >
                <h3 className="font-semibold text-stone-900 group-hover:text-stone-700">Finance</h3>
                <p className="mt-1 text-sm text-stone-600">Invoicing and accounting</p>
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
            Ready to transform your studio?
          </h2>
          <p className="mt-3 text-base sm:text-lg text-stone-300">
            Join hundreds of interior designers who've simplified their workflow with Focuspilot.
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

export default function ChangelogPage() {
  return (
    <main className="bg-white">
      <Hero />
      <UpdatesList />
      <RelatedLinks />
      <FinalCTA />
    </main>
  )
}
