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
  title: "Techstyles vs Studio Designer | Interior Design Software Comparison 2025",
  description:
    "Compare Techstyles vs Studio Designer for interior design firms. See differences in AI features, UK pricing, procurement, and client management. Free migration available.",
  keywords: [
    "Techstyles vs Studio Designer",
    "Studio Designer alternative",
    "interior design software comparison",
    "Studio Designer alternative UK",
    "design business management software",
  ],
  openGraph: {
    title: "Techstyles vs Studio Designer | Interior Design Software Comparison 2025",
    description:
      "Compare Techstyles vs Studio Designer for interior design firms. AI features, UK pricing, and comprehensive feature comparison.",
    type: "article",
    url: "https://techstyles.ai/compare/studio-designer",
  },
  twitter: {
    card: "summary_large_image",
    title: "Techstyles vs Studio Designer | Interior Design Software Comparison",
    description: "Compare Techstyles vs Studio Designer. See why UK designers are switching.",
  },
  alternates: {
    canonical: "https://techstyles.ai/compare/studio-designer",
  },
}

const comparisonData = [
  {
    category: "AI & Automation",
    features: [
      { name: "AI email drafting", techstyles: true, studioDesigner: false },
      { name: "AI product sourcing", techstyles: true, studioDesigner: false },
      { name: "AI proposal generation", techstyles: true, studioDesigner: false },
      { name: "Automated data extraction", techstyles: true, studioDesigner: false },
      { name: "Smart reminders", techstyles: true, studioDesigner: "partial" },
    ],
  },
  {
    category: "Procurement & Products",
    features: [
      { name: "Product library", techstyles: true, studioDesigner: true },
      { name: "Purchase order generation", techstyles: true, studioDesigner: true },
      { name: "Supplier management", techstyles: true, studioDesigner: true },
      { name: "Delivery tracking", techstyles: true, studioDesigner: "partial" },
      { name: "Trade pricing integration", techstyles: true, studioDesigner: "partial" },
    ],
  },
  {
    category: "UK Market Features",
    features: [
      { name: "Native Xero integration", techstyles: true, studioDesigner: false },
      { name: "GBP pricing throughout", techstyles: true, studioDesigner: "partial" },
      { name: "UK VAT handling", techstyles: true, studioDesigner: "partial" },
      { name: "UK-based support", techstyles: true, studioDesigner: false },
      { name: "British English interface", techstyles: true, studioDesigner: false },
    ],
  },
  {
    category: "Client Management",
    features: [
      { name: "Client portal", techstyles: true, studioDesigner: true },
      { name: "Selection approvals", techstyles: true, studioDesigner: true },
      { name: "In-portal payments", techstyles: true, studioDesigner: false },
      { name: "Real-time updates", techstyles: true, studioDesigner: "partial" },
      { name: "White-label branding", techstyles: true, studioDesigner: true },
    ],
  },
  {
    category: "Finance",
    features: [
      { name: "Invoice generation", techstyles: true, studioDesigner: true },
      { name: "Stripe payments", techstyles: true, studioDesigner: false },
      { name: "Project profitability", techstyles: true, studioDesigner: true },
      { name: "Budget tracking", techstyles: true, studioDesigner: true },
      { name: "Accounting sync", techstyles: true, studioDesigner: "partial" },
    ],
  },
]

const faqs = [
  {
    question: "What's the main difference between Techstyles and Studio Designer?",
    answer:
      "Techstyles is built for UK/European studios with native Xero integration and includes AI-powered features for automation. Studio Designer is US-focused without UK accounting integration or AI capabilities.",
  },
  {
    question: "Does Studio Designer have AI features?",
    answer:
      "No, Studio Designer doesn't include AI features. Techstyles offers AI email drafting, AI product sourcing, AI proposal generation, and automated data extraction – features that can save 10+ hours weekly.",
  },
  {
    question: "Which has better procurement features?",
    answer:
      "Both have solid procurement foundations, but Techstyles adds AI-powered product sourcing that finds alternatives and trade pricing automatically, plus better delivery tracking and supplier management.",
  },
  {
    question: "Can I migrate from Studio Designer to Techstyles?",
    answer:
      "Yes. We offer free migration assistance including product library import, client data transfer, and project history migration. Most studios are fully operational within one week.",
  },
  {
    question: "Which is better for UK-based studios?",
    answer:
      "Techstyles is purpose-built for UK studios with Xero integration, GBP pricing, VAT handling, and UK-based support. Studio Designer is designed primarily for the US market.",
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

export default function TechstylesVsStudioDesignerPage() {
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
      { "@type": "ListItem", position: 1, name: "Home", item: "https://techstyles.ai" },
      { "@type": "ListItem", position: 2, name: "Compare", item: "https://techstyles.ai/compare" },
      { "@type": "ListItem", position: 3, name: "Techstyles vs Studio Designer", item: "https://techstyles.ai/compare/studio-designer" },
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
              <h1 className={cn(H1, "text-center")}>Techstyles vs Studio Designer</h1>
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
                  <div className="mb-4 text-xl font-semibold">Choose Techstyles if you...</div>
                  <ul className="space-y-3 text-stone-600">
                    <li className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                      <span>Want AI to automate repetitive tasks</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                      <span>Need native UK accounting integration (Xero)</span>
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
                      <span>Are based in the UK or Europe</span>
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
                    <th className="py-4 px-4 text-center font-semibold text-stone-900 w-32">Techstyles</th>
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
                              <FeatureStatus status={feature.techstyles} />
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex justify-center">
                              <FeatureStatus status={feature.studioDesigner} />
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
              <h2 className="text-2xl sm:text-[28px] md:text-[32px] font-medium tracking-tight text-white">Ready to try Techstyles?</h2>
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
