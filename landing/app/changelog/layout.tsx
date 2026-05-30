import type { Metadata } from "next"
import type { ReactNode } from "react"
import { getTranslations } from "next-intl/server"
import { localeHreflangAlternates } from "@/lib/seo-alternates"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("changelogPage.meta")
  return {
    title: t("title"),
    description: t("description"),
    alternates: localeHreflangAlternates("changelog"),
  }
}

export default function ChangelogLayout({ children }: { children: ReactNode }) {
  return children
}
