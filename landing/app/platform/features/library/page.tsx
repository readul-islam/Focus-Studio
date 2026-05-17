import type { Metadata } from "next"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Zap, Tag, FolderOpen, ShoppingCart } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { MarketingPageHero } from "@/components/marketing/marketing-page-hero"
import { CtaButton } from "@/components/cta-button"

export const metadata: Metadata = {
  title: "Product Library for Interior Designers | AI-Powered Sourcing | Techstyles",
  description:
    "Your studio's centralized product database. Save, organise, and instantly add products to any project with AI-powered sourcing. Build specs 10x faster.",
  keywords: [
    "interior design product library",
    "FF&E database",
    "design product management",
    "AI product sourcing",
    "interior design specifications",
    "product catalogue software",
  ],
  openGraph: {
    title: "Product Library for Interior Designers | AI-Powered Sourcing | Techstyles",
    description: "Your studio's centralized product database. Save, organise, and instantly add products to any project with AI-powered sourcing.",
    url: "https://focuspilot.io/platform/features/library",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Product Library for Interior Designers | Techstyles",
    description: "Your studio's centralized product database with AI-powered sourcing.",
  },
  alternates: {
    canonical: "https://focuspilot.io/platform/features/library",
  },
}

const container = "mx-auto max-w-[1200px] px-6 sm:px-8"
const H1 = "text-[30px] sm:text-5xl md:text-[56px] font-medium tracking-tight leading-[1.1]"
const H2 = "text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight"
const Lead = "text-base sm:text-lg text-stone-600"

// Palette accents
const CLAY = "#E07A57"
const SLATE = "#4B5960"
const OLIVE = "#6E7A58"
const OCHRE = "#C78A3B"

function KpiTile({
  label,
  value,
  sublabel,
  accent,
}: {
  label: string
  value: string
  sublabel?: string
  accent: string
}) {
  return (
    <Card className="overflow-hidden border-stone-200 shadow-sm">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-medium tracking-wide text-stone-600">{label}</div>
            <div className="mt-1 text-2xl font-semibold text-stone-950">{value}</div>
            {sublabel ? <div className="mt-1 text-xs text-stone-500">{sublabel}</div> : null}
          </div>
          <span aria-hidden className="mt-1 inline-block h-1.5 w-10 rounded-full" style={{ backgroundColor: accent }} />
        </div>
      </CardContent>
    </Card>
  )
}

export default function ProductLibraryPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <MarketingPageHero
        gridHeight="min(520px, 58vh)"
        contentClassName={cn(container, "pb-10 pt-8 sm:pb-16 sm:pt-12 md:pt-16")}
      >
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-6 bg-stone-100 text-stone-700">
              Product Library
            </Badge>
            <h1 className={cn(H1, "text-center")}>Your studio's memory bank. Without the chaos.</h1>
            <p className={cn("mt-6 max-w-2xl text-center", Lead)}>
              Build your centralized product database with AI-powered sourcing. Save products from any source, organise
              with smart tagging, and add to projects with one click.
            </p>
            <div className="mx-auto mt-5 flex justify-center">
              <CtaButton
                href="/signup"
                variant="slate"
                size="lg"
                label="Start Building Library"
                showArrow
                arrowVariant="white"
              />
            </div>
          </div>
      </MarketingPageHero>

      {/* Product Grid Demo */}
      <section className="px-6 py-16">
        <div className={container}>
          <div className="text-center mb-12">
            <h2 className={H2}>Organise products your way</h2>
            <p className={cn("max-w-2xl mx-auto mt-4", Lead)}>
              Filter by category, search by name or brand, and find exactly what you need in seconds.
            </p>
          </div>

          <Card className="overflow-hidden border-stone-200 shadow-xl">
            <CardContent className="p-2 sm:p-3">
              <Image
                src="/images/product-library/product-grid.png"
                alt="Product library grid interface showing categorized products with filters"
                width={1200}
                height={600}
                className="w-full h-auto rounded-lg"
              />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="px-6 py-16 bg-stone-50">
        <div className={container}>
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="text-center">
              <div
                className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${CLAY}20` }}
              >
                <Zap className="h-5 w-5" style={{ color: CLAY }} />
              </div>
              <h3 className="text-xl font-semibold text-stone-900 mb-2">AI-Powered Sourcing</h3>
              <p className="text-stone-600">
                Drop any product URL and watch AI instantly extract specs, pricing, and supplier details.
              </p>
            </div>

            <div className="text-center">
              <div
                className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${OLIVE}20` }}
              >
                <Tag className="h-5 w-5" style={{ color: OLIVE }} />
              </div>
              <h3 className="text-xl font-semibold text-stone-900 mb-2">Smart Organisation</h3>
              <p className="text-stone-600">
                Auto-categorise products with intelligent tagging and custom collections for easy discovery.
              </p>
            </div>

            <div className="text-center">
              <div
                className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${SLATE}20` }}
              >
                <ShoppingCart className="h-5 w-5" style={{ color: SLATE }} />
              </div>
              <h3 className="text-xl font-semibold text-stone-900 mb-2">One-Click Procurement</h3>
              <p className="text-stone-600">
                Add any library product to project procurement lists instantly—no re-entering details.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Detail View */}
      <section className="px-6 py-16">
        <div className={container}>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className={H2}>Complete product intelligence</h2>
              <p className={cn("mt-4 mb-8", Lead)}>
                Every product in your library includes comprehensive details: pricing, specifications, supplier
                information, and availability—all automatically captured and kept up to date.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-6 w-6 items-center justify-center rounded-full mt-0.5"
                    style={{ backgroundColor: `${CLAY}20` }}
                  >
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: CLAY }} />
                  </div>
                  <div>
                    <h4 className="font-medium text-stone-900">Retail & Trade Pricing</h4>
                    <p className="text-sm text-stone-600">Track both client and cost pricing for accurate margins</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div
                    className="flex h-6 w-6 items-center justify-center rounded-full mt-0.5"
                    style={{ backgroundColor: `${CLAY}20` }}
                  >
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: CLAY }} />
                  </div>
                  <div>
                    <h4 className="font-medium text-stone-900">Supplier Details</h4>
                    <p className="text-sm text-stone-600">Direct contact info, lead times, and ordering requirements</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div
                    className="flex h-6 w-6 items-center justify-center rounded-full mt-0.5"
                    style={{ backgroundColor: `${CLAY}20` }}
                  >
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: CLAY }} />
                  </div>
                  <div>
                    <h4 className="font-medium text-stone-900">Stock & Availability</h4>
                    <p className="text-sm text-stone-600">Real-time inventory status and sample availability</p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="overflow-hidden border-stone-200 shadow-sm">
              <CardContent className="p-1">
                <Image
                  src="/images/product-library/product-detail.png"
                  alt="Detailed product view showing comprehensive product information and specifications"
                  width={600}
                  height={800}
                  className="w-full h-auto rounded-lg object-cover"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Building Your Library */}
      <section className="px-6 py-16 bg-stone-50">
        <div className={container}>
          <div className="text-center mb-12">
            <h2 className={H2}>Build your library from any source</h2>
            <p className={cn("max-w-2xl mx-auto mt-4", Lead)}>
              Multiple ways to add products: AI web clipper, import from past projects, or manual entry.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <Card className="text-center p-6 border-stone-200 shadow-sm">
              <div
                className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl"
                style={{ backgroundColor: CLAY }}
              >
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-stone-900 mb-2">AI Web Clipper</h3>
              <p className="text-stone-600 mb-4">
                Drop any product URL and AI extracts all details instantly—specs, pricing, images, supplier info.
              </p>
              <Badge variant="secondary" className="text-stone-700" style={{ backgroundColor: `${CLAY}20` }}>
                30 seconds vs 15-20 minutes
              </Badge>
            </Card>

            <Card className="text-center p-6 border-stone-200 shadow-sm">
              <div
                className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl"
                style={{ backgroundColor: OLIVE }}
              >
                <FolderOpen className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-stone-900 mb-2">Import from Projects</h3>
              <p className="text-stone-600 mb-4">
                Save products from any existing project schedule directly to your library with one click.
              </p>
              <Badge variant="secondary" className="text-stone-700" style={{ backgroundColor: `${OLIVE}20` }}>
                Bulk import available
              </Badge>
            </Card>

            <Card className="text-center p-6 border-stone-200 shadow-sm">
              <div
                className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl"
                style={{ backgroundColor: SLATE }}
              >
                <Plus className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-stone-900 mb-2">Manual Entry</h3>
              <p className="text-stone-600 mb-4">
                Add custom products, trade-only items, or bespoke pieces with full specification control.
              </p>
              <Badge variant="secondary" className="text-stone-700" style={{ backgroundColor: `${SLATE}20` }}>
                Custom fields supported
              </Badge>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 py-16">
        <div className={container}>
          <div className="text-center mb-12">
            <h2 className={H2}>Turn chaos into organised efficiency</h2>
          </div>

          <div className="grid gap-8 md:grid-cols-4">
            <KpiTile label="Faster sourcing" value="95%" accent={CLAY} />
            <KpiTile label="Time to add product" value="30s" accent={OLIVE} />
            <KpiTile label="Data accuracy" value="100%" accent={SLATE} />
            <KpiTile label="Storage capacity" value="∞" accent={OCHRE} />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden px-6 py-16" style={{ backgroundColor: CLAY }}>
        <div className="absolute inset-0 bg-[url('/images/texture-noise.png')] opacity-20" />
        <div className="relative mx-auto max-w-4xl text-center">
          <h2 className="text-2xl sm:text-[28px] md:text-[32px] font-medium tracking-tight text-white">Ready to build your product library?</h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/90">
            Start organising your products today. Import from existing projects, use our AI web clipper, or add
            manually—your choice.
          </p>
          <div className="mx-auto mt-5 flex justify-center">
            <CtaButton
              href="/signup"
              variant="white"
              size="lg"
              label="Start Free Trial"
              showArrow
              arrowVariant="brand"
            />
          </div>
        </div>
      </section>
    </div>
  )
}
