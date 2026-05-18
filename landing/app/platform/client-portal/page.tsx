"use client"

import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { useCallback, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { LandingHeroBackground } from "@/components/landing-hero-background"
import { CheckCircle2, XCircle, MessageSquare, Truck, Sparkles, PoundSterling, ClipboardList, ShoppingCart, CreditCard } from "lucide-react"
import { CtaButton } from "@/components/cta-button"
import { BreadcrumbSchema, platformBreadcrumbs } from "@/components/seo/breadcrumb-schema"

const container = "mx-auto max-w-[1200px] px-6 sm:px-8"
const H1 = "text-[30px] sm:text-5xl md:text-[56px] font-medium tracking-tight leading-[1.1]"
const H2 = "text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight"
const Lead = "text-base sm:text-lg text-stone-600"

// Palette accents
const CLAY = "#E07A57"
const OLIVE = "#6E7A58"
const SLATE = "#4B5960"
const OCHRE = "#C78A3B"

function SoftChip({ children, color = "#4E4943" }: { children: React.ReactNode; color?: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full bg-stone-100 px-2 py-0.5 text-[11px] ring-1 ring-stone-200"
      style={{ color }}
    >
      {children}
    </span>
  )
}

function Kpi({
  label,
  value,
  accent,
  sub,
}: {
  label: string
  value: string
  accent: string
  sub?: string
}) {
  return (
    <div
      className="rounded-2xl bg-white px-5 py-4 text-center shadow-[0_6px_22px_rgba(0,0,0,0.06)] ring-1"
      style={{ ringColor: "rgba(0,0,0,0.06)" as React.CSSProperties["color"] }}
    >
      <div className="text-xs font-semibold tracking-wide text-stone-600">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-stone-900">{value}</div>
      {sub ? <div className="mt-1 text-[11px] text-stone-500">{sub}</div> : null}
      <div className="mx-auto mt-3 h-1.5 w-10 rounded-full" style={{ backgroundColor: accent }} />
    </div>
  )
}

type ApprovalStatus = "pending" | "approved" | "declined"

type ApprovalItem = {
  id: string
  title: string
  room: string
  vendor: string
  price: string
  img: string
  code?: string
  status?: ApprovalStatus
}

function StatusPill({ status }: { status: ApprovalStatus }) {
  if (status === "approved") {
    return (
      <span
        className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold shadow-sm"
        style={{
          backgroundColor: "rgba(110,122,88,0.16)",
          color: "#4E6243",
          boxShadow: "inset 0 0 0 1px rgba(110,122,88,0.28)",
        }}
      >
        Approved
      </span>
    )
  }
  if (status === "declined") {
    return (
      <span
        className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold shadow-sm"
        style={{
          backgroundColor: "rgba(224,122,87,0.12)",
          color: "#B75A41",
          boxShadow: "inset 0 0 0 1px rgba(224,122,87,0.28)",
        }}
      >
        Declined
      </span>
    )
  }
  return <SoftChip color={SLATE}>Awaiting decision</SoftChip>
}

function ApprovalCard({
  item,
  onDecide,
}: {
  item: ApprovalItem
  onDecide: (id: string, status: ApprovalStatus, comment: string) => void
}) {
  const [status, setStatus] = useState<ApprovalStatus>(item.status ?? "pending")
  const [comment, setComment] = useState("")
  const [busy, setBusy] = useState(false)

  const decide = useCallback(
    (next: ApprovalStatus) => {
      if (busy) return
      setBusy(true)
      setTimeout(() => {
        setStatus(next)
        onDecide(item.id, next, comment.trim())
        setBusy(false)
      }, 420) // small affordance delay
    },
    [busy, comment, item.id, onDecide],
  )

  return (
    <Card className="overflow-hidden border-stone-200 shadow-sm">
      <CardContent className="p-0">
        <div className="grid gap-0 sm:grid-cols-[180px_1fr]">
          {/* Image */}
          <div className="relative h-44 w-full bg-stone-50 sm:h-full">
            <Image
              src={item.img || "/placeholder.svg?height=360&width=360&query=product"}
              alt={`${item.title} - product selection for interior design project approval`}
              fill
              sizes="(max-width: 768px) 100vw, 180px"
              className="object-cover"
            />
          </div>

          {/* Body */}
          <div className="p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="text-base font-semibold text-stone-900">{item.title}</div>
                <div className="mt-0.5 text-xs text-stone-600">
                  {item.room} • {item.vendor}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-stone-900">{item.price}</div>
                <div className="mt-1">
                  <StatusPill status={status} />
                </div>
              </div>
            </div>

            {/* Comment */}
            <div className="mt-3">
              <label htmlFor={`comment-${item.id}`} className="text-xs font-medium text-stone-700">
                Comment (optional)
              </label>
              <Textarea
                id={`comment-${item.id}`}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={2}
                placeholder="Share thoughts, changes or alternatives you'd prefer…"
                className="mt-1 resize-none"
              />
            </div>

            {/* Actions */}
            <div className="mt-3 flex items-center gap-2">
              <Button
                type="button"
                onClick={() => decide("approved")}
                disabled={busy || status === "approved"}
                className="inline-flex items-center gap-2"
                style={{
                  backgroundColor: "#3F4B51",
                }}
              >
                <CheckCircle2 className="h-4 w-4" />
                Approve
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => decide("declined")}
                disabled={busy || status === "declined"}
                className="inline-flex items-center gap-2"
              >
                <XCircle className="h-4 w-4" />
                Decline
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function MessagesSnapshot() {
  const rows = useMemo(
    () => [
      { who: "Designer", text: "Uploaded final pendant light options", meta: "2h ago", tag: "Design" },
      { who: "You", text: "We like the linen chairs — approved", meta: "1d ago", tag: "Client" },
      { who: "Vendor", text: "Dispatch notice • Order 34821", meta: "2d ago", tag: "Delivery" },
    ],
    [],
  )

  return (
    <Card className="overflow-hidden border-stone-200 shadow-sm">
      <CardContent className="p-4 sm:p-5">
        <div className="inline-flex items-center gap-2 text-sm font-semibold text-stone-900">
          <MessageSquare className="h-4 w-4" />
          Messages & updates
        </div>
        <div className="mt-3 rounded-lg ring-1 ring-stone-200">
          <ul className="divide-y divide-stone-200 bg-white">
            {rows.map((r, i) => (
              <li key={i} className="flex items-center justify-between gap-3 p-3">
                <div className="min-w-0">
                  <div className="truncate text-sm text-stone-900">
                    <span className="font-medium">{r.who}:</span> {r.text}
                  </div>
                  <div className="text-xs text-stone-600">{r.meta}</div>
                </div>
                <SoftChip color={SLATE}>{r.tag}</SoftChip>
              </li>
            ))}
          </ul>
        </div>

        {/* Visual example (updated image) */}
        <div className="relative mt-4 h-[260px] overflow-hidden rounded-xl ring-1 ring-stone-200 sm:h-[320px]">
          <Image
            src="/images/client-portal/messages-updates.png"
            alt="Messages workspace with threads, AI key points and next steps"
            fill
            className="object-cover"
            priority={false}
          />
        </div>
      </CardContent>
    </Card>
  )
}

function InvoiceCard({
  id,
  title,
  amount,
  status,
}: {
  id: string
  title: string
  amount: string
  status: "paid" | "unpaid"
}) {
  const isPaid = status === "paid"
  return (
    <Card className="overflow-hidden border-stone-200 shadow-sm">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-stone-900">{title}</div>
            <div className="mt-1 text-xs text-stone-600">INV-{id}</div>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center gap-1 text-lg font-semibold text-stone-900">
              <PoundSterling className="h-4 w-4" />
              {amount}
            </div>
            <div className="mt-1">
              {isPaid ? (
                <span
                  className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  style={{ backgroundColor: "rgba(110,122,88,0.16)", color: "#4E6243" }}
                >
                  Paid
                </span>
              ) : (
                <span
                  className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  style={{ backgroundColor: "rgba(224,122,87,0.12)", color: "#B75A41" }}
                >
                  Unpaid
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <SoftChip color={SLATE}>Portal</SoftChip>
          <SoftChip color={OCHRE}>Invoice</SoftChip>
        </div>

        <div className="mt-3 flex gap-2">
          {isPaid ? (
            <Button type="button" variant="outline" className="w-full bg-transparent">
              Download PDF
            </Button>
          ) : (
            <>
              <Button type="button" className="w-full" style={{ backgroundColor: "#3F4B51" }}>
                Pay now
              </Button>
              <Button type="button" variant="outline">
                View PDF
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function ClientPortalPage() {
  const { toast } = useToast()

  // UPDATED: Only two approval items (removed the chair card)
  const approvals: ApprovalItem[] = [
    {
      id: "A-02",
      title: "Orbital Brass Chandelier",
      room: "Dining",
      vendor: "LUMINA DESIGN",
      price: "£1,450",
      img: "/images/library/orbital-brass-chandelier.png",
      status: "pending",
    },
    {
      id: "A-03",
      title: "Abstract Canvas Art",
      room: "Living Room",
      vendor: "DECO ART",
      price: "£890",
      img: "/images/library/abstract-canvas-art.png",
      status: "pending",
    },
  ]

  const onDecide = useCallback(
    (id: string, status: ApprovalStatus, comment: string) => {
      toast({
        title: status === "approved" ? "Approved" : "Declined",
        description: comment ? `Your note: “${comment}”` : `Selection ${status}.`,
      })
    },
    [toast],
  )

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Can I customise the portal with my branding?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. The client portal displays your studio's logo, colours, and branding. Your clients see a professional, branded experience that feels like an extension of your business—not a generic third-party tool.",
        },
      },
      {
        "@type": "Question",
        name: "How do clients approve products and selections?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Clients can view selections organised by room or category, then approve or decline each item with a single click. They can add comments to explain their decisions, and you're notified instantly. No more email chains or lost feedback.",
        },
      },
      {
        "@type": "Question",
        name: "Can clients pay invoices through the portal?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Absolutely. Clients can view all invoices, see payment history, and pay directly via Stripe with credit card or bank transfer. You get paid faster, and clients appreciate the convenience.",
        },
      },
      {
        "@type": "Question",
        name: "Is the portal secure?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Each client has secure, password-protected access to only their projects. All data is encrypted, and you control exactly what information clients can see. Enterprise-grade security with a consumer-friendly experience.",
        },
      },
    ],
  }

  return (
    <>
      <BreadcrumbSchema items={platformBreadcrumbs.clientPortal} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <main className="bg-white">
        {/* HERO */}
        <section className="relative isolate overflow-hidden bg-stone-50 pb-10 pt-12 sm:pb-12 sm:pt-16 md:pt-20">
          <LandingHeroBackground gridHeight="min(520px, 56vh)" gridFadeStop={0.58} />
          <div className={cn(container, "relative z-10")}>
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="outline" className="rounded-full border-stone-300 bg-stone-50 text-stone-700">
                Client Collaboration
              </Badge>
              <h1 className={cn("mt-4 text-center", H1)}>Client portal for interior designers</h1>
              <p className={cn("mt-4 text-center", Lead)}>
                Review selections, message your designer, and view invoices in one place. Approve or decline products
                and ideas with comments so everyone stays in sync.
              </p>
              <p className="mt-3 text-center text-sm text-stone-500">
                Built for design studios who want to give clients a premium, branded experience for approvals and
                collaboration.
              </p>
            </div>

            {/* KPIs snapshot */}
            <div className="mx-auto mt-8 max-w-4xl">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Kpi label="Awaiting approval" value="2" accent={CLAY} />
                <Kpi label="Messages" value="12" sub="+2 new" accent={SLATE} />
                <Kpi label="Invoices" value="2" sub="1 unpaid" accent={OCHRE} />
                <Kpi label="Deliveries" value="3" sub="in transit" accent={OLIVE} />
              </div>
            </div>
          </div>
        </section>

        {/* APPROVALS */}
        <section id="approvals" className="bg-white py-14 sm:py-20">
          <div className={container}>
            <div className="mx-auto max-w-3xl text-center">
              <h2 className={H2}>Selections to review</h2>
              <p className={cn("mt-3", Lead)}>
                Approve or decline products and ideas. Leave comments and questions—your designer is notified instantly.
              </p>
            </div>

            <div className="mx-auto mt-8 grid max-w-6xl gap-4 md:grid-cols-2">
              {approvals.map((a) => (
                <ApprovalCard key={a.id} item={a} onDecide={onDecide} />
              ))}
            </div>

            {/* Hint row — centered beneath the two cards */}
            <div className="mx-auto mt-6 flex max-w-6xl flex-wrap items-center justify-center gap-3 text-center text-xs text-stone-600">
              <SoftChip color={SLATE}>Linked to project</SoftChip>
              <SoftChip color={OLIVE}>Notifies your designer</SoftChip>
              <SoftChip color={CLAY}>Keeps a history</SoftChip>
            </div>
          </div>
        </section>

        {/* NEW: CLIENT VIEW SECTION (above Messages) */}
        <section id="client-view" className="bg-white py-14 sm:py-20">
          <div className={container}>
            <div className="mx-auto max-w-3xl text-center">
              <h2 className={H2}>Client view: simple, branded, and secure</h2>
              <p className={cn("mt-3", Lead)}>
                Emails, procurement 1‑click approvals, and messaging all from a customisable client portal, accessible
                via a simple magic link.
              </p>
            </div>

            <div className="mx-auto mt-8 max-w-5xl">
              <div className="relative aspect-[16/9] overflow-hidden rounded-2xl ring-1 ring-stone-200">
                <Image
                  src="/images/client-portal/client-view-hero.png"
                  alt="Client portal dashboard showing project hero, KPIs and approval actions"
                  fill
                  className="object-cover"
                  priority={false}
                />
              </div>
            </div>

            <div className="mx-auto mt-6 flex max-w-5xl flex-wrap items-center justify-center gap-3 text-xs text-stone-700">
              <SoftChip color={SLATE}>Magic link access</SoftChip>
              <SoftChip color={OLIVE}>1‑click approvals</SoftChip>
              <SoftChip color={CLAY}>Branded experience</SoftChip>
            </div>
          </div>
        </section>

        {/* MESSAGES AND UPDATES */}
        <section id="messages" className="bg-white py-14 sm:py-20">
          <div className={container}>
            <div className="grid items-start gap-8 md:grid-cols-12">
              <div className="md:col-span-5">
                <h2 className={H2}>Messages and project updates</h2>
                <p className={cn("mt-3", Lead)}>
                  One shared feed for updates, files and approvals. Email and portal messages live together so nothing
                  is missed.
                </p>
                <ul className="mt-6 space-y-3 text-stone-800">
                  <li className="flex items-start gap-2">
                    <MessageSquare className="mt-0.5 h-5 w-5 text-stone-900" />
                    <span className="text-base">Post and reply right from the portal</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Truck className="mt-0.5 h-5 w-5 text-stone-900" />
                    <span className="text-base">Delivery updates appear automatically</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="mt-0.5 h-5 w-5 text-stone-900" />
                    <span className="text-base">AI summaries keep everyone on the same page</span>
                  </li>
                </ul>
              </div>
              <div className="md:col-span-7">
                <MessagesSnapshot />
              </div>
            </div>
          </div>
        </section>

        {/* INVOICES */}
        <section id="invoices" className="bg-white py-14 sm:py-20">
          <div className={container}>
            <div className="mx-auto max-w-3xl text-center">
              <h2 className={H2}>Invoices & payments</h2>
              <p className={cn("mt-3", Lead)}>
                View, download and pay securely. Everything stays in sync with your project and approvals.
              </p>
            </div>

            <div className="mx-auto mt-8 grid max-w-5xl gap-4 md:grid-cols-2">
              <InvoiceCard id="2053" title="Phase 2 deposit" amount="2,180" status="unpaid" />
              <InvoiceCard id="1972" title="Approved pendants" amount="1,260" status="paid" />
            </div>

            <div className="mx-auto mt-6 flex max-w-5xl flex-wrap items-center gap-3 text-xs text-stone-600">
              <SoftChip color={OCHRE}>Stripe secured</SoftChip>
              <SoftChip color={SLATE}>PDF copies</SoftChip>
              <SoftChip color={OLIVE}>Status updates</SoftChip>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="bg-stone-50 py-16 sm:py-20">
          <div className={cn(container)}>
            <div className="mx-auto max-w-3xl">
              <h2 className={cn("text-center", H2)}>Frequently asked questions</h2>
              <p className="mt-3 text-center text-stone-600">Common questions about the Focuspilot client portal.</p>
              <div className="mt-10 space-y-6">
                <div className="rounded-lg border border-stone-200 bg-white p-6">
                  <h3 className="text-lg font-semibold text-stone-900">Can I customise the portal with my branding?</h3>
                  <p className="mt-2 text-stone-600">
                    Yes. The client portal displays your studio's logo, colours, and branding. Your clients see a
                    professional, branded experience that feels like an extension of your business—not a generic
                    third-party tool.
                  </p>
                </div>
                <div className="rounded-lg border border-stone-200 bg-white p-6">
                  <h3 className="text-lg font-semibold text-stone-900">
                    How do clients approve products and selections?
                  </h3>
                  <p className="mt-2 text-stone-600">
                    Clients can view selections organised by room or category, then approve or decline each item with a
                    single click. They can add comments to explain their decisions, and you're notified instantly. No
                    more email chains or lost feedback.
                  </p>
                </div>
                <div className="rounded-lg border border-stone-200 bg-white p-6">
                  <h3 className="text-lg font-semibold text-stone-900">Can clients pay invoices through the portal?</h3>
                  <p className="mt-2 text-stone-600">
                    Absolutely. Clients can view all invoices, see payment history, and pay directly via Stripe with
                    credit card or bank transfer. You get paid faster, and clients appreciate the convenience.
                  </p>
                </div>
                <div className="rounded-lg border border-stone-200 bg-white p-6">
                  <h3 className="text-lg font-semibold text-stone-900">Is the portal secure?</h3>
                  <p className="mt-2 text-stone-600">
                    Yes. Each client has secure, password-protected access to only their projects. All data is
                    encrypted, and you control exactly what information clients can see. Enterprise-grade security with
                    a consumer-friendly experience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Features */}
        <section className="bg-white py-16 sm:py-20">
          <div className={container}>
            <div className="mx-auto max-w-4xl">
              <h2 className="text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight text-center text-stone-900">
                Connected to your studio operations
              </h2>
              <p className="mt-3 text-center text-stone-600">
                Client Portal works seamlessly with projects, procurement, and finance.
              </p>
              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Link
                  href="/platform/projects"
                  className="group rounded-xl border border-stone-200 bg-stone-50 p-5 transition-all hover:border-stone-300 hover:shadow-md"
                >
                  <ClipboardList className="h-6 w-6 text-stone-600 group-hover:text-stone-900" />
                  <h3 className="mt-3 font-semibold text-stone-900">Projects</h3>
                  <p className="mt-1 text-sm text-stone-600">Share progress with clients</p>
                </Link>
                <Link
                  href="/platform/procurement"
                  className="group rounded-xl border border-stone-200 bg-stone-50 p-5 transition-all hover:border-stone-300 hover:shadow-md"
                >
                  <ShoppingCart className="h-6 w-6 text-stone-600 group-hover:text-stone-900" />
                  <h3 className="mt-3 font-semibold text-stone-900">Procurement</h3>
                  <p className="mt-1 text-sm text-stone-600">Approvals flow to purchasing</p>
                </Link>
                <Link
                  href="/platform/finance"
                  className="group rounded-xl border border-stone-200 bg-stone-50 p-5 transition-all hover:border-stone-300 hover:shadow-md"
                >
                  <CreditCard className="h-6 w-6 text-stone-600 group-hover:text-stone-900" />
                  <h3 className="mt-3 font-semibold text-stone-900">Finance</h3>
                  <p className="mt-1 text-sm text-stone-600">Payments sync automatically</p>
                </Link>
                <Link
                  href="/pricing"
                  className="group rounded-xl border border-stone-200 bg-stone-50 p-5 transition-all hover:border-stone-300 hover:shadow-md"
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
                A calmer way to collaborate with clients
              </h2>
              <p className="mt-3 text-lg text-stone-900/80">
                Approvals, messages and invoices—connected to procurement and your project plan.
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
