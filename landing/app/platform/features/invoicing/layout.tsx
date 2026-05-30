import type React from "react"
import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { localeHreflangAlternates } from "@/lib/seo-alternates"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("platformInvoicing.meta")
  return {
    title: t("title"),
    description: t("description"),
    keywords: [
      "interior design proposals",
      "design studio invoicing",
      "AI proposal generator",
      "interior design billing",
      "design project quotes",
      "automated invoicing for designers",
    ],
    openGraph: {
      title: t("title"),
      description: t("ogDescription"),
      url: "https://focuspilot.io/platform/features/invoicing",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("twitterDescription"),
    },
    alternates: localeHreflangAlternates("platform/features/invoicing"),
  }
}

export default function InvoicingLayout({ children }: { children: React.ReactNode }) {
  return children
}
