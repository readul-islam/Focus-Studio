"use client"

import type React from "react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { Star, Quote } from "lucide-react"
import { useTranslations } from "next-intl"
import { CtaButton } from "@/components/cta-button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { MarketingPageHero } from "@/components/marketing/marketing-page-hero"

const container = "mx-auto max-w-[1200px] px-6 sm:px-8"
const TITLE_H1 = "text-[30px] sm:text-5xl md:text-[56px] font-medium tracking-tight leading-[1.1]"

const TESTIMONIAL_KEYS = [
  "sarahMitchell",
  "jamesChen",
  "emmaWilliams",
  "marcusThompson",
  "lisaPark",
  "davidOkonkwo",
] as const

const STAT_ITEMS = [
  { value: "500+", labelKey: "designStudios" },
  { value: "10hrs", labelKey: "savedPerWeek" },
  { value: "4.9/5", labelKey: "averageRating" },
  { value: "98%", labelKey: "retentionRate" },
] as const

const RELATED_LINKS = [
  { key: "projects", href: "/platform/projects" },
  { key: "clientPortal", href: "/platform/client-portal" },
  { key: "aiFeatures", href: "/platform/ai" },
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

export function CustomersPageContent() {
  const t = useTranslations("customersPage")
  const ts = useTranslations("platformShared")

  return (
    <main className="bg-white">
      <MarketingPageHero contentClassName={cn(container, "pb-12 pt-12 sm:pb-16 md:pt-16")}>
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-stone-300/60 bg-white px-3 py-1 text-xs text-stone-700">
            <Quote className="h-3 w-3" aria-hidden="true" />
            {t("hero.badge")}
          </span>
          <h1 className={cn("mt-5 text-center", TITLE_H1)}>{t("hero.title")}</h1>
          <p className="mt-4 text-center text-base sm:text-lg text-stone-600">{t("hero.subtitle")}</p>
        </Reveal>
      </MarketingPageHero>

      <section className="bg-stone-50 py-12 sm:py-16">
        <div className={container}>
          <Reveal>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              {STAT_ITEMS.map((stat) => (
                <div key={stat.labelKey} className="text-center">
                  <div className="text-3xl sm:text-4xl font-semibold text-stone-900">{stat.value}</div>
                  <div className="mt-1 text-sm text-stone-600">{t(`stats.${stat.labelKey}`)}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className={container}>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIAL_KEYS.map((key, index) => (
              <Reveal key={key} delay={index * 50}>
                <Card className="h-full border-stone-200 transition-all hover:shadow-md">
                  <CardContent className="flex h-full flex-col p-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="mb-3 inline-flex w-fit items-center rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700">
                      {t(`testimonials.${key}.highlight`)}
                    </span>
                    <blockquote className="flex-1 text-stone-700">&ldquo;{t(`testimonials.${key}.quote`)}&rdquo;</blockquote>
                    <div className="mt-6 flex items-center gap-3 border-t border-stone-100 pt-4">
                      <div className="h-10 w-10 rounded-full bg-stone-200" />
                      <div>
                        <div className="font-medium text-stone-900">{t(`testimonials.${key}.author`)}</div>
                        <div className="text-sm text-stone-500">
                          {t(`testimonials.${key}.role`)}, {t(`testimonials.${key}.company`)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-stone-50 py-16 sm:py-20">
        <div className={container}>
          <div className="mx-auto max-w-4xl">
            <Reveal>
              <h2 className="text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight text-center text-stone-900">
                {t("relatedLinks.title")}
              </h2>
              <p className="mt-3 text-center text-stone-600">{t("relatedLinks.subtitle")}</p>
            </Reveal>
            <Reveal delay={100}>
              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {RELATED_LINKS.map((link) => (
                  <Link
                    key={link.key}
                    href={link.href}
                    className="group rounded-xl border border-stone-200 bg-white p-5 transition-all hover:border-stone-300 hover:shadow-md"
                  >
                    <h3 className="font-semibold text-stone-900 group-hover:text-stone-700">
                      {t(`relatedLinks.${link.key}.title`)}
                    </h3>
                    <p className="mt-1 text-sm text-stone-600">{t(`relatedLinks.${link.key}.desc`)}</p>
                  </Link>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section
        aria-label={t("finalCta.ariaLabel")}
        className="relative isolate overflow-hidden py-24 text-stone-100"
        style={{ backgroundColor: "#3F4B51" }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: "url('/textures/grain.png')", backgroundSize: "200px 200px" }}
        />
        <div className={container}>
          <Reveal className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl sm:text-[28px] md:text-[32px] font-medium tracking-tight">{t("finalCta.title")}</h2>
            <p className="mt-3 text-base sm:text-lg text-stone-300">{t("finalCta.subtitle")}</p>
            <div className="mt-8 flex items-center justify-center">
              <CtaButton href="/signup" variant="white" label={ts("startForFree")} showArrow arrowVariant="black" />
            </div>
            <p className="mt-3 text-xs sm:text-sm text-stone-400">{ts("noCreditCardRequired")}</p>
          </Reveal>
        </div>
      </section>
    </main>
  )
}
