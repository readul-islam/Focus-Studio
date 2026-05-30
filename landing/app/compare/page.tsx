import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { ComparePageContent } from "@/components/pages/compare-page-content"
import { localeHreflangAlternates } from "@/lib/seo-alternates"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("comparePage.meta")
  return {
    title: t("title"),
    description: t("description"),
    keywords: t.raw("keywords") as string[],
    openGraph: {
      title: t("title"),
      description: t("ogDescription"),
      type: "website",
      url: "https://focuspilot.io/compare",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("twitterDescription"),
    },
    alternates: localeHreflangAlternates("compare"),
  }
}

export default function ComparePage() {
  return <ComparePageContent />
}
