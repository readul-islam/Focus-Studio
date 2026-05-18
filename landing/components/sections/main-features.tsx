"use client"

import type React from "react"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Building2, Layers, ShoppingCart, CreditCard, Users, CheckCircle2 } from "lucide-react"
import { CtaButton } from "@/components/cta-button"

const container = "mx-auto max-w-[1200px] px-6 sm:px-8"
const CTA = "h-11 rounded-full px-5 text-sm sm:text-base font-medium"
const TITLE_H2 = "text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight"

type FeatureItem = {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  title: string
  desc: string
  bullets: string[]
}

const FEATURES: FeatureItem[] = [
  {
    icon: Building2,
    title: "Lead‑to‑project CRM",
    desc: "Capture inquiries, qualify the right clients, and progress every opportunity with zero manual effort.",
    bullets: [
      "Forms, Instagram, and referral capture",
      "Automated follow‑ups and reminders",
      "Pipeline, stages, and win‑rate insights",
    ],
  },
  {
    icon: Layers,
    title: "Projects, phases, and tasks",
    desc: "Run projects the way studios work—phases, dependencies, installs, and tidy handoffs across your team.",
    bullets: ["Phase plans and milestones", "Kanban, list, and Gantt views", "Workload and resourcing"],
  },
  {
    icon: ShoppingCart,
    title: "Sourcing and procurement",
    desc: "Source, spec, and track every item from vendor to install—POs, statuses, and approvals in one place.",
    bullets: ["Specs and vendor tracking", "Purchase orders and receipts", "Client approvals and audit trail"],
  },
  {
    icon: CreditCard,
    title: "Proposals, invoices, and payments",
    desc: "From estimate to deposit to final invoice—get paid faster with ACH, cards, and accounting sync.",
    bullets: ["E‑sign proposals and deposits", "Itemised invoices and retainers", "QuickBooks/Xero sync"],
  },
  {
    icon: Users,
    title: "Client portal and collaboration",
    desc: "A polished client experience—approvals, moodboards, files, and messaging in a single, branded portal.",
    bullets: ["Approvals and selections", "Files, comments, and notes", "Email capture into threads"],
  },
]

function CalloutPill({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center rounded-full border border-stone-200 bg-white/90 px-3 py-1 text-xs text-stone-700 shadow-sm backdrop-blur">
      {children}
    </div>
  )
}

export default function MainFeatures() {
  return (
    <section id="features" className="bg-white py-16 sm:py-20">
      <div className={container}>
        {/* Header */}
        <div className="mx-auto max-w-4xl text-center">
          <Badge variant="outline" className="rounded-full border-stone-300 bg-stone-50 text-stone-700">
            {"Built for interior design studios & architects"}
          </Badge>
          <h2 className={cn("mt-4", TITLE_H2)}>{"Why studios choose Focuspilot"}</h2>
          <p className="mx-auto mt-3 max-w-3xl text-lg text-stone-600">
            {
              "Focuspilot is the modern operating system for interior designers and architects—bringing CRM, projects, procurement, billing, and client collaboration into one beautiful workspace. Streamline operations, boost profitability, and deliver an elevated client experience."
            }
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <CtaButton href="#overview" variant="black" label="Explore the platform" />
            <CtaButton href="#overview" variant="white" label="Download overview" />
          </div>
        </div>

        {/* Content */}
        <div className="mt-12 grid items-start gap-8 md:grid-cols-12 lg:gap-10">
          {/* Left: features list */}
          <div className="md:col-span-6 lg:col-span-5">
            <ul className="space-y-5">
              {FEATURES.map((f) => (
                <li key={f.title} className="rounded-2xl border border-stone-200 bg-white p-3 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-stone-800">
                      <f.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold leading-tight">{f.title}</h3>
                      <p className="mt-1 text-sm text-stone-600">{f.desc}</p>
                      <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {f.bullets.map((b) => (
                          <li key={b} className="flex items-center gap-2 text-sm text-stone-700">
                            <CheckCircle2 className="h-4 w-4 text-stone-700" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: product visual with floating callouts */}
          <div className="md:col-span-6 lg:col-span-7">
            <div className="relative">
              <div className="absolute -inset-6 -z-10 rounded-3xl bg-stone-50" />
              <Card className="overflow-hidden border-stone-200 shadow-lg">
                <CardContent className="p-0">
                  <div className="relative">
                    <Image
                      src={
                        "/images/ui-projects.png" ||
                        "/placeholder.svg?height=900&width=1440&query=project%20management%20for%20interior%20design" ||
                        "/placeholder.svg"
                      }
                      alt="Project planning board with phases, tasks, and approvals"
                      width={1400}
                      height={900}
                      className="aspect-[16/9] w-full object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 70vw, 960px"
                      priority
                    />

                    {/* Floating callouts */}
                    <div className="pointer-events-none absolute left-3 top-3 hidden gap-2 md:flex">
                      <CalloutPill>Phase plans</CalloutPill>
                      <CalloutPill>Dependencies</CalloutPill>
                    </div>
                    <div className="pointer-events-none absolute bottom-5 left-5 hidden md:block">
                      <CalloutPill>Client approvals</CalloutPill>
                    </div>
                    <div className="pointer-events-none absolute right-5 top-5 hidden md:block">
                      <CalloutPill>POs & invoices</CalloutPill>
                    </div>

                    {/* Curved connectors intentionally omitted for a clean layout */}
                  </div>
                </CardContent>
              </Card>

              <div className="mx-auto mt-4 flex flex-wrap items-center gap-3 text-xs text-stone-500">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-stone-400" />
                  Made for studios, not generic PM tools
                </span>
                <span className="hidden h-1 w-1 rounded-full bg-stone-300 sm:inline-block" />
                <span className="hidden sm:inline">Secure by default • SOC 2 ready • EU/US data residency</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
