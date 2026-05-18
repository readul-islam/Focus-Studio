"use client"

import { CalendarDays, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

type ProposalPreviewProps = {
  className?: string
  date?: string
  number?: string
  from?: {
    name: string
    address?: string
    contact?: string
  }
  to?: {
    name: string
    address?: string
    contact?: string
  }
  summary?: string
  scope?: string[]
  timeline?: { label: string; when: string }[]
}

export function ProposalPreview({
  className,
  date = "15 Aug 2025",
  number = "TS‑1184",
  from = {
    name: "Focuspilot Studio",
    address: "123 Interior Way, London",
    contact: "hello@techstyles.com · +44 20 7123 4567",
  },
  to = {
    name: "Johnson Family Trust",
    address: "Bayswater, London",
    contact: "Attn: Sarah Johnson",
  },
  summary = "We propose a modern, timeless interior for your Penthouse FF&E, balancing function and warmth. Focuspilot coordinates design, sourcing, and installation with transparent costs and clear milestones.",
  scope = [
    "Concept and material palette",
    "FF&E selection and procurement",
    "Room schedules and elevations",
    "Install coordination and snag list",
  ],
  timeline = [
    { label: "Concept", when: "Weeks 1–2" },
    { label: "Design", when: "Weeks 3–6" },
    { label: "Procure & Install", when: "Weeks 7–12" },
  ],
}: ProposalPreviewProps) {
  return (
    <article
      aria-label="Focuspilot proposal template preview"
      className={cn(
        "mx-auto w-full max-w-[720px] overflow-hidden rounded-md border border-stone-200 bg-white shadow-sm",
        // Compact default type scale for best-in-class density
        "text-[13px] leading-6 text-stone-800",
        className,
      )}
    >
      {/* Compact meta row (no colored band, minimal top padding) */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 pt-2 pb-1 text-[12px] text-stone-600">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="h-4 w-4 text-stone-500" aria-hidden="true" />
          {date}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <FileText className="h-4 w-4 text-stone-500" aria-hidden="true" />
          {"Proposal #" + number}
        </span>
      </div>

      {/* FROM / TO — simple text, no containers, smaller size */}
      <div className="grid gap-x-4 gap-y-1 px-4 pb-3 text-[12px] text-stone-700 sm:grid-cols-2">
        <div className="space-y-0.5">
          <div className="text-[10px] uppercase tracking-wide text-stone-500">From</div>
          <div className="font-semibold text-stone-900">{from.name}</div>
          {from.address ? <div>{from.address}</div> : null}
          {from.contact ? <div>{from.contact}</div> : null}
        </div>
        <div className="space-y-0.5 sm:text-right">
          <div className="text-[10px] uppercase tracking-wide text-stone-500">To</div>
          <div className="font-semibold text-stone-900">{to.name}</div>
          {to.address ? <div>{to.address}</div> : null}
          {to.contact ? <div>{to.contact}</div> : null}
        </div>
      </div>

      {/* Executive summary */}
      <section className="border-t border-stone-200 px-4 py-3">
        <h3 className="text-[16px] font-semibold leading-6 text-stone-900">Executive summary</h3>
        <p className="mt-1 text-[13px] leading-6 text-stone-700">{summary}</p>
      </section>

      {/* Scope — full width (Investment removed) */}
      <section className="border-t border-stone-200 px-4 py-3">
        <h4 className="text-[13px] font-semibold text-stone-900">Scope</h4>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {scope.map((item) => (
            <li key={item} className="text-stone-800">
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* Timeline — compact, single row on wide screens */}
      {timeline?.length ? (
        <section className="border-t border-stone-200 px-4 py-3">
          <h4 className="text-[13px] font-semibold text-stone-900">Timeline</h4>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {timeline.map((t) => (
              <div key={t.label} className="rounded-sm border border-stone-200 p-2">
                <div className="text-[10px] uppercase tracking-wide text-stone-600">{t.label}</div>
                <div className="text-[13px] text-stone-800">{t.when}</div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Footer — lean, no extra padding */}
      <div className="flex items-center justify-between gap-3 border-t border-stone-200 px-4 py-2">
        <div className="text-[12px] text-stone-600">
          By accepting, you agree to our standard terms. Questions? hello@techstyles.com
        </div>
        <button
          type="button"
          className={cn(
            "inline-flex items-center justify-center rounded-sm bg-stone-900 px-3 py-1.5",
            "text-[12px] font-semibold text-white shadow-sm ring-1 ring-inset ring-stone-900/10",
          )}
        >
          Accept proposal
        </button>
      </div>
    </article>
  )
}
