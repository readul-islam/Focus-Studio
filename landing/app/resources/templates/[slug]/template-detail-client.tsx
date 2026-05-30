"use client"

import { useState } from "react"
import Link from "next/link"
import { Download } from "lucide-react"
import { useTranslations } from "next-intl"
import { CtaButton } from "@/components/cta-button"
import { TemplateDownloadDialog } from "@/components/resources/template-download-dialog"
import { getTemplateBySlug } from "@/lib/resources-data"

export function TemplateDetailClient({ slug }: { slug: string }) {
  const t = useTranslations("templateDetail")
  const tt = useTranslations("resourcesTemplates")
  const template = getTemplateBySlug(slug)
  const [open, setOpen] = useState(false)

  if (!template) return null

  return (
    <>
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-stone-900">{tt(`templates.${slug}.format`)}</p>
        <p className="mt-1 text-sm text-stone-500">{t("freeOutline")}</p>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-stone-900 py-3 text-sm font-medium text-white hover:bg-stone-800"
        >
          <Download className="h-4 w-4" aria-hidden />
          {t("download")}
        </button>

        <CtaButton
          href={`/signup?template=${encodeURIComponent(template.slug)}`}
          variant="slate"
          label={t("automateInFocuspilot")}
          showArrow
          arrowVariant="white"
          className="mt-3 w-full justify-center"
        />

        <Link
          href="/resources/templates"
          className="mt-4 block text-center text-sm text-stone-500 hover:text-stone-800"
        >
          {t("allTemplates")}
        </Link>
      </div>

      <TemplateDownloadDialog template={template} open={open} onOpenChange={setOpen} />
    </>
  )
}
