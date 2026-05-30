"use client"

import type React from "react"
import Image from "next/image"
import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { CtaButton } from "@/components/cta-button"
import { cn } from "@/lib/utils"
import { LandingHeroBackground } from "@/components/landing-hero-background"
import { BreadcrumbSchema, usePlatformBreadcrumbs } from "@/components/seo/breadcrumb-schema"
import { useTranslations } from "next-intl"
import {
  Mail,
  Share2,
  Sparkles,
  FolderGit2,
  Users,
  ShieldCheck,
  Truck,
  ClipboardList,
  Link2,
  FileText,
  ArrowRight,
} from "lucide-react"

const container = "mx-auto max-w-[1200px] px-6 sm:px-8"
const H1 = "text-[30px] sm:text-5xl md:text-[56px] font-medium tracking-tight leading-[1.1]"
const H2 = "text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight"
const Lead = "text-base sm:text-lg text-stone-600"

const CLAY = "#E07A57"
const OLIVE = "#6E7A58"
const SLATE = "#4B5960"
const OCHRE = "#C78A3B"

const INBOX_ROW_KEYS = ["inGoodCompany", "oakHouseClient", "logistics", "stonecraft"] as const
const HOW_IT_WORKS_STEPS = [
  { key: "connectGmail", icon: Mail },
  { key: "smartRouting", icon: Sparkles },
  { key: "shareWithControl", icon: Share2 },
] as const
const KPI_KEYS = ["emailsCentralised", "responseTime", "sharedThreads", "autoActions"] as const
const KPI_ACCENTS = [OLIVE, OCHRE, CLAY, SLATE] as const

const KPI_WITH_SUB = new Set(["responseTime", "sharedThreads", "autoActions"])
const VENDOR_TIMELINE_KEYS = ["dispatch", "leadTime"] as const
const VENDOR_TIMELINE_PCT = [62, 35] as const
const AI_ACTION_KEYS = ["orderSamples", "createPo", "replyDelivery"] as const
const COLLAB_BULLET_KEYS = ["shareThreads", "aiExtracts", "linkMessages"] as const
const COLLAB_BULLET_ICONS = [Share2, Sparkles, Link2] as const

function SoftChip({ children, color = "#4E4943" }: { children: React.ReactNode; color?: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full bg-stone-100 px-2 py-0.5 text-[11px] ring-1 ring-stone-200"
      style={{ color }}
    >
      {children}
    </span>
  )
}

function DotRow({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  title: string
  desc: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-stone-100 text-stone-900 ring-1 ring-stone-200">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="text-sm font-semibold text-stone-900">{title}</div>
        <div className="text-sm text-stone-700">{desc}</div>
      </div>
    </div>
  )
}

function InboxList() {
  const t = useTranslations("platformAiEmail.inbox")
  const [toast, setToast] = useState<null | { title: string; subtitle?: string }>(null)
  const [justSharedIndex, setJustSharedIndex] = useState<number | null>(null)

  const rows = useMemo(
    () =>
      INBOX_ROW_KEYS.map((key) => ({
        key,
        from: t(`rows.${key}.from`),
        subj: t(`rows.${key}.subject`),
        tag: t(`rows.${key}.tag`),
      })),
    [t],
  )

  function triggerShare(i: number, subject: string) {
    setJustSharedIndex(i)
    setToast({ title: t("toastTitle"), subtitle: subject })
    setTimeout(() => setJustSharedIndex(null), 1200)
    setTimeout(() => setToast(null), 1800)
  }

  return (
    <div className="relative h-full">
      <div className="divide-y divide-stone-200 bg-white">
        {rows.map((m, i) => {
          const shared = justSharedIndex === i
          return (
            <div key={m.key} className="flex items-center justify-between gap-3 p-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-stone-900">{m.subj}</div>
                <div className="truncate text-xs text-stone-600">{m.from}</div>
              </div>
              <div className="flex items-center gap-2">
                <SoftChip>{m.tag}</SoftChip>
                <button
                  type="button"
                  onClick={() => triggerShare(i, m.subj)}
                  disabled={shared}
                  className={
                    "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs transition " +
                    (shared
                      ? "bg-stone-200 text-stone-700"
                      : "bg-stone-900 text-white hover:bg-stone-800 active:scale-[0.98]")
                  }
                  aria-label={shared ? t("sharedAria") : t("shareAria")}
                  title={shared ? t("shared") : t("shareToProject")}
                >
                  {shared ? (
                    <>
                      <span className="inline-block h-2 w-2 rounded-full bg-[#6E7A58]" aria-hidden="true" />
                      {t("shared")}
                    </>
                  ) : (
                    <>
                      <Share2 className="h-3.5 w-3.5" />
                      {t("share")}
                    </>
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div
        aria-live="polite"
        className={
          "pointer-events-none absolute bottom-3 right-3 transition-all duration-300 " +
          (toast ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0")
        }
        role="status"
      >
        <div className="pointer-events-auto flex items-start gap-2 rounded-xl bg-white/95 p-3 pr-4 shadow-lg ring-1 ring-stone-200">
          <div className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-stone-900 text-white">
            <Share2 className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-stone-900">{toast?.title}</div>
            {toast?.subtitle ? <div className="truncate text-xs text-stone-600">{toast.subtitle}</div> : null}
          </div>
        </div>
      </div>
    </div>
  )
}

function CommunicationHubBento() {
  const t = useTranslations("platformAiEmail")
  const ti = useTranslations("platformAiEmail.inbox.tags")

  return (
    <section className="bg-white">
      <div className={cn(container, "mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3")}>
        <Card className="border-stone-200 shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-stone-900">
                <Mail className="h-4 w-4" />
                {t("bento.unifiedInbox.title")}
              </div>
              <SoftChip>{t("hero.gmailConnected")}</SoftChip>
            </div>
            <div className="mt-3 h-[260px] overflow-hidden rounded-lg bg-stone-50 ring-1 ring-stone-200">
              <InboxList />
            </div>
          </CardContent>
        </Card>

        <Card className="border-stone-200 shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-stone-900">
              <FolderGit2 className="h-4 w-4" />
              {t("bento.projectRouting.title")}
            </div>
            <p className="mt-2 text-sm text-stone-700">{t("bento.projectRouting.description")}</p>
            <div className="mt-3 rounded-lg bg-white p-3 ring-1 ring-stone-200">
              <div className="text-sm font-medium text-stone-900">{t("bento.projectRouting.exampleSubject")}</div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                <SoftChip color={SLATE}>{t("bento.projectRouting.projectLabel")}</SoftChip>
                <SoftChip color={OLIVE}>{ti("client")}</SoftChip>
                <SoftChip color={CLAY}>{ti("design")}</SoftChip>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-3 py-1.5 text-xs text-white hover:bg-stone-800"
                >
                  {t("bento.projectRouting.confirmRouting")}
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs text-stone-800 hover:bg-stone-50"
                >
                  {t("bento.projectRouting.change")}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-stone-200 shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-stone-900">
              <Truck className="h-4 w-4" />
              {t("bento.vendorTimeline.title")}
            </div>
            <p className="mt-2 text-sm text-stone-700">{t("bento.vendorTimeline.description")}</p>
            <div className="mt-3 space-y-2 rounded-lg bg-white p-3 ring-1 ring-stone-200">
              {VENDOR_TIMELINE_KEYS.map((key, idx) => (
                <div key={key}>
                  <div className="flex items-center justify-between text-xs">
                    <div className="truncate font-medium text-stone-900">{t(`bento.vendorTimeline.items.${key}.label`)}</div>
                    <div className="text-stone-600">{t(`bento.vendorTimeline.items.${key}.status`)}</div>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded bg-stone-100">
                    <div
                      className="h-2 rounded"
                      style={{
                        width: `${VENDOR_TIMELINE_PCT[idx]}%`,
                        background: "linear-gradient(90deg, rgba(214,177,150,0.35) 0%, rgba(214,177,150,0.9) 100%)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-stone-200 shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-stone-900">
              <Sparkles className="h-4 w-4" />
              {t("bento.aiSummary.title")}
            </div>
            <div className="mt-3 rounded-lg bg-white p-3 ring-1 ring-stone-200">
              <div className="text-[13px] leading-relaxed text-stone-900">{t("bento.aiSummary.summary")}</div>
              <ul className="mt-2 list-disc pl-5 text-xs text-stone-700">
                {AI_ACTION_KEYS.map((key) => (
                  <li key={key}>{t(`bento.aiSummary.actions.${key}`)}</li>
                ))}
              </ul>
              <div className="mt-3 flex flex-wrap gap-2">
                <button className="inline-flex items-center gap-1.5 rounded-lg bg-stone-900 px-3 py-1.5 text-xs text-white hover:bg-stone-800">
                  <ClipboardList className="h-3.5 w-3.5" />
                  {t("bento.aiSummary.createTask")}
                </button>
                <button className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs text-stone-900 hover:bg-stone-50">
                  <FileText className="h-3.5 w-3.5" />
                  {t("bento.aiSummary.createPo")}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-stone-200 shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-stone-900">
              <ShieldCheck className="h-4 w-4" />
              {t("bento.shareControl.title")}
            </div>
            <p className="mt-2 text-sm text-stone-700">{t("bento.shareControl.description")}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <SoftChip color={CLAY}>{t("bento.shareControl.chips.redact")}</SoftChip>
              <SoftChip color={OLIVE}>{t("bento.shareControl.chips.audit")}</SoftChip>
              <SoftChip color={SLATE}>{t("bento.shareControl.chips.shareToFeed")}</SoftChip>
            </div>
          </CardContent>
        </Card>

        <Card className="border-stone-200 shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-stone-900">
              <Users className="h-4 w-4" />
              {t("bento.unifiedMessages.title")}
            </div>
            <p className="mt-2 text-sm text-stone-700">{t("bento.unifiedMessages.description")}</p>
            <div className="mt-3 relative h-[190px] overflow-hidden rounded-lg ring-1 ring-stone-200">
              <Image
                src="/images/platform/projects/messages.png"
                alt={t("bento.unifiedMessages.imageAlt")}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

function ImpactKpis() {
  const t = useTranslations("platformAiEmail.kpis")

  return (
    <section className="bg-white py-12 sm:py-16">
      <div className={container}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {KPI_KEYS.map((key, idx) => (
            <div
              key={key}
              className="rounded-2xl bg-white px-5 py-4 text-center shadow-[0_6px_22px_rgba(0,0,0,0.06)] ring-1 ring-stone-200/60"
            >
              <div className="text-xs font-semibold tracking-wide text-stone-600">{t(`${key}.label`)}</div>
              <div className="mt-1 text-2xl font-semibold text-stone-900">{t(`${key}.value`)}</div>
              {KPI_WITH_SUB.has(key) ? (
                <div className="mt-1 text-[11px] text-stone-500">{t(`${key}.sub`)}</div>
              ) : null}
              <div className="mx-auto mt-3 h-1.5 w-10 rounded-full" style={{ backgroundColor: KPI_ACCENTS[idx] }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CollaborationExplainer() {
  const t = useTranslations("platformAiEmail.collaboration")
  const ti = useTranslations("platformAiEmail.inbox.tags")

  return (
    <section className="bg-white py-14 sm:py-20">
      <div className={container}>
        <div className="grid items-start gap-8 md:grid-cols-12">
          <div className="md:col-span-5">
            <h2 className={H2}>{t("title")}</h2>
            <p className={cn("mt-3", Lead)}>{t("subtitle")}</p>
            <ul className="mt-6 space-y-3 text-stone-800">
              {COLLAB_BULLET_KEYS.map((key, idx) => {
                const Icon = COLLAB_BULLET_ICONS[idx]
                return (
                  <li key={key} className="flex items-start gap-2">
                    <Icon className="mt-0.5 h-5 w-5 text-stone-900" />
                    <span className="text-base">{t(`bullets.${key}`)}</span>
                  </li>
                )
              })}
            </ul>
          </div>
          <div className="md:col-span-7">
            <Card className="overflow-hidden border-stone-200 shadow-lg">
              <CardContent className="p-0">
                <div className="grid gap-0 sm:grid-cols-2">
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-stone-900">{t("mock.projectTitle")}</div>
                      <SoftChip color={SLATE}>{t("mock.projectFeed")}</SoftChip>
                    </div>
                    <div className="mt-3 space-y-3">
                      <div className="rounded-lg bg-stone-50 p-3 ring-1 ring-stone-200">
                        <div className="text-xs text-stone-600">{t("mock.fromClient")}</div>
                        <div className="text-sm font-medium text-stone-900">{t("mock.clientMessage")}</div>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs">
                          <SoftChip color={CLAY}>{ti("email")}</SoftChip>
                          <SoftChip color={OLIVE}>{ti("shared")}</SoftChip>
                          <SoftChip color={SLATE}>{ti("linkedToTask")}</SoftChip>
                        </div>
                      </div>
                      <div className="rounded-lg bg-stone-50 p-3 ring-1 ring-stone-200">
                        <div className="text-xs text-stone-600">{t("mock.fromFocuspilot")}</div>
                        <div className="text-sm text-stone-900">{t("mock.aiSummary")}</div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <button className="inline-flex items-center gap-1.5 rounded-lg bg-stone-900 px-3 py-1.5 text-xs text-white hover:bg-stone-800">
                            <ClipboardList className="h-3.5 w-3.5" />
                            {t("mock.assign")}
                          </button>
                          <button className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs text-stone-900 hover:bg-stone-50">
                            <FileText className="h-3.5 w-3.5" />
                            {t("mock.createPo")}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="relative h-[340px] sm:h-full">
                    <Image
                      src="/images/platform/projects/messages.png"
                      alt={t("mock.feedImageAlt")}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}

export function AiEmailPageContent() {
  const t = useTranslations("platformAiEmail")
  const ts = useTranslations("platformShared")
  const breadcrumbs = usePlatformBreadcrumbs("aiEmail")

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      <main className="bg-white">
        <section className="relative isolate overflow-hidden bg-stone-50 pb-10 pt-12 sm:pb-12 sm:pt-16 md:pt-20">
          <LandingHeroBackground gridHeight="min(520px, 56vh)" gridFadeStop={0.58} />
          <div className={cn(container, "relative z-10")}>
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="outline" className="rounded-full border-stone-300 bg-stone-50 text-stone-700">
                {t("hero.badge")}
              </Badge>
              <h1 className={cn("mt-4 text-center", H1)}>{t("hero.title")}</h1>
              <p className={cn("mt-4 text-center", Lead)}>{t("hero.subtitle")}</p>
            </div>

            <div className="mx-auto mt-8 max-w-6xl">
              <Card className="overflow-hidden border-stone-200 shadow-xl">
                <CardContent className="p-2 sm:p-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-stone-200 bg-white p-3">
                      <div className="flex items-center justify-between">
                        <div className="inline-flex items-center gap-2 text-sm font-semibold text-stone-900">
                          <Mail className="h-4 w-4" />
                          {t("hero.homeInbox")}
                        </div>
                        <SoftChip>{t("hero.gmailConnected")}</SoftChip>
                      </div>
                      <div className="mt-3 h-[320px] overflow-hidden rounded-lg bg-stone-50 ring-1 ring-stone-200">
                        <InboxList />
                      </div>
                    </div>

                    <div className="rounded-xl border border-stone-200 bg-white p-3">
                      <div className="inline-flex items-center gap-2 text-sm font-semibold text-stone-900">
                        <FolderGit2 className="h-4 w-4" />
                        {t("hero.projectMessages")}
                      </div>
                      <div className="mt-3 relative h-[320px] overflow-hidden rounded-lg ring-1 ring-stone-200">
                        <Image
                          src="/images/platform/projects/messages.png"
                          alt={t("hero.projectMessagesImageAlt")}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="bg-white py-14 sm:py-20">
          <div className={container}>
            <div className="mx-auto max-w-3xl text-center">
              <h2 className={H2}>{t("howItWorks.title")}</h2>
              <p className={cn("mt-3", Lead)}>{t("howItWorks.subtitle")}</p>
            </div>

            <div className="mx-auto mt-8 grid max-w-5xl gap-4 sm:grid-cols-3">
              {HOW_IT_WORKS_STEPS.map((step) => (
                <DotRow
                  key={step.key}
                  icon={step.icon}
                  title={t(`howItWorks.steps.${step.key}.title`)}
                  desc={t(`howItWorks.steps.${step.key}.description`)}
                />
              ))}
            </div>
          </div>
        </section>

        <CommunicationHubBento />
        <ImpactKpis />
        <CollaborationExplainer />

        <section className="relative isolate overflow-hidden py-20" style={{ backgroundColor: "#F1BBAA" }}>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{ backgroundImage: "url('/textures/grain.png')", backgroundSize: "200px 200px" }}
          />
          <div className={container}>
            <div className="mx-auto max-w-4xl text-center">
              <h3 className="text-2xl sm:text-[28px] md:text-[32px] font-medium tracking-tight text-stone-950">
                {t("finalCta.title")}
              </h3>
              <p className="mt-3 text-lg text-stone-900/80">{t("finalCta.subtitle")}</p>
              <div className="mt-6 flex justify-center">
                <CtaButton
                  href="/signup"
                  variant="slate"
                  size="lg"
                  label={ts("startForFree")}
                  showArrow
                  arrowVariant="white"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
