"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import * as LucideReact from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { CtaButton } from "@/components/cta-button"
import { cn } from "@/lib/utils"
import { LandingHeroBackground } from "@/components/landing-hero-background"
import { UniformFrame } from "@/components/media/uniform-frame"
import { BreadcrumbSchema, usePlatformBreadcrumbs } from "@/components/seo/breadcrumb-schema"
import { useTranslations } from "next-intl"

const container = "mx-auto max-w-[1200px] px-6 sm:px-8"
const H1 = "text-[30px] sm:text-5xl md:text-[56px] font-medium tracking-tight leading-[1.1]"
const Lead = "text-base sm:text-lg text-stone-600"
const H2 = "text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight text-stone-950"

const FRAME_VARIANT: "framed" | "float" = "framed"

const TAB_CONFIG = [
  { id: "overview", icon: LucideReact.ClipboardList },
  { id: "tasks", icon: LucideReact.ClipboardList },
  { id: "calendar", icon: LucideReact.CalendarDays },
  { id: "messages", icon: LucideReact.FileText },
  { id: "docs", icon: LucideReact.FileText },
  { id: "procurement", icon: LucideReact.ShoppingCart },
  { id: "finance", icon: LucideReact.CreditCard },
  { id: "contractors", icon: LucideReact.Users },
] as const

type SectionId = (typeof TAB_CONFIG)[number]["id"]

const SECTION_TINTS: Record<SectionId, string> = {
  overview: "#FBEAE1",
  tasks: "#F2F6F0",
  calendar: "#EAEFF3",
  messages: "#F6EFEA",
  docs: "#FAF7F2",
  procurement: "#EFEAE2",
  finance: "#ECF3EC",
  contractors: "#FBEAE1",
}

const SECTION_LAYOUT: Record<
  SectionId,
  {
    reverse: boolean
    textCols: string
    imageCols: string
    image: { src: string; width: number; height: number; priority?: boolean }
    bulletKeys: readonly string[]
  }
> = {
  overview: {
    reverse: false,
    textCols: "md:col-span-5",
    imageCols: "md:col-span-7",
    image: { src: "/images/platform/projects/project-overview-detailed.png", width: 1600, height: 900 },
    bulletKeys: ["kpis", "timeline", "deepDive"],
  },
  tasks: {
    reverse: true,
    textCols: "md:col-span-6 md:order-2",
    imageCols: "md:col-span-6 md:order-1",
    image: { src: "/images/platform/projects/tasks-board.png", width: 1600, height: 900 },
    bulletKeys: ["phaseBoards", "reminders", "aiSuggestions"],
  },
  calendar: {
    reverse: false,
    textCols: "md:col-span-6",
    imageCols: "md:col-span-6",
    image: { src: "/images/platform/projects/calendar.png", width: 1600, height: 900 },
    bulletKeys: ["studioView", "attendees", "sync"],
  },
  messages: {
    reverse: true,
    textCols: "md:col-span-6 md:order-2",
    imageCols: "md:col-span-6 md:order-1",
    image: { src: "/images/screenshot-202025-08-10-20at-2009.png", width: 1600, height: 900 },
    bulletKeys: ["inbox", "attachments", "actionFilter"],
  },
  docs: {
    reverse: false,
    textCols: "md:col-span-5",
    imageCols: "md:col-span-7",
    image: { src: "/images/platform/projects/docs-updated.png", width: 1600, height: 900 },
    bulletKeys: ["templates", "uploads", "recent"],
  },
  procurement: {
    reverse: false,
    textCols: "md:col-span-6",
    imageCols: "md:col-span-6",
    image: { src: "/images/platform/projects/procurement-table.png", width: 1600, height: 900 },
    bulletKeys: ["totals", "pos", "clientViews"],
  },
  finance: {
    reverse: true,
    textCols: "md:col-span-6 md:order-2",
    imageCols: "md:col-span-6 md:order-1",
    image: { src: "/images/screenshot-202025-08-10-20at-2008.png", width: 1600, height: 900 },
    bulletKeys: ["tracking", "filters", "sync"],
  },
  contractors: {
    reverse: false,
    textCols: "md:col-span-6",
    imageCols: "md:col-span-6",
    image: { src: "/images/platform/projects/client-portal-overview.png", width: 1600, height: 900 },
    bulletKeys: ["rfi", "schedule", "shareItems"],
  },
}

const FAQ_KEYS = ["vsAsana", "procurement", "clientApprovals", "smallStudios"] as const

const RELATED_LINKS = [
  { key: "procurement", href: "/platform/procurement", icon: LucideReact.ShoppingCart },
  { key: "finance", href: "/platform/finance", icon: LucideReact.CreditCard },
  { key: "clientPortal", href: "/platform/client-portal", icon: LucideReact.Users },
  { key: "pricing", href: "/pricing", icon: LucideReact.Sparkles },
] as const

function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0])
  useEffect(() => {
    const observers: IntersectionObserver[] = []
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (!el) return
      const io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(id)
        },
        { rootMargin: "-40% 0px -55% 0px", threshold: [0, 0.1, 0.5, 1] },
      )
      io.observe(el)
      observers.push(io)
    })
    return () => observers.forEach((o) => o.disconnect())
  }, [ids])
  return active
}

function StickyTabs({ active }: { active: string }) {
  const t = useTranslations("platformProjects.tabs")

  const handleTabClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault()
    const element = document.getElementById(targetId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  return (
    <nav
      className="sticky top-[64px] z-40 -mx-6 border-b border-stone-200 bg-white/70 px-6 py-2 backdrop-blur md:top-[68px] lg:top-[72px]"
      aria-label={t("navAria")}
    >
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-center gap-2">
        {TAB_CONFIG.map((tab) => {
          const Icon = tab.icon
          const isActive = active === tab.id
          const label = t(tab.id)
          return (
            <a
              key={tab.id}
              href={`#${tab.id}`}
              onClick={(e) => handleTabClick(e, tab.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition",
                isActive ? "bg-stone-900 text-white" : "text-stone-700 hover:text-stone-900 hover:bg-stone-100",
              )}
              aria-current={isActive ? "page" : undefined}
              aria-label={t("sectionAria", { label })}
            >
              <Icon className={isActive ? "h-4 w-4 text-white" : "h-4 w-4 text-stone-700"} aria-hidden="true" />
              <span>{label}</span>
            </a>
          )
        })}
      </div>
    </nav>
  )
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-stone-800">
      <LucideReact.CheckCircle2 className="mt-0.5 h-5 w-5 text-stone-900" aria-hidden="true" />
      <span className="text-base">{children}</span>
    </li>
  )
}

function SectionWrapper({
  id,
  activeId,
  tintHex,
  children,
}: {
  id: string
  activeId: string
  tintHex: string
  children: React.ReactNode
}) {
  const isActive = activeId === id
  return (
    <section
      id={id}
      className="transition-colors duration-500"
      style={{ backgroundColor: isActive ? tintHex : "#FFFFFF" }}
      aria-current={isActive ? "true" : undefined}
      aria-labelledby={`${id}-heading`}
    >
      {children}
    </section>
  )
}

function ProjectSection({ id, activeId }: { id: SectionId; activeId: string }) {
  const t = useTranslations("platformProjects.sections")
  const layout = SECTION_LAYOUT[id]

  return (
    <SectionWrapper id={id} activeId={activeId} tintHex={SECTION_TINTS[id]}>
      <div className={cn(container, "py-14 sm:py-20")}>
        <div className="grid items-start gap-10 md:grid-cols-12">
          <div className={layout.textCols}>
            <h2 id={`${id}-heading`} className={H2}>
              {t(`${id}.title`)}
            </h2>
            <p className={cn("mt-3", Lead)}>{t(`${id}.description`)}</p>
            <ul className="mt-6 space-y-3">
              {layout.bulletKeys.map((key) => (
                <Bullet key={key}>{t(`${id}.bullets.${key}`)}</Bullet>
              ))}
            </ul>
            {id === "contractors" ? (
              <div className="mt-6 flex flex-wrap gap-3">
                <CtaButton
                  href="/signup"
                  variant="slate"
                  label={t("contractors.inviteContractor")}
                  showArrow
                  arrowVariant="white"
                />
                <CtaButton href="/platform/procurement#library" variant="white" label={t("contractors.shareItem")} />
              </div>
            ) : null}
          </div>
          <div className={layout.imageCols}>
            <UniformFrame
              src={layout.image.src}
              alt={t(`${id}.imageAlt`)}
              width={layout.image.width}
              height={layout.image.height}
              priority={layout.image.priority}
              variant={FRAME_VARIANT}
            />
          </div>
        </div>
      </div>
    </SectionWrapper>
  )
}

export function ProjectsPageContent() {
  const t = useTranslations("platformProjects")
  const ts = useTranslations("platformShared")
  const sectionIds = TAB_CONFIG.map((tab) => tab.id)
  const active = useActiveSection(sectionIds)
  const breadcrumbs = usePlatformBreadcrumbs("projects")

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />

      <main className="bg-white">
        <section className="relative isolate overflow-hidden bg-stone-50">
          <LandingHeroBackground gridHeight="min(520px, 58vh)" gridFadeStop={0.58} />
          <div className={cn(container, "relative z-10 pb-10 pt-10 sm:pb-14 sm:pt-12 md:pt-16")}>
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="outline" className="rounded-full border-stone-300 bg-stone-50 text-stone-700">
                {t("hero.badge")}
              </Badge>
              <h1 className={cn("mt-4 text-left sm:text-center", H1)}>{t("hero.title")}</h1>
              <p className={cn("mt-4 text-left", Lead)}>{t("hero.subtitle")}</p>
              <p className="mt-3 text-left sm:text-center text-sm text-stone-500">{t("hero.note")}</p>
            </div>

            <div className="mx-auto mt-8 max-w-6xl">
              <UniformFrame
                src="/images/platform/projects/overview-hero.png"
                alt={t("hero.imageAlt")}
                width={1600}
                height={900}
                priority={true}
                variant={FRAME_VARIANT}
              />
            </div>
          </div>
        </section>

        <StickyTabs active={active} />

        {TAB_CONFIG.map((tab) => (
          <ProjectSection key={tab.id} id={tab.id} activeId={active} />
        ))}

        <section className="bg-stone-50 py-16 sm:py-20">
          <div className={container}>
            <div className="mx-auto max-w-3xl">
              <h2 className={cn("text-center", H2)}>{t("faq.title")}</h2>
              <p className="mt-3 text-center text-stone-600">{t("faq.subtitle")}</p>
              <div className="mt-10 space-y-6">
                {FAQ_KEYS.map((key) => (
                  <div key={key} className="rounded-lg border border-stone-200 bg-white p-6">
                    <h3 className="text-lg font-semibold text-stone-900">{t(`faq.items.${key}.question`)}</h3>
                    <p className="mt-2 text-stone-600">{t(`faq.items.${key}.answer`)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-stone-50 py-16 sm:py-20">
          <div className={container}>
            <div className="mx-auto max-w-4xl">
              <h2 className="text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight text-center text-stone-900">
                {t("relatedLinks.title")}
              </h2>
              <p className="mt-3 text-center text-stone-600">{t("relatedLinks.subtitle")}</p>
              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {RELATED_LINKS.map((link) => {
                  const Icon = link.icon
                  return (
                    <Link
                      key={link.key}
                      href={link.href}
                      className="group rounded-xl border border-stone-200 bg-white p-5 transition-all hover:border-stone-300 hover:shadow-md"
                    >
                      <Icon className="h-6 w-6 text-stone-600 group-hover:text-stone-900" />
                      <h3 className="mt-3 font-semibold text-stone-900">{t(`relatedLinks.${link.key}.title`)}</h3>
                      <p className="mt-1 text-sm text-stone-600">{t(`relatedLinks.${link.key}.desc`)}</p>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        <section
          className="relative isolate overflow-hidden py-24"
          style={{ backgroundColor: "#F1BBAA" }}
          aria-labelledby="cta-projects"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06]"
            style={{ backgroundImage: "url('/textures/grain.png')", backgroundSize: "200px 200px" }}
          />
          <div className={container}>
            <div className="mx-auto max-w-3xl text-center">
              <h2 id="cta-projects" className="text-2xl sm:text-[28px] md:text-[32px] font-medium tracking-tight text-stone-950">
                {t("finalCta.title")}
              </h2>
              <p className="mt-3 text-lg text-stone-900/80">{t("finalCta.subtitle")}</p>
              <div className="mt-8 flex justify-center">
                <CtaButton href="/signup" variant="slate" label={ts("startForFree")} showArrow arrowVariant="white" />
              </div>
              <p className="mt-3 text-xs sm:text-sm text-stone-900/60">{ts("noCreditCardRequired")}</p>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
