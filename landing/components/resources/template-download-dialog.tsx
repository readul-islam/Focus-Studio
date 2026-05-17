"use client"

import Link from "next/link"
import { Download } from "lucide-react"
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
  if (!template) return null

  const signupHref = `/signup?template=${encodeURIComponent(template.slug)}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-stone-200 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-stone-900">{template.title}</DialogTitle>
          <DialogDescription className="text-stone-600">
            {template.format} — customise in Word, Google Docs, or use the automated version in Focuspilot.
          </DialogDescription>
        </DialogHeader>

        <ul className="mt-2 space-y-2 text-sm text-stone-600">
          {template.includes.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="text-stone-400" aria-hidden>
                •
              </span>
              {item}
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
            Download outline
          </a>
          <CtaButton
            href={signupHref}
            variant="slate"
            label="Use in Focuspilot"
            showArrow
            arrowVariant="white"
            className="flex-1 justify-center"
          />
        </div>

        <p className="text-center text-xs text-stone-500">
          Automate this template with AI proposals, approvals, and invoicing.{" "}
          <Link href="/resources/ai-playbook" className="font-medium text-stone-700 underline-offset-2 hover:underline">
            See AI Playbook
          </Link>
        </p>
      </DialogContent>
    </Dialog>
  )
}
