import type React from "react"
import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { localeHreflangAlternates } from "@/lib/seo-alternates"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("integrationsPage.meta")
  return {
    title: t("title"),
    description: t("description"),
    alternates: localeHreflangAlternates("integrations"),
  }
}

export default function IntegrationsLayout({ children }: { children: React.ReactNode }) {
  return children
}
