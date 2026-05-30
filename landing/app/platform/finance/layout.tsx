import type React from "react"
import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { localeHreflangAlternates } from "@/lib/seo-alternates"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("platformFinance.meta")
  return {
    title: t("title"),
    description: t("description"),
    keywords: [
      "interior design invoicing",
      "design studio finance software",
      "interior design billing",
      "project budget tracking",
      "design studio accounting",
      "interior design financial management",
    ],
    openGraph: {
      title: t("title"),
      description: t("ogDescription"),
      url: "https://focuspilot.io/platform/finance",
      type: "website",
      images: [
        {
          url: "/images/og-finance.png",
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
    alternates: localeHreflangAlternates("platform/finance"),
  }
}

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
  return children
}
