"use client"

import type React from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { CtaButton } from "@/components/cta-button"
import { cn } from "@/lib/utils"
import {
  CheckCircle2,
  FileText,
  CreditCard,
  Users,
  Zap,
  DollarSign,
  Send,
  Eye,
  Calendar,
  Building2,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { PortugueseTilesBg } from "@/components/graphics/portuguese-tiles-bg"

const container = "mx-auto max-w-[1200px] px-6 sm:px-8"
const H1 = "text-[30px] sm:text-5xl md:text-[56px] font-medium tracking-tight leading-[1.1]"
const H2 = "text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight"
const Lead = "text-base sm:text-lg text-stone-600"

const CLAY = "#E07A57"
const SLATE = "#4B5960"
const OLIVE = "#6E7A58"
const OCHRE = "#C78A3B"

const WORKFLOW_STEPS = [
  { key: "createProposal", number: "01", icon: FileText, accent: CLAY },
  { key: "clientReviews", number: "02", icon: Eye, accent: OLIVE },
  { key: "generateInvoice", number: "03", icon: CreditCard, accent: OCHRE },
  { key: "getPaid", number: "04", icon: DollarSign, accent: SLATE },
] as const

const AI_PROPOSAL_BULLETS = ["detailedScope", "automaticPricing", "professionalTemplates", "versionControl"] as const
const INVOICING_BULLETS = ["oneClickGeneration", "paymentSchedules", "stripeIntegration", "xeroSync"] as const
const CLIENT_BULLETS = ["brandedPortal", "oneClickApproval", "securePayments", "realtimeUpdates"] as const

const BENEFIT_ITEMS = [
  { key: "fasterProposals", icon: Zap, accent: OCHRE },
  { key: "betterCashFlow", icon: DollarSign, accent: CLAY },
  { key: "professionalBranding", icon: Building2, accent: OLIVE },
  { key: "clientSatisfaction", icon: Users, accent: SLATE },
  { key: "automatedWorkflows", icon: Calendar, accent: OCHRE },
  { key: "seamlessIntegration", icon: Send, accent: CLAY },
] as const

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-stone-800">
      <CheckCircle2 className="mt-0.5 h-5 w-5 text-stone-700" />
      <span className="text-base">{children}</span>
    </li>
  )
}

function WorkflowStep({
  number,
  title,
  description,
  icon: Icon,
  accent,
}: {
  number: string
  title: string
  description: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  accent: string
}) {
  return (
    <div className="text-center">
      <div
        className="relative z-10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white ring-1 ring-stone-200"
        style={{ backgroundColor: `${accent}14`, color: accent }}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="mb-2 text-sm font-medium text-stone-600">{number}</div>
      <h3 className="mb-2 text-lg font-semibold text-stone-950">{title}</h3>
      <p className="text-sm text-stone-600">{description}</p>
    </div>
  )
}

function BenefitCard({
  title,
  description,
  icon: Icon,
  accent,
}: {
  title: string
  description: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  accent: string
}) {
  return (
    <Card className="border-stone-200 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="p-6">
        <div
          className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-stone-200"
          style={{ backgroundColor: `${accent}14`, color: accent }}
        >
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-stone-950">{title}</h3>
        <p className="text-sm text-stone-600">{description}</p>
      </CardContent>
    </Card>
  )
}

export function InvoicingPageContent() {
  const t = useTranslations("platformInvoicing")
  const ts = useTranslations("platformShared")

  return (
    <main className="bg-white">
      <section className="relative isolate overflow-hidden pb-10 pt-8 sm:pb-16 sm:pt-12 md:pt-16">
        <PortugueseTilesBg className="opacity-40" height="min(520px, 58vh)" fadeStop={0.6} />

        <div className={cn(container)}>
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="outline" className="rounded-full border-stone-300 bg-stone-50 text-stone-700">
              {t("hero.badge")}
            </Badge>
            <h1 className={cn("mt-4 text-center", H1)}>{t("hero.title")}</h1>
            <p className={cn("mt-4 text-center", Lead)}>{t("hero.subtitle")}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <CtaButton href="/signup" variant="slate" label={ts("seeItInAction")} showArrow arrowVariant="white" />
              <CtaButton href="#features" variant="white" label={ts("exploreFeatures")} />
            </div>
          </div>

          <div className="mx-auto mt-8 max-w-4xl">
            <Card className="overflow-hidden border-stone-200 shadow-xl">
              <CardContent className="p-2 sm:p-3">
                <Image
                  src="/images/platform/crm/ai-proposal-wizard.png"
                  alt={t("hero.imageAlt")}
                  width={1200}
                  height={675}
                  className="h-auto w-full rounded-lg object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1000px"
                  priority={true}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className={container}>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className={H2}>{t("workflow.title")}</h2>
            <p className={cn("mt-3", Lead)}>{t("workflow.subtitle")}</p>
          </div>

          <div className="relative mt-12">
            <div className="absolute left-0 right-0 top-6 hidden h-px bg-stone-200 md:block -z-10" aria-hidden="true" />

            <div className="grid gap-8 md:grid-cols-4 md:gap-6">
              {WORKFLOW_STEPS.map((step) => (
                <WorkflowStep
                  key={step.key}
                  number={step.number}
                  title={t(`workflow.steps.${step.key}.title`)}
                  description={t(`workflow.steps.${step.key}.description`)}
                  icon={step.icon}
                  accent={step.accent}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-stone-50 py-16 sm:py-20">
        <div className={container}>
          <div className="grid items-center gap-10 md:grid-cols-12">
            <div className="md:col-span-6">
              <h2 className={H2}>{t("aiProposals.title")}</h2>
              <p className={cn("mt-3", Lead)}>{t("aiProposals.description")}</p>
              <ul className="mt-6 space-y-3">
                {AI_PROPOSAL_BULLETS.map((key) => (
                  <Bullet key={key}>{t(`aiProposals.bullets.${key}`)}</Bullet>
                ))}
              </ul>
              <div className="mt-6 flex gap-3">
                <CtaButton href="#ai" variant="slate" label={ts("tryAiProposals")} showArrow arrowVariant="white" />
                <CtaButton href="#templates" variant="white" label={ts("viewTemplates")} />
              </div>
            </div>
            <div className="md:col-span-6">
              <div className="grid gap-4">
                <Card className="overflow-hidden border-stone-200 shadow-sm">
                  <CardContent className="p-2">
                    <Image
                      src="/images/platform/crm/ai-scope-definition.png"
                      alt={t("aiProposals.imageAlts.scopeDefinition")}
                      width={800}
                      height={500}
                      className="h-auto w-full rounded-lg object-cover"
                    />
                  </CardContent>
                </Card>
                <Card className="overflow-hidden border-stone-200 shadow-sm">
                  <CardContent className="p-2">
                    <Image
                      src="/images/platform/crm/ai-proposal-pricing.png"
                      alt={t("aiProposals.imageAlts.pricingCalculator")}
                      width={800}
                      height={400}
                      className="h-auto w-full rounded-lg object-cover"
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className={container}>
          <div className="grid items-center gap-10 md:grid-cols-12">
            <div className="md:col-span-6 md:order-2">
              <h2 className={H2}>{t("automatedInvoicing.title")}</h2>
              <p className={cn("mt-3", Lead)}>{t("automatedInvoicing.description")}</p>
              <ul className="mt-6 space-y-3">
                {INVOICING_BULLETS.map((key) => (
                  <Bullet key={key}>{t(`automatedInvoicing.bullets.${key}`)}</Bullet>
                ))}
              </ul>
              <div className="mt-6 flex gap-3">
                <CtaButton href="#payments" variant="slate" label={ts("paymentOptions")} showArrow arrowVariant="white" />
                <CtaButton href="#integrations" variant="white" label={ts("viewIntegrations")} />
              </div>
            </div>
            <div className="md:col-span-6 md:order-1">
              <div className="space-y-4">
                <Card className="overflow-hidden border-stone-200 shadow-sm">
                  <CardContent className="p-2">
                    <Image
                      src="/images/invoice-summary-cards.png"
                      alt={t("automatedInvoicing.imageAlts.invoiceDashboard")}
                      width={800}
                      height={200}
                      className="h-auto w-full rounded-lg object-cover"
                    />
                  </CardContent>
                </Card>
                <div className="grid grid-cols-2 gap-4">
                  <Card className="overflow-hidden border-stone-200 shadow-sm">
                    <CardContent className="p-2">
                      <Image
                        src="/images/invoice-buttons.png"
                        alt={t("automatedInvoicing.imageAlts.invoiceButtons")}
                        width={400}
                        height={120}
                        className="h-auto w-full rounded-lg object-cover"
                      />
                    </CardContent>
                  </Card>
                  <Card className="overflow-hidden border-stone-200 shadow-sm">
                    <CardContent className="p-2">
                      <Image
                        src="/images/project-cost-tracking.png"
                        alt={t("automatedInvoicing.imageAlts.costTracking")}
                        width={400}
                        height={120}
                        className="h-auto w-full rounded-lg object-cover"
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-stone-50 py-16 sm:py-20">
        <div className={container}>
          <div className="grid items-center gap-10 md:grid-cols-12">
            <div className="md:col-span-6">
              <h2 className={H2}>{t("clientExperience.title")}</h2>
              <p className={cn("mt-3", Lead)}>{t("clientExperience.description")}</p>
              <ul className="mt-6 space-y-3">
                {CLIENT_BULLETS.map((key) => (
                  <Bullet key={key}>{t(`clientExperience.bullets.${key}`)}</Bullet>
                ))}
              </ul>
              <div className="mt-6">
                <CtaButton
                  href="/platform/client-portal"
                  variant="slate"
                  label={ts("seeClientPortal")}
                  showArrow
                  arrowVariant="white"
                />
              </div>
            </div>
            <div className="md:col-span-6">
              <Card className="overflow-hidden border-stone-200 shadow-lg">
                <CardContent className="p-2">
                  <Image
                    src="/images/client-portal/client-view-hero.png"
                    alt={t("clientExperience.imageAlt")}
                    width={800}
                    height={600}
                    className="h-auto w-full rounded-lg object-cover"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="bg-white py-16 sm:py-20">
        <div className={container}>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className={H2}>{t("benefitsGrid.title")}</h2>
            <p className={cn("mt-3", Lead)}>{t("benefitsGrid.subtitle")}</p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFIT_ITEMS.map((benefit) => (
              <BenefitCard
                key={benefit.key}
                title={t(`benefitsGrid.items.${benefit.key}.title`)}
                description={t(`benefitsGrid.items.${benefit.key}.description`)}
                icon={benefit.icon}
                accent={benefit.accent}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className={container}>
          <section className="relative overflow-hidden rounded-3xl">
            <div className="absolute inset-0">
              <Image
                src="/images/proposals-kitchen-hero.png"
                alt={t("imageBlock.imageAlt")}
                fill
                className="object-cover"
                sizes="100vw"
                priority={false}
              />
              <div className="absolute inset-0 bg-stone-900/50" />
            </div>

            <div className="relative px-6 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
              <div className="mx-auto max-w-4xl">
                <h2 className="text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight text-white">
                  {t("imageBlock.line1")}
                  <br />
                  {t("imageBlock.line2")}
                  <br />
                  {t("imageBlock.line3")}
                </h2>

                <div className="mt-8 flex justify-end">
                  <CtaButton
                    href="#waitlist"
                    variant="white"
                    label={ts("delightYourClients")}
                    showArrow
                    arrowVariant="brand"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>

      <section className="relative isolate overflow-hidden py-24" style={{ backgroundColor: "#3F4B51" }}>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: "url('/textures/grain.png')", backgroundSize: "200px 200px" }}
        />
        <div className={container}>
          <div className="mx-auto max-w-4xl text-center">
            <h3 className="text-2xl sm:text-[28px] md:text-[32px] font-medium tracking-tight text-white">
              {t("finalCta.title")}
            </h3>
            <p className="mt-3 text-lg text-stone-300">{t("finalCta.subtitle")}</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <CtaButton href="/signup" variant="slate" label={ts("startForFree")} showArrow arrowVariant="white" />
            </div>
            <p className="mt-3 text-xs sm:text-sm text-stone-400">{ts("noCreditCardRequired")}</p>
          </div>
        </div>
      </section>
    </main>
  )
}
