"use client"

import type React from "react"

import Image from "next/image"
import * as LucideReact from "lucide-react"
import { cn } from "@/lib/utils"
import { PmComposite } from "@/components/visuals/pm-composite"
import { FinanceComposite } from "@/components/visuals/finance-composite"

const container = "mx-auto max-w-[1200px] px-6 sm:px-8"
const TITLE_H2 = "text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight"

type Block = {
  labelText?: string
  labelIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>
  title: string
  kicker?: string
  body: string
  bullets: string[]
  image: {
    src: string
    alt: string
    width?: number
    height?: number
  }
}

// Fixed accent frame colors (no clay, deeper than olive)
const FRAME_ACCENTS = ["#C78A3B", "#6E7A58", "#4B5960"] as const // Ochre 500, Olive 600, Slate 700

const BLOCKS: Block[] = [
  {
    labelText: "Project management",
    labelIcon: LucideReact.ClipboardList,
    title: "From ideas to completed projects",
    kicker: "From scattered to streamlined.",
    body: "Run every project from brief to install in one centralised workspace.",
    bullets: [
      "Stay on top of every phase, task, and timeline.",
      "Automate reminders and status updates.",
      "Collaborate in real-time with teams, contractors, and clients.",
      "Access documents, drawings, and design concepts in one place.",
    ],
    image: {
      // Fallback only (first block renders PmComposite)
      src: "/images/overlays/designer-hero.png",
      alt: "Designer working with Focuspilot across task, approvals and products",
      width: 1280,
      height: 840,
    },
  },
  {
    labelText: "Procurement",
    labelIcon: LucideReact.ShoppingCart,
    title: "Procure Smarter. Deliver Faster.",
    kicker: "Sourcing, ordering, and tracking materials shouldn't be a headache.",
    body: "No more manual spreadsheets or lost invoices. Focuspilot ensures materials arrive on time, every time.",
    bullets: [
      "Organise products by room, project, or supplier.",
      "Track deliveries and install dates on your project calendar.",
      "Automate approvals and keep clients in the loop.",
      "Generate purchase orders automatically.",
    ],
    image: {
      src: "/images/overlays/procurement/thumb-room.png",
      alt: "Warm living room scene with curated furniture and decor",
      width: 1280,
      height: 820,
    },
  },
  {
    labelText: "Finance",
    labelIcon: LucideReact.CreditCard,
    title: "Get paid faster. Stay in control.",
    kicker: "One place for invoices, budgets, and client payments.",
    body: "From uncertainty and missed payments to cash flow confidence.",
    bullets: [
      "Track budgets at project and studio level.",
      "Accept payments via Stripe instantly.",
      "Generate branded invoices in seconds.",
      "View insights that actually help you grow.",
    ],
    image: {
      src: "/images/home/finance-lounge.png",
      alt: "Sunlit living room with boucle seating, wood shelving and warm timber details",
      width: 1600,
      height: 1600,
    },
  },
]

function EyebrowLabel({
  text,
  Icon,
}: {
  text: string
  Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>
}) {
  return (
    <div className="inline-flex items-center gap-2 text-sm font-medium text-stone-900">
      {Icon ? <Icon className="h-4 w-4" aria-hidden="true" /> : null}
      <span>{text}</span>
    </div>
  )
}

/**
 * AddableImage
 * - Shows an image with a very small glass-morphism "Add to project" button at the bottom center.
 */
function AddableImage({
  src,
  alt,
  width,
  height,
  sizes,
  rounded = "rounded-xl",
  className,
  oneLine = false,
  fit = "cover",
  position = "center",
  showButton = true,
}: {
  src: string
  alt: string
  width: number
  height: number
  sizes?: string
  rounded?: string
  className?: string
  oneLine?: boolean
  fit?: "cover" | "contain"
  position?: "center" | "bottom" | "top"
  showButton?: boolean
}) {
  const posClass = position === "bottom" ? "object-bottom" : position === "top" ? "object-top" : "object-center"
  return (
    <div className={cn("relative overflow-hidden bg-white/10", rounded, className)}>
      <div className="relative aspect-square w-full">
        <Image
          src={src || "/placeholder.svg"}
          alt={alt}
          fill
          sizes={sizes || "(max-width: 768px) 33vw, (max-width: 1280px) 18vw, 200px"}
          className={cn("object-cover", posClass)}
          priority={false}
        />
      </div>
      {showButton ? (
        <button
          type="button"
          aria-label="Add to project"
          className={cn(
            "absolute left-1/2 -translate-x-1/2",
            "bottom-1.5 sm:bottom-2",
            "inline-flex items-center justify-center gap-1.5",
            "rounded-full px-3 py-1.5 text-[12px] leading-none text-stone-900",
            "bg-white/90 backdrop-blur-md ring-1 ring-black/10 shadow-[0_6px_16px_rgba(0,0,0,0.18)]",
            oneLine ? "whitespace-nowrap" : "",
          )}
        >
          <LucideReact.Plus className="h-3.5 w-3.5" />
          <span>{"Add to project"}</span>
        </button>
      ) : null}
    </div>
  )
}

/**
 * ProcurementComposite
 * - Main large image (abstract artwork) + three small images beneath.
 * - Each image includes a small glass "Add to project" button.
 */
function ProcurementComposite() {
  return (
    <div className="relative">
      <div className="space-y-3">
        {/* Main image */}
        <AddableImage
          src="/images/overlays/procurement/thumb-room.png"
          alt="Warm living room scene"
          width={1280}
          height={820}
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 55vw, 640px"
          rounded="rounded-xl"
          showButton={false}
        />

        {/* Bottom strip of three images */}
        <div className="grid grid-cols-3 gap-3">
          <AddableImage
            src="/images/overlays/procurement/thumb-chair.png"
            alt="Boucle lounge chair"
            width={420}
            height={420}
            sizes="(max-width: 768px) 33vw, (max-width: 1280px) 18vw, 200px"
            rounded="rounded-lg"
            oneLine
          />
          <AddableImage
            src="/images/overlays/procurement/artwork-middle.png"
            alt="Abstract artwork framed on wall"
            width={420}
            height={420}
            sizes="(max-width: 768px) 33vw, (max-width: 1280px) 18vw, 200px"
            rounded="rounded-lg"
            oneLine
          />
          <AddableImage
            src="/images/overlays/procurement/thumb-chandelier.png"
            alt="Brass chandelier with alabaster globes"
            width={420}
            height={420}
            sizes="(max-width: 768px) 33vw, (max-width: 1280px) 18vw, 200px"
            rounded="rounded-lg"
            oneLine
          />
        </div>
      </div>
    </div>
  )
}

function SplitRow({ block, flip = false, index = 0 }: { block: Block; flip?: boolean; index?: number }) {
  const isFirst = index === 0
  const isProcurement = index === 1
  const isFinance = index === 2

  const getTagline = () => {
    if (isFirst) {
      return "Go from scattered tasks to a clear, controllable project timeline."
    }
    if (isProcurement) {
      return "Replace lost invoices with a clear, automated procurement workflow."
    }
    if (isFinance) {
      return "Move from budget uncertainty to complete financial clarity and control."
    }
    return "From post-it notes and endless spreadsheets to calm, clarity, and control."
  }

  return (
    <div className={cn("grid items-center md:grid-cols-12", "gap-10 lg:gap-14")}>
      {/* Text (left by default) */}
      <div className={cn("md:col-span-6", flip ? "md:order-2" : "md:order-1")}>
        <div className="mx-auto max-w-xl">
          {block.labelText ? <EyebrowLabel text={block.labelText} Icon={block.labelIcon} /> : null}
          <h2 className={cn("mt-2", TITLE_H2)}>{block.title}</h2>
          {block.kicker ? <p className="mt-3 text-base sm:text-lg font-medium text-stone-800">{block.kicker}</p> : null}
          <p className="mt-3 text-sm sm:text-base text-stone-600">{block.body}</p>
          <ul className="mt-6 space-y-3">
            {block.bullets.map((b) => (
              <li key={b} className="flex items-start gap-3 text-stone-800">
                <LucideReact.CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-stone-900" />
                <span className="text-sm sm:text-base">{b}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs sm:text-sm text-stone-500">{getTagline()}</p>
        </div>
      </div>

      {/* Visual (right by default) */}
      <div className={cn("md:col-span-6", flip ? "md:order-1" : "md:order-2")}>
        {isFirst ? (
          <div className="relative">
            <PmComposite className="h-full w-full" />
          </div>
        ) : isProcurement ? (
          <ProcurementComposite />
        ) : isFinance ? (
          <FinanceComposite />
        ) : (
          <div className="relative">
            <Image
              src={block.image.src || "/placeholder.svg"}
              alt={block.image.alt}
              width={block.image.width ?? 1280}
              height={block.image.height ?? 840}
              className="h-auto w-full rounded-xl object-cover shadow-lg"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 55vw, 640px"
              priority={false}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default function FeatureBlocks() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className={container}>
        <div className="space-y-20 sm:space-y-24">
          {BLOCKS.map((b, i) => (
            <SplitRow key={b.title} block={b} flip={i % 2 === 1} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
