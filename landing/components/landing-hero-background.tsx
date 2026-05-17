import { cn } from "@/lib/utils"
import { HeroGrid } from "@/components/graphics/hero-grid"

type LandingHeroBackgroundProps = {
  className?: string
  showGrain?: boolean
}

/**
 * Hero background: client landing washes + blueprint-style hero grid.
 */
export function LandingHeroBackground({
  className,
  showGrain = true,
}: LandingHeroBackgroundProps) {
  return (
    <div className={cn("pointer-events-none absolute inset-0", className)} aria-hidden>
      {/* Clay + navy radial washes (matches Focus-Studio client landing) */}
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(224,122,87,0.14),transparent_55%),radial-gradient(ellipse_50%_45%_at_100%_0%,rgba(15,23,42,0.06),transparent)]"
        aria-hidden
      />

      {/* Warm top glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, rgba(224,122,87,0.08) 0%, rgba(224,122,87,0.03) 40%, transparent 70%)",
        }}
        aria-hidden
      />

      {/* Blueprint grid — terracotta major lines, fine minor grid, corner ticks */}
      <HeroGrid className="z-[1] opacity-95" intensity={0.9} />

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
