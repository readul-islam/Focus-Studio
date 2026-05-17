import type React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Sparkles, Mail, FileText, CheckCircle2, ListChecks, Library, CreditCard, ArrowRight } from "lucide-react"
import { CtaButton } from "@/components/cta-button"

// Brand palette (pick exact values below after review)
const CLAY_600 = "#CE6B4E"
const CLAY_500 = "#E07A57"
const CLAY_400 = "#E68E71"
const CLAY_200 = "#F1BBAA"
const CLAY_50 = "#FBEAE1"

const SAGE_500 = "#8FA58F"
const SAGE_300 = "#B9C7B7"
const OLIVE_600 = "#6E7A58"
const OCHRE_500 = "#C78A3B"
const SLATE_700 = "#4B5960"

const INK = "#1F1D1A"
const INK_MUTED = "#4E4943"

// Final CTA defaults (please confirm your choices)
const CTA_BG = SAGE_300
const CTA_TEXT = INK

export const metadata: Metadata = {
  title: "AI for Interior Design Studios | Automation & Intelligence | Techstyles",
  description:
    "AI that handles the busywork: draft emails, extract product specs, generate proposals, summarise client threads. Reduce admin time by 70%. See all AI features.",
  alternates: { canonical: "https://techstyles.ai/platform/ai" },
  openGraph: {
    title: "AI for Interior Design Studios | Automation & Intelligence | Techstyles",
    description: "AI that handles the busywork: draft emails, extract product specs, generate proposals, summarise client threads. Reduce admin time by 70%.",
    url: "https://techstyles.ai/platform/ai",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI for Interior Design Studios | Automation & Intelligence | Techstyles",
    description: "AI that handles the busywork: draft emails, extract product specs, generate proposals, summarise client threads. Reduce admin time by 70%.",
  },
}

// Reuse KPI look & feel from Procurement (same structure and styles)
function Kpi({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div
      className="flex flex-col h-full rounded-2xl bg-white px-5 py-4 text-center shadow-[0_6px_22px_rgba(0,0,0,0.06)] ring-1"
      style={{ ringColor: "rgba(0,0,0,0.06)" as React.CSSProperties["color"] }}
    >
      <div className="text-xs font-semibold tracking-wide" style={{ color: "#7D786C" }}>
        {label}
      </div>
      <div className="flex-1 mt-1 text-2xl font-semibold text-stone-900">{value}</div>
      <div className="mx-auto mt-3 h-1.5 w-10 rounded-full" style={{ backgroundColor: accent }} />
    </div>
  )
}

// Small helper for colored category pills in the bento tiles
function Pill({
  color,
  text,
  icon: Icon,
}: {
  color: string
  text: string
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>
}) {
  const bg = `color-mix(in oklab, ${color} 18%, white)`
  const ring = `color-mix(in oklab, ${color} 26%, transparent)`
  const textColor = color // strong text/icon
  return (
    <span
      className="inline-flex items-center gap-2 rounded-md px-2.5 py-1 text-xs font-medium ring-1"
      style={{ backgroundColor: bg, color: textColor, boxShadow: `inset 0 0 0 1px ${ring}` }}
    >
      {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
      {text}
    </span>
  )
}

export default function AIPage() {
  return (
    <main className="bg-white">
      {/* HERO — clay tints to match brand palette (full‑bleed background, inner max width like other pages) */}
      <section className="relative isolate overflow-hidden" aria-labelledby="ai-hero-title">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background: `linear-gradient(180deg, ${CLAY_50} 0%, ${CLAY_200} 44%, #ffffff 100%)`,
          }}
          aria-hidden
        />
        {/* Grain (subtle) */}
        <div
          className="absolute inset-0 -z-10 opacity-[0.06]"
          style={{ backgroundImage: "url('/textures/grain.png')", backgroundSize: "200px 200px" }}
          aria-hidden
        />
        <div className="mx-auto max-w-[1200px] px-6 sm:px-8 pb-10 pt-8 sm:pb-16 sm:pt-12 md:pt-16">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-stone-700 ring-1 ring-stone-200 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" style={{ color: INK_MUTED }} />
              AI built for interior designers
            </div>
            <h1
              id="ai-hero-title"
              className="mt-5 text-[30px] sm:text-5xl md:text-[56px] font-medium tracking-tight leading-[1.1] text-stone-950"
            >
              AI Features for Interior Design Studios
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-stone-700 sm:text-lg">
              Trim the admin, keep momentum with clients, and protect your creative time. From smarter inbox triage to
              instant product data and faster billing — AI is woven through your workflows.
            </p>

            {/* KPIs — identical UI to Procurement page */}
            <dl className="mx-auto mt-8 max-w-4xl">
              <div className="mx-auto grid grid-cols-3 gap-3 sm:gap-4">
                <Kpi label="Busywork reduced" value="Up to 70%" accent={SAGE_500} />
                <Kpi label="Reply time" value="3× faster" accent={OCHRE_500} />
                <Kpi label="Spec confidence" value="High" accent={CLAY_500} />
              </div>
            </dl>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/platform/features/ai-email"
                className="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-4 py-2.5 text-white transition hover:-translate-y-0.5 hover:bg-stone-900/90"
              >
                Explore AI in Communication
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/platform/procurement"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-stone-900 ring-1 ring-stone-200 transition hover:-translate-y-0.5 hover:bg-stone-50"
              >
                See AI in Procurement
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CAPABILITIES BENTO — colored category pills and icons */}
      <section aria-labelledby="ai-capabilities" className="mx-auto max-w-[1200px] px-6 sm:px-8 py-12 md:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2
            id="ai-capabilities"
            className="text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight text-stone-950"
          >
            What AI does across Techstyles
          </h2>
          <p className="mt-3 text-base text-stone-700">
            AI shows up where it saves you time — not where it adds noise. Here's how it supports your day‑to‑day.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Inbox triage */}
          <article className="group relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-5 ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md">
            <Pill color={CLAY_500} text="Communication" icon={Mail} />
            <h3 className="mt-3 text-base font-semibold text-stone-950">Inbox triage & smart routing</h3>
            <p className="mt-2 text-sm text-stone-700">
              Auto‑tag messages by project, detect intent, and highlight approvals or decision blockers — so the right
              items surface first.
            </p>
            <div className="mt-3 text-sm">
              <Link
                href="/platform/features/ai-email"
                className="inline-flex items-center gap-1 text-stone-900 underline decoration-stone-300 underline-offset-4 hover:decoration-stone-500"
              >
                See AI in the inbox <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </article>

          {/* Draft replies */}
          <article className="group relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-5 ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md">
            <Pill color={OCHRE_500} text="Composer" icon={Sparkles} />
            <h3 className="mt-3 text-base font-semibold text-stone-950">Draft replies in your tone</h3>
            <p className="mt-2 text-sm text-stone-700">
              Generate clear, on‑brand drafts with context from the thread and project — ready for your personal touch.
            </p>
          </article>

          {/* Product/spec extraction */}
          <article className="group relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-5 ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md">
            <Pill color={SAGE_500} text="Procurement" icon={Library} />
            <h3 className="mt-3 text-base font-semibold text-stone-950">Extract product details instantly</h3>
            <p className="mt-2 text-sm text-stone-700">
              Pull specs, dimensions, and finish options from vendor pages and files; create clean line items without
              copy‑paste.
            </p>
            <div className="mt-3 text-sm">
              <Link
                href="/platform/procurement"
                className="inline-flex items-center gap-1 text-stone-900 underline decoration-stone-300 underline-offset-4 hover:decoration-stone-500"
              >
                See AI in Procurement <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </article>

          {/* Approvals assistance */}
          <article className="group relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-5 ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md">
            <Pill color={OLIVE_600} text="Client portal" icon={CheckCircle2} />
            <h3 className="mt-3 text-base font-semibold text-stone-950">Clear choices, fewer back‑and‑forths</h3>
            <p className="mt-2 text-sm text-stone-700">
              Summaries that explain trade‑offs, suggested phrasing for clients, and automatic status updates on
              approve/decline.
            </p>
            <div className="mt-3 text-sm">
              <Link
                href="/platform/client-portal"
                className="inline-flex items-center gap-1 text-stone-900 underline decoration-stone-300 underline-offset-4 hover:decoration-stone-500"
              >
                Client portal overview <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </article>

          {/* Thread summaries */}
          <article className="group relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-5 ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md">
            <Pill color={SLATE_700} text="Summaries" icon={ListChecks} />
            <h3 className="mt-3 text-base font-semibold text-stone-950">One‑glance threads and next steps</h3>
            <p className="mt-2 text-sm text-stone-700">
              Condense long email chains into who said what, decisions made, and clear action items for the team.
            </p>
          </article>

          {/* Proposals & invoices */}
          <article className="group relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-5 ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md">
            <Pill color={OCHRE_500} text="Docs" icon={FileText} />
            <h3 className="mt-3 text-base font-semibold text-stone-950">Faster proposals and invoices</h3>
            <p className="mt-2 text-sm text-stone-700">
              Turn selections into clean proposals, and proposals into invoices with smart line‑item checks and totals.
            </p>
            <div className="mt-3 text-sm">
              <Link
                href="/platform/finance"
                className="inline-flex items-center gap-1 text-stone-900 underline decoration-stone-300 underline-offset-4 hover:decoration-stone-500"
              >
                See Finance features <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </article>
        </div>
      </section>

      {/* HOW IT WORKS (unchanged structure) */}
      <section aria-labelledby="how-it-works" className="border-t border-stone-200 bg-stone-50/50">
        <div className="mx-auto max-w-[1200px] px-6 sm:px-8 py-12 md:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <h2
              id="how-it-works"
              className="text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight text-stone-950"
            >
              How it works
            </h2>
            <p className="mt-3 text-base text-stone-700">
              Context is the magic. AI understands your projects, selections, and client history to make better
              suggestions.
            </p>
          </div>
          <ol className="mx-auto mt-8 grid max-w-5xl gap-4 sm:grid-cols-3">
            <li className="rounded-2xl bg-white p-5 ring-1 ring-stone-200">
              <div className="text-xs font-semibold uppercase tracking-wide text-stone-600">1. Understand</div>
              <p className="mt-2 text-sm text-stone-700">
                Pulls context from messages, selections, specs, and status — never just a generic prompt.
              </p>
            </li>
            <li className="rounded-2xl bg-white p-5 ring-1 ring-stone-200">
              <div className="text-xs font-semibold uppercase tracking-wide text-stone-600">2. Suggest</div>
              <p className="mt-2 text-sm text-stone-700">
                Offers drafts, summaries, and structured line items you can accept or tweak.
              </p>
            </li>
            <li className="rounded-2xl bg-white p-5 ring-1 ring-stone-200">
              <div className="text-xs font-semibold uppercase tracking-wide text-stone-600">3. Apply</div>
              <p className="mt-2 text-sm text-stone-700">
                Updates tasks, approvals, proposals, and invoices automatically when you confirm.
              </p>
            </li>
          </ol>
        </div>
      </section>

      {/* VALUE */}
      <section aria-labelledby="value" className="mx-auto max-w-[1200px] px-6 sm:px-8 py-12 md:py-16">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div>
            <h2 id="value" className="text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight text-stone-950">
              Less admin. More design.
            </h2>
            <p className="mt-3 text-base text-stone-700">
              Studios use Techstyles AI to keep projects moving: respond faster, get specs right the first time, and
              turn decisions into clean paperwork in minutes.
            </p>
            <ul className="mt-4 space-y-2 text-stone-800">
              <li className="flex items-start gap-2">
                <Sparkles className="mt-0.5 h-4 w-4" style={{ color: CLAY_600 }} />
                <span>On‑brand replies and summaries that feel human.</span>
              </li>
              <li className="flex items-start gap-2">
                <Library className="mt-0.5 h-4 w-4" style={{ color: SAGE_500 }} />
                <span>Accurate product data from links, PDFs, and images.</span>
              </li>
              <li className="flex items-start gap-2">
                <CreditCard className="mt-0.5 h-4 w-4" style={{ color: OCHRE_500 }} />
                <span>Proposals and invoices drafted from your selections.</span>
              </li>
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/platform"
                className="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-4 py-2.5 text-white transition hover:-translate-y-0.5 hover:bg-stone-900/90"
              >
                Explore the platform
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/platform/client-portal"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-stone-900 ring-1 ring-stone-200 transition hover:-translate-y-0.5 hover:bg-stone-50"
              >
                See the Client portal
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <Image
            src="/images/ai/less-admin.png"
            width={640}
            height={640}
            alt="Interior design team collaborating at studio workspace with pendant lighting and modern decor - Techstyles AI reduces admin work"
            className="mx-auto w-full max-w-2xl aspect-square rounded-2xl border border-stone-200 bg-white object-cover shadow-sm"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 640px"
            loading="lazy"
          />
        </div>
      </section>

      {/* FULL‑BLEED FINAL CTA (matches global pattern; change CTA_BG/CTA_TEXT above to your chosen palette) */}
      <section className="relative isolate overflow-hidden py-24" aria-labelledby="cta-ai">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: "url('/textures/grain.png')", backgroundSize: "200px 200px" }}
        />
        <div className="absolute inset-0 -z-10" style={{ backgroundColor: CTA_BG }} aria-hidden />
        <div className="mx-auto max-w-[1200px] px-6 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2
              id="cta-ai"
              className="text-2xl sm:text-[28px] md:text-[32px] font-medium tracking-tight"
              style={{ color: CTA_TEXT }}
            >
              Deliver beautiful projects with less effort
            </h2>
            <p className="mt-3 text-base sm:text-lg" style={{ color: `${CTA_TEXT}CC` }}>
              AI in Techstyles keeps clients aligned and paperwork in sync — so your best work ships sooner.
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
            <p className="mt-3 text-xs sm:text-sm" style={{ color: `${CTA_TEXT}99` }}>No credit card required</p>
          </div>
        </div>
      </section>
    </main>
  )
}
