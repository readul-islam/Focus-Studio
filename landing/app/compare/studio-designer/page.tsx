import type { Metadata } from "next"
import Link from "next/link"
import { Check, X, Minus, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { CtaButton } from "@/components/cta-button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

const container = "mx-auto max-w-[1200px] px-6 sm:px-8"
const H1 = "text-[30px] sm:text-5xl md:text-[56px] font-medium tracking-tight leading-[1.1]"
const H2 = "text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight"
const Lead = "text-base sm:text-lg text-stone-600"

export const metadata: Metadata = {
  title: "Focuspilot vs Studio Designer | Interior Design Software Comparison 2025",
  description:
    "Compare Focuspilot vs Studio Designer for interior design firms. See differences in AI features, transparent pricing, procurement, and client management. Free migration available.",
  keywords: [
    "Focuspilot vs Studio Designer",
    "Studio Designer alternative",
    "interior design software comparison",
    "Studio Designer alternative",
    "design business management software",
  ],
  openGraph: {
    title: "Focuspilot vs Studio Designer | Interior Design Software Comparison 2025",
    description:
      "Compare Focuspilot vs Studio Designer for interior design firms. AI features, transparent pricing, and comprehensive feature comparison.",
    type: "article",
    url: "https://focuspilot.io/compare/studio-designer",
  },
  twitter: {
    card: "summary_large_image",
    title: "Focuspilot vs Studio Designer | Interior Design Software Comparison",
    description: "Compare Focuspilot vs Studio Designer. See why designers are switching.",
  },
  alternates: {
    canonical: "https://focuspilot.io/compare/studio-designer",
  },
}

const comparisonData = [
  {
    category: "AI & Automation",
    features: [
      { name: "AI email drafting", focuspilot: true, studioDesigner: false },
      { name: "AI product sourcing", focuspilot: true, studioDesigner: false },
      { name: "AI proposal generation", focuspilot: true, studioDesigner: false },
      { name: "Automated data extraction", focuspilot: true, studioDesigner: false },
      { name: "Smart reminders", focuspilot: true, studioDesigner: "partial" },
    ],
  },
  {
    category: "Procurement & Products",
    features: [
      { name: "Product library", focuspilot: true, studioDesigner: true },
      { name: "Purchase order generation", focuspilot: true, studioDesigner: true },
      { name: "Supplier management", focuspilot: true, studioDesigner: true },
      { name: "Delivery tracking", focuspilot: true, studioDesigner: "partial" },
      { name: "Trade pricing integration", focuspilot: true, studioDesigner: "partial" },
    ],
  },
  {
    category: "Finance & compliance",
    features: [
      { name: "Native Xero integration", focuspilot: true, studioDesigner: false },
      { name: "Multi-currency pricing", focuspilot: true, studioDesigner: "partial" },
      { name: "VAT & tax handling", focuspilot: true, studioDesigner: "partial" },
      { name: "Dedicated support", focuspilot: true, studioDesigner: false },
      { name: "British English interface", focuspilot: true, studioDesigner: false },
    ],
  },
  {
    category: "Client Management",
    features: [
      { name: "Client portal", focuspilot: true, studioDesigner: true },
      { name: "Selection approvals", focuspilot: true, studioDesigner: true },
      { name: "In-portal payments", focuspilot: true, studioDesigner: false },
      { name: "Real-time updates", focuspilot: true, studioDesigner: "partial" },
      { name: "White-label branding", focuspilot: true, studioDesigner: true },
    ],
  },
  {
    category: "Finance",
    features: [
      { name: "Invoice generation", focuspilot: true, studioDesigner: true },
      { name: "Stripe payments", focuspilot: true, studioDesigner: false },
      { name: "Project profitability", focuspilot: true, studioDesigner: true },
      { name: "Budget tracking", focuspilot: true, studioDesigner: true },
      { name: "Accounting sync", focuspilot: true, studioDesigner: "partial" },
    ],
  },
]

const faqs = [
  {
    question: "What's the main difference between Focuspilot and Studio Designer?",
    answer:
      "Focuspilot is built for studios worldwide with native Xero integration and includes AI-powered features for automation. Studio Designer is US-focused without the same accounting integrations or AI capabilities.",
  },
  {
    question: "Does Studio Designer have AI features?",
    answer:
      "No, Studio Designer doesn't include AI features. Focuspilot offers AI email drafting, AI product sourcing, AI proposal generation, and automated data extraction – features that can save 10+ hours weekly.",
  },
  {
    question: "Which has better procurement features?",
    answer:
      "Both have solid procurement foundations, but Focuspilot adds AI-powered product sourcing that finds alternatives and trade pricing automatically, plus better delivery tracking and supplier management.",
  },
  {
    question: "Can I migrate from Studio Designer to Focuspilot?",
    answer:
      "Yes. We offer free migration assistance including product library import, client data transfer, and project history migration. Most studios are fully operational within one week.",
  },
  {
    question: "Which is better for international studios?",
    answer:
      "Focuspilot supports global studios with Xero integration, multi-currency pricing, VAT handling, and dedicated support. Studio Designer is designed primarily for the US market.",
  },
]

function FeatureStatus({ status }: { status: boolean | "partial" }) {
  if (status === true) {
    return <Check className="h-5 w-5 text-green-600" />
  }
  if (status === "partial") {
    return <Minus className="h-5 w-5 text-amber-500" />
  }
  return <X className="h-5 w-5 text-stone-300" />
}

export default function FocuspilotVsStudioDesignerPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://focuspilot.io" },
      { "@type": "ListItem", position: 2, name: "Compare", item: "https://focuspilot.io/compare" },
      { "@type": "ListItem", position: 3, name: "Focuspilot vs Studio Designer", item: "https://focuspilot.io/compare/studio-designer" },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <main className="min-h-screen bg-white">
        {/* Hero */}
        <section className="bg-gradient-to-b from-stone-50 to-white py-16 sm:py-24">
          <div className={container}>
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="outline" className="mb-4 border-stone-300 text-stone-600">
                Software Comparison
              </Badge>
              <h1 className={cn(H1, "text-center")}>Focuspilot vs Studio Designer</h1>
              <p className={cn(Lead, "mt-4 text-center")}>
                Compare AI-powered project management with traditional design business software.
                See which platform fits your studio's needs.
              </p>
            </div>
          </div>
        </section>

        {/* Best For Section */}
        <section className="py-16 sm:py-20">
          <div className={container}>
            <h2 className={cn(H2, "text-center mb-12")}>Which is best for your studio?</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-2 border-stone-900">
                <CardContent className="p-6 sm:p-8">
                        <div className="mb-4 text-xl font-semibold">Choose Focuspilot if you...</div>
                  <ul className="space-y-3 text-stone-600">
                    <li className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                      <span>Want AI to automate repetitive tasks</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                      <span>Need native Xero accounting integration</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                      <span>Want in-portal client payments via Stripe</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                      <span>Value modern, mobile-first design</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                      <span>Work across regions and need multi-currency support</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="border border-stone-200">
                <CardContent className="p-6 sm:p-8">
                  <div className="mb-4 text-xl font-semibold">Choose Studio Designer if you...</div>
                  <ul className="space-y-3 text-stone-600">
                    <li className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-stone-400" />
                      <span>Prefer established, traditional software</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-stone-400" />
                      <span>Are primarily US-based</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-stone-400" />
                      <span>Don't need AI automation features</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-stone-400" />
                      <span>Use QuickBooks for accounting</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Feature Comparison Table */}
        <section className="bg-stone-50 py-16 sm:py-20">
          <div className={container}>
            <h2 className={cn(H2, "text-center mb-12")}>Feature comparison</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-stone-200">
                    <th className="py-4 px-4 text-left font-semibold text-stone-900">Feature</th>
                    <th className="py-4 px-4 text-center font-semibold text-stone-900 w-32">Focuspilot</th>
                    <th className="py-4 px-4 text-center font-semibold text-stone-900 w-32">Studio Designer</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((category) => (
                    <>
                      <tr key={category.category} className="bg-stone-100">
                        <td colSpan={3} className="py-3 px-4 font-semibold text-stone-800">
                          {category.category}
                        </td>
                      </tr>
                      {category.features.map((feature) => (
                        <tr key={feature.name} className="border-b border-stone-100">
                          <td className="py-3 px-4 text-stone-700">{feature.name}</td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex justify-center">
                              <FeatureStatus status={feature.focuspilot} />
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex justify-center">
                              <FeatureStatus status={feature.focuspilot} />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 flex items-center justify-center gap-6 text-sm text-stone-600">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" /> Full support
              </div>
              <div className="flex items-center gap-2">
                <Minus className="h-4 w-4 text-amber-500" /> Partial/Limited
              </div>
              <div className="flex items-center gap-2">
                <X className="h-4 w-4 text-stone-300" /> Not available
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 sm:py-20">
          <div className={container}>
            <div className="mx-auto max-w-3xl">
              <h2 className={cn(H2, "text-center mb-12")}>Frequently asked questions</h2>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left font-medium">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-stone-600">{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-stone-900 py-16 sm:py-20">
          <div className={container}>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl sm:text-[28px] md:text-[32px] font-medium tracking-tight text-white">Ready to try Focuspilot?</h2>
              <p className="mt-4 text-stone-300">
                Start your free 3-month trial. No credit card required. Free migration from Studio Designer.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <CtaButton href="/signup"  className="bg-white text-stone-900 hover:bg-stone-100">
                  Start free trial
                </CtaButton>
                <CtaButton href="/compare" variant="outline"  className="border-stone-600 text-white hover:bg-stone-800">
                  View all comparisons
                </CtaButton>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
