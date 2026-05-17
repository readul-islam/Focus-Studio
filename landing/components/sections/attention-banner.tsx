"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import * as LucideReact from "lucide-react"
import { cn } from "@/lib/utils"

const container = "mx-auto max-w-[1200px] px-6 sm:px-8"

// Terracotta/Peach palette
const Y_BG = "bg-[#E07A57]" // terracotta background
const Y_BUBBLE = "bg-[#F2B49C]" // light peach bubbles
const Y_BUBBLE_DARK = "bg-[#D96E4F]" // slightly deeper terracotta bubbles
const TEXT_DARK = "text-stone-950"

// Animations
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

const MESSAGES: Msg[] = [
  { type: "bubble", dark: true, icon: LucideReact.Mail, text: 'New email • "Can we add a second wall sconce?"' },
  { type: "pill", icon: LucideReact.PhoneMissed, text: "3 missed calls" },
  { type: "bubble", text: "Client asked to move install to Friday." },
  { type: "bubble", text: "Did the marble arrive from the supplier?" },
  { type: "bubble", text: "Which sofa fabric is approved—linen or boucle?" },
  {
    type: "bubble",
    dark: true,
    icon: LucideReact.MessageSquareText,
    text: 'WhatsApp • Contractor: "Need updated floor plan."',
  },
  { type: "bubble", text: "Lead time on dining chairs just changed." },
]

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
  // Compose both float and pop-in animations
  const animation = show ? `floaty 6s ease-in-out infinite ${delayMs}ms, popIn 500ms ${delayMs}ms both` : "none"

  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm shadow-sm",
        "border-black/10",
        dark ? `${Y_BUBBLE_DARK} ${TEXT_DARK}` : `${Y_BUBBLE} ${TEXT_DARK}`,
        "pointer-events-none max-w-[26rem]",
        // Fallback transitions if animations are not supported
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
  const [inView, setInView] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)

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
          {/* Grain */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{ backgroundImage: "url('/textures/grain.png')", backgroundSize: "200px 200px" }}
          />

          <div aria-hidden className={cn("absolute left-1/2 w-[92%] -translate-x-1/2 md:w-[82%]", "top-4 sm:top-8")}>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4">
              {MESSAGES.map((m, i) => {
                const delay = 250 + i * 250 // stagger
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
                {"The day gets busy for designers."}
                <br className="hidden sm:block" />
                <span className="block font-normal">{"We make it calm."}</span>
              </h2>
              <p className="mx-auto mt-3 max-w-3xl text-base sm:text-lg text-stone-900/90">
                {
                  "Every email, call, client question and supplier update funnels into Techstyles — one calm command centre for your studio."
                }
              </p>
            </div>
          </div>

          <div className="invisible h-[280px] sm:h-[320px] lg:h-[340px]" />
        </div>
      </div>
    </section>
  )
}
