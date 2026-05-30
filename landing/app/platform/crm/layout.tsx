import type React from "react"
import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { localeHreflangAlternates } from "@/lib/seo-alternates"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("platformCRM.meta")
  return {
    title: t("title"),
    description: t("description"),
    keywords: [
      "interior design CRM",
      "design studio CRM",
      "interior design lead management",
      "design client relationship management",
      "interior design sales pipeline",
      "design studio client tracking",
    ],
    openGraph: {
      title: t("title"),
      description: t("ogDescription"),
      url: "https://focuspilot.io/platform/crm",
      type: "website",
      images: [
        {
          url: "/images/og-crm.png",
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
    alternates: localeHreflangAlternates("platform/crm"),
  }
}

export default function CRMLayout({ children }: { children: React.ReactNode }) {
  return children
}
