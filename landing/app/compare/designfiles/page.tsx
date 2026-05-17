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
  title: "Techstyles vs DesignFiles | Interior Design Software Comparison 2025",
  description:
    "Compare Techstyles vs DesignFiles for interior designers. See differences in AI features, procurement, finance tools, and scalability. Which is right for your studio?",
  keywords: [
    "Techstyles vs DesignFiles",
    "DesignFiles alternative",
    "interior design software comparison",
    "DesignFiles alternative UK",
    "design project management software",
  ],
  openGraph: {
    title: "Techstyles vs DesignFiles | Interior Design Software Comparison 2025",
    description:
      "Compare Techstyles vs DesignFiles for interior designers. AI features, procurement, finance tools, and scalability comparison.",
    type: "article",
    url: "https://focuspilot.io/compare/designfiles",
  },
  twitter: {
    card: "summary_large_image",
    title: "Techstyles vs DesignFiles | Interior Design Software Comparison",
    description: "Compare Techstyles vs DesignFiles. See which scales better for growing studios.",
  },
  alternates: {
    canonical: "https://focuspilot.io/compare/designfiles",
  },
}

const comparisonData = [
  {
    category: "AI & Automation",
    features: [
      { name: "AI email drafting", techstyles: true, designfiles: false },
      { name: "AI product sourcing", techstyles: true, designfiles: false },
      { name: "AI proposal generation", techstyles: true, designfiles: false },
      { name: "Automated workflows", techstyles: true, designfiles: "partial" },
      { name: "Smart data extraction", techstyles: true, designfiles: false },
    ],
  },
  {
    category: "Procurement & FF&E",
    features: [
      { name: "Product library", techstyles: true, designfiles: true },
      { name: "Purchase order generation", techstyles: true, designfiles: "partial" },
      { name: "Supplier management", techstyles: true, designfiles: "partial" },
      { name: "Delivery tracking", techstyles: true, designfiles: false },
      { name: "Trade pricing lookup", techstyles: true, designfiles: false },
    ],
  },
  {
    category: "Finance & Invoicing",
    features: [
      { name: "Invoice generation", techstyles: true, designfiles: true },
      { name: "Xero/QuickBooks sync", techstyles: true, designfiles: false },
      { name: "Stripe payments", techstyles: true, designfiles: false },
      { name: "Project profitability", techstyles: true, designfiles: "partial" },
      { name: "Budget vs actual tracking", techstyles: true, designfiles: "partial" },
    ],
  },
  {
    category: "Client Management",
    features: [
      { name: "Client portal", techstyles: true, designfiles: true },
      { name: "Selection boards", techstyles: true, designfiles: true },
      { name: "Approval workflows", techstyles: true, designfiles: "partial" },
      { name: "In-portal payments", techstyles: true, designfiles: false },
      { name: "Real-time collaboration", techstyles: true, designfiles: "partial" },
    ],
  },
  {
    category: "Scalability",
    features: [
      { name: "Multi-user teams", techstyles: true, designfiles: true },
      { name: "Role-based permissions", techstyles: true, designfiles: "partial" },
      { name: "Multiple studios/brands", techstyles: true, designfiles: false },
      { name: "Enterprise features", techstyles: true, designfiles: false },
      { name: "API access", techstyles: true, designfiles: false },
    ],
  },
]

const faqs = [
  {
    question: "What's the main difference between Techstyles and DesignFiles?",
    answer:
      "DesignFiles is a simpler, more affordable tool for basic project management and client boards. Techstyles is a comprehensive platform with AI automation, full procurement management, accounting integration, and features that scale with your studio.",
  },
  {
    question: "Is DesignFiles cheaper than Techstyles?",
    answer:
      "DesignFiles has a lower starting price, but Techstyles' AI features can save 10+ hours weekly in admin time. When you factor in time savings, Techstyles often provides better value, especially for studios doing £200k+ in projects annually.",
  },
  {
    question: "Does DesignFiles have accounting integration?",
    answer:
      "No, DesignFiles doesn't integrate with accounting software. Techstyles has native two-way sync with Xero and QuickBooks, automatically syncing invoices, payments, and expenses.",
  },
  {
    question: "Which is better for a growing studio?",
    answer:
      "Techstyles scales better with features like role-based permissions, multi-user collaboration, API access, and enterprise options. DesignFiles works well for solo designers but can feel limited as teams grow.",
  },
  {
    question: "Can I migrate from DesignFiles to Techstyles?",
    answer:
      "Yes. We offer free migration assistance including project data, client contacts, and product library import. Most studios transition within a few days.",
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

export default function TechstylesVsDesignFilesPage() {
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
      { "@type": "ListItem", position: 3, name: "Techstyles vs DesignFiles", item: "https://focuspilot.io/compare/designfiles" },
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
              <h1 className={cn(H1, "text-center")}>Techstyles vs DesignFiles</h1>
              <p className={cn(Lead, "mt-4 text-center")}>
                Compare a comprehensive AI-powered platform with simpler project management.
                See which tool fits your studio's current needs and growth plans.
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
                      <span>Want AI to handle repetitive admin tasks</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                      <span>Need comprehensive procurement management</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                      <span>Want accounting software integration</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                      <span>Plan to grow your team</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                      <span>Need client payments through the portal</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="border border-stone-200">
                <CardContent className="p-6 sm:p-8">
                  <div className="mb-4 text-xl font-semibold">Choose DesignFiles if you...</div>
                  <ul className="space-y-3 text-stone-600">
                    <li className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-stone-400" />
                      <span>Are a solo designer with simple needs</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-stone-400" />
                      <span>Primarily need client presentation boards</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-stone-400" />
                      <span>Have a very tight budget</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-stone-400" />
                      <span>Don't need procurement or finance features</span>
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
                    <th className="py-4 px-4 text-center font-semibold text-stone-900 w-32">DesignFiles</th>
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
                              <FeatureStatus status={feature.designfiles} />
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
                Start your free 3-month trial. No credit card required. Free migration from DesignFiles.
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
