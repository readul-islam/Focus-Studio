import type React from "react"
import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { localeHreflangAlternates } from "@/lib/seo-alternates"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("platformAiProcurement.meta")
  return {
    title: t("title"),
    description: t("description"),
    keywords: [
      "AI product sourcing",
      "interior design web clipper",
      "AI procurement for designers",
      "product extraction tool",
      "design specification software",
      "intelligent product sourcing",
    ],
    openGraph: {
      title: t("title"),
      description: t("ogDescription"),
      url: "https://focuspilot.io/platform/features/ai-procurement",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("twitterDescription"),
    },
    alternates: localeHreflangAlternates("platform/features/ai-procurement"),
  }
}

export default function AIProcurementLayout({ children }: { children: React.ReactNode }) {
  return children
}
