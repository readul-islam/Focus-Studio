"use client"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

/**
 * PmComposite
 * - Left calendar: unchanged size/position (bottom-left).
 * - Right AI chat: unchanged size/position (bottom-right).
 * - Task card: smaller and moved above on the right (upper-right), stacked above AI chat.
 */
export function PmComposite({
  className,
  ratio = "aspect-[1/1]",
}: {
  className?: string
  ratio?: string
}) {
  const t = useTranslations("visuals.pm")

  return (
    <div className={cn("relative w-full", ratio, className)}>
      {/* Base studio hero image */}
      <Image
        src="/images/overlays/designer-hero-new.png"
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
            "radial-gradient(120% 80% at 50% 100%, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.03) 38%, rgba(0,0,0,0.01) 70%, rgba(0,0,0,0) 100%)",
        }}
      />

      {/* LEFT: Calendar (unchanged) */}
      <div
        className={cn(
          "absolute bottom-3 sm:bottom-4 md:bottom-5 left-2 sm:left-3 md:left-5 z-20",
          "w-[24%] sm:w-[24%] md:w-[22%] lg:w-[20%]",
        )}
      >
        <div className="overflow-hidden rounded-[12px] bg-white/60 backdrop-blur-md ring-1 ring-white/65 shadow-[0_10px_24px_rgba(0,0,0,0.2)]">
          <Image
            src="/images/overlays/calendar-card.png"
            alt={t("calendarAlt")}
            width={454}
            height={432}
            sizes="(max-width: 768px) 24vw, (max-width: 1280px) 22vw, 260px"
            className="h-auto w-full"
            priority={false}
          />
        </div>
      </div>

      {/* RIGHT: AI Composer (unchanged) */}
      <div
        className={cn(
          "absolute bottom-3 sm:bottom-4 md:bottom-5 right-2 sm:right-3 md:right-5 z-20",
          "w-[30%] md:w-[30%] lg:w-[32%]",
        )}
      >
        <div className="overflow-hidden rounded-[12px] bg-white/85 backdrop-blur-md ring-1 ring-white/75 shadow-[0_10px_24px_rgba(0,0,0,0.22)]">
          <Image
            src="/images/overlays/ai-composer.png"
            alt={t("aiComposerAlt")}
            width={764}
            height={272}
            sizes="(max-width: 768px) 36vw, (max-width: 1280px) 30vw, 380px"
            className="h-auto w-full object-contain"
            priority={false}
          />
        </div>
      </div>

      {/* UPPER-RIGHT: Task card (smaller and above AI chat) */}
      <div
        className={cn(
          // Place above the AI chat on the right side
          "absolute right-2 sm:right-3 md:right-5 z-30",
          // Vertical offset to sit clearly above the AI box
          "top-[6%] sm:top-[8%] md:top-[10%]",
          // Smaller than before as requested
          "w-[26%] sm:w-[24%] md:w-[22%] lg:w-[22%]",
        )}
      >
        <div className="overflow-hidden rounded-[12px] bg-white/70 backdrop-blur-md ring-1 ring-white/70 shadow-[0_12px_26px_rgba(0,0,0,0.2)]">
          <Image
            src="/images/overlays/task-card.png"
            alt={t("taskCardAlt")}
            width={900}
            height={360}
            sizes="(max-width: 768px) 34vw, (max-width: 1280px) 24vw, 320px"
            className="h-auto w-full"
            priority={false}
          />
        </div>
      </div>
    </div>
  )
}
