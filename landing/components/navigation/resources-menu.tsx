"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import * as LucideReact from "lucide-react"
import { notifyNavOpen, subscribeNavOpen } from "@/lib/nav-bus"

const links = [
  { label: "Blog", href: "/blog", icon: LucideReact.BookOpen, desc: "Ideas and studio workflows." },
  { label: "Customer stories", href: "#stories", icon: LucideReact.Users, desc: "Studios shipping great work." },
  { label: "Knowledge Centre", href: "/knowledge", icon: LucideReact.FileText, desc: "Guides & how‑tos." },
  { label: "Changelog", href: "/changelog", icon: LucideReact.Megaphone, desc: "What we ship, every week." },
  { label: "Templates", href: "/resources/templates", icon: LucideReact.Stars, desc: "Plug‑and‑play docs." },
  {
    label: "AI Playbook",
    href: "/resources/ai-playbook",
    icon: LucideReact.Sparkles,
    desc: "Use AI across your studio.",
  },
]

export function ResourcesMenu() {
  const [open, setOpen] = React.useState(false)
  const [panelTop, setPanelTop] = React.useState<number>(64)
  const MENU_ID = "resources"

  const updateTop = React.useCallback(() => {
    const header = document.querySelector("header")
    const rect = header?.getBoundingClientRect()
    setPanelTop(rect ? Math.max(56, Math.round(rect.bottom)) : 64)
  }, [])

  React.useEffect(() => {
    if (!open) return
    updateTop()
    const onResize = () => updateTop()
    const onScroll = () => updateTop()
    window.addEventListener("resize", onResize)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("resize", onResize)
      window.removeEventListener("scroll", onScroll)
    }
  }, [open, updateTop])

  React.useEffect(() => {
    const unsub = subscribeNavOpen((id) => {
      if (id && id !== MENU_ID) setOpen(false)
    })
    return unsub
  }, [])

  React.useEffect(() => {
    if (open) notifyNavOpen(MENU_ID)
  }, [open])

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    function onClick(e: MouseEvent) {
      const panel = document.getElementById("resources-menu-panel")
      const trigger = document.getElementById("resources-trigger")
      if (panel && panel.contains(e.target as Node)) return
      if (trigger && trigger.contains(e.target as Node)) return
      setOpen(false)
    }
    if (open) {
      window.addEventListener("keydown", onKey)
      window.addEventListener("click", onClick)
    }
    return () => {
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("click", onClick)
    }
  }, [open])

  return (
    <div className="relative">
      <button
        id="resources-trigger"
        type="button"
        className={cn(
          "inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm transition-colors",
          open
            ? "bg-stone-900 text-white"
            : "text-stone-700 hover:text-stone-900 hover:bg-stone-100 focus-visible:bg-stone-100",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-300",
        )}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((s) => !s)}
        onMouseEnter={() => setOpen(true)}
      >
        Resources
        <svg
          aria-hidden="true"
          className={cn("h-4 w-4 transition-transform", open ? "rotate-180" : "rotate-0")}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" />
        </svg>
      </button>

      <div
        id="resources-menu-panel"
        className={cn(
          "fixed left-1/2 z-50 mt-0 w-[min(720px,92vw)] -translate-x-1/2",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
          "transition-opacity",
        )}
        style={{ top: panelTop }}
        role="menu"
        aria-label="Resources"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <div className="rounded-2xl border border-stone-200 bg-white p-3 shadow-xl ring-1 ring-black/5">
          <ul className="grid gap-1 sm:grid-cols-2">
            {links.map((l) => {
              const Icon = l.icon
              return (
                <li key={l.label}>
                  <Link href={l.href} className="group flex items-start gap-3 rounded-lg px-3 py-2 hover:bg-stone-50">
                    <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-stone-100 text-stone-900 ring-1 ring-stone-200">
                      {Icon ? <Icon className="h-4 w-4" /> : null}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-stone-900 group-hover:underline">{l.label}</span>
                      <span className="block text-xs text-stone-600">{l.desc}</span>
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}
