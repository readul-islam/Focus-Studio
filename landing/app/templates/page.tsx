"use client"

import type React from "react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { FileText, Download, FileSpreadsheet, FileCheck, ClipboardList, Receipt, MessageSquare } from "lucide-react"
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

const templates = [
  {
    title: "Design Proposal Template",
    description: "Professional proposal template with scope, timeline, and pricing sections. Perfect for residential and commercial projects.",
    category: "Proposals",
    icon: FileText,
    popular: true,
  },
  {
    title: "Letter of Agreement",
    description: "Standard interior design contract template covering terms, fees, and deliverables. UK and US versions available.",
    category: "Contracts",
    icon: FileCheck,
    popular: true,
  },
  {
    title: "Project Brief Template",
    description: "Capture client requirements, budget, timeline, and style preferences in a structured format.",
    category: "Planning",
    icon: ClipboardList,
    popular: false,
  },
  {
    title: "FF&E Schedule Template",
    description: "Track furniture, fixtures, and equipment specifications, suppliers, and lead times in one document.",
    category: "Procurement",
    icon: FileSpreadsheet,
    popular: true,
  },
  {
    title: "Client Questionnaire",
    description: "Discover client preferences, lifestyle needs, and project requirements before the first meeting.",
    category: "Discovery",
    icon: MessageSquare,
    popular: false,
  },
  {
    title: "Invoice Template",
    description: "Professional invoice template with VAT support, payment terms, and bank details. Works with Xero.",
    category: "Finance",
    icon: Receipt,
    popular: false,
  },
]

function Hero() {
  return (
    <MarketingPageHero contentClassName={cn(container, "pb-12 pt-12 sm:pb-16 md:pt-16")}>
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-stone-300/60 bg-white px-3 py-1 text-xs text-stone-700">
            <Download className="h-3 w-3" aria-hidden="true" />
            Free downloads
          </span>
          <h1 className={cn("mt-5 text-center", TITLE_H1)}>Free templates</h1>
          <p className="mt-4 text-center text-base sm:text-lg text-stone-600">
            Professional templates for interior design studios. Download, customise, and use for your projects.
          </p>
          <p className="mt-3 text-center text-sm text-stone-500">
            All templates are included and automated in Techstyles.
          </p>
        </Reveal>
    </MarketingPageHero>
  )
}

function TemplateGrid() {
  return (
    <section className="bg-stone-50 py-16 sm:py-20">
      <div className={container}>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template, index) => {
            const Icon = template.icon
            return (
              <Reveal key={template.title} delay={index * 50}>
                <Card className="h-full border-stone-200 bg-white transition-all hover:shadow-md">
                  <CardContent className="flex h-full flex-col p-6">
                    <div className="flex items-start justify-between">
                      <div className="rounded-lg bg-stone-100 p-2.5">
                        <Icon className="h-5 w-5 text-stone-600" aria-hidden="true" />
                      </div>
                      {template.popular && (
                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                          Popular
                        </span>
                      )}
                    </div>
                    <span className="mt-4 text-xs font-medium text-stone-500">{template.category}</span>
                    <h3 className="mt-1 font-semibold text-stone-900">{template.title}</h3>
                    <p className="mt-2 flex-1 text-sm text-stone-600">{template.description}</p>
                    <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-stone-200 bg-white py-2.5 text-sm font-medium text-stone-700 transition-all hover:border-stone-300 hover:bg-stone-50">
                      <Download className="h-4 w-4" aria-hidden="true" />
                      Download
                    </button>
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

function AutomationBanner() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className={container}>
        <Reveal>
          <div className="mx-auto max-w-4xl rounded-2xl bg-stone-900 p-8 sm:p-12 text-center text-white">
            <h2 className="text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight">
              Get more with Techstyles
            </h2>
            <p className="mt-3 text-stone-300">
              These templates are built into Techstyles with automation and AI features. Generate proposals, track FF&E, and invoice clients automatically.
            </p>
            <div className="mt-8 flex items-center justify-center">
              <CtaButton href="/signup" variant="white" label="Start for free" showArrow arrowVariant="black" />
            </div>
            <p className="mt-3 text-xs sm:text-sm text-stone-400">No credit card required</p>
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
              See how Techstyles automates your workflow.
            </p>
          </Reveal>
          <Reveal delay={100}>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Link
                href="/platform/crm"
                className="group rounded-xl border border-stone-200 bg-white p-5 transition-all hover:border-stone-300 hover:shadow-md"
              >
                <h3 className="font-semibold text-stone-900 group-hover:text-stone-700">CRM</h3>
                <p className="mt-1 text-sm text-stone-600">Leads and proposals</p>
              </Link>
              <Link
                href="/platform/projects"
                className="group rounded-xl border border-stone-200 bg-white p-5 transition-all hover:border-stone-300 hover:shadow-md"
              >
                <h3 className="font-semibold text-stone-900 group-hover:text-stone-700">Projects</h3>
                <p className="mt-1 text-sm text-stone-600">Timelines and tasks</p>
              </Link>
              <Link
                href="/platform/procurement"
                className="group rounded-xl border border-stone-200 bg-white p-5 transition-all hover:border-stone-300 hover:shadow-md"
              >
                <h3 className="font-semibold text-stone-900 group-hover:text-stone-700">Procurement</h3>
                <p className="mt-1 text-sm text-stone-600">FF&E and POs</p>
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

export default function TemplatesPage() {
  return (
    <main className="bg-white">
      <Hero />
      <TemplateGrid />
      <AutomationBanner />
      <RelatedLinks />
    </main>
  )
}
