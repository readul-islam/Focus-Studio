import type React from "react"
import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { localeHreflangAlternates } from "@/lib/seo-alternates"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("platformProcurement.meta")
  return {
    title: t("title"),
    description: t("description"),
    keywords: [
      "interior design procurement",
      "design product sourcing",
      "FF&E procurement software",
      "interior design purchase orders",
      "vendor management for designers",
      "design studio procurement",
    ],
    openGraph: {
      title: t("title"),
      description: t("ogDescription"),
      url: "https://focuspilot.io/platform/procurement",
      type: "website",
      images: [
        {
          url: "/images/og-procurement.png",
          width: 1200,
          height: 630,
          alt: t("ogImageAlt"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("twitterDescription"),
    },
    alternates: localeHreflangAlternates("platform/procurement"),
  }
}

export default function ProcurementLayout({ children }: { children: React.ReactNode }) {
  return children
}
