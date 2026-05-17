import { cn } from "@/lib/utils"
import { FloorPlanBg } from "@/components/graphics/floorplan-bg"

type LandingHeroBackgroundProps = {
  className?: string
  /** Architectural grid + room rectangles */
  showFloorPlan?: boolean
  /** Fine film grain texture */
  showGrain?: boolean
  /** Client-app dot grid (kept subtle when floor plan is on) */
  showDotGrid?: boolean
}

/**
 * Hero background: client landing clay/navy washes + marketing floor-plan grid.
 */
export function LandingHeroBackground({
  className,
  showFloorPlan = true,
  showGrain = true,
  showDotGrid = true,
}: LandingHeroBackgroundProps) {
  return (
    <div className={cn("pointer-events-none absolute inset-0", className)} aria-hidden>
      {/* Clay + navy radial washes (matches Focus-Studio client landing) */}
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(224,122,87,0.14),transparent_55%),radial-gradient(ellipse_50%_45%_at_100%_0%,rgba(15,23,42,0.06),transparent)]"
        aria-hidden
      />

      {/* Extra warm top glow — ties floor plan to terracotta brand */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, rgba(224,122,87,0.08) 0%, rgba(224,122,87,0.03) 40%, transparent 70%)",
        }}
        aria-hidden
      />

      {/* Floor-plan grid with rectangular room hints */}
      {showFloorPlan && (
        <FloorPlanBg
          mode="grid"
          tile={164}
          intensity={0.85}
          height="min(560px, 62vh)"
          fadeStop={0.55}
          className="z-[1] opacity-[0.92]"
        />
      )}

      {/* Dot grid — lighter so it does not fight the floor plan */}
      {showDotGrid && (
        <div
          className={cn(
            "absolute inset-0 z-[2]",
            showFloorPlan ? "opacity-[0.28]" : "opacity-[0.5]",
          )}
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgb(15 23 42 / 0.05) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
          aria-hidden
        />
      )}

      {/* Subtle grain for depth */}
      {showGrain && (
        <div
          className="absolute inset-0 z-[3] opacity-[0.05]"
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
