import { cn } from "@/lib/utils"

type Props = {
  className?: string
  height?: string
  tile?: number
  navy?: string
  clay?: string
  bone?: string
  fadeStop?: number // 0..1
  opacity?: number // overall opacity
}

/**
 * PortugueseTilesBg
 * Subtle repeating azulejo-inspired motif.
 * Navy and clay strokes on a bone base with a soft top-to-bottom fade.
 */
export function PortugueseTilesBg({
  className,
  height = "min(520px, 58vh)",
  tile = 120,
  navy = "#223040",
  clay = "#E07A57",
  bone = "#FAF7F2",
  fadeStop = 0.55,
  opacity = 0.12,
}: Props) {
  const mask = `linear-gradient(to bottom, black 0%, black ${Math.round(fadeStop * 100)}%, transparent 100%)`
  const half = tile / 2
  const quarter = tile / 4

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute left-0 right-0 top-0 -z-20", className)}
      style={{ height, maskImage: mask, WebkitMaskImage: mask, opacity }}
    >
      <svg width="100%" height="100%" preserveAspectRatio="none" className="h-full w-full">
        <defs>
          <pattern id="ts-pt-tiles" width={tile} height={tile} patternUnits="userSpaceOnUse">
            {/* Base tile */}
            <rect x="0" y="0" width={tile} height={tile} fill={bone} />
            {/* Navy frame */}
            <rect
              x="1"
              y="1"
              width={tile - 2}
              height={tile - 2}
              fill="none"
              stroke={navy}
              strokeWidth="1"
              opacity="0.5"
              vectorEffect="non-scaling-stroke"
            />
            {/* Central rosette (navy) */}
            <circle cx={half} cy={half} r={quarter * 0.6} fill="none" stroke={navy} strokeWidth="1" opacity="0.45" />
            <path
              d={`
                M ${half} ${half - quarter * 0.9} 
                L ${half + quarter * 0.35} ${half - quarter * 0.35}
                L ${half + quarter * 0.9} ${half}
                L ${half + quarter * 0.35} ${half + quarter * 0.35}
                L ${half} ${half + quarter * 0.9}
                L ${half - quarter * 0.35} ${half + quarter * 0.35}
                L ${half - quarter * 0.9} ${half}
                L ${half - quarter * 0.35} ${half - quarter * 0.35} Z
              `}
              fill="none"
              stroke={navy}
              strokeWidth="1"
              opacity="0.35"
            />
            {/* Clay dots at corners */}
            <circle cx={quarter * 0.8} cy={quarter * 0.8} r="2" fill={clay} opacity="0.7" />
            <circle cx={tile - quarter * 0.8} cy={quarter * 0.8} r="2" fill={clay} opacity="0.7" />
            <circle cx={quarter * 0.8} cy={tile - quarter * 0.8} r="2" fill={clay} opacity="0.7" />
            <circle cx={tile - quarter * 0.8} cy={tile - quarter * 0.8} r="2" fill={clay} opacity="0.7" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#ts-pt-tiles)" />
      </svg>
    </div>
  )
}
