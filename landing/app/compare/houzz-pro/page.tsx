import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { CompareDetailPageContent } from "@/components/pages/compare-detail-page-content"
import { localeHreflangAlternates } from "@/lib/seo-alternates"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("compareDetailPages.houzz-pro.meta")
  return {
    title: t("title"),
    description: t("description"),
    keywords: t.raw("keywords") as string[],
    openGraph: {
      title: t("title"),
      description: t("ogDescription"),
      type: "article",
      url: "https://focuspilot.io/compare/houzz-pro",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("twitterDescription"),
    },
    alternates: localeHreflangAlternates("compare/houzz-pro"),
  }
}

export default function FocuspilotVsHouzzProPage() {
  return <CompareDetailPageContent slug="houzz-pro" />
}
