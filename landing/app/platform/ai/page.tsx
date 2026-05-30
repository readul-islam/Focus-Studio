import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import AIPlatformPage from "./ai-platform-page"
import { localeHreflangAlternates } from "@/lib/seo-alternates"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("platformAI.meta")
  return {
    title: t("title"),
    description: t("description"),
    alternates: localeHreflangAlternates("platform/ai"),
    openGraph: {
      title: t("title"),
      description: t("ogDescription"),
      url: "https://focuspilot.io/platform/ai",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("twitterDescription"),
    },
  }
}

export default function AIPage() {
  return <AIPlatformPage />
}
