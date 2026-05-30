"use client"

import { Mail, MessageSquare } from "lucide-react"
import { useTranslations } from "next-intl"
import { CtaButton } from "@/components/cta-button"

export function ContactPageContent() {
  const t = useTranslations("contactPage")

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-[30px] sm:text-5xl md:text-[56px] font-medium tracking-tight leading-[1.1] text-stone-900">
          {t("title")}
        </h1>
        <p className="mt-6 text-lg text-stone-600">{t("subtitle")}</p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-stone-200 p-6">
            <Mail className="mx-auto h-8 w-8 text-stone-600" />
            <h2 className="mt-4 font-semibold text-stone-900">{t("email.title")}</h2>
            <p className="mt-2 text-sm text-stone-600">{t("email.description")}</p>
            <a
              href="mailto:hello@focuspilot.io"
              className="mt-4 inline-block text-stone-900 underline hover:no-underline"
            >
              hello@focuspilot.io
            </a>
          </div>
          <div className="rounded-xl border border-stone-200 p-6">
            <MessageSquare className="mx-auto h-8 w-8 text-stone-600" />
            <h2 className="mt-4 font-semibold text-stone-900">{t("demo.title")}</h2>
            <p className="mt-2 text-sm text-stone-600">{t("demo.description")}</p>
            <CtaButton href="/signup" className="mt-4">
              {t("demo.cta")}
            </CtaButton>
          </div>
        </div>
      </div>
    </main>
  )
}
