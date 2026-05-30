"use client"

import type React from "react"

import { useMemo } from "react"
import { useTranslations } from "next-intl"
import Image from "next/image"
import * as LucideReact from "lucide-react"
import { cn } from "@/lib/utils"
import { PmComposite } from "@/components/visuals/pm-composite"
import { FinanceComposite } from "@/components/visuals/finance-composite"

const container = "mx-auto max-w-[1200px] px-6 sm:px-8"
const TITLE_H2 = "text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight"

type BlockKey = "projectManagement" | "procurement" | "finance"

type Block = {
  key: BlockKey
  labelText: string
  labelIcon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  title: string
  kicker: string
  body: string
  bullets: string[]
  image: {
    src: string
    alt: string
    width?: number
    height?: number
  }
}

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

function AddableImage({
  src,
  alt,
  width,
  height,
  sizes,
  rounded = "rounded-xl",
  className,
  oneLine = false,
  position = "center",
  showButton = true,
  addLabel,
  addAriaLabel,
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
  addLabel: string
  addAriaLabel: string
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
          aria-label={addAriaLabel}
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
          <span>{addLabel}</span>
        </button>
      ) : null}
    </div>
  )
}

function ProcurementComposite({
  roomAlt,
  chairAlt,
  artAlt,
  chandelierAlt,
  addLabel,
  addAriaLabel,
}: {
  roomAlt: string
  chairAlt: string
  artAlt: string
  chandelierAlt: string
  addLabel: string
  addAriaLabel: string
}) {
  return (
    <div className="relative">
      <div className="space-y-3">
        <AddableImage
          src="/images/overlays/procurement/thumb-room.png"
          alt={roomAlt}
          width={1280}
          height={820}
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 55vw, 640px"
          rounded="rounded-xl"
          showButton={false}
          addLabel={addLabel}
          addAriaLabel={addAriaLabel}
        />
        <div className="grid grid-cols-3 gap-3">
          <AddableImage
            src="/images/overlays/procurement/thumb-chair.png"
            alt={chairAlt}
            width={420}
            height={420}
            sizes="(max-width: 768px) 33vw, (max-width: 1280px) 18vw, 200px"
            rounded="rounded-lg"
            oneLine
            addLabel={addLabel}
            addAriaLabel={addAriaLabel}
          />
          <AddableImage
            src="/images/overlays/procurement/artwork-middle.png"
            alt={artAlt}
            width={420}
            height={420}
            sizes="(max-width: 768px) 33vw, (max-width: 1280px) 18vw, 200px"
            rounded="rounded-lg"
            oneLine
            addLabel={addLabel}
            addAriaLabel={addAriaLabel}
          />
          <AddableImage
            src="/images/overlays/procurement/thumb-chandelier.png"
            alt={chandelierAlt}
            width={420}
            height={420}
            sizes="(max-width: 768px) 33vw, (max-width: 1280px) 18vw, 200px"
            rounded="rounded-lg"
            oneLine
            addLabel={addLabel}
            addAriaLabel={addAriaLabel}
          />
        </div>
      </div>
    </div>
  )
}

function SplitRow({
  block,
  flip = false,
  index = 0,
  tagline,
  addLabel,
  addAriaLabel,
  procurementAlts,
}: {
  block: Block
  flip?: boolean
  index?: number
  tagline: string
  addLabel: string
  addAriaLabel: string
  procurementAlts?: { roomAlt: string; chairAlt: string; artAlt: string; chandelierAlt: string }
}) {
  const isFirst = index === 0
  const isProcurement = index === 1
  const isFinance = index === 2

  return (
    <div className={cn("grid items-center md:grid-cols-12", "gap-10 lg:gap-14")}>
      <div className={cn("md:col-span-6", flip ? "md:order-2" : "md:order-1")}>
        <div className="mx-auto max-w-xl">
          <EyebrowLabel text={block.labelText} Icon={block.labelIcon} />
          <h2 className={cn("mt-2", TITLE_H2)}>{block.title}</h2>
          <p className="mt-3 text-base sm:text-lg font-medium text-stone-800">{block.kicker}</p>
          <p className="mt-3 text-sm sm:text-base text-stone-600">{block.body}</p>
          <ul className="mt-6 space-y-3">
            {block.bullets.map((b) => (
              <li key={b} className="flex items-start gap-3 text-stone-800">
                <LucideReact.CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-stone-900" />
                <span className="text-sm sm:text-base">{b}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs sm:text-sm text-stone-500">{tagline}</p>
        </div>
      </div>

      <div className={cn("md:col-span-6", flip ? "md:order-1" : "md:order-2")}>
        {isFirst ? (
          <div className="relative">
            <PmComposite className="h-full w-full" />
          </div>
        ) : isProcurement && procurementAlts ? (
          <ProcurementComposite
            {...procurementAlts}
            addLabel={addLabel}
            addAriaLabel={addAriaLabel}
          />
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
  const t = useTranslations("homePage.featureBlocks")

  const blocks = useMemo<Block[]>(
    () => [
      {
        key: "projectManagement",
        labelText: t("blocks.projectManagement.label"),
        labelIcon: LucideReact.ClipboardList,
        title: t("blocks.projectManagement.title"),
        kicker: t("blocks.projectManagement.kicker"),
        body: t("blocks.projectManagement.body"),
        bullets: [
          t("blocks.projectManagement.bullet1"),
          t("blocks.projectManagement.bullet2"),
          t("blocks.projectManagement.bullet3"),
          t("blocks.projectManagement.bullet4"),
        ],
        image: {
          src: "/images/overlays/designer-hero.png",
          alt: t("blocks.projectManagement.imageAlt"),
          width: 1280,
          height: 840,
        },
      },
      {
        key: "procurement",
        labelText: t("blocks.procurement.label"),
        labelIcon: LucideReact.ShoppingCart,
        title: t("blocks.procurement.title"),
        kicker: t("blocks.procurement.kicker"),
        body: t("blocks.procurement.body"),
        bullets: [
          t("blocks.procurement.bullet1"),
          t("blocks.procurement.bullet2"),
          t("blocks.procurement.bullet3"),
          t("blocks.procurement.bullet4"),
        ],
        image: {
          src: "/images/overlays/procurement/thumb-room.png",
          alt: t("blocks.procurement.imageAlt"),
          width: 1280,
          height: 820,
        },
      },
      {
        key: "finance",
        labelText: t("blocks.finance.label"),
        labelIcon: LucideReact.CreditCard,
        title: t("blocks.finance.title"),
        kicker: t("blocks.finance.kicker"),
        body: t("blocks.finance.body"),
        bullets: [
          t("blocks.finance.bullet1"),
          t("blocks.finance.bullet2"),
          t("blocks.finance.bullet3"),
          t("blocks.finance.bullet4"),
        ],
        image: {
          src: "/images/home/finance-lounge.png",
          alt: t("blocks.finance.imageAlt"),
          width: 1600,
          height: 1600,
        },
      },
    ],
    [t],
  )

  const taglines: Record<BlockKey, string> = useMemo(
    () => ({
      projectManagement: t("taglines.projectManagement"),
      procurement: t("taglines.procurement"),
      finance: t("taglines.finance"),
    }),
    [t],
  )

  const procurementAlts = useMemo(
    () => ({
      roomAlt: t("blocks.procurement.roomAlt"),
      chairAlt: t("blocks.procurement.chairAlt"),
      artAlt: t("blocks.procurement.artAlt"),
      chandelierAlt: t("blocks.procurement.chandelierAlt"),
    }),
    [t],
  )

  const addLabel = t("addToProject")
  const addAriaLabel = t("addToProjectAria")

  return (
    <section className="bg-white py-20 sm:py-24">
      <div className={container}>
        <div className="space-y-20 sm:space-y-24">
          {blocks.map((b, i) => (
            <SplitRow
              key={b.key}
              block={b}
              flip={i % 2 === 1}
              index={i}
              tagline={taglines[b.key]}
              addLabel={addLabel}
              addAriaLabel={addAriaLabel}
              procurementAlts={b.key === "procurement" ? procurementAlts : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
