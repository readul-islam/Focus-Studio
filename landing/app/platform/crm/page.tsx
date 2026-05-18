"use client"

import type React from "react"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import {
  FileText,
  Mail,
  FilePenLine as Pipeline,
  Users,
  Wand2,
  CheckCircle2,
  FolderOpen,
  Sparkles,
  Brain,
  ClipboardList,
  ShoppingCart,
  CreditCard,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { CtaButton } from "@/components/cta-button"
import { cn } from "@/lib/utils"
import { MarketingPageHero } from "@/components/marketing/marketing-page-hero"
import { BreadcrumbSchema, platformBreadcrumbs } from "@/components/seo/breadcrumb-schema"

const container = "mx-auto max-w-[1200px] px-6 sm:px-8"
const TITLE_H1 = "text-[30px] sm:text-5xl md:text-[56px] font-medium tracking-tight leading-[1.1]"
const TITLE_H2 = "text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight"

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

function Hero() {
  return (
    <MarketingPageHero
      id="overview"
      gridHeight="min(520px, 58vh)"
      contentClassName={cn(container, "pb-12 pt-12 sm:pb-16 md:pt-16")}
    >
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full border border-stone-300/60 bg-white px-3 py-1 text-xs text-stone-700">
            CRM for interior design studios
          </span>
          <h1 className={cn("mt-5 text-center", TITLE_H1)}>Interior design CRM software</h1>
          <p className="mt-4 text-center text-base sm:text-lg text-stone-600">
            Centralise leads, clients, and suppliers. Track your pipeline from first inquiry to signed proposal and kick
            off every project with clarity.
          </p>
          <p className="mt-3 text-center text-sm text-stone-500">
            Built for interior designers and architects who want to win the right projects and nurture every client
            relationship.
          </p>
          <div className="mx-auto mt-6 flex justify-center gap-3">
            <CtaButton href="#pipeline" variant="slate"  label="See pipeline" />
            <CtaButton href="#leads" variant="grey"  label="Manage leads" />
          </div>
        </Reveal>
    </MarketingPageHero>
  )
}

type FeatureVisual =
  | { type: "image"; data: { src: string; alt: string; width: number; height: number; sizes?: string } }
  | { type: "custom"; node: React.ReactNode }

function FeatureRow({
  icon: Icon,
  title,
  body,
  bullets,
  visual,
  flip = false,
  id,
}: {
  icon: any
  title: string
  body: string
  bullets?: string[]
  visual: FeatureVisual
  flip?: boolean
  id?: string
}) {
  return (
    <section id={id} className={cn("py-14 sm:py-18", id === "proposals" ? "bg-[#E7DFD8]" : "bg-white")}>
      <div className={container}>
        <div className={cn("grid items-center md:grid-cols-12", "gap-10 lg:gap-14")}>
          <div className={cn("md:col-span-6", flip ? "md:order-2" : "md:order-1")}>
            <Reveal className="mx-auto max-w-xl">
              <div className="inline-flex items-center gap-2 text-sm font-medium text-stone-900">
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span>CRM</span>
              </div>
              <h2 className={cn("mt-2", TITLE_H2)}>{title}</h2>
              <p className="mt-3 text-stone-700">{body}</p>
              {bullets?.length ? (
                <ul className="mt-5 space-y-3">
                  {bullets.map((b) => (
                    <li key={b} className="flex items-start gap-3 text-stone-800">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-stone-900" />
                      <span className="text-base">{b}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </Reveal>
          </div>

          <div className={cn("md:col-span-6", flip ? "md:order-1" : "md:order-2")}>
            <Reveal>
              <Card className="overflow-hidden border-stone-200 shadow-lg">
                <CardContent className="p-0">
                  <div className="relative w-full">
                    {visual.type === "image" ? (
                      <Image
                        src={visual.data.src || "/placeholder.svg"}
                        alt={visual.data.alt}
                        width={visual.data.width}
                        height={visual.data.height}
                        className="h-auto w-full rounded-lg bg-stone-50 object-cover"
                        sizes={visual.data.sizes || "(max-width: 768px) 100vw, (max-width: 1280px) 60vw, 960px"}
                        priority={false}
                      />
                    ) : (
                      <div className="rounded-lg">{visual.node}</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}

function OnboardingWizard() {
  // Brand-aligned icon colors (pulled from AI page treatment: clay/rust, sage, ochre)
  const brand = {
    clay: "#A56A52",
    sage: "#6F8B7A",
    ochre: "#B6893C",
  }

  const steps = [
    {
      icon: FolderOpen,
      title: "Create project",
      text: "Choose a template for residential, commercial, or staging.",
      color: brand.clay,
    },
    {
      icon: Users,
      title: "Invite stakeholders",
      text: "Clients, contractors, and partners in one secure place.",
      color: brand.sage,
    },
    {
      icon: FileText,
      title: "Seed details",
      text: "Rooms, budget, styles, and initial milestones auto‑generated.",
      color: brand.ochre,
    },
    {
      icon: Wand2,
      title: "Automations",
      text: "Kickstart tasks, approvals, and messages with AI suggestions.",
      color: brand.clay,
    },
  ]

  return (
    <section id="onboarding" className="bg-stone-50 py-16 sm:py-20">
      <div className={container}>
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight">From proposal to project in minutes</h2>
          <p className="mt-3 text-stone-700">
            Use our onboarding wizard to generate the essentials for every job, so designers spend less time setting up,
            and more time designing.
          </p>
        </Reveal>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <Card key={s.title} className="border-stone-200">
              <CardContent className="p-4">
                {/* Icon only — no background container */}
                <s.icon className="mb-3 h-6 w-6" style={{ color: s.color }} aria-hidden="true" />
                <div className="text-lg font-semibold">{s.title}</div>
                <p className="mt-1 text-sm text-stone-700">{s.text}</p>
              </CardContent>
            </Card>
          ))}
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
            Bring clarity to your studio&rsquo;s relationships.
          </h2>
          <p className="mt-3 text-base sm:text-lg text-stone-300">
            Capture leads, move deals forward, and launch projects - seamlessly connected to approvals, procurement, and
            finance.
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

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How is this different from HubSpot or Salesforce?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Generic CRMs require extensive customisation to work for design studios. Focuspilot CRM is built specifically for interior designers with pipeline stages, contact types, and proposal tools that match how design businesses actually operate. No complex setup required.",
      },
    },
    {
      "@type": "Question",
      name: "Can I create proposals and quotes?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Our AI-powered proposal wizard generates professional, branded proposals from your project brief. It analyses your historic data for accurate pricing and creates detailed scope documents with phase-based milestones ready to download as PDFs.",
      },
    },
    {
      "@type": "Question",
      name: "Does it integrate with project management?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Absolutely. When you win a deal, you can convert it to a project with one click. All client information, scope details, and proposal data flow seamlessly into your project workspace. No duplicate data entry.",
      },
    },
    {
      "@type": "Question",
      name: "Can I track where my leads come from?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Focuspilot tracks lead sources automatically—whether from your website, Instagram, referrals, or events. See which channels bring your best clients and focus your marketing efforts accordingly.",
      },
    },
  ],
}

export default function CRMPage() {
  return (
    <>
      <BreadcrumbSchema items={platformBreadcrumbs.crm} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <main className="bg-white">
        <Hero />

        <FeatureRow
          id="leads"
          icon={Mail}
          title="Lead capture that fits your studio"
          body="Plug inquiries from your website, Instagram, referrals, or events straight into Focuspilot. Qualify faster with
      clear statuses, sources, and scores so your team knows where to focus."
          bullets={[
            "Single inbox for new inquiries with source tracking.",
            "Custom lead statuses mapped to your sales process.",
            "Bulk actions and CSV import to onboard historical data.",
          ]}
          visual={{
            type: "image",
            data: {
              src: "/images/platform/crm/leads-table.png",
              alt: "Interior design CRM lead intake table showing source tracking, status chips, and contact details for studio management",
              width: 1600,
              height: 650,
              sizes: "(max-width: 768px) 100vw, (max-width: 1280px) 60vw, 960px",
            },
          }}
        />

        <FeatureRow
          id="pipeline"
          icon={Pipeline}
          title="Pipeline you can drag, drop, and trust"
          body="Move opportunities from New to Won with a pipeline designed for design studios see values, owners, and momentum at a glance."
          bullets={[
            "Custom columns and deal values to forecast revenue.",
            "Drag‑and‑drop across stages; keyboard accessible.",
            "Switch between Board and Table views in one click.",
          ]}
          visual={{
            type: "image",
            data: {
              src: "/images/platform/crm/pipeline-board.png",
              alt: "Interior design sales pipeline Kanban board showing deal stages from lead to won with project cards and revenue values",
              width: 1600,
              height: 760,
            },
          }}
          flip
        />

        <FeatureRow
          id="contacts"
          icon={Users}
          title="Clients, contacts, and supplier organised"
          body="Keep every relationship up to date. Consolidate client details, specifiers, vendors, and trades with the notes, emails, and files that matter."
          bullets={[
            "Flexible types: Lead, Client, Partner, Supplier, Trade.",
            "Rich profiles with email, phone, and linked projects.",
            "Bulk actions for outreach and GDPR-friendly exports.",
          ]}
          visual={{
            type: "image",
            data: {
              src: "/images/platform/crm/contacts-table.png",
              alt: "Interior design CRM contacts directory showing client types, company names, and quick action buttons for communication",
              width: 1600,
              height: 640,
            },
          }}
        />

        <FeatureRow
          id="proposals"
          icon={Brain}
          title="AI-powered proposals that win work"
          body="Create intelligent, data-driven proposals in minutes. Our AI wizard analyses your brief and historic data to generate line-by-line costings organised by phases and milestones ready to download as branded PDFs."
          bullets={[
            "AI scope definition from brief with smart enhancement suggestions.",
            "Historic data analysis for accurate pricing recommendations.",
            "Phase-based milestone structure with detailed line items.",
            "Branded PDF generation ready to send to clients.",
          ]}
          visual={{
            type: "image",
            data: {
              src: "/images/platform/crm/ai-proposal-pricing.png",
              alt: "AI-powered interior design proposal wizard showing detailed pricing breakdown with line items, fees, and AI assistant suggestions",
              width: 1600,
              height: 400,
            },
          }}
          flip
        />

        <section className="bg-stone-50 py-16 sm:py-20">
          <div className={container}>
            <Reveal className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center gap-2 text-sm font-medium text-stone-900">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                <span>AI Proposal Wizard</span>
              </div>
              <h2 className="mt-2 text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight">
                From brief to branded proposal in minutes
              </h2>
              <p className="mt-3 text-stone-700">
                Let AI transform your project briefs into comprehensive, accurately-priced proposals with detailed scope
                definitions and milestone-based pricing.
              </p>
            </Reveal>

            <div className="mt-12 grid gap-8 lg:grid-cols-2">
              <Reveal>
                <Card className="overflow-hidden border-stone-200 shadow-lg">
                  <CardContent className="p-0">
                    <Image
                      src="/images/platform/crm/ai-scope-definition.png"
                      alt="AI scope definition interface for interior design proposals with markdown formatting, project phases, and deliverables outline"
                      width={1200}
                      height={800}
                      className="h-auto w-full bg-stone-50 object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 600px"
                    />
                  </CardContent>
                </Card>
              </Reveal>

              <Reveal delay={200}>
                <div className="flex h-full flex-col justify-center">
                  <h3 className="text-2xl font-semibold tracking-tight">Intelligent scope definition</h3>
                  <p className="mt-3 text-stone-700">
                    Start with a basic brief and watch AI enhance it into a comprehensive scope of work. Choose from
                    templates, write custom content, or let AI generate detailed project phases with professional
                    formatting.
                  </p>
                  <ul className="mt-6 space-y-3">
                    <li className="flex items-start gap-3 text-stone-800">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-stone-900" />
                      <span>AI enhancement of basic project briefs</span>
                    </li>
                    <li className="flex items-start gap-3 text-stone-800">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-stone-900" />
                      <span>Professional markdown formatting for proposals</span>
                    </li>
                    <li className="flex items-start gap-3 text-stone-800">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-stone-900" />
                      <span>Template library with custom options</span>
                    </li>
                  </ul>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="bg-white py-16 sm:py-20">
          <div className={container}>
            <div className="mx-auto max-w-3xl">
              <Reveal>
                <h2 className="text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight text-center">
                  Frequently asked questions
                </h2>
                <p className="mt-3 text-center text-stone-600">
                  Common questions about Focuspilot CRM for interior designers.
                </p>
              </Reveal>
              <div className="mt-10 space-y-6">
                <Reveal>
                  <div className="rounded-lg border border-stone-200 bg-stone-50 p-6">
                    <h3 className="text-lg font-semibold text-stone-900">
                      How is this different from HubSpot or Salesforce?
                    </h3>
                    <p className="mt-2 text-stone-600">
                      Generic CRMs require extensive customisation to work for design studios. Focuspilot CRM is built
                      specifically for interior designers with pipeline stages, contact types, and proposal tools that
                      match how design businesses actually operate. No complex setup required.
                    </p>
                  </div>
                </Reveal>
                <Reveal delay={100}>
                  <div className="rounded-lg border border-stone-200 bg-stone-50 p-6">
                    <h3 className="text-lg font-semibold text-stone-900">Can I create proposals and quotes?</h3>
                    <p className="mt-2 text-stone-600">
                      Yes. Our AI-powered proposal wizard generates professional, branded proposals from your project
                      brief. It analyses your historic data for accurate pricing and creates detailed scope documents
                      with phase-based milestones ready to download as PDFs.
                    </p>
                  </div>
                </Reveal>
                <Reveal delay={200}>
                  <div className="rounded-lg border border-stone-200 bg-stone-50 p-6">
                    <h3 className="text-lg font-semibold text-stone-900">Does it integrate with project management?</h3>
                    <p className="mt-2 text-stone-600">
                      Absolutely. When you win a deal, you can convert it to a project with one click. All client
                      information, scope details, and proposal data flow seamlessly into your project workspace. No
                      duplicate data entry.
                    </p>
                  </div>
                </Reveal>
                <Reveal delay={300}>
                  <div className="rounded-lg border border-stone-200 bg-stone-50 p-6">
                    <h3 className="text-lg font-semibold text-stone-900">Can I track where my leads come from?</h3>
                    <p className="mt-2 text-stone-600">
                      Yes. Focuspilot tracks lead sources automatically—whether from your website, Instagram, referrals,
                      or events. See which channels bring your best clients and focus your marketing efforts
                      accordingly.
                    </p>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        <OnboardingWizard />
        <FinalCTA />
      </main>
    </>
  )
}
