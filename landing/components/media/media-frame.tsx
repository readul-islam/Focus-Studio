"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

type Variant = "framed" | "float"

type MediaFrameProps = {
  src: string
  alt: string
  ratio?: "16/9" | "4/3" | "3/2" | "21/9"
  sizes?: string
  priority?: boolean
  className?: string
  variant?: Variant
}

/**
 * MediaFrame
 * - Enforces consistent frame, radius, ring, and shadow across all screenshots.
 * - No inner image rounding; outer shape controls the silhouette.
 * - Use variant="float" to drop the white container and let the image sit on the section.
 */
export function MediaFrame({
  src,
  alt,
  ratio = "16/9",
  sizes = "(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1200px",
  priority = false,
  className,
  variant = "framed",
}: MediaFrameProps) {
  const aspectClass =
    ratio === "16/9"
      ? "aspect-[16/9]"
      : ratio === "4/3"
        ? "aspect-[4/3]"
        : ratio === "3/2"
          ? "aspect-[3/2]"
          : "aspect-[21/9]"

  if (variant === "float") {
    return (
      <div className={cn("relative overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/5", aspectClass, className)}>
        <Image
          src={src || "/placeholder.svg"}
          alt={alt}
          fill
          sizes={sizes}
          className="object-cover"
          priority={priority}
        />
      </div>
    )
  }

  // framed (default)
  return (
    <div
      className={cn(
        "overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-lg",
        "ring-1 ring-black/0",
        className,
      )}
    >
      <div className={cn("relative w-full", aspectClass)}>
        <Image
          src={src || "/placeholder.svg"}
          alt={alt}
          fill
          sizes={sizes}
          className="object-cover"
          priority={priority}
        />
      </div>
    </div>
  )
}
