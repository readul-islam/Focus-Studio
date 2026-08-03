"use client"

import { usePathname } from "next/navigation"

export function CanonicalTag() {
  const pathname = usePathname()
  const cleanPath = pathname === "/" ? "" : pathname
  const canonicalUrl = `https://focuspilot.io${cleanPath}`

  return <link rel="canonical" href={canonicalUrl} />
}
