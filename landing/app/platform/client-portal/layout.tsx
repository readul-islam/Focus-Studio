import type React from "react"
import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { localeHreflangAlternates } from "@/lib/seo-alternates"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("platformClientPortal.meta")
  return {
    title: t("title"),
    description: t("description"),
    keywords: [
      "interior design client portal",
      "design client collaboration",
      "client approval software",
      "interior design client management",
      "design selection approvals",
      "client project portal",
    ],
    openGraph: {
      title: t("title"),
      description: t("ogDescription"),
      url: "https://focuspilot.io/platform/client-portal",
      type: "website",
      images: [
        {
          url: "/images/og-client-portal.png",
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
    alternates: localeHreflangAlternates("platform/client-portal"),
  }
}

export default function ClientPortalLayout({ children }: { children: React.ReactNode }) {
  return children
}
