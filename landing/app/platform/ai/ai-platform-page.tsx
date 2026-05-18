"use client"

import type React from "react"
import Link from "next/link"
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FileText,
  Mail,
  ShoppingCart,
  Sparkles,
  Sun,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { CtaButton } from "@/components/cta-button"
import { MarketingPageHero } from "@/components/marketing/marketing-page-hero"
import { Reveal } from "@/components/marketing/reveal"
import { BreadcrumbSchema, platformBreadcrumbs } from "@/components/seo/breadcrumb-schema"
import { UniformFrame } from "@/components/media/uniform-frame"
import { cn } from "@/lib/utils"

const container = "mx-auto max-w-[1200px] px-6 sm:px-8"
const TITLE_H1 = "text-[30px] sm:text-5xl md:text-[56px] font-medium tracking-tight leading-[1.1]"
const TITLE_H2 = "text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight text-stone-950"

const features = [
  {
    id: "daily-brief",
    icon: Sun,
    title: "Daily brief",
    description:
      "Start each morning with a project-aware summary: overdue tasks, client decisions waiting, procurement risks, and what to tackle first.",
    href: "#daily-brief",
    linkLabel: "See daily brief",
    accent: "#E07A57",
  },
  {
    icon: Mail,
    title: "Email routing & drafts",
    description:
      "Route threads to the right project, summarise long chains, and draft replies in your studio tone — ready for you to send.",
    href: "/platform/features/ai-email",
    linkLabel: "Explore AI email",
    accent: "#8FA58F",
  },
  {
    icon: ShoppingCart,
    title: "Procurement assist",
    description:
      "Extract specs from supplier pages, flag long-lead items, and suggest alternates when timelines slip — tied to your FF&E schedule.",
    href: "/platform/features/ai-procurement",
    linkLabel: "See AI procurement",
    accent: "#6E7A58",
  },
  {
    icon: FileText,
    title: "Proposals & documents",
    description:
      "Turn briefs and selections into scoped proposals and invoice-ready line items with checks that match your templates.",
    href: "/platform/features/invoicing",
    linkLabel: "Proposals & invoicing",
    accent: "#C78A3B",
  },
] as const

/** Real product screenshots — same assets as feature subpages (no generated stock art). */
const productShowcases = [
  {
    title: "Studio dashboard",
    caption: "Project health, tasks, and your daily brief in one view.",
    src: "/images/app/dashboard-hero.png",
    alt: "Focuspilot studio dashboard with project overview and KPIs",
    href: "#daily-brief",
  },
  {
    title: "AI inbox",
    caption: "Threads routed to projects with context-aware drafts.",
    src: "/images/platform/projects/messages.png",
    alt: "Project messages and email threads in Focuspilot",
    href: "/platform/features/ai-email",
  },
  {
    title: "Procurement assist",
    caption: "Import specs from supplier pages into your schedule.",
    src: "/images/procurement/ai-import-chair.png",
    alt: "AI extracting product specifications for FF&E procurement",
    href: "/platform/features/ai-procurement",
  },
  {
    title: "AI proposals",
    caption: "Scope and pricing drafts from your brief and history.",
    src: "/images/platform/crm/ai-proposal-wizard.png",
    alt: "AI proposal wizard with phased pricing for interior design studios",
    href: "/platform/features/invoicing",
  },
] as const

const steps = [
  {
    step: "1",
    title: "Project context",
    body: "AI reads your active projects — phases, selections, messages, and budgets — so suggestions stay specific, not generic.",
  },
  {
    step: "2",
    title: "Draft",
    body: "Get summaries, reply drafts, spec extractions, or proposal sections you can edit in seconds instead of starting from a blank page.",
  },
  {
    step: "3",
    title: "Human approve",
    body: "Nothing goes to clients or suppliers until you confirm. You stay in control; AI handles the repetitive first pass.",
  },
] as const

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
          <h2 className="text-2xl font-medium tracking-tight sm:text-[28px] md:text-[32px]">
            Ship beautiful work with less admin
          </h2>
          <p className="mt-3 text-base text-stone-300 sm:text-lg">
            Join studios using Focuspilot AI for inbox, procurement, and proposals — connected to one project workspace.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <CtaButton href="/signup" variant="white" label="Start for free" showArrow arrowVariant="black" />
            <Link
              href="/resources/ai-playbook"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-white/30 px-4 text-sm font-medium text-white hover:bg-white/10"
            >
              Read the AI Playbook
            </Link>
          </div>
          <p className="mt-3 text-xs text-stone-400 sm:text-sm">No credit card required</p>
        </Reveal>
      </div>
    </section>
  )
}

export default function AIPlatformPage() {
  return (
    <>
      <BreadcrumbSchema items={platformBreadcrumbs.ai} />

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
                AI for design studios
              </span>
              <h1 className={cn("mt-5 lg:text-left", TITLE_H1)}>AI built for design studios</h1>
              <p className="mt-4 text-base leading-relaxed text-stone-600 sm:text-lg">
                Focuspilot AI works inside your projects — not in a disconnected chat window. Trim inbox noise, keep
                procurement accurate, and move proposals faster while your team stays in control.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <CtaButton href="/signup" variant="slate" label="Start for free" showArrow arrowVariant="white" />
                <CtaButton href="#features" variant="grey" label="See AI features" />
              </div>
            </Reveal>
            <Reveal delay={100}>
              <UniformFrame
                src="/images/ui-hero-dashboard.png"
                alt="Focuspilot dashboard showing projects, tasks, and studio overview with AI-assisted workflows"
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
                AI across your studio workflow
              </h2>
              <p className="mt-3 text-base text-stone-600">
                Four places where AI saves hours every week — each tied to real project data in Focuspilot.
              </p>
            </Reveal>

            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {features.map((f, i) => (
                <FeatureCard key={f.title} {...f} delay={i * 60} />
              ))}
            </div>

            <Reveal className="mt-16">
              <h3 className="text-center text-lg font-medium text-stone-900">Inside the product</h3>
              <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-stone-600">
                Screenshots from the live studio app — the same AI tools you get after signup.
              </p>
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                {productShowcases.map((item, i) => (
                  <Reveal key={item.title} delay={i * 50}>
                    <Link
                      href={item.href}
                      className="group block overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md"
                    >
                      <UniformFrame
                        src={item.src}
                        alt={item.alt}
                        width={800}
                        height={500}
                        variant="float"
                        className="rounded-b-none"
                      />
                      <div className="border-t border-stone-100 px-4 py-3">
                        <p className="font-medium text-stone-900 group-hover:text-[#C96A4A]">{item.title}</p>
                        <p className="mt-0.5 text-xs text-stone-600">{item.caption}</p>
                      </div>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <section
          id="daily-brief"
          className="scroll-mt-24 border-t border-stone-200 bg-stone-50/80 py-14 sm:py-20"
          aria-labelledby="daily-brief-heading"
        >
          <div className={cn(container, "grid items-center gap-10 lg:grid-cols-2 lg:gap-14")}>
            <Reveal>
              <h2 id="daily-brief-heading" className={TITLE_H2}>
                Your morning brief, project by project
              </h2>
              <p className="mt-4 text-base leading-relaxed text-stone-600">
                Open Focuspilot and see what matters today: blocked approvals, slipping milestones, supplier delays, and
                client messages that need a reply — grouped by project, not buried in email.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-stone-700">
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#8FA58F]" aria-hidden />
                  Summarises overnight email and task changes
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#8FA58F]" aria-hidden />
                  Highlights budget and timeline risks before site meetings
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#8FA58F]" aria-hidden />
                  Available in the studio app after you sign up
                </li>
              </ul>
              <div className="mt-6">
                <CtaButton href="/signup" variant="slate" label="Try daily brief" showArrow arrowVariant="white" />
              </div>
            </Reveal>
            <Reveal delay={120}>
              <UniformFrame
                src="/images/app/dashboard-hero.png"
                alt="Focuspilot daily brief and project dashboard for interior design studios"
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
                How it works
              </h2>
              <p className="mt-3 text-base text-stone-600">
                Context first, drafts second, your approval last — the same pattern across email, procurement, and docs.
              </p>
            </Reveal>

            <ol className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-3">
              {steps.map((s, i) => (
                <Reveal key={s.step} delay={i * 80}>
                  <li className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-900 text-sm font-semibold text-white">
                      {s.step}
                    </span>
                    <h3 className="mt-4 text-lg font-semibold text-stone-900">{s.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-stone-600">{s.body}</p>
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
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#FBEAE1]"
                  aria-hidden
                >
                  <BookOpen className="h-7 w-7 text-[#C96A4A]" />
                </div>
                <div className="mt-6 flex-1 lg:mt-0">
                  <h2 id="playbook-heading" className="text-2xl font-medium tracking-tight text-stone-900 sm:text-3xl">
                    Free AI Playbook for studios
                  </h2>
                  <p className="mt-3 text-stone-600">
                    Practical workflows, copy-paste prompts, and guardrails for email, procurement, proposals, and
                    governance — no fluff, ready to use with Focuspilot.
                  </p>
                  <Link
                    href="/resources/ai-playbook"
                    className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-stone-900 hover:text-[#C96A4A]"
                  >
                    Open the AI Playbook
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </div>
                <div className="mt-6 shrink-0 lg:mt-0">
                  <CtaButton
                    href="/resources/ai-playbook"
                    variant="outline"
                    label="Browse playbook"
                    className="w-full justify-center sm:w-auto"
                  />
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <FinalCTA />
      </main>
    </>
  )
}
