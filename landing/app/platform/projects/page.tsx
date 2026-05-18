"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import * as LucideReact from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { CtaButton } from "@/components/cta-button"
import { cn } from "@/lib/utils"
import { LandingHeroBackground } from "@/components/landing-hero-background"
import { UniformFrame } from "@/components/media/uniform-frame"
import { BreadcrumbSchema, platformBreadcrumbs } from "@/components/seo/breadcrumb-schema"

const container = "mx-auto max-w-[1200px] px-6 sm:px-8"
const H1 = "text-[30px] sm:text-5xl md:text-[56px] font-medium tracking-tight leading-[1.1]"
const Lead = "text-base sm:text-lg text-stone-600"
const H2 = "text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight text-stone-950"

// Switch to "float" to remove the white frame globally (quick preview)
const FRAME_VARIANT: "framed" | "float" = "framed"

// In-page tabs/sections
const tabs = [
  { id: "overview", label: "Overview", icon: LucideReact.ClipboardList },
  { id: "tasks", label: "Tasks", icon: LucideReact.ClipboardList },
  { id: "calendar", label: "Calendar", icon: LucideReact.CalendarDays },
  { id: "messages", label: "Messages", icon: LucideReact.FileText },
  { id: "docs", label: "Docs", icon: LucideReact.FileText },
  { id: "procurement", label: "Procurement", icon: LucideReact.ShoppingCart },
  { id: "finance", label: "Finance", icon: LucideReact.CreditCard },
  { id: "contractors", label: "Contractors", icon: LucideReact.Users },
]

// Soft tints from your palette family
const SECTION_TINTS: Record<string, string> = {
  overview: "#FBEAE1", // clay 50
  tasks: "#F2F6F0", // light sage/olive wash
  calendar: "#EAEFF3", // cool slate tint
  messages: "#F6EFEA", // warm light tint
  docs: "#FAF7F2", // bone 50
  procurement: "#EFEAE2", // greige 100
  finance: "#ECF3EC", // sage 100
  contractors: "#FBEAE1", // clay 50 (can change)
}

function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0])
  useEffect(() => {
    const observers: IntersectionObserver[] = []
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (!el) return
      const io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(id)
        },
        { rootMargin: "-40% 0px -55% 0px", threshold: [0, 0.1, 0.5, 1] },
      )
      io.observe(el)
      observers.push(io)
    })
    return () => observers.forEach((o) => o.disconnect())
  }, [ids])
  return active
}

function StickyTabs({ active }: { active: string }) {
  const handleTabClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault()
    const element = document.getElementById(targetId)
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  }

  return (
    <nav
      className="sticky top-[64px] z-40 -mx-6 border-b border-stone-200 bg-white/70 px-6 py-2 backdrop-blur md:top-[68px] lg:top-[72px]"
      aria-label="Project sections"
    >
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-center gap-2">
        {tabs.map((t) => {
          const Icon = t.icon
          const isActive = active === t.id
          return (
            <a
              key={t.id}
              href={`#${t.id}`}
              onClick={(e) => handleTabClick(e, t.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition",
                isActive ? "bg-stone-900 text-white" : "text-stone-700 hover:text-stone-900 hover:bg-stone-100",
              )}
              aria-current={isActive ? "page" : undefined}
              aria-label={`${t.label} section`}
            >
              {Icon ? (
                <Icon className={isActive ? "h-4 w-4 text-white" : "h-4 w-4 text-stone-700"} aria-hidden="true" />
              ) : null}
              <span>{t.label}</span>
            </a>
          )
        })}
      </div>
    </nav>
  )
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-stone-800">
      <LucideReact.CheckCircle2 className="mt-0.5 h-5 w-5 text-stone-900" aria-hidden="true" />
      <span className="text-base">{children}</span>
    </li>
  )
}

// Section wrapper that highlights the active section by tinting its full-width background
function SectionWrapper({
  id,
  activeId,
  tintHex,
  children,
}: {
  id: string
  activeId: string
  tintHex: string
  children: React.ReactNode
}) {
  const isActive = activeId === id
  return (
    <section
      id={id}
      className="transition-colors duration-500"
      style={{ backgroundColor: isActive ? tintHex : "#FFFFFF" }}
      aria-current={isActive ? "true" : undefined}
      aria-labelledby={`${id}-heading`}
    >
      {children}
    </section>
  )
}

export default function ProjectManagementPage() {
  const sectionIds = tabs.map((t) => t.id)
  const active = useActiveSection(sectionIds)

  return (
    <>
      <BreadcrumbSchema items={platformBreadcrumbs.projects} />

      <main className="bg-white">
        {/* Hero */}
        <section className="relative isolate overflow-hidden bg-stone-50">
          <LandingHeroBackground gridHeight="min(520px, 58vh)" gridFadeStop={0.58} />
          <div className={cn(container, "relative z-10 pb-10 pt-10 sm:pb-14 sm:pt-12 md:pt-16")}>
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="outline" className="rounded-full border-stone-300 bg-stone-50 text-stone-700">
                Project Management
              </Badge>
              <h1 className={cn("mt-4 text-left sm:text-center", H1)}>Interior design project management software</h1>
              <p className={cn("mt-4 text-left", Lead)}>
                Plan phases, track tasks and timelines, manage budgets, approvals and communication in one calm
                workspace.
              </p>
              <p className="mt-3 text-left sm:text-center text-sm text-stone-500">
                Built for interior designers, architects, and design studios who want to replace spreadsheets and
                scattered tools with one calm workspace.
              </p>
            </div>

            <div className="mx-auto mt-8 max-w-6xl">
              <UniformFrame
                src="/images/platform/projects/overview-hero.png"
                alt="Project overview dashboard showing KPIs, timeline, and procurement status for interior design project management"
                width={1600}
                height={900}
                priority={true}
                variant={FRAME_VARIANT}
              />
            </div>
          </div>
        </section>

        <StickyTabs active={active} />

        {/* Overview */}
        <SectionWrapper id="overview" activeId={active} tintHex={SECTION_TINTS.overview}>
          <div className={cn(container, "py-14 sm:py-20")}>
            <div className="grid items-start gap-10 md:grid-cols-12">
              <div className="md:col-span-5">
                <h2 id="overview-heading" className={H2}>
                  Everything in one live overview
                </h2>
                <p className={cn("mt-3", Lead)}>
                  Keep status clear across teams budget, margin, tasks, POs, and milestones update in real time.
                </p>
                <ul className="mt-6 space-y-3">
                  <Bullet>At‑a‑glance KPIs for each project</Bullet>
                  <Bullet>Visual timeline for phases and installs</Bullet>
                  <Bullet>One click to deep‑dive into tasks, docs or procurement</Bullet>
                </ul>
              </div>
              <div className="md:col-span-7">
                <UniformFrame
                  src="/images/platform/projects/project-overview-detailed.png"
                  alt="Chelsea Penthouse project overview showing budget utilization, profit margin, task completion, and project timeline with KPI cards and phase tracking"
                  width={1600}
                  height={900}
                  variant={FRAME_VARIANT}
                />
              </div>
            </div>
          </div>
        </SectionWrapper>

        {/* Tasks */}
        <SectionWrapper id="tasks" activeId={active} tintHex={SECTION_TINTS.tasks}>
          <div className={cn(container, "py-14 sm:py-20")}>
            <div className="grid items-start gap-10 md:grid-cols-12">
              <div className="md:col-span-6 md:order-2">
                <h2 id="tasks-heading" className={H2}>
                  Plan phases. Track tasks. Stay on schedule.
                </h2>
                <p className={cn("mt-3", Lead)}>
                  Kanban, list or Gantt view, assign owners, set priorities, and keep work moving with smart reminders.
                </p>
                <ul className="mt-6 space-y-3">
                  <Bullet>Phase boards with badges, dates and assignees</Bullet>
                  <Bullet>Auto reminders and dependency warnings</Bullet>
                  <Bullet>AI task suggestions from briefs and meetings</Bullet>
                </ul>
              </div>
              <div className="md:col-span-6 md:order-1">
                <UniformFrame
                  src="/images/platform/projects/tasks-board.png"
                  alt="Tasks Kanban board showing design phases with task cards, assignees, and progress tracking"
                  width={1600}
                  height={900}
                  variant={FRAME_VARIANT}
                />
              </div>
            </div>
          </div>
        </SectionWrapper>

        {/* Calendar */}
        <SectionWrapper id="calendar" activeId={active} tintHex={SECTION_TINTS.calendar}>
          <div className={cn(container, "py-14 sm:py-20")}>
            <div className="grid items-start gap-10 md:grid-cols-12">
              <div className="md:col-span-6">
                <h2 id="calendar-heading" className={H2}>
                  Schedule installs, site visits, and milestones
                </h2>
                <p className={cn("mt-3", Lead)}>
                  A studio calendar that reflects the reality of projects with agenda and timeline modes.
                </p>
                <ul className="mt-6 space-y-3">
                  <Bullet>Studio‑wide view of events, deadlines and deliveries</Bullet>
                  <Bullet>Assign attendees and rooms, log hours, track visits</Bullet>
                  <Bullet>Syncs with tasks and procurement statuses</Bullet>
                </ul>
              </div>
              <div className="md:col-span-6">
                <UniformFrame
                  src="/images/platform/projects/calendar.png"
                  alt="Studio calendar interface showing project events, deadlines, and team scheduling with KPIs and agenda view"
                  width={1600}
                  height={900}
                  variant={FRAME_VARIANT}
                />
              </div>
            </div>
          </div>
        </SectionWrapper>

        {/* Messages */}
        <SectionWrapper id="messages" activeId={active} tintHex={SECTION_TINTS.messages}>
          <div className={cn(container, "py-14 sm:py-20")}>
            <div className="grid items-start gap-10 md:grid-cols-12">
              <div className="md:col-span-6 md:order-2">
                <h2 id="messages-heading" className={H2}>
                  Keep clients and vendors aligned
                </h2>
                <p className={cn("mt-3", Lead)}>
                  Centralise email, portal messages, and supplier threads with quick actions that drive work forward.
                </p>
                <ul className="mt-6 space-y-3">
                  <Bullet>One inbox per project—searchable and organised</Bullet>
                  <Bullet>Convert attachments into tasks, POs, or moodboard items</Bullet>
                  <Bullet>Action‑required filter to clear blockers fast</Bullet>
                </ul>
              </div>
              <div className="md:col-span-6 md:order-1">
                <UniformFrame
                  src="/images/screenshot-202025-08-10-20at-2009.png"
                  alt="Project messages interface showing thread list and detailed conversation with action buttons for task creation and file management"
                  width={1600}
                  height={900}
                  variant={FRAME_VARIANT}
                />
              </div>
            </div>
          </div>
        </SectionWrapper>

        {/* Docs */}
        <SectionWrapper id="docs" activeId={active} tintHex={SECTION_TINTS.docs}>
          <div className={cn(container, "py-14 sm:py-20")}>
            <div className="grid items-start gap-10 md:grid-cols-12">
              <div className="md:col-span-5">
                <h2 id="docs-heading" className={H2}>
                  Drawings, photos, and files organised
                </h2>
                <p className={cn("mt-3", Lead)}>
                  Keep documents where the work happens. Versioned, previewable, and linked to tasks and POs.
                </p>
                <ul className="mt-6 space-y-3">
                  <Bullet>Folder templates for repeatable organisation</Bullet>
                  <Bullet>Drag‑and‑drop uploads with quick previews</Bullet>
                  <Bullet>Recent files and approvals at your fingertips</Bullet>
                </ul>
              </div>
              <div className="md:col-span-7">
                <UniformFrame
                  src="/images/platform/projects/docs-updated.png"
                  alt="Documents workspace showing organized folders for Design Concepts, Technical Drawings, and Procurement Documents with notes list and status indicators"
                  width={1600}
                  height={900}
                  variant={FRAME_VARIANT}
                />
              </div>
            </div>
          </div>
        </SectionWrapper>

        {/* Procurement */}
        <SectionWrapper id="procurement" activeId={active} tintHex={SECTION_TINTS.procurement}>
          <div className={cn(container, "py-14 sm:py-20")}>
            <div className="grid items-start gap-10 md:grid-cols-12">
              <div className="md:col-span-6">
                <h2 id="procurement-heading" className={H2}>
                  From spec to PO to install
                </h2>
                <p className={cn("mt-3", Lead)}>
                  Track lead times, deliveries, and approvals across every item - no spreadsheets required.
                </p>
                <ul className="mt-6 space-y-3">
                  <Bullet>Totals, quantities, costs and delivery progress</Bullet>
                  <Bullet>Generate POs, log receipts, and sync statuses</Bullet>
                  <Bullet>Client‑ready views for transparent selections</Bullet>
                </ul>
              </div>
              <div className="md:col-span-6">
                <UniformFrame
                  src="/images/platform/projects/procurement-table.png"
                  alt="Procurement items table showing product specifications, costs, delivery status, and Create PO functionality"
                  width={1600}
                  height={900}
                  variant={FRAME_VARIANT}
                />
              </div>
            </div>
          </div>
        </SectionWrapper>

        {/* Finance */}
        <SectionWrapper id="finance" activeId={active} tintHex={SECTION_TINTS.finance}>
          <div className={cn(container, "py-14 sm:py-20")}>
            <div className="grid items-start gap-10 md:grid-cols-12">
              <div className="md:col-span-6 md:order-2">
                <h2 id="finance-heading" className={H2}>
                  Proposals, invoices and payments automated
                </h2>
                <p className={cn("mt-3", Lead)}>
                  Create branded docs, track due dates, and sync with accounting. Get paid faster.
                </p>
                <ul className="mt-6 space-y-3">
                  <Bullet>Invoice and PO tracking in one table</Bullet>
                  <Bullet>Status chips and quick filters for action</Bullet>
                  <Bullet>Sync to Xero/QuickBooks to keep books tight</Bullet>
                </ul>
              </div>
              <div className="md:col-span-6 md:order-1">
                <UniformFrame
                  src="/images/screenshot-202025-08-10-20at-2008.png"
                  alt="Finance dashboard showing invoices and purchase orders table with payment status, amounts, and accounting sync options"
                  width={1600}
                  height={900}
                  variant={FRAME_VARIANT}
                />
              </div>
            </div>
          </div>
        </SectionWrapper>

        {/* Contractors */}
        <SectionWrapper id="contractors" activeId={active} tintHex={SECTION_TINTS.contractors}>
          <div className={cn(container, "py-14 sm:py-20")}>
            <div className="grid items-start gap-10 md:grid-cols-12">
              {/* Text / bullets */}
              <div className="md:col-span-6">
                <h2 id="contractors-heading" className={H2}>
                  Contractors, RFIs, and schedules in sync
                </h2>
                <p className={cn("mt-3", Lead)}>
                  Keep site teams aligned with a secure, shared view across information requests, schedules, and items
                  to install.
                </p>
                <ul className="mt-6 space-y-3">
                  <Bullet>Request for Information (RFI) threads with attachments and approvals</Bullet>
                  <Bullet>See the schedule and assigned work by phase, room, and day</Bullet>
                  <Bullet>Share procurement items with specs, install notes, and status</Bullet>
                </ul>
                <div className="mt-6 flex flex-wrap gap-3">
                  <CtaButton
                    href="/signup"
                    variant="slate"
                                        label="Invite a contractor"
                    showArrow
                    arrowVariant="white"
                  />
                  <CtaButton href="/platform/procurement#library" variant="white" label="Share an item" />
                </div>
              </div>

              {/* Client portal overview visual */}
              <div className="md:col-span-6">
                <UniformFrame
                  src="/images/platform/projects/client-portal-overview.png"
                  alt="Contractor portal dashboard showing project KPIs, weekly schedule, recent activity, and quick actions for trade coordination"
                  width={1600}
                  height={900}
                  variant={FRAME_VARIANT}
                />
              </div>
            </div>
          </div>
        </SectionWrapper>

        {/* FAQ */}
        <section className="bg-stone-50 py-16 sm:py-20">
          <div className={cn(container)}>
            <div className="mx-auto max-w-3xl">
              <h2 className={cn("text-center", H2)}>Frequently asked questions</h2>
              <p className="mt-3 text-center text-stone-600">
                Common questions about Focuspilot project management for interior designers.
              </p>
              <div className="mt-10 space-y-6">
                <div className="rounded-lg border border-stone-200 bg-white p-6">
                  <h3 className="text-lg font-semibold text-stone-900">
                    How is Focuspilot different from Asana or Monday?
                  </h3>
                  <p className="mt-2 text-stone-600">
                    Unlike generic project management tools, Focuspilot is purpose-built for interior designers and
                    architects. It includes procurement tracking, client approval workflows, product libraries, and
                    financial tools that Asana and Monday simply don't offer. Everything is designed around how design
                    studios actually work.
                  </p>
                </div>
                <div className="rounded-lg border border-stone-200 bg-white p-6">
                  <h3 className="text-lg font-semibold text-stone-900">
                    Does it handle procurement and purchase orders?
                  </h3>
                  <p className="mt-2 text-stone-600">
                    Yes. Focuspilot includes full procurement management with product libraries, supplier tracking,
                    automated purchase orders, delivery scheduling, and client approval workflows. You can track every
                    item from specification to installation.
                  </p>
                </div>
                <div className="rounded-lg border border-stone-200 bg-white p-6">
                  <h3 className="text-lg font-semibold text-stone-900">Can clients approve items and pay invoices?</h3>
                  <p className="mt-2 text-stone-600">
                    Absolutely. Your clients get a branded portal where they can review selections, approve or decline
                    products with comments, view project progress, and pay invoices directly via Stripe. No more
                    back-and-forth emails.
                  </p>
                </div>
                <div className="rounded-lg border border-stone-200 bg-white p-6">
                  <h3 className="text-lg font-semibold text-stone-900">Is Focuspilot suitable for small studios?</h3>
                  <p className="mt-2 text-stone-600">
                    Yes, we're designed for studios of all sizes. Solo designers love having everything in one place,
                    while larger teams benefit from collaboration features and role-based permissions. Our pricing
                    scales with your team.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Features */}
        <section className="bg-stone-50 py-16 sm:py-20">
          <div className={container}>
            <div className="mx-auto max-w-4xl">
              <h2 className="text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight text-center text-stone-900">
                Connected to your entire workflow
              </h2>
              <p className="mt-3 text-center text-stone-600">
                Projects integrates seamlessly with the rest of the Focuspilot platform.
              </p>
              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Link
                  href="/platform/procurement"
                  className="group rounded-xl border border-stone-200 bg-white p-5 transition-all hover:border-stone-300 hover:shadow-md"
                >
                  <LucideReact.ShoppingCart className="h-6 w-6 text-stone-600 group-hover:text-stone-900" />
                  <h3 className="mt-3 font-semibold text-stone-900">Procurement</h3>
                  <p className="mt-1 text-sm text-stone-600">Source products and manage vendors</p>
                </Link>
                <Link
                  href="/platform/finance"
                  className="group rounded-xl border border-stone-200 bg-white p-5 transition-all hover:border-stone-300 hover:shadow-md"
                >
                  <LucideReact.CreditCard className="h-6 w-6 text-stone-600 group-hover:text-stone-900" />
                  <h3 className="mt-3 font-semibold text-stone-900">Finance</h3>
                  <p className="mt-1 text-sm text-stone-600">Track budgets and invoicing</p>
                </Link>
                <Link
                  href="/platform/client-portal"
                  className="group rounded-xl border border-stone-200 bg-white p-5 transition-all hover:border-stone-300 hover:shadow-md"
                >
                  <LucideReact.Users className="h-6 w-6 text-stone-600 group-hover:text-stone-900" />
                  <h3 className="mt-3 font-semibold text-stone-900">Client Portal</h3>
                  <p className="mt-1 text-sm text-stone-600">Share updates and collect approvals</p>
                </Link>
                <Link
                  href="/pricing"
                  className="group rounded-xl border border-stone-200 bg-white p-5 transition-all hover:border-stone-300 hover:shadow-md"
                >
                  <LucideReact.Sparkles className="h-6 w-6 text-stone-600 group-hover:text-stone-900" />
                  <h3 className="mt-3 font-semibold text-stone-900">See Pricing</h3>
                  <p className="mt-1 text-sm text-stone-600">Start free with all features</p>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer CTA band */}
        <section
          className="relative isolate overflow-hidden py-24"
          style={{ backgroundColor: "#F1BBAA" }}
          aria-labelledby="cta-projects"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06]"
            style={{ backgroundImage: "url('/textures/grain.png')", backgroundSize: "200px 200px" }}
          />
          <div className={container}>
            <div className="mx-auto max-w-3xl text-center">
              <h2 id="cta-projects" className="text-2xl sm:text-[28px] md:text-[32px] font-medium tracking-tight text-stone-950">
                Run every project with clarity and control.
              </h2>
              <p className="mt-3 text-lg text-stone-900/80">
                Project management, docs, procurement and billing designed for interior design studios.
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
    </>
  )
}
