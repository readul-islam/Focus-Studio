import { cn } from "@/lib/utils"
import { HeroGrid } from "@/components/graphics/hero-grid"

type LandingHeroBackgroundProps = {
  className?: string
  showGrain?: boolean
  /** CSS height for the blueprint grid layer */
  gridHeight?: string
  gridFadeStop?: number
}

/**
 * Hero background: clay gradient washes (subtle motion) + blueprint-style hero grid.
 * Shared by the marketing home hero and blog hero.
 */
export function LandingHeroBackground({
  className,
  showGrain = true,
  gridHeight = "min(580px, 68vh)",
  gridFadeStop = 0.58,
}: LandingHeroBackgroundProps) {
  return (
    <div className={cn("pointer-events-none absolute inset-0", className)} aria-hidden>
      {/* Static base washes */}
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(224,122,87,0.14),transparent_55%),radial-gradient(ellipse_50%_45%_at_100%_0%,rgba(15,23,42,0.06),transparent)]"
        aria-hidden
      />

      {/* Animated clay center glow */}
      <div
        className="absolute inset-0 motion-safe:animate-[landing-hero-glow_14s_ease-in-out_infinite_alternate]"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 8%, rgba(224, 122, 87, 0.16) 0%, rgba(224, 122, 87, 0.05) 45%, transparent 72%)",
        }}
        aria-hidden
      />

      {/* Animated warm top + corner accent */}
      <div
        className="absolute inset-0 motion-safe:animate-[landing-hero-glow-alt_18s_ease-in-out_infinite_alternate]"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, rgba(224, 122, 87, 0.1) 0%, rgba(224, 122, 87, 0.03) 40%, transparent 70%), radial-gradient(ellipse 45% 40% at 95% 5%, rgba(15, 23, 42, 0.07) 0%, transparent 55%)",
        }}
        aria-hidden
      />

      {/* Blueprint grid — terracotta major lines, fine minor grid, corner ticks */}
      <HeroGrid
        className="z-[1] opacity-95"
        intensity={0.9}
        height={gridHeight}
        fadeStop={gridFadeStop}
      />

      {/* Subtle grain */}
      {showGrain && (
        <div
          className="absolute inset-0 z-[2] opacity-[0.05]"
          style={{
            backgroundImage: "url('/textures/grain.png')",
            backgroundSize: "200px 200px",
          }}
          aria-hidden
        />
      )}
    </div>
  )
}
