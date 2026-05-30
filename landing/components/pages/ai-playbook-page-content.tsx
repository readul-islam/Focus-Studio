"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowRight, Copy, Check, Sparkles } from "lucide-react"
import { useTranslations } from "next-intl"
import { CtaButton } from "@/components/cta-button"
import { MarketingPageHero } from "@/components/marketing/marketing-page-hero"
import { Reveal } from "@/components/marketing/reveal"
import { cn } from "@/lib/utils"

const container = "mx-auto max-w-[1200px] px-6 sm:px-8"
const TITLE_H1 = "text-[30px] sm:text-5xl md:text-[56px] font-medium tracking-tight leading-[1.1]"

const PLAYBOOK_CHAPTERS = [
  { id: "start", stepKeys: ["sourceOfTruth", "humanReview", "logDecisions"], promptKeys: ["projectContext"] },
  { id: "email", stepKeys: ["routeByProject", "draftDontSend", "surfaceBlockers"], promptKeys: ["clientUpdate", "chaseApproval"] },
  { id: "procurement", stepKeys: ["specFromSupplier", "alternateWhenDelayed", "batchPoPrep"], promptKeys: ["alternateProduct"] },
  { id: "tasks", stepKeys: ["kickoffTaskMap", "weeklyReplan"], promptKeys: ["kickoffTasks"] },
  { id: "proposals", stepKeys: ["scopeFromBrief", "alignWithTemplate"], promptKeys: ["scopeOutline"] },
  { id: "governance", stepKeys: ["noConfidentialUploads", "verifyNumbers", "brandVoiceChecklist"], promptKeys: ["tonePass"] },
] as const

const QUICK_WINS = [
  { key: "inboxSummary", href: "/platform/features/ai-email" },
  { key: "phasedProposal", href: "/platform/crm" },
  { key: "ffeSchedule", href: "/platform/procurement" },
] as const

function PromptBlock({ label, text, copyLabel, copiedLabel }: { label: string; text: string; copyLabel: string; copiedLabel: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-stone-50">
      <div className="flex items-center justify-between border-b border-stone-200 px-4 py-2">
        <span className="text-xs font-medium text-stone-600">{label}</span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-stone-600 hover:bg-stone-200/60"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? copiedLabel : copyLabel}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed text-stone-800 whitespace-pre-wrap font-sans">{text}</pre>
    </div>
  )
}

export function AiPlaybookPageContent() {
  const t = useTranslations("resourcesAiPlaybook")
  const [activeId, setActiveId] = useState<string>(PLAYBOOK_CHAPTERS[0]?.id ?? "")

  useEffect(() => {
    const sections = PLAYBOOK_CHAPTERS.map((c) => document.getElementById(c.id)).filter(Boolean)
    if (!sections.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]?.target.id) setActiveId(visible[0].target.id)
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0, 0.25, 0.5] },
    )

    sections.forEach((el) => observer.observe(el!))
    return () => observer.disconnect()
  }, [])

  return (
    <main className="bg-white">
      <MarketingPageHero contentClassName={cn(container, "pb-12 pt-12 sm:pb-16 md:pt-16")}>
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-stone-300/60 bg-white px-3 py-1 text-xs text-stone-700">
            <Sparkles className="h-3 w-3 text-[#C96A4A]" aria-hidden />
            {t("hero.badge")}
          </span>
          <h1 className={cn("mt-5", TITLE_H1)}>{t("hero.title")}</h1>
          <p className="mt-4 text-base leading-relaxed text-stone-600 sm:text-lg">{t("hero.subtitle")}</p>
          <div className="mt-8 flex justify-center">
            <CtaButton href="/platform/ai" variant="slate" label={t("hero.exploreAi")} showArrow arrowVariant="white" />
          </div>
        </Reveal>
      </MarketingPageHero>

      <section className="border-b bg-stone-50 py-14 sm:py-16">
        <div className={container}>
          <h2 className="text-center text-2xl font-semibold text-stone-900">{t("quickWinsTitle")}</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {QUICK_WINS.map((win, i) => (
              <Reveal key={win.key} delay={i * 60}>
                <Link
                  href={win.href}
                  className="group flex h-full flex-col rounded-2xl border border-stone-200 bg-white p-6 transition-shadow hover:shadow-md"
                >
                  <h3 className="font-semibold text-stone-900 group-hover:text-[#C96A4A]">{t(`quickWins.${win.key}.title`)}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-stone-600">{t(`quickWins.${win.key}.body`)}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-stone-900">
                    {t("learnMore")}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className={cn(container, "grid gap-12 lg:grid-cols-[220px_1fr]")}>
          <nav className="hidden lg:block" aria-label={t("navAriaLabel")}>
            <p className="text-xs font-medium uppercase tracking-wider text-stone-500">{t("onThisPage")}</p>
            <ul className="mt-4 space-y-1 border-l border-stone-200">
              {PLAYBOOK_CHAPTERS.map((ch) => (
                <li key={ch.id}>
                  <a
                    href={`#${ch.id}`}
                    className={cn(
                      "block border-l-2 py-2 pl-4 text-sm transition-colors -ml-px",
                      activeId === ch.id
                        ? "border-stone-900 font-medium text-stone-900"
                        : "border-transparent text-stone-500 hover:text-stone-800",
                    )}
                  >
                    {t(`chapters.${ch.id}.title`)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="min-w-0 space-y-16">
            {PLAYBOOK_CHAPTERS.map((chapter, index) => (
              <Reveal key={chapter.id} delay={index * 30}>
                <article id={chapter.id} className="scroll-mt-28">
                  <h2 className="text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
                    {t(`chapters.${chapter.id}.title`)}
                  </h2>
                  <p className="mt-3 max-w-2xl text-lg text-stone-600">{t(`chapters.${chapter.id}.summary`)}</p>

                  <ol className="mt-8 space-y-6">
                    {chapter.stepKeys.map((stepKey, stepIndex) => (
                      <li key={stepKey} className="flex gap-4">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-900 text-sm font-medium text-white">
                          {stepIndex + 1}
                        </span>
                        <div>
                          <h3 className="font-semibold text-stone-900">{t(`chapters.${chapter.id}.steps.${stepKey}.title`)}</h3>
                          <p className="mt-1 text-stone-600 leading-relaxed">{t(`chapters.${chapter.id}.steps.${stepKey}.body`)}</p>
                        </div>
                      </li>
                    ))}
                  </ol>

                  <div className="mt-10 space-y-4">
                    <h3 className="text-sm font-medium uppercase tracking-wider text-stone-500">{t("promptLibrary")}</h3>
                    {chapter.promptKeys.map((promptKey) => (
                      <PromptBlock
                        key={promptKey}
                        label={t(`chapters.${chapter.id}.prompts.${promptKey}.label`)}
                        text={t(`chapters.${chapter.id}.prompts.${promptKey}.text`)}
                        copyLabel={t("copy")}
                        copiedLabel={t("copied")}
                      />
                    ))}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-stone-900 py-16 text-white sm:py-20">
        <div className={cn(container, "mx-auto max-w-3xl text-center")}>
          <h2 className="text-2xl font-medium sm:text-3xl">{t("finalCta.title")}</h2>
          <p className="mt-4 text-stone-300">{t("finalCta.subtitle")}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <CtaButton href="/signup" variant="white" label={t("finalCta.startFree")} showArrow arrowVariant="black" />
            <Link
              href="/resources/templates"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-white/30 px-4 text-sm font-medium text-white hover:bg-white/10"
            >
              {t("finalCta.browseTemplates")}
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
