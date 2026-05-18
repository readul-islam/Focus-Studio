"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type ProductVideoProps = {
  src: string
  poster?: string
  className?: string
  // Tailwind aspect ratio class, e.g. "aspect-[16/9]"
  aspectClassName?: string
  // If true, show native controls
  controls?: boolean
  // Start/stop playback when scrolled into view
  autoPlayWhenInView?: boolean
}

export function ProductVideo({
  src,
  poster,
  className,
  aspectClassName = "aspect-[16/9]",
  controls = false,
  autoPlayWhenInView = true,
}: ProductVideoProps) {
  const videoRef = React.useRef<HTMLVideoElement | null>(null)
  const [canPlay, setCanPlay] = React.useState(false)
  const [errored, setErrored] = React.useState(false)

  React.useEffect(() => {
    if (!autoPlayWhenInView) return
    const el = videoRef.current
    if (!el) return

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!el) return
          if (e.isIntersecting) {
            // Autoplay attempts are allowed if muted + playsInline
            el.play().catch(() => {
              // If autoplay is blocked, we just keep it paused
            })
          } else {
            el.pause()
          }
        })
      },
      { threshold: 0.35 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [autoPlayWhenInView])

  return (
    <div className={cn("relative w-full overflow-hidden rounded-xl", aspectClassName)}>
      {/* Skeleton/placeholder layer when video not ready */}
      {!canPlay && !errored ? <div className="absolute inset-0 animate-pulse rounded-xl bg-stone-100" /> : null}

      <video
        ref={videoRef}
        className={cn("h-full w-full rounded-xl object-cover", className)}
        poster={poster}
        muted
        playsInline
        loop
        autoPlay
        controls={controls}
        preload="metadata"
        onCanPlay={() => setCanPlay(true)}
        onError={() => setErrored(true)}
      >
        <source src={src} type="video/mp4" />
        {/* Fallback text for older browsers */}
        {"Your browser does not support the video tag."}
      </video>

      {/* Poster-only fallback if video errors */}
      {errored && poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={poster || "/placeholder.svg"}
          alt="Focuspilot product demo video preview showing interior design software interface"
          className="absolute inset-0 h-full w-full rounded-xl object-cover"
        />
      ) : null}
    </div>
  )
}
