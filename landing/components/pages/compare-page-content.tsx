"use client"

import Link from "next/link"
import { useMemo } from "react"
import { ArrowRight, Check } from "lucide-react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { CtaButton } from "@/components/cta-button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

const container = "mx-auto max-w-[1200px] px-6 sm:px-8"
const H1 = "text-[30px] sm:text-5xl md:text-[56px] font-medium tracking-tight leading-[1.1]"
const H2 = "text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight"
const Lead = "text-base sm:text-lg text-stone-600"

const COMPETITOR_KEYS = [
  { key: "programa", slug: "programa", name: "Programa" },
  { key: "designManager", slug: "design-manager", name: "Design Manager" },
  { key: "houzzPro", slug: "houzz-pro", name: "Houzz Pro" },
  { key: "studioDesigner", slug: "studio-designer", name: "Studio Designer" },
  { key: "designfiles", slug: "designfiles", name: "DesignFiles" },
] as const

const REASON_KEYS = ["worldwide", "ai", "mobile", "allInOne", "migration", "pricing"] as const

export function ComparePageContent() {
  const t = useTranslations("comparePage")

  const competitors = useMemo(
    () =>
      COMPETITOR_KEYS.map((c) => ({
        slug: c.slug,
        name: c.name,
        description: t(`competitors.${c.key}.description`),
        focuspilotAdvantage: t(`competitors.${c.key}.advantage`),
      })),
    [t],
  )

  const reasons = useMemo(
    () =>
      REASON_KEYS.map((key) => ({
        title: t(`whySwitch.reasons.${key}.title`),
        description: t(`whySwitch.reasons.${key}.description`),
      })),
    [t],
  )

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: t("breadcrumb.home"), item: "https://focuspilot.io" },
      { "@type": "ListItem", position: 2, name: t("breadcrumb.compare"), item: "https://focuspilot.io/compare" },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <main className="min-h-screen bg-white">
        <section className="bg-gradient-to-b from-stone-50 to-white py-16 sm:py-24">
          <div className={container}>
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="outline" className="mb-4 border-stone-300 text-stone-600">
                {t("badge")}
              </Badge>
              <h1 className={cn(H1, "text-center")}>{t("title")}</h1>
              <p className={cn(Lead, "mt-4 text-center")}>{t("subtitle")}</p>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className={container}>
            <h2 className={cn(H2, "text-center mb-12")}>{t("detailedTitle")}</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {competitors.map((competitor) => (
                <Link key={competitor.slug} href={`/compare/${competitor.slug}`} className="group">
                  <Card className="h-full border-stone-200 transition-all hover:border-stone-300 hover:shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-stone-900">
                          {t("vsLabel", { name: competitor.name })}
                        </h3>
                        <ArrowRight className="h-5 w-5 text-stone-400 transition-transform group-hover:translate-x-1" />
                      </div>
                      <p className="text-sm text-stone-600 mb-4">{competitor.description}</p>
                      <div className="pt-4 border-t border-stone-100">
                        <p className="text-xs font-medium text-stone-500 mb-2">{t("advantageLabel")}</p>
                        <p className="text-sm text-stone-700">{competitor.focuspilotAdvantage}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-stone-50 py-16 sm:py-20">
          <div className={container}>
            <div className="mx-auto max-w-3xl text-center mb-12">
              <h2 className={cn(H2)}>{t("whySwitch.title")}</h2>
              <p className={cn(Lead, "mt-4")}>{t("whySwitch.subtitle")}</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {reasons.map((reason, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-900">{reason.title}</h3>
                    <p className="text-sm text-stone-600 mt-1">{reason.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-24">
          <div className={container}>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className={cn(H2)}>{t("cta.title")}</h2>
              <p className={cn(Lead, "mt-4")}>{t("cta.subtitle")}</p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <CtaButton href="/signup">{t("cta.startTrial")}</CtaButton>
                <CtaButton href="/pricing" variant="outline">
                  {t("cta.viewPricing")}
                </CtaButton>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
