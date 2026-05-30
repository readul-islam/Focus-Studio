"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Zap, Tag, FolderOpen, ShoppingCart } from "lucide-react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { MarketingPageHero } from "@/components/marketing/marketing-page-hero"
import { CtaButton } from "@/components/cta-button"

const container = "mx-auto max-w-[1200px] px-6 sm:px-8"
const H1 = "text-[30px] sm:text-5xl md:text-[56px] font-medium tracking-tight leading-[1.1]"
const H2 = "text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight"
const Lead = "text-base sm:text-lg text-stone-600"

const CLAY = "#E07A57"
const SLATE = "#4B5960"
const OLIVE = "#6E7A58"
const OCHRE = "#C78A3B"

const KPI_KEYS = ["fasterSourcing", "timeToAdd", "dataAccuracy", "storage"] as const
const KPI_ACCENTS = [CLAY, OLIVE, SLATE, OCHRE] as const

function KpiTile({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <Card className="overflow-hidden border-stone-200 shadow-sm">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-medium tracking-wide text-stone-600">{label}</div>
            <div className="mt-1 text-2xl font-semibold text-stone-950">{value}</div>
          </div>
          <span aria-hidden className="mt-1 inline-block h-1.5 w-10 rounded-full" style={{ backgroundColor: accent }} />
        </div>
      </CardContent>
    </Card>
  )
}

export function ProductLibraryPageContent() {
  const t = useTranslations("platformProductLibrary")
  const ts = useTranslations("platformShared")

  return (
    <div className="min-h-screen bg-white">
      <MarketingPageHero
        gridHeight="min(520px, 58vh)"
        contentClassName={cn(container, "pb-10 pt-8 sm:pb-16 sm:pt-12 md:pt-16")}
      >
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="secondary" className="mb-6 bg-stone-100 text-stone-700">
            {t("hero.badge")}
          </Badge>
          <h1 className={cn(H1, "text-center")}>{t("hero.title")}</h1>
          <p className={cn("mt-6 max-w-2xl text-center", Lead)}>{t("hero.subtitle")}</p>
          <div className="mx-auto mt-5 flex justify-center">
            <CtaButton
              href="/signup"
              variant="slate"
              size="lg"
              label={ts("startBuildingLibrary")}
              showArrow
              arrowVariant="white"
            />
          </div>
        </div>
      </MarketingPageHero>

      <section className="px-6 py-16">
        <div className={container}>
          <div className="text-center mb-12">
            <h2 className={H2}>{t("organise.title")}</h2>
            <p className={cn("max-w-2xl mx-auto mt-4", Lead)}>{t("organise.subtitle")}</p>
          </div>
          <Card className="overflow-hidden border-stone-200 shadow-xl">
            <CardContent className="p-2 sm:p-3">
              <Image
                src="/images/product-library/product-grid.png"
                alt={t("organise.imageAlt")}
                width={1200}
                height={600}
                className="w-full h-auto rounded-lg"
              />
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="px-6 py-16 bg-stone-50">
        <div className={container}>
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${CLAY}20` }}>
                <Zap className="h-5 w-5" style={{ color: CLAY }} />
              </div>
              <h3 className="text-xl font-semibold text-stone-900 mb-2">{t("benefits.aiSourcing.title")}</h3>
              <p className="text-stone-600">{t("benefits.aiSourcing.description")}</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${OLIVE}20` }}>
                <Tag className="h-5 w-5" style={{ color: OLIVE }} />
              </div>
              <h3 className="text-xl font-semibold text-stone-900 mb-2">{t("benefits.smartOrganisation.title")}</h3>
              <p className="text-stone-600">{t("benefits.smartOrganisation.description")}</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${SLATE}20` }}>
                <ShoppingCart className="h-5 w-5" style={{ color: SLATE }} />
              </div>
              <h3 className="text-xl font-semibold text-stone-900 mb-2">{t("benefits.oneClickProcurement.title")}</h3>
              <p className="text-stone-600">{t("benefits.oneClickProcurement.description")}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className={container}>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className={H2}>{t("intelligence.title")}</h2>
              <p className={cn("mt-4 mb-8", Lead)}>{t("intelligence.subtitle")}</p>
              <div className="space-y-4">
                {(["pricing", "supplier", "stock"] as const).map((key) => (
                  <div key={key} className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full mt-0.5" style={{ backgroundColor: `${CLAY}20` }}>
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: CLAY }} />
                    </div>
                    <div>
                      <h4 className="font-medium text-stone-900">{t(`intelligence.items.${key}.title`)}</h4>
                      <p className="text-sm text-stone-600">{t(`intelligence.items.${key}.description`)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Card className="overflow-hidden border-stone-200 shadow-sm">
              <CardContent className="p-1">
                <Image
                  src="/images/product-library/product-detail.png"
                  alt={t("intelligence.imageAlt")}
                  width={600}
                  height={800}
                  className="w-full h-auto rounded-lg object-cover"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 bg-stone-50">
        <div className={container}>
          <div className="text-center mb-12">
            <h2 className={H2}>{t("sources.title")}</h2>
            <p className={cn("max-w-2xl mx-auto mt-4", Lead)}>{t("sources.subtitle")}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="text-center p-6 border-stone-200 shadow-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: CLAY }}>
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-stone-900 mb-2">{t("sources.webClipper.title")}</h3>
              <p className="text-stone-600 mb-4">{t("sources.webClipper.description")}</p>
              <Badge variant="secondary" className="text-stone-700" style={{ backgroundColor: `${CLAY}20` }}>
                {t("sources.webClipper.badge")}
              </Badge>
            </Card>
            <Card className="text-center p-6 border-stone-200 shadow-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: OLIVE }}>
                <FolderOpen className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-stone-900 mb-2">{t("sources.importProjects.title")}</h3>
              <p className="text-stone-600 mb-4">{t("sources.importProjects.description")}</p>
              <Badge variant="secondary" className="text-stone-700" style={{ backgroundColor: `${OLIVE}20` }}>
                {t("sources.importProjects.badge")}
              </Badge>
            </Card>
            <Card className="text-center p-6 border-stone-200 shadow-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: SLATE }}>
                <Plus className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-stone-900 mb-2">{t("sources.manualEntry.title")}</h3>
              <p className="text-stone-600 mb-4">{t("sources.manualEntry.description")}</p>
              <Badge variant="secondary" className="text-stone-700" style={{ backgroundColor: `${SLATE}20` }}>
                {t("sources.manualEntry.badge")}
              </Badge>
            </Card>
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className={container}>
          <div className="text-center mb-12">
            <h2 className={H2}>{t("stats.title")}</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-4">
            {KPI_KEYS.map((key, i) => (
              <KpiTile
                key={key}
                label={t(`stats.kpis.${key}.label`)}
                value={t(`stats.kpis.${key}.value`)}
                accent={KPI_ACCENTS[i]}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden px-6 py-16" style={{ backgroundColor: CLAY }}>
        <div className="absolute inset-0 bg-[url('/images/texture-noise.png')] opacity-20" />
        <div className="relative mx-auto max-w-4xl text-center">
          <h2 className="text-2xl sm:text-[28px] md:text-[32px] font-medium tracking-tight text-white">{t("cta.title")}</h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/90">{t("cta.subtitle")}</p>
          <div className="mx-auto mt-5 flex justify-center">
            <CtaButton href="/signup" variant="white" size="lg" label={ts("startFreeTrialCaps")} showArrow arrowVariant="brand" />
          </div>
        </div>
      </section>
    </div>
  )
}
