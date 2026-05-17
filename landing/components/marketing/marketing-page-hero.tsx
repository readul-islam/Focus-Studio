import type { ReactNode } from "react"
import { LandingHeroBackground } from "@/components/landing-hero-background"
import { cn } from "@/lib/utils"

type MarketingPageHeroProps = {
  children: ReactNode
  className?: string
  contentClassName?: string
  gridHeight?: string
  gridFadeStop?: number
  id?: string
}

/**
 * Centered marketing hero shell — landing/blog blueprint grid + clay gradient motion.
 */
export function MarketingPageHero({
  children,
  className,
  contentClassName,
  gridHeight = "min(420px, 50vh)",
  gridFadeStop = 0.58,
  id,
}: MarketingPageHeroProps) {
  return (
    <section id={id} className={cn("relative isolate overflow-hidden bg-stone-50", className)}>
      <LandingHeroBackground gridHeight={gridHeight} gridFadeStop={gridFadeStop} />
      <div className={cn("relative z-10", contentClassName)}>{children}</div>
    </section>
  )
}
