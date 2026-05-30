"use client"

import Link from "next/link"
import { Fragment, useMemo } from "react"
import { Check, X, Minus, ArrowRight } from "lucide-react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { CtaButton } from "@/components/cta-button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  COMPARE_COMPETITOR_NAMES,
  COMPARE_PAGE_LAYOUT,
  COMPARE_TABLE_DATA,
  EXPLORE_LINK_KEYS,
  FAQ_KEYS,
  FOCUS_REASON_KEYS,
  COMPETITOR_REASON_KEYS,
  MIGRATION_STEP_KEYS,
  type CompareSlug,
  type FeatureStatus,
} from "@/lib/compare-detail-config"

const container = "mx-auto max-w-[1200px] px-6 sm:px-8"
const H1 = "text-[30px] sm:text-5xl md:text-[56px] font-medium tracking-tight leading-[1.1]"
const H2 = "text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight"
const Lead = "text-base sm:text-lg text-stone-600"

function FeatureStatusIcon({ status }: { status: FeatureStatus }) {
  if (status === true) return <Check className="h-5 w-5 text-green-600" />
  if (status === "partial") return <Minus className="h-5 w-5 text-amber-500" />
  return <X className="h-5 w-5 text-stone-300" />
}

type CompareDetailPageContentProps = {
  slug: CompareSlug
}

export function CompareDetailPageContent({ slug }: CompareDetailPageContentProps) {
  const ts = useTranslations("compareDetailShared")
  const tc = useTranslations("compareDetailCategories")
  const tf = useTranslations("compareDetailFeatures")
  const tp = useTranslations(`compareDetailPages.${slug}`)

  const competitorName = COMPARE_COMPETITOR_NAMES[slug]
  const layout = COMPARE_PAGE_LAYOUT[slug]
  const tableData = COMPARE_TABLE_DATA[slug]

  const faqItems = useMemo(
    () => FAQ_KEYS[slug].map((key) => ({ key, question: tp(`faqs.${key}.question`), answer: tp(`faqs.${key}.answer`) })),
    [slug, tp],
  )

  const faqSchema = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    }),
    [faqItems],
  )

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: ts("breadcrumb.home"), item: "https://focuspilot.io" },
      { "@type": "ListItem", position: 2, name: ts("breadcrumb.compare"), item: "https://focuspilot.io/compare" },
      {
        "@type": "ListItem",
        position: 3,
        name: tp("breadcrumbTitle"),
        item: `https://focuspilot.io/compare/${slug}`,
      },
    ],
  }

  const exploreLinks = EXPLORE_LINK_KEYS[slug as keyof typeof EXPLORE_LINK_KEYS]
  const migrationSteps = MIGRATION_STEP_KEYS[slug as keyof typeof MIGRATION_STEP_KEYS]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <main className="min-h-screen bg-white">
        <section className="bg-gradient-to-b from-stone-50 to-white py-16 sm:py-24">
          <div className={container}>
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="outline" className="mb-4 border-stone-300 text-stone-600">
                {ts("badge")}
              </Badge>
              <h1 className={cn(H1, "text-center")}>{tp("hero.title")}</h1>
              <p className={cn(Lead, "mt-4 text-center")}>{tp("hero.subtitle")}</p>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className={container}>
            <h2 className={cn(H2, "text-center mb-12")}>{tp("bestFor.title")}</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-2 border-stone-900">
                <CardContent className="p-6 sm:p-8">
                  <div className="mb-4 text-xl font-semibold">{tp("bestFor.focuspilotTitle")}</div>
                  <ul className="space-y-3 text-stone-600">
                    {FOCUS_REASON_KEYS[slug].map((key) => (
                      <li key={key} className="flex items-start gap-3">
                        <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                        <span>{tp(`bestFor.focuspilotReasons.${key}`)}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card className="border border-stone-200">
                <CardContent className="p-6 sm:p-8">
                  <div className="mb-4 text-xl font-semibold">{tp("bestFor.competitorTitle", { name: competitorName })}</div>
                  <ul className="space-y-3 text-stone-600">
                    {COMPETITOR_REASON_KEYS[slug].map((key) => (
                      <li key={key} className="flex items-start gap-3">
                        <Minus className="mt-0.5 h-5 w-5 flex-shrink-0 text-stone-400" />
                        <span>{tp(`bestFor.competitorReasons.${key}`)}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="bg-stone-50 py-16 sm:py-20">
          <div className={container}>
            <h2 className={cn(H2, "text-center mb-12")}>{tp("comparisonTitle")}</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] border-collapse">
                <thead>
                  <tr className="border-b border-stone-200">
                    <th className="py-4 px-4 text-left font-semibold text-stone-900">{ts("table.feature")}</th>
                    <th className="py-4 px-4 text-center font-semibold text-stone-900 w-32">{ts("table.focuspilot")}</th>
                    <th className="py-4 px-4 text-center font-semibold text-stone-900 w-32">{competitorName}</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((section) => (
                    <Fragment key={section.categoryKey}>
                      <tr className="bg-stone-100">
                        <td colSpan={3} className="py-3 px-4 font-semibold text-stone-900">
                          {tc(section.categoryKey)}
                        </td>
                      </tr>
                      {section.features.map((feature) => (
                        <tr key={feature.featureKey} className="border-b border-stone-100">
                          <td className="py-3 px-4 text-stone-700">{tf(feature.featureKey)}</td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex justify-center">
                              <FeatureStatusIcon status={feature.focuspilot} />
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex justify-center">
                              <FeatureStatusIcon status={feature.competitor} />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-stone-600">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" /> {ts("legend.full")}
              </div>
              <div className="flex items-center gap-2">
                <Minus className="h-4 w-4 text-amber-500" /> {ts("legend.partial")}
              </div>
              <div className="flex items-center gap-2">
                <X className="h-4 w-4 text-stone-300" /> {ts("legend.none")}
              </div>
            </div>
          </div>
        </section>

        {layout.hasMigration && migrationSteps ? (
          <section className="py-16 sm:py-20">
            <div className={container}>
              <div className="mx-auto max-w-3xl">
                <h2 className={cn(H2, "text-center mb-6")}>{tp("migration.title")}</h2>
                <p className={cn(Lead, "text-center mb-10")}>{tp("migration.subtitle")}</p>
                <div className="space-y-6">
                  {migrationSteps.map((stepKey, index) => (
                    <div key={stepKey} className="flex gap-4">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-stone-900 text-sm font-semibold text-white">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold">{tp(`migration.steps.${stepKey}.title`)}</div>
                        <p className="text-stone-600">{tp(`migration.steps.${stepKey}.description`)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <section className={cn("py-16 sm:py-20", layout.hasMigration ? "bg-stone-50" : "")}>
          <div className={container}>
            <div className="mx-auto max-w-3xl">
              <h2 className={cn(H2, "text-center mb-10")}>{ts("faqTitle")}</h2>
              <Accordion type="single" collapsible className="space-y-3">
                {faqItems.map((faq, index) => (
                  <AccordionItem
                    key={faq.key}
                    value={`faq-${index}`}
                    className="rounded-lg border border-stone-200 bg-white px-6"
                  >
                    <AccordionTrigger className="text-left font-medium hover:no-underline">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-stone-600">{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {layout.hasExploreLinks && exploreLinks ? (
          <section className="py-16 sm:py-20">
            <div className={container}>
              <h2 className={cn(H2, "text-center mb-10")}>{tp("explore.title")}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {exploreLinks.map((link) => (
                  <Link
                    key={link.key}
                    href={link.href}
                    className="group rounded-lg border border-stone-200 p-6 transition-colors hover:border-stone-300 hover:bg-stone-50"
                  >
                    <div className="font-semibold">{tp(`explore.links.${link.key}.title`)}</div>
                    <p className="mt-1 text-sm text-stone-600">{tp(`explore.links.${link.key}.description`)}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-stone-900 group-hover:gap-2 transition-all">
                      {ts("learnMore")} <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {layout.ctaVariant === "light" ? (
          <section className="bg-[#EFEAE2] py-24">
            <div className={container}>
              <div className="mx-auto max-w-3xl text-center">
                <h2 className="text-2xl sm:text-[28px] md:text-[32px] font-medium tracking-tight text-stone-900">
                  {tp("cta.title")}
                </h2>
                <p className="mt-3 text-base sm:text-lg text-stone-700">{tp("cta.subtitle")}</p>
                <div className="mt-8 flex justify-center">
                  <CtaButton href="/signup" variant="slate" label={tp("cta.primary")} showArrow arrowVariant="white" />
                </div>
                <p className="mt-3 text-xs sm:text-sm text-stone-600">{ts("noCreditCard")}</p>
              </div>
            </div>
          </section>
        ) : (
          <section className="bg-stone-900 py-16 sm:py-20">
            <div className={container}>
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-2xl sm:text-[28px] md:text-[32px] font-medium tracking-tight text-white">
                  {tp("cta.title")}
                </h2>
                <p className="mt-4 text-stone-300">{tp("cta.subtitle")}</p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                  <CtaButton href="/signup" className="bg-white text-stone-900 hover:bg-stone-100">
                    {tp("cta.primary")}
                  </CtaButton>
                  <CtaButton href="/compare" variant="outline" className="border-stone-600 text-white hover:bg-stone-800">
                    {tp("cta.secondary")}
                  </CtaButton>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  )
}
