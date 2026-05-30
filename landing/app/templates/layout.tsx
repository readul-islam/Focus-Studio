import type { Metadata } from "next"
import type { ReactNode } from "react"
import { getTranslations } from "next-intl/server"
import { localeHreflangAlternates } from "@/lib/seo-alternates"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("templatesRedirect.meta")
  return {
    title: t("title"),
    description: t("description"),
    alternates: localeHreflangAlternates("resources/templates"),
  }
}

export default function TemplatesLayout({ children }: { children: ReactNode }) {
  return children
}
