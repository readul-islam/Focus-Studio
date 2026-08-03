import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { MarketingPageHero } from "@/components/marketing/marketing-page-hero"
import { TemplateDetailClient } from "./template-detail-client"
import { getTemplateBySlug, studioTemplates } from "@/lib/resources-data"
import { generateBreadcrumbSchema } from "@/lib/seo-schemas"
import { cn } from "@/lib/utils"

const container = "mx-auto max-w-[1200px] px-6 sm:px-8"

export function generateStaticParams() {
  return studioTemplates.map((t) => ({ slug: t.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const template = getTemplateBySlug(params.slug)
  if (!template) return { title: "Template not found" }
  return {
    title: `${template.title} | Free Interior Design Template | Focuspilot`,
    description: `${template.description} Download free studio templates built for interior designers and architects by Focuspilot.`,
    keywords: [
      "Focuspilot",
      "Focuspilot templates",
      template.title,
      `${template.category} template for interior designers`,
      "interior design templates",
      "design studio documents",
    ],
    openGraph: {
      title: `${template.title} | Focuspilot Studio Templates`,
      description: template.description,
      type: "website",
      url: `https://focuspilot.io/resources/templates/${template.slug}`,
      siteName: "Focuspilot",
    },
    twitter: {
      card: "summary_large_image",
      title: `${template.title} | Focuspilot Studio Templates`,
      description: template.description,
    },
    alternates: { canonical: `https://focuspilot.io/resources/templates/${template.slug}` },
  }
}

export default function TemplateDetailPage({ params }: { params: { slug: string } }) {
  const template = getTemplateBySlug(params.slug)
  if (!template) notFound()

  const Icon = template.icon
  const otherTemplates = studioTemplates.filter((t) => t.slug !== template.slug)

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://focuspilot.io" },
    { name: "Resources", url: "https://focuspilot.io/resources/templates" },
    { name: template.title, url: `https://focuspilot.io/resources/templates/${template.slug}` },
  ])

  const documentSchema = {
    "@context": "https://schema.org",
    "@type": "DigitalDocument",
    name: template.title,
    description: template.description,
    url: `https://focuspilot.io/resources/templates/${template.slug}`,
    publisher: {
      "@type": "Organization",
      name: "Focuspilot",
      url: "https://focuspilot.io",
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(documentSchema) }}
      />

      <main className="bg-white">
        <MarketingPageHero
          gridHeight="min(380px, 45vh)"
          contentClassName={cn(container, "pb-10 pt-10 sm:pb-14 sm:pt-12")}
        >
          <div className="mx-auto max-w-3xl">
            <div className="inline-flex rounded-lg bg-stone-100 p-3">
              <Icon className="h-6 w-6 text-stone-600" aria-hidden />
            </div>
            <p className="mt-4 text-xs font-medium uppercase tracking-wider text-stone-500">
              {template.category}
            </p>
            <h1 className="mt-2 text-3xl font-medium tracking-tight text-stone-900 sm:text-4xl">
              {template.title}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-stone-600">{template.description}</p>
          </div>
        </MarketingPageHero>

        <section className="py-14 sm:py-16">
          <div className={cn(container, "grid gap-12 lg:grid-cols-[1fr_320px]")}>
            <div>
              <h2 className="text-xl font-semibold text-stone-900">What&apos;s included</h2>
              <ul className="mt-4 space-y-3">
                {template.includes.map((item) => (
                  <li key={item} className="flex gap-3 text-stone-600">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#E07A57]" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>

              <h2 className="mt-10 text-xl font-semibold text-stone-900">Preview structure</h2>
              <ul className="mt-4 space-y-2 rounded-xl border border-stone-200 bg-stone-50 p-6 text-sm text-stone-700">
                {template.preview.map((line) => (
                  <li key={line}>• {line}</li>
                ))}
              </ul>
            </div>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <TemplateDetailClient slug={template.slug} />
            </aside>
          </div>
        </section>

        {/* Related Templates for Internal Linking & Search Indexing */}
        <section className="border-t bg-stone-50 py-12 sm:py-16">
          <div className={container}>
            <h2 className="text-2xl font-semibold text-stone-900">Explore more studio templates</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {otherTemplates.map((t) => {
                const TempIcon = t.icon
                return (
                  <Link
                    key={t.slug}
                    href={`/resources/templates/${t.slug}`}
                    className="group rounded-2xl border border-stone-200 bg-white p-6 transition hover:shadow-md hover:border-stone-300"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-stone-100 p-2.5">
                        <TempIcon className="h-5 w-5 text-stone-700" />
                      </div>
                      <span className="text-xs font-medium uppercase text-stone-500">{t.category}</span>
                    </div>
                    <h3 className="mt-4 font-semibold text-stone-900 group-hover:text-[#C96A4A] transition-colors">
                      {t.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-stone-600">{t.description}</p>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

