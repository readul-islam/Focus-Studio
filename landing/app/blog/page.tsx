import type { Metadata } from "next"
import { Suspense } from "react"
import { getTranslations } from "next-intl/server"
import { BlogPageContent } from "@/components/blog/blog-page-content"
import { localeHreflangAlternates } from "@/lib/seo-alternates"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("blogPage.meta")
  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      type: "website",
      url: "https://focuspilot.io/blog",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
    alternates: localeHreflangAlternates("blog"),
  }
}

export default function BlogPage() {
  return (
    <Suspense fallback={null}>
      <BlogPageContent />
    </Suspense>
  )
}
