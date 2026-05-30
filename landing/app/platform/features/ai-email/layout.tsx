import type React from "react"
import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { localeHreflangAlternates } from "@/lib/seo-alternates"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("platformAiEmail.meta")
  return {
    title: t("title"),
    description: t("description"),
    keywords: [
      "interior design email management",
      "AI email for designers",
      "design studio communication",
      "project email routing",
      "interior design inbox",
      "client communication software",
    ],
    openGraph: {
      title: t("title"),
      description: t("ogDescription"),
      url: "https://focuspilot.io/platform/features/ai-email",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("twitterDescription"),
    },
    alternates: localeHreflangAlternates("platform/features/ai-email"),
  }
}

export default function AIEmailLayout({ children }: { children: React.ReactNode }) {
  return children
}
