import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { TemplateDetailPageContent } from "./template-detail-page-content"
import { getTemplateBySlug, studioTemplates, toSerializableTemplate } from "@/lib/resources-data"
import { localeHreflangAlternates } from "@/lib/seo-alternates"

export function generateStaticParams() {
  return studioTemplates.map((t) => ({ slug: t.slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const template = getTemplateBySlug(params.slug)
  const t = await getTranslations("resourcesTemplates")

  if (!template) {
    return { title: t("detail.notFoundTitle") }
  }

  const title = `${t(`templates.${template.slug}.title`)}${t("detail.metaTitleSuffix")}`
  const description = t(`templates.${template.slug}.description`)

  return {
    title,
    description,
    alternates: localeHreflangAlternates(`resources/templates/${template.slug}`),
  }
}

export default async function TemplateDetailPage({ params }: { params: { slug: string } }) {
  const template = getTemplateBySlug(params.slug)
  if (!template) notFound()
  return <TemplateDetailPageContent template={toSerializableTemplate(template)} />
}
