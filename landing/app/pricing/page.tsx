import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { PricingPageContent } from "@/components/pages/pricing-page-content"
import { localeHreflangAlternates } from "@/lib/seo-alternates"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pricingPage.meta")
  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("ogDescription"),
      type: "website",
      url: "https://focuspilot.io/pricing",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("twitterDescription"),
    },
    alternates: localeHreflangAlternates("pricing"),
  }
}

export default function PricingPage() {
  return <PricingPageContent />
}
