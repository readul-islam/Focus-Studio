"use client"

import Image from "next/image"
import { Sparkles, Zap, Clock, CheckCircle2, Database, Search, FileText } from "lucide-react"
import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { CtaButton } from "@/components/cta-button"
import { PortugueseTilesBg } from "@/components/graphics/portuguese-tiles-bg"

const container = "mx-auto max-w-[1200px] px-6 sm:px-8"
const TITLE_H1 = "text-[30px] sm:text-5xl md:text-[56px] font-medium tracking-tight leading-[1.1]"
const TITLE_H2 = "text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight"

const FLOW_STEPS = [
  { key: "browseAndClip", number: "01", icon: Search, color: "#E07A57" },
  { key: "aiExtractsDetails", number: "02", icon: Sparkles, color: "#166534" },
  { key: "reviewAndOrganize", number: "03", icon: FileText, color: "#D97706" },
  { key: "addToProjects", number: "04", icon: Zap, color: "#4B5960" },
] as const

const FEATURE_BLOCKS = [
  {
    key: "instantDataExtraction",
    image: { src: "/images/procurement/ai-import-chair.png", width: 1280, height: 840 },
    benefitKeys: ["automaticSpecSheets", "priceTracking", "vendorContact", "productImages"] as const,
  },
  {
    key: "smartProductLibrary",
    image: { src: "/images/app/procurement-library.png", width: 1280, height: 840 },
    benefitKeys: ["intelligentCategorization", "advancedSearch", "similarProducts", "customTags"] as const,
  },
  {
    key: "projectIntegration",
    image: { src: "/images/platform/projects/procurement-table.png", width: 1280, height: 840 },
    benefitKeys: ["oneClickAddition", "automatedLists", "clientPresentations", "budgetTracking"] as const,
  },
] as const

const BENEFIT_ITEMS = [
  { key: "saveHoursDaily", icon: Clock, color: "#D97706" },
  { key: "buildYourLibrary", icon: Database, color: "#4B5960" },
  { key: "instantAccuracy", icon: Zap, color: "#166534" },
  { key: "universalCompatibility", icon: Search, color: "#E07A57" },
  { key: "professionalPresentations", icon: FileText, color: "#7C2D12" },
  { key: "alwaysUpToDate", icon: CheckCircle2, color: "#4338CA" },
] as const

export function AIProcurementPageContent() {
  const t = useTranslations("platformAiProcurement")
  const ts = useTranslations("platformShared")

  return (
    <>
      <section className="relative isolate overflow-hidden bg-white">
        <PortugueseTilesBg className="top-0" height="min(520px, 58vh)" opacity={0.08} />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-30"
          style={{
            background:
              "radial-gradient(60% 46% at 50% 0%, rgba(214,177,150,0.14) 0%, rgba(214,177,150,0.06) 42%, transparent 72%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-40 opacity-[0.06]"
          style={{ backgroundImage: "url('/textures/grain.png')", backgroundSize: "200px 200px" }}
        />
        <div className={cn(container, "pb-10 pt-8 sm:pb-16 sm:pt-12 md:pt-16")}>
          <div className="mx-auto max-w-4xl text-center sm:text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-stone-300/60 bg-white px-3 py-1 text-xs text-stone-700">
              <Sparkles className="h-3 w-3 text-stone-600" />
              <span>{t("hero.badge")}</span>
            </div>
            <h1 className={cn("mt-5 text-center", TITLE_H1)}>{t("hero.title")}</h1>
            <p className="mt-4 text-center text-base sm:text-lg text-stone-600">{t("hero.subtitle")}</p>
            <div className="mx-auto mt-6 flex justify-center">
              <CtaButton href="/signup" variant="slate" label={ts("startFreeTrial")} showArrow arrowVariant="white" />
            </div>
          </div>
          <div className="mx-auto mt-10 max-w-6xl">
            <Card className="overflow-hidden border-stone-200 shadow-xl">
              <CardContent className="p-2 sm:p-3">
                <div className="relative w-full">
                  <Image
                    src="/images/procurement/ai-import-chair.png"
                    alt={t("hero.imageAlt")}
                    width={1600}
                    height={900}
                    priority
                    className="h-auto w-full rounded-lg bg-stone-50 object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1200px"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-24">
        <div className={container}>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className={TITLE_H2}>{t("procurementFlow.title")}</h2>
            <p className="mt-3 text-lg text-stone-600">{t("procurementFlow.subtitle")}</p>
          </div>
          <div className="relative mt-16">
            <div
              className="absolute left-0 right-0 top-6 hidden h-px bg-stone-200 lg:block"
              style={{ left: "12.5%", right: "12.5%", width: "75%" }}
            />
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {FLOW_STEPS.map((step) => (
                <div key={step.key} className="relative z-10">
                  <div className="flex flex-col items-center text-center">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl bg-white ring-1"
                      style={{ backgroundColor: `${step.color}14`, ringColor: `${step.color}28` }}
                    >
                      <step.icon className="h-5 w-5" style={{ color: step.color }} />
                    </div>
                    <div className="mt-4 text-sm font-medium text-stone-500">{step.number}</div>
                    <h3 className="mt-2 text-xl font-semibold text-stone-900">{t(`procurementFlow.steps.${step.key}.title`)}</h3>
                    <p className="mt-2 text-sm text-stone-600 leading-relaxed">{t(`procurementFlow.steps.${step.key}.description`)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-stone-50 py-20 sm:py-24">
        <div className={container}>
          <div className="space-y-20 sm:space-y-24">
            {FEATURE_BLOCKS.map((block, index) => {
              const isEven = index % 2 === 0
              return (
                <div key={block.key} className="grid items-center gap-10 md:grid-cols-12 lg:gap-14">
                  <div className={cn("md:col-span-6", isEven ? "md:order-1" : "md:order-2")}>
                    <div className="mx-auto max-w-xl">
                      <h2 className={cn("mt-2", TITLE_H2)}>{t(`featureBlocks.${block.key}.title`)}</h2>
                      <p className="mt-3 text-stone-600">{t(`featureBlocks.${block.key}.description`)}</p>
                      <ul className="mt-6 space-y-3">
                        {block.benefitKeys.map((benefitKey) => (
                          <li key={benefitKey} className="flex items-start gap-3 text-stone-800">
                            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "#166534" }} />
                            <span className="text-base">{t(`featureBlocks.${block.key}.benefits.${benefitKey}`)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className={cn("md:col-span-6", isEven ? "md:order-2" : "md:order-1")}>
                    <div className="relative">
                      <Image
                        src={block.image.src}
                        alt={t(`featureBlocks.${block.key}.imageAlt`)}
                        width={block.image.width}
                        height={block.image.height}
                        className="h-auto w-full rounded-xl object-cover shadow-lg"
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 55vw, 640px"
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-24">
        <div className={container}>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className={TITLE_H2}>{t("benefitsGrid.title")}</h2>
            <p className="mt-3 text-lg text-stone-600">{t("benefitsGrid.subtitle")}</p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFIT_ITEMS.map((benefit) => (
              <Card key={benefit.key} className="border-stone-200 bg-white">
                <CardContent className="p-6">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg ring-1"
                    style={{ backgroundColor: `${benefit.color}14`, ringColor: `${benefit.color}28` }}
                  >
                    <benefit.icon className="h-5 w-5" style={{ color: benefit.color }} />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-stone-900">{t(`benefitsGrid.items.${benefit.key}.title`)}</h3>
                  <p className="mt-2 text-sm text-stone-600 leading-relaxed">{t(`benefitsGrid.items.${benefit.key}.description`)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section
        id="waitlist"
        className="relative isolate overflow-hidden py-24 text-stone-100"
        style={{ backgroundColor: "#3F4B51" }}
        aria-labelledby="cta-heading"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: "url('/textures/grain.png')", backgroundSize: "200px 200px" }}
        />
        <div className={container}>
          <div className="mx-auto max-w-3xl text-center">
            <h2 id="cta-heading" className="text-2xl sm:text-[28px] md:text-[32px] font-medium tracking-tight">
              {t("bigCta.title")}
            </h2>
            <p className="mt-3 text-base sm:text-lg text-stone-300">{t("bigCta.subtitle")}</p>
            <div className="mt-8 flex items-center justify-center">
              <CtaButton href="/signup" variant="white" label={ts("startForFree")} showArrow arrowVariant="slate" />
            </div>
            <p className="mt-3 text-xs sm:text-sm text-stone-400">{ts("noCreditCardRequired")}</p>
          </div>
        </div>
      </section>
    </>
  )
}
