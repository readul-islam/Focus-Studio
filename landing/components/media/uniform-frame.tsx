"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

type Props = {
  src: string
  alt: string
  width?: number
  height?: number
  priority?: boolean
  className?: string
  variant?: "framed" | "float"
}

export function UniformFrame({
  src,
  alt,
  width = 1600,
  height = 900,
  priority = false,
  className,
  variant = "framed",
}: Props) {
  const isFramed = variant === "framed"

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl",
        isFramed ? "bg-white ring-1 ring-black/5 shadow-sm p-2 sm:p-3" : "bg-transparent p-0",
        className,
      )}
    >
      <div className={cn("relative w-full", isFramed ? "rounded-lg overflow-hidden" : "rounded-xl overflow-hidden")}>
        {/* Use next/image with unoptimized to avoid remote loader config issues */}
        <Image
          src={src || "/placeholder.svg"}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          unoptimized
          className="h-auto w-full object-cover"
        />
      </div>
    </div>
  )
}
