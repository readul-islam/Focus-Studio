import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { localeHreflangAlternates } from "@/lib/seo-alternates"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("termsPage.meta")
  return {
    title: t("title"),
    description: t("description"),
    alternates: localeHreflangAlternates("terms"),
  }
}

export default async function TermsPage() {
  const t = await getTranslations("termsPage")

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-24">
        <h1 className="text-[30px] sm:text-5xl md:text-[56px] font-medium tracking-tight leading-[1.1] text-stone-900">
          {t("title")}
        </h1>
        <p className="mt-4 text-sm text-stone-500">{t("lastUpdated")}</p>

        <div className="mt-12 space-y-8 text-stone-600">
          {(["acceptance", "service", "accounts", "payment", "ip"] as const).map((key) => (
            <section key={key}>
              <h2 className="text-xl font-semibold text-stone-900">{t(`sections.${key}.title`)}</h2>
              <p className="mt-3">{t(`sections.${key}.body`)}</p>
            </section>
          ))}
          <section>
            <h2 className="text-xl font-semibold text-stone-900">{t("sections.contact.title")}</h2>
            <p className="mt-3">
              {t("sections.contact.bodyBefore")}{" "}
              <a href="mailto:legal@focuspilot.io" className="text-stone-900 underline hover:no-underline">
                legal@focuspilot.io
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
