"use client"

import Link from "next/link"
import { Download } from "lucide-react"
import { useTranslations } from "next-intl"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CtaButton } from "@/components/cta-button"
import type { StudioTemplate } from "@/lib/resources-data"

type TemplateDownloadDialogProps = {
  template: StudioTemplate | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TemplateDownloadDialog({ template, open, onOpenChange }: TemplateDownloadDialogProps) {
  const t = useTranslations("templateDownloadDialog")
  const tt = useTranslations("resourcesTemplates")

  if (!template) return null

  const signupHref = `/signup?template=${encodeURIComponent(template.slug)}`
  const format = tt(`templates.${template.slug}.format`)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-stone-200 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-stone-900">
            {tt(`templates.${template.slug}.title`)}
          </DialogTitle>
          <DialogDescription className="text-stone-600">{t("formatDescription", { format })}</DialogDescription>
        </DialogHeader>

        <ul className="mt-2 space-y-2 text-sm text-stone-600">
          {template.includeKeys.map((key) => (
            <li key={key} className="flex gap-2">
              <span className="text-stone-400" aria-hidden>
                •
              </span>
              {tt(`templates.${template.slug}.includes.${key}`)}
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a
            href={template.downloadPath}
            download
            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-stone-200 bg-white px-4 text-sm font-medium text-stone-900 transition-colors hover:bg-stone-50"
            onClick={() => onOpenChange(false)}
          >
            <Download className="h-4 w-4" aria-hidden />
            {t("downloadOutline")}
          </a>
          <CtaButton
            href={signupHref}
            variant="slate"
            label={t("useInFocuspilot")}
            showArrow
            arrowVariant="white"
            className="flex-1 justify-center"
          />
        </div>

        <p className="text-center text-xs text-stone-500">
          {t("footerNote")}{" "}
          <Link href="/resources/ai-playbook" className="font-medium text-stone-700 underline-offset-2 hover:underline">
            {t("seeAiPlaybook")}
          </Link>
        </p>
      </DialogContent>
    </Dialog>
  )
}
