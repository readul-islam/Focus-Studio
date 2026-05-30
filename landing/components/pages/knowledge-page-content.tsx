"use client"

import type React from "react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { ArrowRight, Book, FileText, Video, HelpCircle, Search, ChevronRight } from "lucide-react"
import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { MarketingPageHero } from "@/components/marketing/marketing-page-hero"

const container = "mx-auto max-w-[1200px] px-6 sm:px-8"
const TITLE_H1 = "text-[30px] sm:text-5xl md:text-[56px] font-medium tracking-tight leading-[1.1]"
const TITLE_H2 = "text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight"

const CATEGORIES = [
  { id: "gettingStarted", icon: Book, color: "#A56A52", articleKeys: ["quickStart", "accountSetup", "invitingTeam", "firstProject"] },
  { id: "features", icon: FileText, color: "#6F8B7A", articleKeys: ["projectManagement", "procurementPos", "clientPortal", "financeInvoicing"] },
  { id: "videoTutorials", icon: Video, color: "#B6893C", articleKeys: ["platformOverview", "aiFeaturesDemo", "clientPortalSetup", "xeroIntegration"] },
  { id: "faq", icon: HelpCircle, color: "#63708C", articleKeys: ["billingPricing", "dataSecurity", "integrations", "migrationHelp"] },
] as const

const RELATED_LINKS = [
  { key: "projects", href: "/platform/projects" },
  { key: "aiFeatures", href: "/platform/ai" },
  { key: "integrations", href: "/integrations" },
  { key: "pricing", href: "/pricing" },
] as const

function useReveal({ threshold = 0.12, delay = 0 } = {}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [show, setShow] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReduced) {
      setShow(true)
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setShow(true), delay)
          io.disconnect()
        }
      },
      { threshold },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold, delay])
  return { ref, show }
}

function Reveal({
  children,
  className,
  delay = 0,
  threshold = 0.12,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  threshold?: number
}) {
  const { ref, show } = useReveal({ threshold, delay })
  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out",
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function KnowledgePageContent() {
  const t = useTranslations("knowledgePage")

  return (
    <main className="bg-white">
      <MarketingPageHero contentClassName={cn(container, "pb-12 pt-12 sm:pb-16 md:pt-16")}>
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-stone-300/60 bg-white px-3 py-1 text-xs text-stone-700">
            <Book className="h-3 w-3" aria-hidden="true" />
            {t("hero.badge")}
          </span>
          <h1 className={cn("mt-5 text-center", TITLE_H1)}>{t("hero.title")}</h1>
          <p className="mt-4 text-center text-base sm:text-lg text-stone-600">{t("hero.subtitle")}</p>
          <div className="mt-8 mx-auto max-w-lg">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" aria-hidden="true" />
              <input
                type="search"
                placeholder={t("hero.searchPlaceholder")}
                className="w-full rounded-lg border border-stone-200 bg-white py-3 pl-12 pr-4 text-stone-900 placeholder:text-stone-400 focus:border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-200"
              />
            </div>
          </div>
        </Reveal>
      </MarketingPageHero>

      <section className="bg-stone-50 py-16 sm:py-20">
        <div className={container}>
          <div className="grid gap-6 sm:grid-cols-2">
            {CATEGORIES.map((category, index) => {
              const Icon = category.icon
              return (
                <Reveal key={category.id} delay={index * 50}>
                  <Card className="h-full border-stone-200 bg-white transition-all hover:shadow-md">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg p-2.5" style={{ backgroundColor: `${category.color}15` }}>
                          <Icon className="h-5 w-5" style={{ color: category.color }} aria-hidden="true" />
                        </div>
                        <div>
                          <h2 className="font-medium text-stone-900">{t(`categories.${category.id}.title`)}</h2>
                          <p className="text-sm text-stone-500">{t(`categories.${category.id}.description`)}</p>
                        </div>
                      </div>
                      <ul className="mt-5 space-y-3">
                        {category.articleKeys.map((articleKey) => (
                          <li key={articleKey}>
                            <button className="group flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors hover:bg-stone-50">
                              <span className="text-sm text-stone-700 group-hover:text-stone-900">
                                {t(`categories.${category.id}.articles.${articleKey}.title`)}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-stone-400">
                                  {t(`categories.${category.id}.articles.${articleKey}.time`)}
                                </span>
                                <ChevronRight
                                  className="h-4 w-4 text-stone-400 transition-transform group-hover:translate-x-0.5 group-hover:text-stone-600"
                                  aria-hidden="true"
                                />
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className={container}>
          <Reveal>
            <div className="mx-auto max-w-2xl rounded-2xl bg-stone-50 border border-stone-200 p-8 sm:p-10 text-center">
              <HelpCircle className="mx-auto h-10 w-10 text-stone-400" aria-hidden="true" />
              <h2 className="mt-4 text-xl sm:text-2xl font-medium text-stone-900">{t("support.title")}</h2>
              <p className="mt-2 text-stone-600">{t("support.subtitle")}</p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-stone-800"
                >
                  {t("support.contactSupport")}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/changelog"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-stone-200 bg-white px-5 py-2.5 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50"
                >
                  {t("support.viewChangelog")}
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-stone-50 py-16 sm:py-20">
        <div className={container}>
          <div className="mx-auto max-w-4xl">
            <Reveal>
              <h2 className={cn(TITLE_H2, "text-center text-stone-900")}>{t("relatedLinks.title")}</h2>
              <p className="mt-3 text-center text-stone-600">{t("relatedLinks.subtitle")}</p>
            </Reveal>
            <Reveal delay={100}>
              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {RELATED_LINKS.map(({ key, href }) => (
                  <Link
                    key={key}
                    href={href}
                    className="group rounded-xl border border-stone-200 bg-white p-5 transition-all hover:border-stone-300 hover:shadow-md"
                  >
                    <h3 className="font-semibold text-stone-900 group-hover:text-stone-700">
                      {t(`relatedLinks.${key}.title`)}
                    </h3>
                    <p className="mt-1 text-sm text-stone-600">{t(`relatedLinks.${key}.desc`)}</p>
                  </Link>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </main>
  )
}
