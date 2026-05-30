import type React from "react"
import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { localeHreflangAlternates } from "@/lib/seo-alternates"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("platformApprovals.meta")
  return {
    title: t("title"),
    description: t("description"),
    keywords: [
      "interior design approvals",
      "client sign-off software",
      "design approval workflow",
      "selection approval system",
      "interior design client approvals",
      "design decision tracking",
    ],
    openGraph: {
      title: t("title"),
      description: t("ogDescription"),
      url: "https://focuspilot.io/platform/features/approvals",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("twitterDescription"),
    },
    alternates: localeHreflangAlternates("platform/features/approvals"),
  }
}

export default function ApprovalsLayout({ children }: { children: React.ReactNode }) {
  return children
}
