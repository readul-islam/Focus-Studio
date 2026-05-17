"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ChevronRight, Download, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { CtaButton } from "@/components/cta-button"
import { MarketingPageHero } from "@/components/marketing/marketing-page-hero"
import { Reveal } from "@/components/marketing/reveal"
import { TemplateDownloadDialog } from "@/components/resources/template-download-dialog"
import {
  TEMPLATE_CATEGORIES,
  type StudioTemplate,
  type TemplateCategory,
  studioTemplates,
} from "@/lib/resources-data"
import { cn } from "@/lib/utils"

const container = "mx-auto max-w-[1200px] px-6 sm:px-8"
const TITLE_H1 = "text-[30px] sm:text-5xl md:text-[56px] font-medium tracking-tight leading-[1.1]"

export default function ResourcesTemplatesPage() {
  const [category, setCategory] = useState<TemplateCategory>("All")
  const [selected, setSelected] = useState<StudioTemplate | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const filtered = useMemo(() => {
    if (category === "All") return studioTemplates
    return studioTemplates.filter((t) => t.category === category)
  }, [category])

  function openDownload(template: StudioTemplate) {
    setSelected(template)
    setDialogOpen(true)
  }

  return (
    <main className="bg-white">
      <MarketingPageHero contentClassName={cn(container, "pb-12 pt-12 sm:pb-16 md:pt-16")}>
        <nav aria-label="Breadcrumb" className="mb-8 text-sm text-stone-500">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-stone-900">
                Home
              </Link>
            </li>
            <li aria-hidden>
              <ChevronRight className="h-3.5 w-3.5" />
            </li>
            <li className="font-medium text-stone-900" aria-current="page">
              Templates
            </li>
          </ol>
        </nav>
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-stone-300/60 bg-white px-3 py-1 text-xs text-stone-700">
            <Download className="h-3 w-3" aria-hidden />
            Free downloads
          </span>
          <h1 className={cn("mt-5", TITLE_H1)}>Studio templates</h1>
          <p className="mt-4 text-base leading-relaxed text-stone-600 sm:text-lg">
            Proposals, contracts, briefs, and procurement sheets—download outlines you can customise, or run them
            automatically in Focuspilot with AI.
          </p>
        </Reveal>
      </MarketingPageHero>

      <section className="border-b bg-stone-50 py-5">
        <div className={cn(container, "flex flex-wrap justify-center gap-2")}>
          {TEMPLATE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                category === cat
                  ? "bg-stone-900 text-white"
                  : "border border-stone-200 bg-white text-stone-700 hover:bg-stone-100",
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className={container}>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((template, index) => {
              const Icon = template.icon
              return (
                <Reveal key={template.slug} delay={index * 40}>
                  <Card className="h-full border-stone-200 bg-white transition-shadow hover:shadow-md">
                    <CardContent className="flex h-full flex-col p-6">
                      <div className="flex items-start justify-between">
                        <div className="rounded-lg bg-stone-100 p-2.5">
                          <Icon className="h-5 w-5 text-stone-600" aria-hidden />
                        </div>
                        {template.popular && (
                          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
                            Popular
                          </span>
                        )}
                      </div>
                      <span className="mt-4 text-xs font-medium uppercase tracking-wider text-stone-500">
                        {template.category}
                      </span>
                      <h2 className="mt-1 text-lg font-semibold text-stone-900">
                        <Link href={`/resources/templates/${template.slug}`} className="hover:underline">
                          {template.title}
                        </Link>
                      </h2>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-stone-600">{template.description}</p>
                      <div className="mt-5 flex gap-2">
                        <button
                          type="button"
                          onClick={() => openDownload(template)}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-stone-200 bg-white py-2.5 text-sm font-medium text-stone-800 hover:bg-stone-50"
                        >
                          <Download className="h-4 w-4" aria-hidden />
                          Download
                        </button>
                        <Link
                          href={`/resources/templates/${template.slug}`}
                          className="inline-flex items-center justify-center rounded-lg border border-stone-200 px-3 text-sm font-medium text-stone-700 hover:bg-stone-50"
                        >
                          Preview
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      <section className="border-t bg-white py-16 sm:py-20">
        <div className={container}>
          <Reveal>
            <div className="mx-auto max-w-4xl rounded-2xl bg-stone-900 p-8 text-center text-white sm:p-12">
              <Sparkles className="mx-auto h-8 w-8 text-[#E07A57]" aria-hidden />
              <h2 className="mt-4 text-2xl font-medium tracking-tight sm:text-3xl">
                Templates that update themselves
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-stone-300">
                In Focuspilot, proposals pull from your CRM, FF&E links to procurement, and invoices sync to finance—no
                copy-paste between spreadsheets.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <CtaButton href="/signup" variant="white" label="Start for free" showArrow arrowVariant="black" />
                <Link
                  href="/resources/ai-playbook"
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-white/30 px-4 text-sm font-medium text-white hover:bg-white/10"
                >
                  AI Playbook
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <TemplateDownloadDialog template={selected} open={dialogOpen} onOpenChange={setDialogOpen} />
    </main>
  )
}
