"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"

import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { CtaButton } from "@/components/cta-button"
import { cn } from "@/lib/utils"
import { PortugueseTilesBg } from "@/components/graphics/portuguese-tiles-bg"
import { ClipboardList, FileText, Stamp, Truck, Receipt, CheckCircle2, Link2, Sparkles } from "lucide-react"

const container = "mx-auto max-w-[1200px] px-6 sm:px-8"
const H1 = "text-[30px] sm:text-5xl md:text-[56px] font-medium tracking-tight leading-[1.1]"
const H2 = "text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight"
const Lead = "text-base sm:text-lg text-stone-600"

// brand clay colors
const CLAY = "#E07A57"
const CLAY_HOVER = "#CE6B4E"

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-stone-800">
      <CheckCircle2 className="mt-0.5 h-5 w-5 text-stone-900" aria-hidden="true" />
      <span className="text-base">{children}</span>
    </li>
  )
}

function Kpi({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div
      className="rounded-2xl bg-white px-5 py-4 text-center shadow-[0_6px_22px_rgba(0,0,0,0.06)] ring-1"
      style={{ ringColor: "rgba(0,0,0,0.06)" as React.CSSProperties["color"] }}
    >
      <div className="text-xs font-semibold tracking-wide" style={{ color: "#7D786C" }}>
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold text-stone-900">{value}</div>
      <div className="mx-auto mt-3 h-1.5 w-10 rounded-full" style={{ backgroundColor: accent }} />
    </div>
  )
}

function ApprovedChip() {
  return (
    <span
      className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-medium shadow-sm ring-1"
      style={{ color: "#4E6243", ringColor: "rgba(78,98,67,0.28)" as React.CSSProperties["color"] }}
    >
      {"Approved"}
    </span>
  )
}

function StatusPill({ status }: { status: "approved" | "rejected" }) {
  const isApproved = status === "approved"
  // Approved: olive text on soft green tint
  // Rejected: terracotta/clay text on soft clay tint
  const styles = isApproved
    ? {
        backgroundColor: "rgba(110,122,88,0.16)", // Olive tint
        color: "#4E6243",
        boxShadow: "inset 0 0 0 1px rgba(110,122,88,0.28)",
      }
    : {
        backgroundColor: "rgba(224,122,87,0.12)", // Clay tint
        color: "#B75A41",
        boxShadow: "inset 0 0 0 1px rgba(224,122,87,0.28)",
      }
  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold shadow-sm"
      style={styles as React.CSSProperties}
    >
      {isApproved ? "Approved" : "Rejected"}
    </span>
  )
}

type ApprovalItem = {
  title: string
  room: string
  vendor: string
  code: string
  imgSrc: string
  status: "approved" | "rejected"
}

function ApprovalsList() {
  const items: ApprovalItem[] = [
    {
      title: "Brass Floor Lamp",
      room: "Living Room",
      vendor: "In Good Company",
      code: "DL-01",
      imgSrc: "/images/procurement/hero/side-lamp-new.png",
      status: "approved",
    },
    {
      title: "Boucle Lounge Chair",
      room: "Library",
      vendor: "Carlisle Brem",
      code: "PL-02",
      imgSrc: "/images/procurement/hero/side-lounge.png",
      status: "rejected",
    },
  ]

  return (
    <div className="p-2 sm:p-3">
      <ul className="divide-y divide-stone-200">
        {items.map((it) => (
          <li key={it.code} className="flex items-center gap-4 p-3 sm:p-4">
            {/* Thumbnail */}
            <div className="relative h-20 w-20 sm:h-24 sm:w-24 overflow-hidden rounded-xl bg-stone-100 ring-1 ring-stone-200">
              <Image
                src={it.imgSrc || "/placeholder.svg?height=192&width=192&query=product%20thumbnail"}
                alt={`${it.title} - ${it.vendor} product for ${it.room}`}
                fill
                sizes="(max-width: 640px) 80px, 96px"
                className="object-contain p-1.5"
              />
            </div>

            {/* Details */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-stone-900">{it.title}</div>
                  <div className="text-xs text-stone-600">
                    {it.room} • {it.vendor}
                  </div>
                </div>
                <StatusPill status={it.status} />
              </div>
              <div className="mt-1 text-xs text-stone-700">{it.code}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

const TILE_BORDER = "rounded-3xl overflow-hidden border border-stone-200 bg-white shadow-lg"

function HeroTile({
  heightClass,
  src,
  alt,
  sizes,
  object = "object-cover",
  objectPosition,
  withInnerInset = true,
  showApproved = false,
  frameInsetClass = "inset-2 sm:inset-3",
}: {
  heightClass: string
  src: string
  alt: string
  sizes: string
  object?: "object-cover" | "object-contain"
  objectPosition?: string
  withInnerInset?: boolean
  showApproved?: boolean
  frameInsetClass?: string
}) {
  const inset = "inset-0"
  const rounded = "rounded-[inherit]"
  return (
    <div className={TILE_BORDER}>
      <div className={`relative w-full ${heightClass}`}>
        {/* Image fills container; rounding inherits outer to avoid any sharp edges */}
        <div className={`absolute ${inset} overflow-hidden ${rounded}`}>
          <Image
            src={src || "/placeholder.svg"}
            alt={alt}
            fill
            sizes={sizes}
            className={`${object} rounded-[inherit]`}
            style={objectPosition ? { objectPosition, borderRadius: "inherit" } : { borderRadius: "inherit" }}
            priority={false}
          />

          {/* Even inner frame overlay (sits in front of image, equal on all edges) */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-stone-200"
            style={{ boxShadow: "inset 0 0 0 10px #ffffff" }}
          />

          {/* Approved chip over the image and frame */}
          {showApproved ? (
            <div className="pointer-events-none absolute bottom-2 left-1/2 z-[1] -translate-x-1/2 sm:bottom-3">
              <ApprovedChip />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function FeatureTile({
  title,
  desc,
  icon: Icon,
  imgAlt,
  accent = "#EFEAE2",
  placeholderQuery,
  href,
}: {
  title: string
  desc: string
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>
  imgAlt: string
  accent?: string
  placeholderQuery: string
  href?: string
}) {
  return (
    <Card className="group overflow-hidden border-stone-200 bg-white shadow-sm ring-1 ring-black/0 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-black/5">
      <CardContent className="p-0">
        <div className="h-1.5 w-full" style={{ backgroundColor: accent }} aria-hidden />
        <div className="relative h-40 w-full sm:h-44 md:h-48">
          <Image
            src={`/placeholder.svg?height=320&width=640&query=${encodeURIComponent(placeholderQuery)}`}
            alt={imgAlt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 400px"
            className="object-cover"
          />
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2">
            {Icon ? (
              <span
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg ring-1"
                style={{
                  backgroundColor: "rgba(224,122,87,0.12)",
                  color: CLAY,
                  boxShadow: "inset 0 0 0 1px rgba(224,122,87,0.28)",
                }}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
            ) : null}
            <h3 className="text-base font-semibold leading-tight text-stone-900">{title}</h3>
          </div>
          <p className="mt-2 text-sm text-stone-700">{desc}</p>
          {href ? (
            <Link href={href} className="mt-3 inline-block text-sm font-medium text-stone-900 underline">
              Learn more
            </Link>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * AiImportDemo
 * Simulates the end-to-end flow:
 * 1) On scroll into view, types the URL into a readonly field with a Sparkles (AI) icon.
 * 2) Button morphs to clay color and "presses" itself.
 * 3) A short loading phase with skeleton + progress bar.
 * 4) Product image and details fade in realistically.
 */
function AiImportDemo() {
  const FULL_URL = "https://www.myluxinterior.com/chair"
  const DOMAIN = "myluxinterior.com"

  type Phase = "idle" | "typing" | "loading" | "done"
  const [phase, setPhase] = useState<Phase>("idle")
  const [typed, setTyped] = useState("")
  const [pressAnim, setPressAnim] = useState(false)
  const [progress, setProgress] = useState(0)

  const rootRef = useRef<HTMLDivElement | null>(null)
  const started = useRef(false)

  // Kick off sequence when in view
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !started.current) {
            started.current = true
            setPhase("typing")
          }
        })
      },
      { threshold: 0.35 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Typewriter effect
  useEffect(() => {
    if (phase !== "typing") return
    setTyped("")
    let i = 0
    const speed = 28 // ms per char
    const id = setInterval(() => {
      i++
      setTyped(FULL_URL.slice(0, i))
      if (i >= FULL_URL.length) {
        clearInterval(id)
        // small pause, then "click"
        setTimeout(() => {
          setPressAnim(true)
          setPhase("loading")
          setTimeout(() => setPressAnim(false), 260)
        }, 320)
      }
    }, speed)
    return () => clearInterval(id)
  }, [phase])

  // Loading progress simulation
  useEffect(() => {
    if (phase !== "loading") return
    setProgress(0)
    const id = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.random() * 18
        if (next >= 100) {
          clearInterval(id)
          // short grace before revealing content
          setTimeout(() => setPhase("done"), 350)
          return 100
        }
        return next
      })
    }, 220)
    return () => clearInterval(id)
  }, [phase])

  const showSkeleton = phase === "loading"
  const showResult = phase === "done"

  return (
    <div
      ref={rootRef}
      className="mx-auto mt-8 max-w-4xl"
      aria-live="polite"
      aria-label="AI product import demonstration"
    >
      {/* URL Row with AI icon and typewriter URL */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex grow items-center gap-2 rounded-lg border border-stone-300 bg-white px-3 py-3">
          <span
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg ring-1"
            style={{
              backgroundColor: "rgba(224,122,87,0.12)",
              color: CLAY,
              boxShadow: "inset 0 0 0 1px rgba(224,122,87,0.28)",
            }}
            aria-hidden="true"
            title="AI"
          >
            <Sparkles className="h-4 w-4" />
          </span>
          <label htmlFor="ai-url-input" className="sr-only">
            Product URL
          </label>
          <input
            id="ai-url-input"
            type="url"
            value={phase === "idle" ? "" : typed}
            readOnly
            className="w-full bg-transparent text-sm text-stone-700 outline-none"
            aria-label="Product URL"
            placeholder="Paste a product URL"
          />
        </div>

        {/* AI button: morphs to clay and presses when loading */}
        <CtaButton
          label={phase === "loading" ? "Working..." : phase === "done" ? "Imported" : "Add with AI"}
          variant={phase === "loading" || phase === "done" ? "white" : "slate"}
          className={
            phase === "loading" || phase === "done"
              ? "!bg-[#E07A57] !text-white !ring-[#E07A57] hover:!bg-[#CE6B4E] transition-colors " +
                (pressAnim ? "scale-95 transition-transform" : "")
              : ""
          }
        />
      </div>

      {/* Result area */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-lg">
        {/* Progress bar while loading */}
        {showSkeleton ? (
          <div className="relative">
            <div className="absolute left-0 top-0 h-1 bg-stone-200" style={{ width: "100%" }} />
            <div
              className="absolute left-0 top-0 h-1"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, rgba(224,122,87,0.3) 0%, rgba(224,122,87,0.9) 100%)",
                transition: "width 220ms ease",
              }}
              aria-hidden
            />
          </div>
        ) : null}

        {/* Loading skeleton */}
        {showSkeleton ? (
          <div className="grid gap-0 sm:grid-cols-2" aria-label="Loading product information">
            <div className="h-[28rem] animate-pulse bg-stone-100 sm:h-[30rem] md:h-[32rem]" />
            <div className="p-5 sm:p-6">
              <div className="h-5 w-40 animate-pulse rounded bg-stone-100" />
              <div className="mt-2 h-5 w-28 animate-pulse rounded bg-stone-100" />
              <div className="mt-3 h-4 w-64 animate-pulse rounded bg-stone-100" />
              <div className="mt-4 space-y-2">
                <div className="h-4 w-[90%] animate-pulse rounded bg-stone-100" />
                <div className="h-4 w-[80%] animate-pulse rounded bg-stone-100" />
                <div className="h-4 w-[70%] animate-pulse rounded bg-stone-100" />
              </div>
              <div className="mt-6 flex justify-center gap-3">
                <div className="h-10 w-40 animate-pulse rounded bg-stone-100" />
                <div className="h-10 w-32 animate-pulse rounded bg-stone-100" />
              </div>
            </div>
          </div>
        ) : null}

        {/* Final result */}
        {showResult ? (
          <div className="grid items-stretch gap-0 sm:grid-cols-2">
            {/* Larger image area, object-contain to avoid cropping */}
            <div className="relative h-[28rem] w-full bg-white sm:h-[30rem] md:h-[32rem]">
              <Image
                src={"/images/procurement/ai-import-chair.png"}
                alt="Arc Marble Table - AI imported product showing sculptural ribbed base with natural finish"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain opacity-0 transition-opacity duration-700 [animation:fadeIn_0.7s_ease_forwards]"
                priority={false}
              />
            </div>

            {/* Details */}
            <div className="p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 items-center rounded-full border border-stone-200 bg-white px-2.5 text-xs text-stone-700">
                  AI import
                </span>
                <span className="text-xs text-stone-500">Source: {DOMAIN}</span>
              </div>

              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-stone-900">Arc Marble Table</h3>
              <p className={cn("mt-2", Lead)}>
                Sculptural, ribbed base with soft curves and a natural finish — a statement piece for dining or living.
              </p>
              <div className="mt-2 text-lg font-semibold text-stone-900">£1,290</div>
              <div className="mt-1 text-sm text-stone-600">My Lux Interior</div>

              <dl className="mt-5 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
                  <dt className="text-stone-600">Material</dt>
                  <dd className="font-medium text-stone-900">Solid oak</dd>
                </div>
                <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
                  <dt className="text-stone-600">Finish</dt>
                  <dd className="font-medium text-stone-900">Natural</dd>
                </div>
                <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
                  <dt className="text-stone-600">Dimensions</dt>
                  <dd className="font-medium text-stone-900">W 560 x D 600 x H 820 mm</dd>
                </div>
                <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
                  <dt className="text-stone-600">Lead time</dt>
                  <dd className="font-medium text-stone-900">6 to 8 weeks</dd>
                </div>
              </dl>

              {/* Center-aligned buttons. Add to library is clay. */}
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <CtaButton
                  label="Add to library"
                  variant="white"
                  className="!bg-[#E07A57] !text-white !ring-[#E07A57] hover:!bg-[#CE6B4E]"
                />
                <CtaButton label="Create PO" variant="white" />
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <style>{`
@keyframes fadeIn {
to { opacity: 1 }
}
`}</style>
    </div>
  )
}

function LibraryCards() {
  const items = [
    {
      title: "Orbital Brass Chandelier",
      brand: "LUMINA DESIGN",
      price: "£1,450",
      tag: "Lighting",
      img: "/images/library/orbital-brass-chandelier.png",
    },
    {
      title: "Abstract Canvas Art",
      brand: "CONTEMPORARY ART CO",
      price: "£890",
      tag: "Accessories",
      img: "/images/library/abstract-canvas-art.png",
    },
    {
      title: "Mid-Century Accent Chair",
      brand: "DANISH MODERN",
      price: "£1,650",
      tag: "Furniture",
      img: "/images/library/mid-century-accent-chair.png",
    },
  ] as const

  return (
    <div className="mt-8 overflow-x-auto">
      <div className="flex snap-x snap-mandatory gap-4">
        {items.map((it, i) => (
          <Card
            key={it.title}
            className="snap-start shrink-0 basis-[82%] overflow-hidden border-stone-200 shadow-md sm:basis-[55%] md:basis-[42%] lg:basis-[32%]"
          >
            <CardContent className="p-0">
              {/* Image */}
              <div className="relative h-[300px] w-full sm:h-[340px]">
                <Image
                  src={it.img || "/placeholder.svg"}
                  alt={`${it.title} by ${it.brand} - ${it.tag} for interior design projects`}
                  fill
                  sizes="(max-width: 768px) 82vw, (max-width: 1280px) 42vw, 32vw"
                  className="object-cover"
                  priority={false}
                />
              </div>

              {/* Body */}
              <div className="p-5">
                <div className="min-w-0">
                  <div className="truncate text-base font-semibold text-stone-900 sm:text-lg">{it.title}</div>
                  <div className="mt-0.5 text-[11px] font-medium tracking-wider text-stone-500">{it.brand}</div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="text-lg font-semibold text-stone-900 sm:text-xl">{it.price}</div>
                  <span
                    className="inline-flex items-center rounded-full px-3 py-1 text-xs"
                    style={{
                      backgroundColor: "rgba(214,177,150,0.16)",
                      boxShadow: "inset 0 0 0 1px rgba(214,177,150,0.38)",
                      color: "#4E4943",
                    }}
                  >
                    {it.tag}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default function ProcurementPage() {
  return (
    <main className="bg-white">
      {/* HERO (wider, full-bleed container) */}
      <section className="relative isolate overflow-hidden pb-10 pt-12 sm:pb-12 sm:pt-16 md:pt-20">
        <PortugueseTilesBg height="min(520px, 56vh)" opacity={0.16} fadeStop={0.5} />
        {/* Full-bleed container just for this section */}
        <div className="mx-auto max-w-none px-6 sm:px-8">
          {/* Heading stays comfortably narrow */}
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="outline" className="rounded-full border-stone-300 bg-stone-50 text-stone-700">
              Procurement & Purchasing
            </Badge>
            <h1 className={cn("mt-4 text-center", H1)}>FF&E Procurement & Purchasing Software for Interior Designers</h1>
            <p className={cn("mt-4 text-center", Lead)}>
              Build a product library, collect client approvals, and create purchase orders that stay in sync with your
              projects.
            </p>
          </div>

          {/* HERO MOSAIC — placeholders only, rounded containers, center bigger, sides at 75% height */}
          <div className="mx-auto mt-10 w-full max-w-[min(1680px,96vw)]">
            <div className="grid items-end gap-4 sm:grid-cols-12 sm:gap-4 lg:gap-6">
              {/* Left (unchanged size, now with even padding around image) */}
              <div className="col-span-1 sm:col-span-4 md:col-span-3">
                <HeroTile
                  heightClass="h-[270px] sm:h-[340px] md:h-[450px] lg:h-[495px]"
                  src="/images/procurement/hero/side-lounge.png"
                  alt="Boucle lounge chair with approved status for interior design procurement"
                  sizes="(max-width: 768px) 100vw, (max-width: 1400px) 30vw, 32vw"
                  object="object-contain"
                  withInnerInset
                  showApproved
                />
              </div>

              {/* Center (taller) */}
              <div className="col-span-2 sm:col-span-12 md:col-span-6">
                <HeroTile
                  heightClass="h-[360px] sm:h-[450px] md:h-[600px] lg:h-[660px]"
                  src="/images/procurement/hero/center-room.png"
                  alt="Modern interior design room scene with lounge chair and brass floor lamp showcasing procurement workflow"
                  sizes="(max-width: 768px) 100vw, (max-width: 1400px) 40vw, 36vw"
                  object="object-cover"
                  withInnerInset
                  showApproved={false}
                />
              </div>

              {/* Right (unchanged size, now with even padding around image) */}
              <div className="col-span-1 sm:col-span-4 md:col-span-3">
                <HeroTile
                  heightClass="h-[270px] sm:h-[340px] md:h-[450px] lg:h-[495px]"
                  src="/images/procurement/hero/side-lamp-new.png"
                  alt="Brass floor lamp with approved status for interior design specification"
                  sizes="(max-width: 768px) 100vw, (max-width: 1400px) 30vw, 32vw"
                  object="object-contain"
                  withInnerInset
                  showApproved
                />
              </div>
            </div>
          </div>

          {/* KPIs (remain nice and narrow) */}
          <div className="mx-auto mt-12 max-w-4xl sm:mt-14">
            <div className="mx-auto grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Kpi label="On time deliveries" value="94%" accent="#6E7A58" />
              <Kpi label="POs auto generated" value="1,204" accent="#C78A3B" />
              <Kpi label="Approved selections" value="3,872" accent={CLAY} />
              <Kpi label="Vendors tracked" value="212" accent="#4B5960" />
            </div>
          </div>
        </div>
      </section>

      {/* AI PROCUREMENT HIGHLIGHT */}
      <section id="ai" className="bg-white py-14 sm:py-20" aria-labelledby="ai-procurement">
        <div className={container}>
          <div className="mx-auto max-w-3xl text-center">
            <h2 id="ai-procurement" className={H2}>
              Add products with AI from any URL
            </h2>
            <p className={cn("mt-3", Lead)}>
              Paste a link to a product page and let AI pull the specs, images, pricing and vendor details into your
              library.
            </p>
          </div>

          <AiImportDemo />
        </div>
      </section>

      {/* BENTO FEATURE GRID */}
      <section className="bg-white py-14 sm:py-20" aria-labelledby="procurement-features">
        <div className={container}>
          <h2 id="procurement-features" className="sr-only">
            Procurement features
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <FeatureTile
              title="Specification sheets"
              desc="One place for dimensions, finishes, supplier links and room context."
              icon={FileText}
              imgAlt="Specification sheets interface for interior design products"
              accent="#E68E71"
              placeholderQuery="specification%20sheets%20ui%20clean"
            />
            <FeatureTile
              title="Approvals"
              desc="Collect selections and sign off with a full change history."
              icon={Stamp}
              imgAlt="Client approval interface for interior design selections"
              accent="#6E7A58"
              placeholderQuery="client%20approvals%20ui%20modal"
            />
            <FeatureTile
              title="Purchase orders"
              desc="Create POs from specs and keep statuses in sync."
              icon={ClipboardList}
              imgAlt="Purchase order management table for interior design procurement"
              accent="#C78A3B"
              placeholderQuery="purchase%20orders%20table%20ui"
            />
            <FeatureTile
              title="Vendors and deliveries"
              desc="Supplier contacts, quotes and delivery windows linked to your schedule."
              icon={Truck}
              imgAlt="Vendor and delivery tracking dashboard for interior design projects"
              accent="#4B5960"
              placeholderQuery="vendor%20delivery%20tracking%20board"
            />
            <FeatureTile
              title="Receipts"
              desc="Log receipts and install dates. Catch delays early."
              icon={Receipt}
              imgAlt="Receipt tracking interface for interior design procurement"
              accent="#B75A41"
              placeholderQuery="receipts%20table%20ui"
            />
            <FeatureTile
              title="Link to budget"
              desc="Tie every item to budgets and client invoices without spreadsheets."
              icon={Link2}
              imgAlt="Budget linking interface connecting procurement to project finances"
              accent="#8FA58F"
              placeholderQuery="budget%20linking%20finance%20ui"
            />
          </div>
        </div>
      </section>

      {/* CLIENT APPROVALS */}
      <section className="bg-white py-14 sm:py-20" aria-labelledby="client-approvals">
        <div className={container}>
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
            <div>
              <h2 className="text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight text-stone-900">Client Approvals</h2>
              <p className={cn("mt-4", Lead)}>
                Easily manage and track client approvals for your interior design projects.
              </p>
            </div>
            <ApprovalsList />
          </div>
        </div>
      </section>

      {/* LIBRARY CARDS */}
      <section className="bg-white py-14 sm:py-20" aria-labelledby="library-cards">
        <div className={container}>
          <h2 id="library-cards" className="sr-only">
            Library cards
          </h2>
          <LibraryCards />
        </div>
      </section>

      {/* Related Features */}
      <section className="bg-stone-50 py-16 sm:py-20">
        <div className={container}>
          <div className="mx-auto max-w-4xl">
            <h2 className="text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight text-center text-stone-900">
              Works with your entire workflow
            </h2>
            <p className="mt-3 text-center text-stone-600">
              Procurement connects to projects, finance, and client approvals.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Link
                href="/platform/projects"
                className="group rounded-xl border border-stone-200 bg-white p-5 transition-all hover:border-stone-300 hover:shadow-md"
              >
                <ClipboardList className="h-6 w-6 text-stone-600 group-hover:text-stone-900" />
                <h3 className="mt-3 font-semibold text-stone-900">Projects</h3>
                <p className="mt-1 text-sm text-stone-600">Link products to project phases</p>
              </Link>
              <Link
                href="/platform/finance"
                className="group rounded-xl border border-stone-200 bg-white p-5 transition-all hover:border-stone-300 hover:shadow-md"
              >
                <Receipt className="h-6 w-6 text-stone-600 group-hover:text-stone-900" />
                <h3 className="mt-3 font-semibold text-stone-900">Finance</h3>
                <p className="mt-1 text-sm text-stone-600">Track costs and margins</p>
              </Link>
              <Link
                href="/platform/client-portal"
                className="group rounded-xl border border-stone-200 bg-white p-5 transition-all hover:border-stone-300 hover:shadow-md"
              >
                <Stamp className="h-6 w-6 text-stone-600 group-hover:text-stone-900" />
                <h3 className="mt-3 font-semibold text-stone-900">Client Portal</h3>
                <p className="mt-1 text-sm text-stone-600">Collect selection approvals</p>
              </Link>
              <Link
                href="/pricing"
                className="group rounded-xl border border-stone-200 bg-white p-5 transition-all hover:border-stone-300 hover:shadow-md"
              >
                <Sparkles className="h-6 w-6 text-stone-600 group-hover:text-stone-900" />
                <h3 className="mt-3 font-semibold text-stone-900">See Pricing</h3>
                <p className="mt-1 text-sm text-stone-600">Start free with all features</p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden py-24" style={{ backgroundColor: "#F1BBAA" }}>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: "url('/textures/grain.png')", backgroundSize: "200px 200px" }}
        />
        <div className={container}>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl sm:text-[28px] md:text-[32px] font-medium tracking-tight text-stone-950">
              Specification and purchasing, connected to your projects
            </h2>
            <p className="mt-3 text-lg text-stone-900/80">
              No more manual spreadsheets or lost invoices. Techstyles ensures materials arrive on time, every time.
            </p>
            <div className="mt-8 flex justify-center">
              <CtaButton
                href="/signup"
                variant="slate"
                label="Start for free"
                showArrow
                arrowVariant="white"
              />
            </div>
            <p className="mt-3 text-xs sm:text-sm text-stone-900/60">No credit card required</p>
          </div>
        </div>
      </section>
    </main>
  )
}
