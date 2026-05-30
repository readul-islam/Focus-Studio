import type React from "react"
import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { localeHreflangAlternates } from "@/lib/seo-alternates"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("platformProjects.meta")
  return {
    title: t("title"),
    description: t("description"),
    keywords: [
      "interior design project management",
      "design project tracking",
      "interior design workflow",
      "design studio project software",
      "project management for designers",
      "interior design timeline management",
    ],
    openGraph: {
      title: t("title"),
      description: t("ogDescription"),
      url: "https://focuspilot.io/platform/projects",
      type: "website",
      images: [
        {
          url: "/images/og-projects.png",
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
    alternates: localeHreflangAlternates("platform/projects"),
  }
}

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return children
}
