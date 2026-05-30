"use client"

import Image from "next/image"
import { CheckCircle2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

/**
 * FinanceComposite
 * - Uses the new lifestyle image as the base.
 * - Adds three small glass-morphism overlay ideas:
 *   1) Left: Paid status snippet
 *   2) Center: Revenue vs Target chart
 *   3) Right: Studio Profit KPI
 *
 * Note: Overlays use the provided Source URLs directly (as requested).
 */
export function FinanceComposite({
  className,
  ratio = "aspect-[1/1]",
}: {
  className?: string
  ratio?: string
}) {
  const t = useTranslations("visuals.finance")

  function PaidGlassButton() {
    return (
      <button
        type="button"
        className="inline-flex w-full items-center justify-center gap-2 rounded-full px-3 py-1.5 text-xs sm:text-sm font-semibold text-[#2F4D35] backdrop-blur-md"
        style={{
          backgroundColor: "rgba(255,255,255,0.25)", // lighter white-based glass
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.4), 0 8px 20px rgba(0,0,0,0.12)",
        }}
        aria-label={t("paidLabel")}
      >
        <CheckCircle2 className="h-4 w-4" />
        <span>{t("paidLabel")}</span>
      </button>
    )
  }

  return (
    <div className={cn("relative w-full", ratio, className)}>
      {/* Base lifestyle image — square to avoid top/bottom crop */}
      <Image
        src="/images/home/finance-lounge-new.png"
        alt={t("heroAlt")}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 55vw, 640px"
        className="rounded-xl object-cover"
        priority={false}
      />

      {/* Subtle vignette to lift overlays */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-xl"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 100%, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.03) 42%, rgba(0,0,0,0.01) 70%, rgba(0,0,0,0) 100%)",
        }}
      />

      {/* LEFT: Paid status snippet (swapped here, smaller) */}
      <div className="absolute left-3 bottom-3 sm:left-4 sm:bottom-4 md:left-5 md:bottom-5 z-20 w-[22%] sm:w-[20%] md:w-[18%]">
        <div className="overflow-hidden rounded-[8px] bg-white/65 backdrop-blur-md ring-1 ring-white/65 shadow-[0_8px_20px_rgba(0,0,0,0.18)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-08-10%20at%2013.23.38-Bs84CmeM1ZzZUbByqwfSAlKiunNbJZ.png"
            alt={t("paidSnippetAlt")}
            className="block h-auto w-full"
            loading="lazy"
          />
        </div>
      </div>

      {/* CENTER: Revenue vs Target chart (reduced size) */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-3 sm:bottom-4 md:bottom-5 z-20 w-[50%] sm:w-[44%] md:w-[36%]">
        <div className="overflow-hidden rounded-[8px] bg-white/60 backdrop-blur-md ring-1 ring-white/65 shadow-[0_10px_22px_rgba(0,0,0,0.18)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-08-10%20at%2013.25.15-LWPR9mXHVBRAP9BP986dbgr911OQfz.png"
            alt={t("profitKpiAlt")}
            className="block h-auto w-full"
            loading="lazy"
          />
        </div>
      </div>

      {/* RIGHT: Stack of green glass “Paid” buttons */}
      <div className="absolute right-3 bottom-3 sm:right-4 sm:bottom-4 md:right-5 md:bottom-5 z-20 w-[22%] sm:w-[20%] md:w-[18%]">
        <div className="flex flex-col gap-2">
          <PaidGlassButton />
          <PaidGlassButton />
          <PaidGlassButton />
        </div>
      </div>
    </div>
  )
}
