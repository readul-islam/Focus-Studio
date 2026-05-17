import { cn } from '@/lib/utils'

type Props = {
  className?: string
  tile?: number // px size of each tile repeat
  intensity?: number // scales line opacity
  showBaseGrid?: boolean
  height?: string // CSS height for the background container
  fadeStop?: number // 0..1 mask stop before fading
  mode?: 'grid' | 'rooms' // grid = orthogonal squares; rooms = decorative walls
}

/**
 * FloorPlanBg
 * - "grid" mode: clean, orthogonal square/rectangular grid with major/minor lines.
 * - "rooms" mode: decorative rectilinear "walls" (previous behavior).
 * - Uses non-scaling strokes for crispness and a top-to-bottom fade mask.
 */
export function FloorPlanBg({
  className,
  tile = 160,
  intensity = 1,
  showBaseGrid = true,
  height = 'min(520px, 60vh)',
  fadeStop = 0.52,
  mode = 'grid',
}: Props) {
  const o = (v: number) => Math.min(1, Math.max(0, v * intensity))
  const mask = `linear-gradient(to bottom, black 0%, black ${Math.round(
    fadeStop * 100
  )}%, transparent 100%)`

  // Pre-calc common positions (quarters) for neat squares/rectangles
  const q1 = tile * 0.25
  const q2 = tile * 0.5
  const q3 = tile * 0.75

  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute left-0 right-0 top-0 -z-20', className)}
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
        shapeRendering="crispEdges"
      >
        <defs>
          <pattern
            id="ts-floorplan-grid"
            width={tile}
            height={tile}
            patternUnits="userSpaceOnUse"
          >
            <g fill="none">
              {/* Base tile outline */}
              {showBaseGrid && (
                <rect
                  x="0"
                  y="0"
                  width={tile}
                  height={tile}
                  stroke={`rgba(28,25,23,${o(0.12)})`}
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                />
              )}

              {mode === 'grid' ? (
                <>
                  {/* Minor grid at quarters (very faint) */}
                  <path
                    d={`M ${q1} 0 V ${tile} M ${q3} 0 V ${tile} M 0 ${q1} H ${tile} M 0 ${q3} H ${tile}`}
                    stroke={`rgba(28,25,23,${o(0.10)})`}
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                  {/* Major grid at halves (slightly stronger) */}
                  <path
                    d={`M ${q2} 0 V ${tile} M 0 ${q2} H ${tile}`}
                    stroke={`rgba(28,25,23,${o(0.18)})`}
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                  {/* Optional "room" hints: light rectangles aligned to grid, no overlap */}
                  <rect
                    x={q1}
                    y={q1}
                    width={q2}
                    height={q2}
                    stroke={`rgba(28,25,23,${o(0.20)})`}
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                  <rect
                    x={0}
                    y={q2}
                    width={q1}
                    height={q1}
                    stroke={`rgba(28,25,23,${o(0.16)})`}
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                  <rect
                    x={q3}
                    y={0}
                    width={tile - q3}
                    height={q1}
                    stroke={`rgba(28,25,23,${o(0.16)})`}
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                </>
              ) : (
                <>
                  {/* Decorative "rooms" mode (previous rectilinear motif) */}
                  {/* Crosshair grid */}
                  {showBaseGrid && (
                    <path
                      d={`M ${q2} 0 V ${tile} M 0 ${q2} H ${tile}`}
                      stroke={`rgba(28,25,23,${o(0.12)})`}
                      strokeWidth="1"
                      vectorEffect="non-scaling-stroke"
                    />
                  )}
                  {/* Walls */}
                  <path
                    d={`M ${tile * 0.12} ${tile * 0.12} H ${tile * 0.78} M ${tile * 0.12} ${tile * 0.12} V ${tile * 0.44}`}
                    stroke={`rgba(28,25,23,${o(0.24)})`}
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                  <path
                    d={`M ${tile * 0.38} ${tile * 0.36} H ${tile * 0.92} M ${tile * 0.38} ${tile * 0.36} V ${tile * 0.88}`}
                    stroke={`rgba(28,25,23,${o(0.22)})`}
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                  <path
                    d={`M ${tile * 0.88} ${tile * 0.88} H ${tile * 0.28} M ${tile * 0.88} ${tile * 0.88} V ${tile * 0.54}`}
                    stroke={`rgba(28,25,23,${o(0.20)})`}
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                </>
              )}
            </g>
          </pattern>
        </defs>

        <rect x="0" y="0" width="100%" height="100%" fill="url(#ts-floorplan-grid)" opacity={0.75} />
      </svg>
    </div>
  )
}
