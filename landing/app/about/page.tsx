import type { Metadata } from "next"
import { ArrowLeft } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { CtaButton } from "@/components/cta-button"
import { localeHreflangAlternates } from "@/lib/seo-alternates"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("aboutPage.meta")
  return {
    title: t("title"),
    description: t("description"),
    alternates: localeHreflangAlternates("about"),
  }
}

export default async function AboutPage() {
  const t = await getTranslations("aboutPage")
  const ts = await getTranslations("platformShared")

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-[30px] sm:text-5xl md:text-[56px] font-medium tracking-tight leading-[1.1] text-stone-900">
          {t("title")}
        </h1>
        <p className="mt-6 text-lg text-stone-600">{t("paragraph1")}</p>
        <p className="mt-4 text-stone-600">{t("paragraph2")}</p>
        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <CtaButton href="/signup">{ts("startFreeTrial")}</CtaButton>
          <CtaButton href="/" variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {ts("backToHome")}
          </CtaButton>
        </div>
      </div>
    </main>
  )
}
