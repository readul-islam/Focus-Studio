import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { CtaButton } from "@/components/cta-button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

const container = "mx-auto max-w-[1200px] px-6 sm:px-8"
const H1 = "text-[30px] sm:text-5xl md:text-[56px] font-medium tracking-tight leading-[1.1]"
const H2 = "text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight"
const Lead = "text-base sm:text-lg text-stone-600"

export const metadata: Metadata = {
  title: "Compare Interior Design Software | Focuspilot vs Competitors",
  description:
    "Compare Focuspilot with Programa, Houzz Pro, Studio Designer, DesignFiles and more. See why interior designers choose Focuspilot for project management.",
  keywords: [
    "interior design software comparison",
    "Programa alternative",
    "Houzz Pro alternative",
    "Studio Designer alternative",
    "DesignFiles alternative",
    "best interior design software",
  ],
  openGraph: {
    title: "Compare Interior Design Software | Focuspilot vs Competitors",
    description:
      "Compare Focuspilot with Programa, Houzz Pro, Studio Designer, DesignFiles and more. See why interior designers choose Focuspilot.",
    type: "website",
    url: "https://focuspilot.io/compare",
  },
  twitter: {
    card: "summary_large_image",
    title: "Compare Interior Design Software | Focuspilot",
    description: "Compare Focuspilot with leading interior design software. See detailed feature comparisons.",
  },
  alternates: {
    canonical: "https://focuspilot.io/compare",
  },
}

const competitors = [
  {
    name: "Programa",
    slug: "programa",
    description: "Popular in the US for procurement and project management",
    strengths: ["Strong procurement", "Good client portal"],
    focuspilotAdvantage: "Global-ready with native Xero, AI features, and Stripe payments",
  },
  {
    name: "Design Manager",
    slug: "design-manager",
    description: "Legacy desktop software for interior designers",
    strengths: ["Established brand", "Comprehensive features"],
    focuspilotAdvantage: "Modern cloud-based, mobile-friendly, no installation required",
  },
  {
    name: "Houzz Pro",
    slug: "houzz-pro",
    description: "All-in-one platform tied to Houzz marketplace",
    strengths: ["Houzz integration", "Lead generation"],
    focuspilotAdvantage: "Independent platform, dedicated support, more flexible",
  },
  {
    name: "Studio Designer",
    slug: "studio-designer",
    description: "Cloud-based design business management",
    strengths: ["Room planning", "Product library"],
    focuspilotAdvantage: "AI-powered features, better procurement, multi-currency pricing",
  },
  {
    name: "DesignFiles",
    slug: "designfiles",
    description: "Simple project management for designers",
    strengths: ["Easy to use", "Affordable"],
    focuspilotAdvantage: "More comprehensive features, AI automation, scales better",
  },
]

export default function ComparePage() {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://focuspilot.io" },
      { "@type": "ListItem", position: 2, name: "Compare", item: "https://focuspilot.io/compare" },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <main className="min-h-screen bg-white">
        {/* Hero */}
        <section className="bg-gradient-to-b from-stone-50 to-white py-16 sm:py-24">
          <div className={container}>
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="outline" className="mb-4 border-stone-300 text-stone-600">
                Software Comparisons
              </Badge>
                  <h1 className={cn(H1, "text-center")}>Compare Focuspilot</h1>
              <p className={cn(Lead, "mt-4 text-center")}>
                See how Focuspilot compares to other interior design software. We believe in transparency –
                find the right tool for your studio.
              </p>
            </div>
          </div>
        </section>

        {/* Comparison Cards */}
        <section className="py-16 sm:py-20">
          <div className={container}>
            <h2 className={cn(H2, "text-center mb-12")}>Detailed Comparisons</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {competitors.map((competitor) => (
                <Link
                  key={competitor.slug}
                  href={`/compare/${competitor.slug}`}
                  className="group"
                >
                  <Card className="h-full border-stone-200 transition-all hover:border-stone-300 hover:shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-stone-900">
                          Focuspilot vs {competitor.name}
                        </h3>
                        <ArrowRight className="h-5 w-5 text-stone-400 transition-transform group-hover:translate-x-1" />
                      </div>
                      <p className="text-sm text-stone-600 mb-4">{competitor.description}</p>
                      <div className="pt-4 border-t border-stone-100">
                        <p className="text-xs font-medium text-stone-500 mb-2">Focuspilot advantage:</p>
                        <p className="text-sm text-stone-700">{competitor.focuspilotAdvantage}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

                {/* Why Focuspilot */}
        <section className="bg-stone-50 py-16 sm:py-20">
          <div className={container}>
            <div className="mx-auto max-w-3xl text-center mb-12">
              <h2 className={cn(H2)}>Why studios switch to Focuspilot</h2>
              <p className={cn(Lead, "mt-4")}>
                Common reasons interior designers choose Focuspilot over alternatives
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Built for design studios worldwide",
                  description: "Native Xero integration, multi-currency support, VAT handling, and dedicated support.",
                },
                {
                  title: "AI-Powered Automation",
                  description: "AI email drafting, product sourcing, and proposal generation save hours weekly.",
                },
                {
                  title: "Modern & Mobile",
                  description: "Cloud-based, works on any device. No desktop software to install or update.",
                },
                {
                  title: "All-in-One Platform",
                  description: "CRM, projects, procurement, client portal, and finance in one connected workspace.",
                },
                {
                  title: "Free Migration",
                  description: "We help you migrate data from your existing software at no extra cost.",
                },
                {
                  title: "Transparent Pricing",
                  description: "Simple per-user pricing. No hidden fees or per-project charges.",
                },
              ].map((reason, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-900">{reason.title}</h3>
                    <p className="text-sm text-stone-600 mt-1">{reason.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 sm:py-24">
          <div className={container}>
            <div className="mx-auto max-w-2xl text-center">
                <h2 className={cn(H2)}>Ready to see Focuspilot in action?</h2>
              <p className={cn(Lead, "mt-4")}>
                Start your free 3-month trial and see why studios are switching to Focuspilot.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <CtaButton href="/signup" >
                  Start free trial
                </CtaButton>
                <CtaButton href="/pricing" variant="outline" >
                  View pricing
                </CtaButton>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
