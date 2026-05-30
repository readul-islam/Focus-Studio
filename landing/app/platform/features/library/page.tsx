import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { ProductLibraryPageContent } from "@/components/pages/product-library-page-content"
import { localeHreflangAlternates } from "@/lib/seo-alternates"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("platformProductLibrary.meta")
  return {
    title: t("title"),
    description: t("description"),
    keywords: [
      "interior design product library",
      "FF&E database",
      "design product management",
      "AI product sourcing",
      "interior design specifications",
      "product catalogue software",
    ],
    openGraph: {
      title: t("title"),
      description: t("ogDescription"),
      url: "https://focuspilot.io/platform/features/library",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("twitterDescription"),
    },
    alternates: localeHreflangAlternates("platform/features/library"),
  }
}

export default function ProductLibraryPage() {
  return <ProductLibraryPageContent />
}
