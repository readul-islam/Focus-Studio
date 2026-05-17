"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import * as LucideReact from "lucide-react"
import { notifyNavOpen, subscribeNavOpen } from "@/lib/nav-bus"

type Item = {
  label: string
  href: string
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>
  desc?: string
}

type Column = {
  heading: string
  href?: string
  items: Item[]
}

/* Palette accents for the 3 columns */
const PALETTE = {
  clay: "#E07A57", // Brand clay 500 (Core workflows)
  emerald: "#166534", // Dark emerald (Studio operations)
  slate: "#4B5960", // Slate 700 (Key features)
} as const

function hexToRgba(hex: string, alpha = 1) {
  const h = hex.replace("#", "")
  const r = Number.parseInt(h.substring(0, 2), 16)
  const g = Number.parseInt(h.substring(2, 4), 16)
  const b = Number.parseInt(h.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const coreColumns: Column[] = [
  {
    heading: "Core workflows",
    href: "/platform",
    items: [
      {
        label: "Project management",
        href: "/platform/projects",
        icon: LucideReact.ClipboardList,
        desc: "Phases, tasks, timelines",
      },
      {
        label: "Procurement",
        href: "/platform/procurement",
        icon: LucideReact.ShoppingCart,
        desc: "Sourcing, POs, tracking",
      },
      {
        label: "Finance",
        href: "/platform/finance",
        icon: LucideReact.CreditCard,
        desc: "Proposals, invoices, payments",
      },
      {
        label: "Client portal",
        href: "/platform/client-portal",
        icon: LucideReact.Users,
        desc: "Approvals, files, messaging",
      },
      { label: "CRM", href: "/platform/crm", icon: LucideReact.Building2, desc: "Lead → project pipeline" },
    ],
  },
  {
    heading: "Studio operations",
    href: "/platform/projects",
    items: [
      {
        label: "Scheduling & installs",
        href: "/platform/projects",
        icon: LucideReact.CalendarCheck,
        desc: "Project timelines and installation scheduling",
      },
      {
        label: "Resource planning",
        href: "/platform/crm",
        icon: LucideReact.Boxes,
        desc: "Team allocation and capacity management",
      },
      {
        label: "Vendor & deliveries",
        href: "/platform/procurement",
        icon: LucideReact.Truck,
        desc: "Supplier management and delivery tracking",
      },
      {
        label: "Docs & templates",
        href: "/platform/features/library",
        icon: LucideReact.FileText,
        desc: "Document library and project templates",
      },
    ],
  },
  {
    heading: "Key features",
    href: "/platform/features",
    items: [
      {
        label: "Communication",
        href: "/platform/features/ai-email",
        icon: LucideReact.Mail,
        desc: "Unified inbox with project routing",
      },
      {
        label: "Approvals",
        href: "/platform/features/approvals",
        icon: LucideReact.CheckCircle2,
        desc: "Client sign-off and decision tracking",
      },
      {
        label: "AI Product Procurement",
        href: "/platform/features/ai-procurement",
        icon: LucideReact.Sparkles,
        desc: "Web clipper with instant AI extraction",
      },
      {
        label: "Product Library",
        href: "/platform/features/library",
        icon: LucideReact.Library,
        desc: "Centralized product database with AI sourcing",
      },
      {
        label: "Proposals & invoices",
        href: "/platform/features/invoicing",
        icon: LucideReact.FileText,
        desc: "AI proposals and automated billing",
      },
    ],
  },
]

function VisualPromo({
  title,
  desc,
  href,
  img,
  accent,
}: {
  title: string
  desc: string
  href: string
  img: string
  accent: string
}) {
  const bar = hexToRgba(accent, 0.85)
  return (
    <Link
      href={href}
      className={cn(
        "group relative block overflow-hidden rounded-2xl border border-stone-200 bg-white",
        "ring-1 ring-black/0 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-black/5",
      )}
    >
      {/* Accent bar at top */}
      <div className="absolute left-0 right-0 top-0 h-1.5" style={{ backgroundColor: bar }} aria-hidden />
      {/* Image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={img || "/placeholder.svg?height=220&width=400"}
        alt={`${title} - ${desc}`}
        className="h-32 w-full object-cover sm:h-36 md:h-40"
        loading="lazy"
      />
      {/* Content */}
      <div className="flex items-start gap-3 p-4">
        <div
          className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-lg ring-1"
          style={{
            backgroundColor: hexToRgba(accent, 0.12),
            color: accent,
            boxShadow: `inset 0 0 0 1px ${hexToRgba(accent, 0.28)}`,
          }}
        >
          <LucideReact.ArrowRight className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-stone-900">
            <span className="truncate text-sm font-semibold">{title}</span>
            <LucideReact.ArrowRight
              className="h-4 w-4 text-stone-600 transition group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </div>
          <p className="mt-1 line-clamp-2 text-xs text-stone-700">{desc}</p>
        </div>
      </div>
    </Link>
  )
}

export function MegaNavPlatform() {
  const [open, setOpen] = React.useState(false)
  const [panelTop, setPanelTop] = React.useState<number>(64)
  const MENU_ID = "platform"

  const updateTop = React.useCallback(() => {
    const header = document.querySelector("header")
    const rect = header?.getBoundingClientRect()
    setPanelTop(rect ? Math.max(56, Math.round(rect.bottom)) : 64)
  }, [])

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
      const panel = document.getElementById("platform-panel")
      const trigger = document.getElementById("platform-trigger")
      if (panel && panel.contains(e.target as Node)) return
      if (trigger && trigger.contains(e.target as Node)) return
      setOpen(false)
    }
    if (open) {
      window.addEventListener("keydown", onKey)
      window.addEventListener("click", onClick)
      updateTop()
      const onResize = () => updateTop()
      const onScroll = () => updateTop()
      window.addEventListener("resize", onResize)
      window.addEventListener("scroll", onScroll, { passive: true })
      return () => {
        window.removeEventListener("keydown", onKey)
        window.removeEventListener("click", onClick)
        window.removeEventListener("resize", onResize)
        window.removeEventListener("scroll", onScroll)
      }
    }
  }, [open, updateTop])

  const colAccents = [PALETTE.clay, PALETTE.emerald, PALETTE.slate]

  return (
    <div className="relative">
      <button
        id="platform-trigger"
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
        Platform
        <svg
          aria-hidden="true"
          className={cn("h-4 w-4 transition-transform", open ? "rotate-180" : "rotate-0")}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" />
        </svg>
      </button>

      {/* Centered panel */}
      <div
        id="platform-panel"
        className={cn(
          "fixed left-1/2 z-50 mt-0 w-[min(1100px,92vw)] -translate-x-1/2",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
          "transition-opacity",
        )}
        style={{ top: panelTop }}
        role="menu"
        aria-label="Platform"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <div className="rounded-3xl border border-stone-200 bg-white p-4 shadow-xl ring-1 ring-black/5">
          {/* Columns */}
          <div className="grid gap-6 md:grid-cols-3">
            {coreColumns.map((col, idx) => {
              const color = colAccents[idx % colAccents.length]
              const chipBg = hexToRgba(color, 0.14)
              const chipRing = hexToRgba(color, 0.32)
              return (
                <div key={col.heading}>
                  <div className="mb-3 flex items-center justify-between">
                    <Link
                      href={col.href || "#"}
                      className="text-base font-semibold tracking-tight text-stone-950 hover:underline"
                    >
                      {col.heading}
                    </Link>
                    <LucideReact.ArrowRight className="h-4 w-4" style={{ color }} aria-hidden="true" />
                  </div>
                  <ul className="space-y-2">
                    {col.items.map((it) => {
                      const Icon = it.icon
                      return (
                        <li key={it.label}>
                          <Link
                            href={it.href}
                            className="group flex items-start gap-3 rounded-lg px-2 py-2 hover:bg-stone-50"
                          >
                            <span
                              className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-lg ring-[1px]"
                              style={
                                {
                                  backgroundColor: chipBg,
                                  color,
                                  ringColor: chipRing,
                                  boxShadow: `inset 0 0 0 1px ${chipRing}`,
                                } as React.CSSProperties
                              }
                            >
                              {Icon ? <Icon className="h-4 w-4" /> : null}
                            </span>
                            <span className="min-w-0">
                              <span className="block text-sm font-medium text-stone-900 group-hover:underline">
                                {it.label}
                              </span>
                              {it.desc ? <span className="block text-xs text-stone-600">{it.desc}</span> : null}
                            </span>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )
            })}
          </div>

          {/* Visual promos with images */}
          <div className="mt-5 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <VisualPromo
              title="Platform overview"
              desc="Connect leads, projects, procurement and billing in one calm workspace."
              href="/platform/projects"
              img="/images/platform/projects/overview-hero.png"
              accent={PALETTE.clay}
            />
            <VisualPromo
              title="Product tour"
              desc="Take a quick guided tour of the UI—see how studios run projects end‑to‑end."
              href="/tour"
              img="/images/ui-hero-dashboard.png"
              accent={PALETTE.emerald}
            />
            <VisualPromo
              title="What's new"
              desc="See recently shipped features and what's coming next."
              href="/"
              img="/images/app/dashboard-hero.png"
              accent={PALETTE.slate}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
