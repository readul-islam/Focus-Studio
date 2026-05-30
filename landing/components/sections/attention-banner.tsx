"use client"

import type React from "react"

import { useEffect, useMemo, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import * as LucideReact from "lucide-react"
import { cn } from "@/lib/utils"

const container = "mx-auto max-w-[1200px] px-6 sm:px-8"

const Y_BG = "bg-[#E07A57]"
const Y_BUBBLE = "bg-[#F2B49C]"
const Y_BUBBLE_DARK = "bg-[#D96E4F]"
const TEXT_DARK = "text-stone-950"

const styles = `
@keyframes floaty {
0% { transform: translateY(0) }
50% { transform: translateY(-6px) }
100% { transform: translateY(0) }
}
@keyframes popIn {
0% { opacity: 0; transform: translateY(6px) scale(0.98) }
100% { opacity: 1; transform: translateY(0) scale(1) }
}
`

type Msg = {
  type: "bubble" | "pill"
  dark?: boolean
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>
  text: string
}

function Bubble({
  children,
  dark = false,
  className,
  show = true,
  delayMs = 0,
}: {
  children: React.ReactNode
  dark?: boolean
  className?: string
  show?: boolean
  delayMs?: number
}) {
  const animation = show ? `floaty 6s ease-in-out infinite ${delayMs}ms, popIn 500ms ${delayMs}ms both` : "none"

  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm shadow-sm",
        "border-black/10",
        dark ? `${Y_BUBBLE_DARK} ${TEXT_DARK}` : `${Y_BUBBLE} ${TEXT_DARK}`,
        "pointer-events-none max-w-[26rem]",
        show ? "opacity-100" : "opacity-0",
        className,
      )}
      style={{ animation }}
    >
      {children}
      <span
        className={cn("absolute -bottom-1 left-6 h-2 w-2 rotate-45", dark ? Y_BUBBLE_DARK : Y_BUBBLE)}
        aria-hidden="true"
      />
    </div>
  )
}

function Pill({
  children,
  show = true,
  delayMs = 0,
}: {
  children: React.ReactNode
  show?: boolean
  delayMs?: number
}) {
  const animation = show ? `floaty 7s ease-in-out infinite ${delayMs}ms, popIn 450ms ${delayMs}ms both` : "none"

  return (
    <div
      aria-hidden="true"
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3 py-1 text-xs backdrop-blur-sm",
        TEXT_DARK,
        show ? "opacity-100" : "opacity-0",
      )}
      style={{ animation }}
    >
      {children}
    </div>
  )
}

export default function AttentionBanner() {
  const t = useTranslations("homePage.attentionBanner")
  const [inView, setInView] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)

  const messages = useMemo<Msg[]>(
    () => [
      { type: "bubble", dark: true, icon: LucideReact.Mail, text: t("messages.email") },
      { type: "pill", icon: LucideReact.PhoneMissed, text: t("messages.missedCalls") },
      { type: "bubble", text: t("messages.installMove") },
      { type: "bubble", text: t("messages.marble") },
      { type: "bubble", text: t("messages.fabric") },
      {
        type: "bubble",
        dark: true,
        icon: LucideReact.MessageSquareText,
        text: t("messages.whatsapp"),
      },
      { type: "bubble", text: t("messages.leadTime") },
    ],
    [t],
  )

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setInView(true)
            io.disconnect()
          }
        })
      },
      { threshold: 0.25 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section className="py-10 sm:py-12">
      <style>{styles}</style>
      <div className={container}>
        <div
          ref={rootRef}
          className={cn(
            "relative overflow-hidden rounded-3xl",
            Y_BG,
            "min-h-[580px] sm:min-h-[540px] lg:min-h-[560px]",
          )}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{ backgroundImage: "url('/textures/grain.png')", backgroundSize: "200px 200px" }}
          />

          <div aria-hidden className={cn("absolute left-1/2 w-[92%] -translate-x-1/2 md:w-[82%]", "top-4 sm:top-8")}>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4">
              {messages.map((m, i) => {
                const delay = 250 + i * 250
                if (m.type === "pill") {
                  const Icon = m.icon
                  return (
                    <Pill key={i} show={inView} delayMs={delay}>
                      {Icon ? <Icon className="h-4 w-4" /> : null}
                      <span>{m.text}</span>
                    </Pill>
                  )
                }
                const Icon = m.icon
                return (
                  <Bubble key={i} dark={m.dark} show={inView} delayMs={delay}>
                    {Icon ? <Icon className="h-4 w-4" /> : null}
                    <span>{m.text}</span>
                  </Bubble>
                )
              })}
            </div>
          </div>

          <div className="absolute inset-x-6 bottom-6 sm:bottom-8 lg:bottom-10">
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="text-2xl sm:text-[30px] md:text-4xl font-medium leading-tight tracking-tight text-stone-950">
                {t("titleLine1")}
                <br className="hidden sm:block" />
                <span className="block font-normal">{t("titleLine2")}</span>
              </h2>
              <p className="mx-auto mt-3 max-w-3xl text-base sm:text-lg text-stone-900/90">{t("subtitle")}</p>
            </div>
          </div>

          <div className="invisible h-[280px] sm:h-[320px] lg:h-[340px]" />
        </div>
      </div>
    </section>
  )
}
