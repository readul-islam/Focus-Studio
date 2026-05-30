import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { localeHreflangAlternates } from "@/lib/seo-alternates"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("privacyPage.meta")
  return {
    title: t("title"),
    description: t("description"),
    alternates: localeHreflangAlternates("privacy"),
  }
}

export default async function PrivacyPage() {
  const t = await getTranslations("privacyPage")

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-24">
        <h1 className="text-[30px] sm:text-5xl md:text-[56px] font-medium tracking-tight leading-[1.1] text-stone-900">
          {t("title")}
        </h1>
        <p className="mt-4 text-sm text-stone-500">{t("lastUpdated")}</p>

        <div className="mt-12 space-y-8 text-stone-600">
          <section>
            <h2 className="text-xl font-semibold text-stone-900">{t("sections.collect.title")}</h2>
            <p className="mt-3">{t("sections.collect.p1")}</p>
            <p className="mt-3">{t("sections.collect.p2")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900">{t("sections.use.title")}</h2>
            <p className="mt-3">{t("sections.use.body")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900">{t("sections.google.title")}</h2>
            <p className="mt-3">{t("sections.google.p1")}</p>
            <p className="mt-3">{t("sections.google.p2")}</p>
            <p className="mt-3">{t("sections.google.p3")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900">{t("sections.sharing.title")}</h2>
            <p className="mt-3">{t("sections.sharing.intro")}</p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              {(["processors", "team", "google", "legal"] as const).map((key) => (
                <li key={key}>
                  <strong className="text-stone-800">{t(`sections.sharing.${key}.label`)}</strong>{" "}
                  {t(`sections.sharing.${key}.body`)}
                </li>
              ))}
            </ul>
            <p className="mt-3">{t("sections.sharing.outro")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900">{t("sections.security.title")}</h2>
            <p className="mt-3">{t("sections.security.body")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900">{t("sections.rights.title")}</h2>
            <p className="mt-3">
              {t("sections.rights.bodyBefore")}{" "}
              <a href="mailto:privacy@focuspilot.io" className="text-stone-900 underline hover:no-underline">
                privacy@focuspilot.io
              </a>{" "}
              to exercise these rights.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900">{t("sections.contactUs.title")}</h2>
            <p className="mt-3">
              {t("sections.contactUs.bodyBefore")}{" "}
              <a href="mailto:privacy@focuspilot.io" className="text-stone-900 underline hover:no-underline">
                privacy@focuspilot.io
              </a>
              . {t("sections.contactUs.bodyAfter")}{" "}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                className="text-stone-900 underline hover:no-underline"
                rel="noopener noreferrer"
                target="_blank"
              >
                {t("sections.contactUs.policyLinkText")}
              </a>
              {t("sections.contactUs.bodyEnd")}
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
