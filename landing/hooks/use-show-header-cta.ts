"use client"

import { useEffect, useState } from "react"

// Show header CTA when the target (default #overview) is mostly scrolled past.
export function useShowHeaderCta(rootId = "overview", threshold = 0.2) {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const el = document.getElementById(rootId)
    if (!el) {
      setShow(true) // if not found, show CTA
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => setShow(!entry.isIntersecting || entry.intersectionRatio < threshold),
      { threshold: [0, threshold, 0.5, 0.8, 1] },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [rootId, threshold])
  return show
}
