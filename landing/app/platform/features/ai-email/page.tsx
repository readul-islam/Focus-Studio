"use client"

import type React from "react"
import Image from "next/image"
import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { CtaButton } from "@/components/cta-button"
import { cn } from "@/lib/utils"
import { FloorPlanBg } from "@/components/graphics/floorplan-bg"
import {
  Mail,
  Share2,
  Sparkles,
  FolderGit2,
  Users,
  ShieldCheck,
  Truck,
  ClipboardList,
  Link2,
  FileText,
  ArrowRight,
} from "lucide-react"

const container = "mx-auto max-w-[1200px] px-6 sm:px-8"
const H1 = "text-[30px] sm:text-5xl md:text-[56px] font-medium tracking-tight leading-[1.1]"
const H2 = "text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight"
const Lead = "text-base sm:text-lg text-stone-600"

// Palette accents
const CLAY = "#E07A57"
const OLIVE = "#6E7A58"
const SLATE = "#4B5960"
const OCHRE = "#C78A3B"

// Small helper chip
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

function DotRow({
  icon: Icon,
  title,
  desc,
}: { icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-stone-100 text-stone-900 ring-1 ring-stone-200">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="text-sm font-semibold text-stone-900">{title}</div>
        <div className="text-sm text-stone-700">{desc}</div>
      </div>
    </div>
  )
}

/**
 * Simulated email row list with Share chips
 */
function InboxList() {
  const rows = useMemo(
    () => [
      { from: "In Good Company", subj: "Proforma invoice • Brass floor lamp", tag: "Vendor" },
      { from: "Client — Oak House", subj: "Re: Dining chair finishes (linen vs boucle)", tag: "Client" },
      { from: "Logistics", subj: "Dispatch notice • Order 34821", tag: "Delivery" },
      { from: "Stonecraft Ltd", subj: "Lead time update — marble slab", tag: "Vendor" },
    ],
    [],
  )

  // Toast + "Shared" UI state
  const [toast, setToast] = useState<null | { title: string; subtitle?: string }>(null)
  const [justSharedIndex, setJustSharedIndex] = useState<number | null>(null)

  function triggerShare(i: number, subject: string) {
    setJustSharedIndex(i)
    // Show inline toast
    setToast({
      title: "Shared to project",
      subtitle: subject,
    })
    // Reset states
    setTimeout(() => {
      setJustSharedIndex(null)
    }, 1200)
    setTimeout(() => {
      setToast(null)
    }, 1800)
  }

  return (
    <div className="relative h-full">
      <div className="divide-y divide-stone-200 bg-white">
        {rows.map((m, i) => {
          const shared = justSharedIndex === i
          return (
            <div key={i} className="flex items-center justify-between gap-3 p-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-stone-900">{m.subj}</div>
                <div className="truncate text-xs text-stone-600">{m.from}</div>
              </div>
              <div className="flex items-center gap-2">
                <SoftChip>{m.tag}</SoftChip>
                <button
                  type="button"
                  onClick={() => triggerShare(i, m.subj)}
                  disabled={shared}
                  className={
                    "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs transition " +
                    (shared
                      ? "bg-stone-200 text-stone-700"
                      : "bg-stone-900 text-white hover:bg-stone-800 active:scale-[0.98]")
                  }
                  aria-label={shared ? "Shared" : "Share to project"}
                  title={shared ? "Shared" : "Share to project"}
                >
                  {shared ? (
                    <>
                      <span className="inline-block h-2 w-2 rounded-full bg-[#6E7A58]" aria-hidden="true" />
                      Shared
                    </>
                  ) : (
                    <>
                      <Share2 className="h-3.5 w-3.5" />
                      Share
                    </>
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Inline confirmation toast */}
      <div
        aria-live="polite"
        className={
          "pointer-events-none absolute bottom-3 right-3 transition-all duration-300 " +
          (toast ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0")
        }
        role="status"
      >
        <div className="pointer-events-auto flex items-start gap-2 rounded-xl bg-white/95 p-3 pr-4 shadow-lg ring-1 ring-stone-200">
          <div className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-stone-900 text-white">
            <Share2 className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-stone-900">{toast?.title}</div>
            {toast?.subtitle ? <div className="truncate text-xs text-stone-600">{toast.subtitle}</div> : null}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Bento: Communication hub in tiles
 */
function CommunicationHubBento() {
  return (
    <section className="bg-white">
      <div className={cn(container, "mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3")}>
        {/* Unified Inbox */}
        <Card className="border-stone-200 shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-stone-900">
                <Mail className="h-4 w-4" />
                Unified inbox
              </div>
              <SoftChip>Gmail connected</SoftChip>
            </div>
            <div className="mt-3 h-[260px] overflow-hidden rounded-lg bg-stone-50 ring-1 ring-stone-200">
              <InboxList />
            </div>
          </CardContent>
        </Card>

        {/* Project routing */}
        <Card className="border-stone-200 shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-stone-900">
              <FolderGit2 className="h-4 w-4" />
              Project routing
            </div>
            <p className="mt-2 text-sm text-stone-700">
              Emails are auto‑suggested to a project using participants, subject and labels. Confirm in one click.
            </p>
            <div className="mt-3 rounded-lg bg-white p-3 ring-1 ring-stone-200">
              <div className="text-sm font-medium text-stone-900">“Dining chair finishes (linen vs boucle)”</div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                <SoftChip color={SLATE}>Project: Oak House</SoftChip>
                <SoftChip color={OLIVE}>Client</SoftChip>
                <SoftChip color={CLAY}>Design</SoftChip>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-3 py-1.5 text-xs text-white hover:bg-stone-800"
                >
                  Confirm routing
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs text-stone-800 hover:bg-stone-50"
                >
                  Change…
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vendor timeline updates → PO */}
        <Card className="border-stone-200 shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-stone-900">
              <Truck className="h-4 w-4" />
              Vendor emails → PO timeline
            </div>
            <p className="mt-2 text-sm text-stone-700">
              Delivery notices and lead time updates flow into Procurement and update PO status automatically.
            </p>
            <div className="mt-3 space-y-2 rounded-lg bg-white p-3 ring-1 ring-stone-200">
              {[
                { label: "Dispatch notice • Order 34821", status: "In transit", pct: 62 },
                { label: "Lead time update — marble slab", status: "ETA shifted +3d", pct: 35 },
              ].map((r) => (
                <div key={r.label}>
                  <div className="flex items-center justify-between text-xs">
                    <div className="truncate font-medium text-stone-900">{r.label}</div>
                    <div className="text-stone-600">{r.status}</div>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded bg-stone-100">
                    <div
                      className="h-2 rounded"
                      style={{
                        width: `${r.pct}%`,
                        background: "linear-gradient(90deg, rgba(214,177,150,0.35) 0%, rgba(214,177,150,0.9) 100%)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI summary + actions */}
        <Card className="border-stone-200 shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-stone-900">
              <Sparkles className="h-4 w-4" />
              AI summary & actions
            </div>
            <div className="mt-3 rounded-lg bg-white p-3 ring-1 ring-stone-200">
              <div className="text-[13px] leading-relaxed text-stone-900">
                Summary: Client prefers linen, requests sample. Approve pendant lights, confirm dispatch window.
              </div>
              <ul className="mt-2 list-disc pl-5 text-xs text-stone-700">
                <li>Create a task: Order fabric samples</li>
                <li>Create a PO: Pendant lights (approved)</li>
                <li>Reply: Confirm delivery window</li>
              </ul>
              <div className="mt-3 flex flex-wrap gap-2">
                <button className="inline-flex items-center gap-1.5 rounded-lg bg-stone-900 px-3 py-1.5 text-xs text-white hover:bg-stone-800">
                  <ClipboardList className="h-3.5 w-3.5" />
                  Create task
                </button>
                <button className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs text-stone-900 hover:bg-stone-50">
                  <FileText className="h-3.5 w-3.5" />
                  Create PO
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Share & controls */}
        <Card className="border-stone-200 shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-stone-900">
              <ShieldCheck className="h-4 w-4" />
              Share with control
            </div>
            <p className="mt-2 text-sm text-stone-700">
              Share to a project feed with one click; redact participants; revoke anytime.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <SoftChip color={CLAY}>Redact personal emails</SoftChip>
              <SoftChip color={OLIVE}>Audit trail</SoftChip>
              <SoftChip color={SLATE}>Share to: Project feed</SoftChip>
            </div>
          </CardContent>
        </Card>

        {/* Unified messages (email + portal) */}
        <Card className="border-stone-200 shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-stone-900">
              <Users className="h-4 w-4" />
              Unified messages
            </div>
            <p className="mt-2 text-sm text-stone-700">
              Email threads sit next to portal messages, RFIs and AI alerts — one place to collaborate.
            </p>
            <div className="mt-3 relative h-[190px] overflow-hidden rounded-lg ring-1 ring-stone-200">
              <Image
                src="/images/platform/projects/messages.png"
                alt="Project messages feed combining emails and portal threads"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

function ImpactKpis() {
  const items = [
    { label: "Emails centralised", value: "100%", accent: OLIVE },
    { label: "Response time", value: "−38%", sub: "median vs baseline", accent: OCHRE },
    { label: "Shared threads", value: "4.2x", sub: "more visibility", accent: CLAY },
    { label: "Auto actions", value: "2.8x", sub: "tasks/POs created", accent: SLATE },
  ]
  return (
    <section className="bg-white py-12 sm:py-16">
      <div className={container}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {items.map((k) => (
            <div
              key={k.label}
              className="rounded-2xl bg-white px-5 py-4 text-center shadow-[0_6px_22px_rgba(0,0,0,0.06)] ring-1"
              style={{ ringColor: "rgba(0,0,0,0.06)" as React.CSSProperties["color"] }}
            >
              <div className="text-xs font-semibold tracking-wide text-stone-600">{k.label}</div>
              <div className="mt-1 text-2xl font-semibold text-stone-900">{k.value}</div>
              {k.sub ? <div className="mt-1 text-[11px] text-stone-500">{k.sub}</div> : null}
              <div className="mx-auto mt-3 h-1.5 w-10 rounded-full" style={{ backgroundColor: k.accent }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CollaborationExplainer() {
  return (
    <section className="bg-white py-14 sm:py-20">
      <div className={container}>
        <div className="grid items-start gap-8 md:grid-cols-12">
          <div className="md:col-span-5">
            <h2 className={H2}>One hub for studio communication</h2>
            <p className={cn("mt-3", Lead)}>
              Your personal "Home inbox" stays yours. Share to the project when it matters - so teams, contractors, and
              clients stay aligned without forwarding chains.
            </p>
            <ul className="mt-6 space-y-3 text-stone-800">
              <li className="flex items-start gap-2">
                <Share2 className="mt-0.5 h-5 w-5 text-stone-900" />
                <span className="text-base">Share email threads with one click</span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="mt-0.5 h-5 w-5 text-stone-900" />
                <span className="text-base">AI extracts next actions and drafts replies</span>
              </li>
              <li className="flex items-start gap-2">
                <Link2 className="mt-0.5 h-5 w-5 text-stone-900" />
                <span className="text-base">Link messages to tasks, POs, and documents instantly</span>
              </li>
            </ul>
          </div>
          <div className="md:col-span-7">
            <Card className="overflow-hidden border-stone-200 shadow-lg">
              <CardContent className="p-0">
                <div className="grid gap-0 sm:grid-cols-2">
                  {/* Team thread mock */}
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-stone-900">Oak House • Selections</div>
                      <SoftChip color={SLATE}>Project feed</SoftChip>
                    </div>
                    <div className="mt-3 space-y-3">
                      <div className="rounded-lg bg-stone-50 p-3 ring-1 ring-stone-200">
                        <div className="text-xs text-stone-600">From: Client</div>
                        <div className="text-sm font-medium text-stone-900">
                          “Let’s go with linen on the dining chairs.”
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs">
                          <SoftChip color={CLAY}>Email</SoftChip>
                          <SoftChip color={OLIVE}>Shared</SoftChip>
                          <SoftChip color={SLATE}>Linked to task</SoftChip>
                        </div>
                      </div>
                      <div className="rounded-lg bg-stone-50 p-3 ring-1 ring-stone-200">
                        <div className="text-xs text-stone-600">From: Techstyles</div>
                        <div className="text-sm text-stone-900">
                          AI summary: Approve pendant lights; order fabric samples; confirm delivery window.
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <button className="inline-flex items-center gap-1.5 rounded-lg bg-stone-900 px-3 py-1.5 text-xs text-white hover:bg-stone-800">
                            <ClipboardList className="h-3.5 w-3.5" />
                            Assign
                          </button>
                          <button className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs text-stone-900 hover:bg-stone-50">
                            <FileText className="h-3.5 w-3.5" />
                            Create PO
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Visual feed */}
                  <div className="relative h-[340px] sm:h-full">
                    <Image
                      src="/images/platform/projects/messages.png"
                      alt="Messages feed including emails, portal messages and AI alerts"
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function AiEmailPage() {
  return (
    <main className="bg-white">
      {/* HERO */}
      <section className="relative isolate overflow-hidden pb-10 pt-12 sm:pb-12 sm:pt-16 md:pt-20">
        <FloorPlanBg mode="grid" tile={164} intensity={0.9} height="min(520px, 56vh)" fadeStop={0.5} />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 0%, rgba(75,89,96,0.08) 0%, rgba(217,213,204,0.16) 40%, transparent 70%)",
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
              Communication
            </Badge>
            <h1 className={cn("mt-4 text-center", H1)}>Unified inbox with project routing</h1>
            <p className={cn("mt-4 text-center", Lead)}>
              Fully integrated with Gmail. Route project‑specific and supplier emails into Techstyles, then share to the
              project and team with GDPR‑aware controls.
            </p>
          </div>

          {/* Hero visual */}
          <div className="mx-auto mt-8 max-w-6xl">
            <Card className="overflow-hidden border-stone-200 shadow-xl">
              <CardContent className="p-2 sm:p-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  {/* Home inbox (concept) */}
                  <div className="rounded-xl border border-stone-200 bg-white p-3">
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-2 text-sm font-semibold text-stone-900">
                        <Mail className="h-4 w-4" />
                        Home inbox
                      </div>
                      <SoftChip>Gmail connected</SoftChip>
                    </div>
                    <div className="mt-3 h-[320px] overflow-hidden rounded-lg bg-stone-50 ring-1 ring-stone-200">
                      <InboxList />
                    </div>
                  </div>

                  {/* Project messages (screenshot) */}
                  <div className="rounded-xl border border-stone-200 bg-white p-3">
                    <div className="inline-flex items-center gap-2 text-sm font-semibold text-stone-900">
                      <FolderGit2 className="h-4 w-4" />
                      Project messages
                    </div>
                    <div className="mt-3 relative h-[320px] overflow-hidden rounded-lg ring-1 ring-stone-200">
                      <Image
                        src="/images/platform/projects/messages.png"
                        alt="Project messages feed with email and portal threads"
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-white py-14 sm:py-20">
        <div className={container}>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className={H2}>Streamlined, collaborative communication</h2>
            <p className={cn("mt-3", Lead)}>
              Nothing missed. Nothing dropped. One feed for emails, portal messages, contracts and AI alerts.
            </p>
          </div>

          <div className="mx-auto mt-8 grid max-w-5xl gap-4 sm:grid-cols-3">
            <DotRow
              icon={Mail}
              title="Connect Gmail"
              desc="Secure OAuth connection; keep your personal inbox intact."
            />
            <DotRow
              icon={Sparkles}
              title="Smart routing"
              desc="Project detection by participants, subject and labels—plus vendor recognition."
            />
            <DotRow
              icon={Share2}
              title="Share with control"
              desc="Share to a project feed with one click; redact participants; revoke anytime."
            />
          </div>
        </div>
      </section>

      {/* BENTO GRID — Email Hub */}
      <CommunicationHubBento />

      {/* OUTCOMES / KPIs */}
      <ImpactKpis />

      {/* COLLABORATION EXPLAINER */}
      <CollaborationExplainer />

      {/* CTA */}
      <section className="relative isolate overflow-hidden py-20" style={{ backgroundColor: "#F1BBAA" }}>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: "url('/textures/grain.png')", backgroundSize: "200px 200px" }}
        />
        <div className={container}>
          <div className="mx-auto max-w-4xl text-center">
            <h3 className="text-2xl sm:text-[28px] md:text-[32px] font-medium tracking-tight text-stone-950">
              Email that works like your studio does
            </h3>
            <p className="mt-3 text-lg text-stone-900/80">
              Unified inbox, project routing, supplier tracking and GDPR‑aware sharing—only in Techstyles.
            </p>
            <div className="mt-6 flex justify-center">
              <CtaButton
                href="/signup"
                variant="slate"
                size="lg"
                label="Start for free"
                showArrow
                arrowVariant="white"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
