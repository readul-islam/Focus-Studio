"use client"

import type React from "react"
import Image from "next/image"
import { useEffect, useMemo, useRef, useState } from "react"
import {
  FileText,
  Mail,
  FilePenLine as Pipeline,
  Users,
  Wand2,
  CheckCircle2,
  FolderOpen,
  Sparkles,
  Brain,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { CtaButton } from "@/components/cta-button"
import { cn } from "@/lib/utils"
import { MarketingPageHero } from "@/components/marketing/marketing-page-hero"
import { BreadcrumbSchema, usePlatformBreadcrumbs } from "@/components/seo/breadcrumb-schema"

const container = "mx-auto max-w-[1200px] px-6 sm:px-8"
const TITLE_H1 = "text-[30px] sm:text-5xl md:text-[56px] font-medium tracking-tight leading-[1.1]"
const TITLE_H2 = "text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight"

const FEATURE_ROWS = [
  {
    id: "leads",
    icon: Mail,
    flip: false,
    bulletKeys: ["inbox", "statuses", "bulkImport"] as const,
    image: {
      src: "/images/platform/crm/leads-table.png",
      width: 1600,
      height: 650,
      sizes: "(max-width: 768px) 100vw, (max-width: 1280px) 60vw, 960px",
    },
  },
  {
    id: "pipeline",
    icon: Pipeline,
    flip: true,
    bulletKeys: ["forecast", "dragDrop", "views"] as const,
    image: { src: "/images/platform/crm/pipeline-board.png", width: 1600, height: 760 },
  },
  {
    id: "contacts",
    icon: Users,
    flip: false,
    bulletKeys: ["types", "profiles", "bulkActions"] as const,
    image: { src: "/images/platform/crm/contacts-table.png", width: 1600, height: 640 },
  },
  {
    id: "proposals",
    icon: Brain,
    flip: true,
    bulletKeys: ["scopeDefinition", "pricing", "milestones", "pdf"] as const,
    image: { src: "/images/platform/crm/ai-proposal-pricing.png", width: 1600, height: 400 },
    tinted: true,
  },
] as const

const ONBOARDING_STEPS = [
  { key: "createProject", icon: FolderOpen, color: "#A56A52" },
  { key: "inviteStakeholders", icon: Users, color: "#6F8B7A" },
  { key: "seedDetails", icon: FileText, color: "#B6893C" },
  { key: "automations", icon: Wand2, color: "#A56A52" },
] as const

const FAQ_KEYS = ["vsHubspot", "proposals", "projectIntegration", "leadSources"] as const
const SCOPE_BULLET_KEYS = ["enhancement", "formatting", "templates"] as const

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

function FeatureRow({
  featureId,
  icon: Icon,
  flip,
  bulletKeys,
  image,
  tinted,
}: {
  featureId: (typeof FEATURE_ROWS)[number]["id"]
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>
  flip: boolean
  bulletKeys: readonly string[]
  image: { src: string; width: number; height: number; sizes?: string }
  tinted?: boolean
}) {
  const t = useTranslations("platformCRM")

  return (
    <section id={featureId} className={cn("py-14 sm:py-18", tinted ? "bg-[#E7DFD8]" : "bg-white")}>
      <div className={container}>
        <div className={cn("grid items-center md:grid-cols-12", "gap-10 lg:gap-14")}>
          <div className={cn("md:col-span-6", flip ? "md:order-2" : "md:order-1")}>
            <Reveal className="mx-auto max-w-xl">
              <div className="inline-flex items-center gap-2 text-sm font-medium text-stone-900">
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span>{t("featureLabel")}</span>
              </div>
              <h2 className={cn("mt-2", TITLE_H2)}>{t(`features.${featureId}.title`)}</h2>
              <p className="mt-3 text-stone-700">{t(`features.${featureId}.body`)}</p>
              <ul className="mt-5 space-y-3">
                {bulletKeys.map((key) => (
                  <li key={key} className="flex items-start gap-3 text-stone-800">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-stone-900" />
                    <span className="text-base">{t(`features.${featureId}.bullets.${key}`)}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <div className={cn("md:col-span-6", flip ? "md:order-1" : "md:order-2")}>
            <Reveal>
              <Card className="overflow-hidden border-stone-200 shadow-lg">
                <CardContent className="p-0">
                  <div className="relative w-full">
                    <Image
                      src={image.src}
                      alt={t(`features.${featureId}.imageAlt`)}
                      width={image.width}
                      height={image.height}
                      className="h-auto w-full rounded-lg bg-stone-50 object-cover"
                      sizes={image.sizes || "(max-width: 768px) 100vw, (max-width: 1280px) 60vw, 960px"}
                      priority={false}
                    />
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}

export function CrmPageContent() {
  const t = useTranslations("platformCRM")
  const ts = useTranslations("platformShared")
  const breadcrumbs = usePlatformBreadcrumbs("crm")

  const faqSchema = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ_KEYS.map((key) => ({
        "@type": "Question",
        name: t(`faq.items.${key}.question`),
        acceptedAnswer: {
          "@type": "Answer",
          text: t(`faq.items.${key}.answer`),
        },
      })),
    }),
    [t],
  )

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <main className="bg-white">
        <MarketingPageHero
          id="overview"
          gridHeight="min(520px, 58vh)"
          contentClassName={cn(container, "pb-12 pt-12 sm:pb-16 md:pt-16")}
        >
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center rounded-full border border-stone-300/60 bg-white px-3 py-1 text-xs text-stone-700">
              {t("hero.badge")}
            </span>
            <h1 className={cn("mt-5 text-center", TITLE_H1)}>{t("hero.title")}</h1>
            <p className="mt-4 text-center text-base sm:text-lg text-stone-600">{t("hero.subtitle")}</p>
            <p className="mt-3 text-center text-sm text-stone-500">{t("hero.note")}</p>
            <div className="mx-auto mt-6 flex justify-center gap-3">
              <CtaButton href="#pipeline" variant="slate" label={t("hero.seePipeline")} />
              <CtaButton href="#leads" variant="grey" label={t("hero.manageLeads")} />
            </div>
          </Reveal>
        </MarketingPageHero>

        {FEATURE_ROWS.map((row) => (
          <FeatureRow
            key={row.id}
            featureId={row.id}
            icon={row.icon}
            flip={row.flip}
            bulletKeys={row.bulletKeys}
            image={row.image}
            tinted={"tinted" in row && row.tinted}
          />
        ))}

        <section className="bg-stone-50 py-16 sm:py-20">
          <div className={container}>
            <Reveal className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center gap-2 text-sm font-medium text-stone-900">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                <span>{t("aiProposal.badge")}</span>
              </div>
              <h2 className="mt-2 text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight">
                {t("aiProposal.title")}
              </h2>
              <p className="mt-3 text-stone-700">{t("aiProposal.subtitle")}</p>
            </Reveal>

            <div className="mt-12 grid gap-8 lg:grid-cols-2">
              <Reveal>
                <Card className="overflow-hidden border-stone-200 shadow-lg">
                  <CardContent className="p-0">
                    <Image
                      src="/images/platform/crm/ai-scope-definition.png"
                      alt={t("aiProposal.scopeImageAlt")}
                      width={1200}
                      height={800}
                      className="h-auto w-full bg-stone-50 object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 600px"
                    />
                  </CardContent>
                </Card>
              </Reveal>

              <Reveal delay={200}>
                <div className="flex h-full flex-col justify-center">
                  <h3 className="text-2xl font-semibold tracking-tight">{t("aiProposal.scopeTitle")}</h3>
                  <p className="mt-3 text-stone-700">{t("aiProposal.scopeDescription")}</p>
                  <ul className="mt-6 space-y-3">
                    {SCOPE_BULLET_KEYS.map((key) => (
                      <li key={key} className="flex items-start gap-3 text-stone-800">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-stone-900" />
                        <span>{t(`aiProposal.scopeBullets.${key}`)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="bg-white py-16 sm:py-20">
          <div className={container}>
            <div className="mx-auto max-w-3xl">
              <Reveal>
                <h2 className="text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight text-center">
                  {t("faq.title")}
                </h2>
                <p className="mt-3 text-center text-stone-600">{t("faq.subtitle")}</p>
              </Reveal>
              <div className="mt-10 space-y-6">
                {FAQ_KEYS.map((key, index) => (
                  <Reveal key={key} delay={index * 100}>
                    <div className="rounded-lg border border-stone-200 bg-stone-50 p-6">
                      <h3 className="text-lg font-semibold text-stone-900">{t(`faq.items.${key}.question`)}</h3>
                      <p className="mt-2 text-stone-600">{t(`faq.items.${key}.answer`)}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="onboarding" className="bg-stone-50 py-16 sm:py-20">
          <div className={container}>
            <Reveal className="mx-auto max-w-3xl text-center">
              <h2 className="text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight">{t("onboarding.title")}</h2>
              <p className="mt-3 text-stone-700">{t("onboarding.subtitle")}</p>
            </Reveal>

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {ONBOARDING_STEPS.map((step) => {
                const StepIcon = step.icon
                return (
                  <Card key={step.key} className="border-stone-200">
                    <CardContent className="p-4">
                      <StepIcon className="mb-3 h-6 w-6" style={{ color: step.color }} aria-hidden="true" />
                      <div className="text-lg font-semibold">{t(`onboarding.steps.${step.key}.title`)}</div>
                      <p className="mt-1 text-sm text-stone-700">{t(`onboarding.steps.${step.key}.text`)}</p>
                    </CardContent>
                  </Card>
                )
              })}
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
    </>
  )
}
