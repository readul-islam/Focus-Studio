import { cn } from "@/lib/utils"

type HeroGridProps = {
  className?: string
  /** CSS height of the grid layer */
  height?: string
  /** 0–1: where the vertical fade begins */
  fadeStop?: number
  intensity?: number
}

/**
 * Landing hero grid — blueprint-style lines with clay accents (no floor-plan boxes).
 */
export function HeroGrid({
  className,
  height = "min(580px, 68vh)",
  fadeStop = 0.58,
  intensity = 1,
}: HeroGridProps) {
  const o = (v: number) => Math.min(1, Math.max(0, v * intensity))
  const minor = 40
  const major = minor * 4

  const mask = `linear-gradient(to bottom, black 0%, black ${Math.round(fadeStop * 100)}%, transparent 100%)`

  const clay = (alpha: number) => `rgba(224, 122, 87, ${o(alpha)})`
  const slate = (alpha: number) => `rgba(15, 23, 42, ${o(alpha)})`

  const patternId = "ts-hero-grid-pattern"

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-x-0 top-0", className)}
      style={{
        height,
        maskImage: mask,
        WebkitMaskImage: mask,
      }}
    >
      <svg
        width="100%"
        height="100%"
        preserveAspectRatio="none"
        className="h-full w-full"
        shapeRendering="geometricPrecision"
      >
        <defs>
          <pattern
            id={patternId}
            width={major}
            height={major}
            patternUnits="userSpaceOnUse"
          >
            <g fill="none" strokeLinecap="square">
              {/* Minor grid — fine blueprint lines */}
              <path
                d={`M ${minor} 0 V ${major} M ${minor * 2} 0 V ${major} M ${minor * 3} 0 V ${major}
                    M 0 ${minor} H ${major} M 0 ${minor * 2} H ${major} M 0 ${minor * 3} H ${major}`}
                stroke={slate(0.045)}
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
              {/* Major cell border */}
              <rect
                x="0"
                y="0"
                width={major}
                height={major}
                stroke={clay(0.11)}
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
              {/* Center cross — soft focal accent per major cell */}
              <path
                d={`M ${major / 2} 0 V ${major} M 0 ${major / 2} H ${major}`}
                stroke={clay(0.06)}
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
              {/* Corner registration marks (drafting style) */}
              <path
                d={`M 6 6 L 18 6 M 6 6 L 6 18
                    M ${major - 6} 6 L ${major - 18} 6 M ${major - 6} 6 L ${major - 6} 18`}
                stroke={clay(0.14)}
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
              {/* Intersection nodes on major lines */}
              <circle cx={major / 2} cy={major / 2} r="1.25" fill={clay(0.2)} />
              <circle cx={0} cy={0} r="1" fill={slate(0.08)} />
              <circle cx={major} cy={0} r="1" fill={slate(0.08)} />
            </g>
          </pattern>

          {/* Soft glow at pattern center for depth */}
          <radialGradient id="ts-hero-grid-vignette" cx="50%" cy="18%" r="70%">
            <stop offset="0%" stopColor="rgba(224, 122, 87, 0.04)" />
            <stop offset="55%" stopColor="rgba(255, 255, 255, 0)" />
          </radialGradient>
        </defs>

        <rect x="0" y="0" width="100%" height="100%" fill={`url(#${patternId})`} />
        <rect x="0" y="0" width="100%" height="100%" fill="url(#ts-hero-grid-vignette)" />
      </svg>
    </div>
  )
}
