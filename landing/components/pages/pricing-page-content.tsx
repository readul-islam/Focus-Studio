"use client"

import type React from "react"
import { useMemo } from "react"
import { useTranslations } from "next-intl"
import { CtaButton } from "@/components/cta-button"

const FAQ_KEYS = [
  "afterBeta",
  "userPricing",
  "tryBeforeBuy",
  "paymentMethods",
  "setupFee",
  "annualBilling",
] as const

function CheckIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )
}

export function PricingPageContent() {
  const t = useTranslations("pricingPage")

  const faqItems = useMemo(
    () => FAQ_KEYS.map((key) => ({ key, question: t(`faq.items.${key}.question`), answer: t(`faq.items.${key}.answer`) })),
    [t],
  )

  const faqSchema = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    }),
    [faqItems],
  )

  const betaFeatures = ["users", "ai", "projects", "portal", "procurement", "support"] as const
  const soloFeatures = ["users", "projects", "portal", "crm", "storage", "support"] as const
  const proFeatures = ["everything", "unlimited", "automation", "branding", "support", "sla"] as const
  const enterpriseFeatures = ["everything", "unlimited", "security", "api", "manager", "billing"] as const

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <main className="min-h-screen">
        <section className="relative bg-gradient-to-b from-stone-50 to-white py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-1.5 text-sm text-stone-700">
                <span className="relative flex h-2 w-2">
                  <span
                    className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                    style={{ backgroundColor: "#8FA58F" }}
                  />
                  <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: "#8FA58F" }} />
                </span>
                {t("hero.badge")}
              </div>

              <h1 className="text-[30px] sm:text-5xl md:text-[56px] font-medium tracking-tight leading-[1.1] text-stone-900 mb-6">
                {t("hero.title")}
              </h1>

              <p className="text-base sm:text-lg leading-relaxed text-stone-600 max-w-2xl mx-auto">{t("hero.subtitle")}</p>
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-20 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 sm:gap-8 md:grid-cols-2 xl:grid-cols-4 max-w-7xl mx-auto">
              {/* Beta Plan */}
              <div className="relative rounded-2xl border-2 border-stone-200 bg-white p-6 sm:p-8 shadow-sm hover:shadow-lg transition-shadow">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl sm:text-2xl font-medium text-stone-900">{t("plans.beta.name")}</h2>
                    <span
                      className="rounded-full px-3 py-1 text-xs font-medium"
                      style={{ backgroundColor: "#ECF3EC", color: "#6E7A58" }}
                    >
                      {t("plans.beta.badge")}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl sm:text-5xl font-bold text-stone-900">{t("plans.beta.price")}</span>
                  </div>
                  <p className="text-sm sm:text-base text-stone-600">{t("plans.beta.description")}</p>
                </div>

                <ul className="space-y-3 sm:space-y-4 mb-8">
                  {betaFeatures.map((key) => (
                    <li key={key} className="flex items-start gap-3">
                      <CheckIcon className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: "#8FA58F" }} />
                      <span className="text-sm sm:text-base text-stone-700">{t(`plans.beta.features.${key}`)}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href="/signup"
                  className="block w-full rounded-lg bg-stone-900 px-4 py-3 text-center text-sm sm:text-base font-medium text-white hover:bg-stone-800 transition-colors"
                >
                  {t("plans.beta.cta")}
                </a>
              </div>

              {/* Solo Plan */}
              <div className="relative rounded-2xl border-2 border-stone-200 bg-white p-6 sm:p-8 shadow-sm hover:shadow-lg transition-shadow">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl sm:text-2xl font-medium text-stone-900">{t("plans.solo.name")}</h2>
                    <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-medium text-stone-600">
                      {t("plans.solo.badge")}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl sm:text-5xl font-bold text-stone-900">{t("plans.solo.price")}</span>
                    <span className="text-stone-500 text-base sm:text-lg">{t("plans.solo.priceUnit")}</span>
                  </div>
                  <p className="text-sm sm:text-base text-stone-600">{t("plans.solo.description")}</p>
                </div>

                <ul className="space-y-3 sm:space-y-4 mb-8">
                  {soloFeatures.map((key) => (
                    <li key={key} className="flex items-start gap-3">
                      <CheckIcon className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: "#8FA58F" }} />
                      <span className="text-sm sm:text-base text-stone-700">{t(`plans.solo.features.${key}`)}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href="/signup"
                  className="block w-full rounded-lg border-2 border-stone-900 bg-white px-4 py-3 text-center text-sm sm:text-base font-medium text-stone-900 hover:bg-stone-50 transition-colors"
                >
                  {t("plans.solo.cta")}
                </a>
              </div>

              {/* Professional Plan */}
              <div className="relative rounded-2xl border-2 border-stone-900 bg-stone-900 p-6 sm:p-8 shadow-xl">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-stone-900 shadow-sm">
                    {t("plans.professional.badge")}
                  </span>
                </div>

                <div className="mb-6">
                  <h2 className="text-xl sm:text-2xl font-medium text-white mb-4">{t("plans.professional.name")}</h2>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl sm:text-5xl font-bold text-white">{t("plans.professional.price")}</span>
                    <span className="text-stone-300 text-base sm:text-lg">{t("plans.professional.priceUnit")}</span>
                  </div>
                  <p className="text-sm sm:text-base text-stone-300">{t("plans.professional.description")}</p>
                </div>

                <ul className="space-y-3 sm:space-y-4 mb-8">
                  {proFeatures.map((key) => (
                    <li key={key} className="flex items-start gap-3">
                      <CheckIcon className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: "#B9C7B7" }} />
                      <span className="text-sm sm:text-base text-white">{t(`plans.professional.features.${key}`)}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href="/signup"
                  className="block w-full rounded-lg bg-white px-4 py-3 text-center text-sm sm:text-base font-medium text-stone-900 hover:bg-stone-100 transition-colors"
                >
                  {t("plans.professional.cta")}
                </a>
              </div>

              {/* Enterprise Plan */}
              <div className="relative rounded-2xl border-2 border-stone-200 bg-white p-6 sm:p-8 shadow-sm hover:shadow-lg transition-shadow">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl sm:text-2xl font-medium text-stone-900">{t("plans.enterprise.name")}</h2>
                    <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-medium text-stone-600">
                      {t("plans.enterprise.badge")}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl sm:text-5xl font-bold text-stone-900">{t("plans.enterprise.price")}</span>
                  </div>
                  <p className="text-sm sm:text-base text-stone-600">{t("plans.enterprise.description")}</p>
                </div>

                <ul className="space-y-3 sm:space-y-4 mb-8">
                  {enterpriseFeatures.map((key) => (
                    <li key={key} className="flex items-start gap-3">
                      <CheckIcon className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: "#8FA58F" }} />
                      <span className="text-sm sm:text-base text-stone-700">{t(`plans.enterprise.features.${key}`)}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href="mailto:sales@focuspilot.io?subject=Enterprise%20plan"
                  className="block w-full rounded-lg border-2 border-stone-900 bg-white px-4 py-3 text-center text-sm sm:text-base font-medium text-stone-900 hover:bg-stone-50 transition-colors"
                >
                  {t("plans.enterprise.cta")}
                </a>
              </div>
            </div>

            <div className="mt-12 text-center">
              <p className="text-sm text-stone-600 max-w-2xl mx-auto">{t("note")}</p>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-24 bg-stone-50">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight text-stone-900 mb-4">
                {t("faq.title")}
              </h2>
              <p className="text-base sm:text-lg leading-relaxed text-stone-600">{t("faq.subtitle")}</p>
            </div>

            <div className="space-y-6">
              {faqItems.map((item) => (
                <div key={item.key} className="rounded-xl border border-stone-200 bg-white p-6">
                  <h3 className="text-lg font-medium text-stone-900 mb-2">{item.question}</h3>
                  <p className="text-base text-stone-600">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 bg-[#3F4B51]">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-[28px] md:text-[32px] font-medium tracking-tight text-white">{t("cta.title")}</h2>
            <p className="mt-3 text-base sm:text-lg text-stone-300">{t("cta.subtitle")}</p>
            <div className="mt-8 flex justify-center">
              <CtaButton href="/signup" variant="white" label={t("cta.button")} showArrow arrowVariant="black" />
            </div>
            <p className="mt-3 text-xs sm:text-sm text-stone-400">{t("cta.noCreditCard")}</p>
          </div>
        </section>
      </main>
    </>
  )
}
