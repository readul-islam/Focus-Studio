"use client"
import Image from "next/image"
import { Sparkles, Zap, Clock, CheckCircle2, Database, Search, FileText } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { CtaButton } from "@/components/cta-button"
import { PortugueseTilesBg } from "@/components/graphics/portuguese-tiles-bg"

const container = "mx-auto max-w-[1200px] px-6 sm:px-8"
const TITLE_H1 = "text-[30px] sm:text-5xl md:text-[56px] font-medium tracking-tight leading-[1.1]"
const TITLE_H2 = "text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight"

function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-white">
      <PortugueseTilesBg className="top-0" height="min(520px, 58vh)" opacity={0.08} />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-30"
        style={{
          background:
            "radial-gradient(60% 46% at 50% 0%, rgba(214,177,150,0.14) 0%, rgba(214,177,150,0.06) 42%, transparent 72%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-40 opacity-[0.06]"
        style={{ backgroundImage: "url('/textures/grain.png')", backgroundSize: "200px 200px" }}
      />

      <div className={cn(container, "pb-10 pt-8 sm:pb-16 sm:pt-12 md:pt-16")}>
        <div className="mx-auto max-w-4xl text-center sm:text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-stone-300/60 bg-white px-3 py-1 text-xs text-stone-700">
            <Sparkles className="h-3 w-3 text-stone-600" />
            <span>AI-powered procurement</span>
          </div>

          <h1 className={cn("mt-5 text-center", TITLE_H1)}>
            AI Product Procurement Web clipper meets instant library.
          </h1>

          <p className="mt-4 text-center text-base sm:text-lg text-stone-600">
            Transform how you source products with AI that instantly extracts specifications, pricing, and vendor
            details from any website. Build your product library effortlessly.
          </p>

          <div className="mx-auto mt-6 flex justify-center">
            <CtaButton
              href="/signup"
              variant="slate"
                            label="Start free trial"
              showArrow
              arrowVariant="white"
            />
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-6xl">
          <Card className="overflow-hidden border-stone-200 shadow-xl">
            <CardContent className="p-2 sm:p-3">
              <div className="relative w-full">
                <Image
                  src="/images/procurement/ai-import-chair.png"
                  alt="AI Product Procurement showing web clipper extracting product specifications and details"
                  width={1600}
                  height={900}
                  priority={true}
                  className="h-auto w-full rounded-lg bg-stone-50 object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1200px"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

function ProcurementFlow() {
  const steps = [
    {
      number: "01",
      title: "Browse & clip",
      description: "Use our browser extension to capture products from any vendor website with one click.",
      icon: Search,
      color: "#E07A57", // Brand clay color
    },
    {
      number: "02",
      title: "AI extracts details",
      description: "Our AI instantly pulls specifications, pricing, dimensions, and vendor information.",
      icon: Sparkles,
      color: "#166534", // Brand emerald
    },
    {
      number: "03",
      title: "Review & organize",
      description: "Verify extracted data and organize products into collections and project libraries.",
      icon: FileText,
      color: "#D97706", // Amber
    },
    {
      number: "04",
      title: "Add to projects",
      description: "Seamlessly add products to client presentations and procurement lists.",
      icon: Zap,
      color: "#4B5960", // Brand slate
    },
  ]

  return (
    <section className="bg-white py-20 sm:py-24">
      <div className={container}>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className={TITLE_H2}>How AI procurement works</h2>
          <p className="mt-3 text-lg text-stone-600">
            From discovery to library in seconds. Let AI handle the tedious work of product data entry.
          </p>
        </div>

        <div className="relative mt-16">
          {/* Desktop connecting line - runs across all 4 steps */}
          <div
            className="absolute left-0 right-0 top-6 hidden h-px bg-stone-200 lg:block"
            style={{ left: "12.5%", right: "12.5%", width: "75%" }}
          />

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div key={step.number} className="relative z-10">
                <div className="flex flex-col items-center text-center">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-white ring-1"
                    style={{
                      backgroundColor: `${step.color}14`,
                      ringColor: `${step.color}28`,
                    }}
                  >
                    <step.icon className="h-5 w-5" style={{ color: step.color }} />
                  </div>
                  <div className="mt-4 text-sm font-medium text-stone-500">{step.number}</div>
                  <h3 className="mt-2 text-xl font-semibold text-stone-900">{step.title}</h3>
                  <p className="mt-2 text-sm text-stone-600 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function FeatureBlocks() {
  const features = [
    {
      title: "Instant data extraction",
      description:
        "AI automatically captures product specifications, pricing, dimensions, materials, and vendor details from any website.",
      benefits: [
        "Automatic spec sheet generation",
        "Price tracking and updates",
        "Vendor contact information",
        "Product images and documentation",
      ],
      image: {
        src: "/images/procurement/ai-import-chair.png",
        alt: "AI extracting product details from a furniture website showing specifications and pricing",
        width: 1280,
        height: 840,
      },
    },
    {
      title: "Smart product library",
      description:
        "Build a comprehensive product database with AI-powered categorization, search, and recommendations.",
      benefits: [
        "Intelligent product categorization",
        "Advanced search and filtering",
        "Similar product suggestions",
        "Custom tags and collections",
      ],
      image: {
        src: "/images/app/procurement-library.png",
        alt: "Product library interface showing organized collections and AI-powered search",
        width: 1280,
        height: 840,
      },
    },
    {
      title: "Project integration",
      description: "Seamlessly add products to client presentations, mood boards, and procurement lists.",
      benefits: [
        "One-click project addition",
        "Automated procurement lists",
        "Client presentation tools",
        "Budget tracking integration",
      ],
      image: {
        src: "/images/platform/projects/procurement-table.png",
        alt: "Project procurement interface showing products added to client presentation",
        width: 1280,
        height: 840,
      },
    },
  ]

  return (
    <section className="bg-stone-50 py-20 sm:py-24">
      <div className={container}>
        <div className="space-y-20 sm:space-y-24">
          {features.map((feature, index) => {
            const isEven = index % 2 === 0
            return (
              <div key={feature.title} className="grid items-center gap-10 md:grid-cols-12 lg:gap-14">
                <div className={cn("md:col-span-6", isEven ? "md:order-1" : "md:order-2")}>
                  <div className="mx-auto max-w-xl">
                    <h2 className={cn("mt-2", TITLE_H2)}>{feature.title}</h2>
                    <p className="mt-3 text-stone-600">{feature.description}</p>
                    <ul className="mt-6 space-y-3">
                      {feature.benefits.map((benefit) => (
                        <li key={benefit} className="flex items-start gap-3 text-stone-800">
                          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "#166534" }} />
                          <span className="text-base">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className={cn("md:col-span-6", isEven ? "md:order-2" : "md:order-1")}>
                  <div className="relative">
                    <Image
                      src={feature.image.src || "/placeholder.svg"}
                      alt={feature.image.alt}
                      width={feature.image.width}
                      height={feature.image.height}
                      className="h-auto w-full rounded-xl object-cover shadow-lg"
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 55vw, 640px"
                      priority={false}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function BenefitsGrid() {
  const benefits = [
    {
      icon: Clock,
      title: "Save hours daily",
      description: "Eliminate manual data entry and product research. Focus on design, not admin work.",
      color: "#D97706", // Amber
    },
    {
      icon: Database,
      title: "Build your library",
      description: "Create a comprehensive product database that grows with every project.",
      color: "#4B5960", // Brand slate
    },
    {
      icon: Zap,
      title: "Instant accuracy",
      description: "AI ensures consistent, accurate product data across all your projects.",
      color: "#166534", // Brand emerald
    },
    {
      icon: Search,
      title: "Universal compatibility",
      description: "Works with any vendor website - from trade-only to retail platforms.",
      color: "#E07A57", // Brand clay
    },
    {
      icon: FileText,
      title: "Professional presentations",
      description: "Generate beautiful spec sheets and client presentations automatically.",
      color: "#7C2D12", // Brown
    },
    {
      icon: CheckCircle2,
      title: "Always up-to-date",
      description: "Track price changes and availability updates across all your saved products.",
      color: "#4338CA", // Indigo
    },
  ]

  return (
    <section className="bg-white py-20 sm:py-24">
      <div className={container}>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className={TITLE_H2}>Why designers love AI procurement</h2>
          <p className="mt-3 text-lg text-stone-600">
            Transform your sourcing workflow with intelligent automation that learns from your preferences.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => (
            <Card key={benefit.title} className="border-stone-200 bg-white">
              <CardContent className="p-6">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg ring-1"
                  style={{
                    backgroundColor: `${benefit.color}14`,
                    ringColor: `${benefit.color}28`,
                  }}
                >
                  <benefit.icon className="h-5 w-5" style={{ color: benefit.color }} />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-stone-900">{benefit.title}</h3>
                <p className="mt-2 text-sm text-stone-600 leading-relaxed">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function BigCTA() {
  return (
    <section
      id="waitlist"
      className="relative isolate overflow-hidden py-24 text-stone-100"
      style={{ backgroundColor: "#3F4B51" }}
      aria-labelledby="cta-heading"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{ backgroundImage: "url('/textures/grain.png')", backgroundSize: "200px 200px" }}
      />
      <div className={container}>
        <div className="mx-auto max-w-3xl text-center">
          <h2 id="cta-heading" className="text-2xl sm:text-[28px] md:text-[32px] font-medium tracking-tight">
            Deliver beautiful projects with less effort
          </h2>
          <p className="mt-3 text-base sm:text-lg text-stone-300">
            Specs, approvals, purchase orders and receipts in one connected workflow.
          </p>
          <div className="mt-8 flex items-center justify-center">
            <CtaButton href="/signup" variant="white" label="Start for free" showArrow arrowVariant="slate" />
          </div>
          <p className="mt-3 text-xs sm:text-sm text-stone-400">No credit card required</p>
        </div>
      </div>
    </section>
  )
}

export default function AIProcurementPage() {
  return (
    <>
      <Hero />
      <ProcurementFlow />
      <FeatureBlocks />
      <BenefitsGrid />
      <BigCTA />
    </>
  )
}
