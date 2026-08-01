"use client"

import Link from "next/link"
import { Tag, ShieldCheck, Mail, ExternalLink, ArrowRight } from "lucide-react"

export function BlogSaleBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-950 via-stone-900 to-amber-950 text-stone-100 p-5 sm:p-6 border border-amber-500/30 shadow-lg my-6">
      <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
        <ShieldCheck className="h-40 w-40 text-amber-400" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-0.5 text-amber-300 font-semibold text-xs border border-amber-500/30 uppercase tracking-wider">
              <Tag className="h-3 w-3 text-amber-400 animate-pulse" />
              FOR SALE
            </span>
            <span className="text-xs text-emerald-400 font-medium inline-flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> 100% Sedo Escrow Protected
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Focuspilot Domain, Website Codebase & Social Media Assets Are For Sale
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-stone-300 leading-relaxed">
            Acquire the premium domain name, complete Next.js 14 codebase, official LinkedIn page, and Facebook page via safe escrow transfer on Sedo.com.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            href="/sale"
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-4 py-2.5 text-xs sm:text-sm transition-all shadow-md hover:scale-[1.02]"
          >
            <span>View Sale Package</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <a
            href="https://sedo.com/search/?keyword=focuspilot"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-100 font-semibold px-4 py-2.5 text-xs sm:text-sm border border-stone-700 hover:border-amber-500/40 transition-all"
          >
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Buy on Sedo</span>
            <ExternalLink className="h-3.5 w-3.5 text-stone-400" />
          </a>

          <a
            href="mailto:dev.hero.us@gmail.com?subject=Inquiry%20Regarding%20Focuspilot%20Domain%20%26%20Website%20Sale"
            className="hidden lg:inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 hover:text-amber-200 underline"
          >
            <Mail className="h-3.5 w-3.5" />
            <span>dev.hero.us@gmail.com</span>
          </a>
        </div>
      </div>
    </div>
  )
}
