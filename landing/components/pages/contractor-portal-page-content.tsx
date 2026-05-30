"use client"

import { Calendar, Check, FileText, MessageSquare, Users } from "lucide-react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { CtaButton } from "@/components/cta-button"
import { Card, CardContent } from "@/components/ui/card"

const container = "mx-auto max-w-[1200px] px-6 sm:px-8"
const H1 = "text-[30px] sm:text-5xl md:text-[56px] font-medium tracking-tight leading-[1.1]"
const H2 = "text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight"
const Lead = "text-base sm:text-lg text-stone-600"

const FEATURE_ITEMS = [
  { key: "schedules", icon: Calendar },
  { key: "documents", icon: FileText },
  { key: "messaging", icon: MessageSquare },
  { key: "coordination", icon: Users },
] as const

const BENEFIT_KEYS = ["relevantScope", "anyDevice", "notifications", "siteUpdates", "noInstall"] as const

export function ContractorPortalPageContent() {
  const t = useTranslations("platformContractorPortal")
  const ts = useTranslations("platformShared")

  return (
    <main className="min-h-screen bg-white">
      <section className="bg-gradient-to-b from-stone-50 to-white py-16 sm:py-24">
        <div className={container}>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className={cn(H1, "text-center")}>{t("hero.title")}</h1>
            <p className={cn(Lead, "mt-4 text-center")}>{t("hero.subtitle")}</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <CtaButton href="/signup">{ts("startFreeTrial")}</CtaButton>
              <CtaButton href="/platform/projects" variant="outline">
                {ts("seeAllFeatures")}
              </CtaButton>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className={container}>
          <h2 className={cn(H2, "text-center mb-12")}>{t("features.title")}</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURE_ITEMS.map(({ key, icon: Icon }) => (
              <Card key={key} className="border-stone-200">
                <CardContent className="p-6">
                  <div className="rounded-lg bg-stone-100 p-2 w-fit">
                    <Icon className="h-5 w-5 text-stone-600" />
                  </div>
                  <h3 className="mt-4 font-semibold text-stone-900">{t(`features.items.${key}.title`)}</h3>
                  <p className="mt-2 text-sm text-stone-600">{t(`features.items.${key}.description`)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-stone-50 py-16 sm:py-20">
        <div className={container}>
          <div className="mx-auto max-w-3xl">
            <h2 className={cn(H2, "text-center mb-12")}>{t("benefits.title")}</h2>
            <div className="space-y-4">
              {BENEFIT_KEYS.map((key) => (
                <div key={key} className="flex items-center gap-3 rounded-lg bg-white p-4 border border-stone-200">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-stone-700">{t(`benefits.items.${key}`)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className={container}>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className={cn(H2)}>{t("cta.title")}</h2>
            <p className={cn(Lead, "mt-4")}>{t("cta.subtitle")}</p>
            <CtaButton href="/signup" className="mt-8">
              {ts("startFreeTrial")}
            </CtaButton>
          </div>
        </div>
      </section>
    </main>
  )
}
