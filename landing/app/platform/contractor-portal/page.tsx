import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { ContractorPortalPageContent } from "@/components/pages/contractor-portal-page-content"
import { localeHreflangAlternates } from "@/lib/seo-alternates"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("platformContractorPortal.meta")
  return {
    title: t("title"),
    description: t("description"),
    keywords: [
      "interior design contractor portal",
      "trade management software",
      "contractor collaboration",
      "interior design project coordination",
      "trade scheduling software",
    ],
    openGraph: {
      title: t("title"),
      description: t("ogDescription"),
      url: "https://focuspilot.io/platform/contractor-portal",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("twitterTitle"),
      description: t("twitterDescription"),
    },
    alternates: localeHreflangAlternates("platform/contractor-portal"),
  }
}

export default function ContractorPortalPage() {
  return <ContractorPortalPageContent />
}
