"use client"

import Image from "next/image"
import { CheckCircle2, Clock, Users, FileCheck, Bell, Zap, Shield, ArrowRight } from "lucide-react"
import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { CtaButton } from "@/components/cta-button"
import { PortugueseTilesBg } from "@/components/graphics/portuguese-tiles-bg"

const container = "mx-auto max-w-[1200px] px-6 sm:px-8"
const TITLE_H1 = "text-[30px] sm:text-5xl md:text-[56px] font-medium tracking-tight leading-[1.1]"
const TITLE_H2 = "text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight"

const FLOW_STEPS = [
  { key: "shareForApproval", number: "01", icon: FileCheck, color: "#E07A57" },
  { key: "clientReviews", number: "02", icon: Users, color: "#166534" },
  { key: "trackProgress", number: "03", icon: Clock, color: "#D97706" },
  { key: "moveForward", number: "04", icon: Zap, color: "#4B5960" },
] as const

const FEATURE_BLOCKS = [
  {
    key: "realTimeNotifications",
    image: {
      src: "/images/client-portal/messages-updates.png",
      width: 1280,
      height: 840,
    },
    benefitKeys: ["instantNotifications", "reminderSchedules", "mobileLinks", "deadlineTracking"] as const,
  },
  {
    key: "visualApprovalWorkflow",
    image: {
      src: "/images/platform/projects/docs-updated.png",
      width: 1280,
      height: 840,
    },
    benefitKeys: ["imageGalleries", "sideBySide", "projectContext", "mobileViewing"] as const,
  },
  {
    key: "versionControlHistory",
    image: {
      src: "/images/platform/projects/docs-grid.png",
      width: 1280,
      height: 840,
    },
    benefitKeys: ["approvalHistory", "versionComparison", "auditTrail", "rollback"] as const,
  },
] as const

const BENEFIT_ITEMS = [
  { key: "fasterDecisions", icon: Clock, color: "#D97706" },
  { key: "secureCompliant", icon: Shield, color: "#4B5960" },
  { key: "betterClientExperience", icon: Users, color: "#166534" },
  { key: "neverMissDeadlines", icon: Bell, color: "#E07A57" },
  { key: "completeTransparency", icon: FileCheck, color: "#7C2D12" },
  { key: "automatedWorkflows", icon: Zap, color: "#4338CA" },
] as const

function Hero() {
  const t = useTranslations("platformApprovals.hero")
  const ts = useTranslations("platformShared")

  return (
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
        <div className="mx-auto max-w-4xl">
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-stone-300/60 bg-white px-3 py-1 text-xs text-stone-700">
              <FileCheck className="h-3 w-3 text-stone-600" />
              <span>{t("badge")}</span>
            </div>
          </div>
          <h1 className={cn("mt-5 text-center", TITLE_H1)}>{t("title")}</h1>
          <p className="mt-4 text-center text-base sm:text-lg text-stone-600">{t("subtitle")}</p>
          <div className="mx-auto mt-6 flex justify-center">
            <CtaButton href="/signup" variant="slate" size="lg" label={ts("startFreeTrial")} showArrow arrowVariant="white" />
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-6xl">
          <Card className="overflow-hidden border-stone-200 shadow-xl">
            <CardContent className="p-2 sm:p-3">
              <div className="relative w-full">
                <Image
                  src="/images/platform/projects/client-portal-overview.png"
                  alt={t("imageAlt")}
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
  )
}

function ApprovalFlow() {
  const t = useTranslations("platformApprovals.approvalFlow")

  return (
    <section className="bg-white py-20 sm:py-24">
      <div className={container}>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className={TITLE_H2}>{t("title")}</h2>
          <p className="mt-3 text-lg text-stone-600">{t("subtitle")}</p>
        </div>
        <div className="relative mt-16">
          <div
            className="absolute left-0 right-0 top-6 hidden h-px bg-stone-200 lg:block"
            style={{ left: "12.5%", right: "12.5%", width: "75%" }}
          />
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {FLOW_STEPS.map((step) => (
              <div key={step.key} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div
                    className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl ring-1 bg-white"
                    style={{ backgroundColor: `${step.color}14`, ringColor: `${step.color}28` }}
                  >
                    <step.icon className="h-5 w-5" style={{ color: step.color }} />
                  </div>
                  <div className="mt-4 text-sm font-medium text-stone-500">{step.number}</div>
                  <h3 className="mt-2 text-xl font-semibold text-stone-900">{t(`steps.${step.key}.title`)}</h3>
                  <p className="mt-2 text-sm text-stone-600 leading-relaxed">{t(`steps.${step.key}.description`)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function FeatureBlocks() {
  const t = useTranslations("platformApprovals.featureBlocks")

  return (
    <section className="bg-stone-50 py-20 sm:py-24">
      <div className={container}>
        <div className="space-y-20 sm:space-y-24">
          {FEATURE_BLOCKS.map((block, index) => {
            const isEven = index % 2 === 0
            return (
              <div key={block.key} className="grid items-center gap-10 md:grid-cols-12 lg:gap-14">
                <div className={cn("md:col-span-6", isEven ? "md:order-1" : "md:order-2")}>
                  <div className="mx-auto max-w-xl">
                    <h2 className={cn("mt-2", TITLE_H2)}>{t(`${block.key}.title`)}</h2>
                    <p className="mt-3 text-stone-600">{t(`${block.key}.description`)}</p>
                    <ul className="mt-6 space-y-3">
                      {block.benefitKeys.map((benefitKey) => (
                        <li key={benefitKey} className="flex items-start gap-3 text-stone-800">
                          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "#166534" }} />
                          <span className="text-base">{t(`${block.key}.benefits.${benefitKey}`)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className={cn("md:col-span-6", isEven ? "md:order-2" : "md:order-1")}>
                  <div className="relative">
                    <Image
                      src={block.image.src}
                      alt={t(`${block.key}.imageAlt`)}
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
  )
}

function ApprovalsImageBlock() {
  const t = useTranslations("platformApprovals.imageBlock")

  return (
    <section className="py-20 sm:py-24">
      <div className={container}>
        <div className="relative overflow-hidden rounded-3xl">
          <div className="absolute inset-0">
            <Image
              src="/images/screenshot-202025-08-19-20at-2011.jpeg"
              alt={t("imageAlt")}
              width={1600}
              height={800}
              className="h-full w-full object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1200px"
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>
          <div className="relative px-8 py-16 sm:px-12 sm:py-20 lg:px-16 lg:py-24">
            <div className="mx-auto max-w-2xl">
              <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                {t("line1")}
                <br />
                {t("line2")}
                <br />
                {t("line3")}
              </h2>
              <div className="mt-8 flex justify-start">
                <button className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-base font-medium text-stone-900 shadow-lg transition-all hover:bg-stone-50 hover:shadow-xl">
                  <span>{t("cta")}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function BenefitsGrid() {
  const t = useTranslations("platformApprovals.benefitsGrid")

  return (
    <section className="bg-white py-20 sm:py-24">
      <div className={container}>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className={TITLE_H2}>{t("title")}</h2>
          <p className="mt-3 text-lg text-stone-600">{t("subtitle")}</p>
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
                <h3 className="mt-4 text-lg font-semibold text-stone-900">{t(`items.${benefit.key}.title`)}</h3>
                <p className="mt-2 text-sm text-stone-600 leading-relaxed">{t(`items.${benefit.key}.description`)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function BigCTA() {
  const t = useTranslations("platformApprovals.bigCta")
  const ts = useTranslations("platformShared")

  return (
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
            {t("title")}
          </h2>
          <p className="mt-3 text-base sm:text-lg text-stone-300">{t("subtitle")}</p>
          <div className="mt-8 flex justify-center">
            <CtaButton href="/signup" variant="white" label={ts("startForFree")} showArrow arrowVariant="black" />
          </div>
          <p className="mt-3 text-xs sm:text-sm text-stone-400">{ts("noCreditCardRequired")}</p>
        </div>
      </div>
    </section>
  )
}

export function ApprovalsPageContent() {
  return (
    <>
      <Hero />
      <ApprovalFlow />
      <FeatureBlocks />
      <ApprovalsImageBlock />
      <BenefitsGrid />
      <BigCTA />
    </>
  )
}
