"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight, Tag, ShieldCheck, Mail, X } from "lucide-react"

export function SaleBanner() {
  const [dismissed, setDismissed] = React.useState(false)

  if (dismissed) return null

  return (
    <div className="relative bg-gradient-to-r from-amber-950 via-stone-900 to-amber-950 text-stone-100 border-b border-amber-500/20 text-xs sm:text-sm py-2 px-4 shadow-md transition-all">
      <div className="mx-auto max-w-[1200px] flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        {/* Left Side: Notice & Badges */}
        <div className="flex flex-wrap items-center gap-2 font-medium">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-amber-300 font-semibold border border-amber-500/30 tracking-wide text-[11px] sm:text-xs uppercase">
            <Tag className="h-3 w-3 text-amber-400 animate-pulse" />
            FOR SALE
          </span>
          <span>
            This Website, Domain, LinkedIn Page & Social Assets are listed for acquisition on{" "}
            <a
              href="https://sedo.com/search/?keyword=focuspilot"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-300 font-semibold underline decoration-amber-400/50 hover:text-amber-200 transition-colors"
            >
              Sedo.com
            </a>
          </span>
          <span className="hidden md:inline-flex items-center gap-1 text-emerald-400 text-xs">
            <ShieldCheck className="h-3.5 w-3.5" /> 100% Escrow Protected
          </span>
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-3 ml-auto sm:ml-0">
          <Link
            href="/sale"
            className="inline-flex items-center gap-1.5 font-semibold text-amber-300 hover:text-amber-200 transition-colors underline hover:no-underline"
          >
            <span>View Sale Package</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <a
            href="mailto:dev.hero.us@gmail.com?subject=Inquiry%20about%20Focuspilot%20Domain%20%26%20Website%20Acquisition"
            className="hidden sm:inline-flex items-center gap-1 rounded bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold px-2.5 py-1 text-xs transition-colors"
          >
            <Mail className="h-3 w-3" />
            <span>dev.hero.us@gmail.com</span>
          </a>
          <button
            onClick={() => setDismissed(true)}
            className="text-stone-400 hover:text-stone-200 p-0.5 rounded transition-colors ml-1"
            title="Dismiss notice"
            aria-label="Dismiss notice"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
