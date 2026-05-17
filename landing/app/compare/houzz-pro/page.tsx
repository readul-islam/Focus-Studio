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
  title: "Techstyles vs Houzz Pro | Interior Design Software Comparison 2025",
  description:
    "Compare Techstyles vs Houzz Pro for interior design studios. Independent platform vs Houzz ecosystem. See AI features, UK pricing, and why designers are switching.",
  keywords: [
    "Techstyles vs Houzz Pro",
    "Houzz Pro alternative",
    "interior design software comparison",
    "Houzz Pro alternative UK",
    "independent design software",
  ],
  openGraph: {
    title: "Techstyles vs Houzz Pro | Interior Design Software Comparison 2025",
    description:
      "Compare Techstyles vs Houzz Pro for interior design studios. Independent platform vs Houzz ecosystem. AI features, UK pricing, and more.",
    type: "article",
    url: "https://techstyles.ai/compare/houzz-pro",
  },
  twitter: {
    card: "summary_large_image",
    title: "Techstyles vs Houzz Pro | Interior Design Software Comparison",
    description: "Compare Techstyles vs Houzz Pro. See why UK designers choose an independent platform.",
  },
  alternates: {
    canonical: "https://techstyles.ai/compare/houzz-pro",
  },
}

const comparisonData = [
  {
    category: "Platform Independence",
    features: [
      { name: "Independent platform (not tied to marketplace)", techstyles: true, houzzPro: false },
      { name: "Own your client relationships", techstyles: true, houzzPro: "partial" },
      { name: "No platform commission on leads", techstyles: true, houzzPro: false },
      { name: "Use with any product suppliers", techstyles: true, houzzPro: true },
      { name: "White-label client portal", techstyles: true, houzzPro: "partial" },
    ],
  },
  {
    category: "UK & European Focus",
    features: [
      { name: "Native Xero integration", techstyles: true, houzzPro: false },
      { name: "GBP pricing & UK VAT handling", techstyles: true, houzzPro: "partial" },
      { name: "UK-based support team", techstyles: true, houzzPro: false },
      { name: "GDPR compliant", techstyles: true, houzzPro: true },
      { name: "British spelling & terminology", techstyles: true, houzzPro: false },
    ],
  },
  {
    category: "AI Features",
    features: [
      { name: "AI email drafting", techstyles: true, houzzPro: false },
      { name: "AI product sourcing", techstyles: true, houzzPro: false },
      { name: "AI proposal generation", techstyles: true, houzzPro: false },
      { name: "Smart client thread summaries", techstyles: true, houzzPro: false },
      { name: "Automated data extraction", techstyles: true, houzzPro: false },
    ],
  },
  {
    category: "Project Management",
    features: [
      { name: "Project timelines & phases", techstyles: true, houzzPro: true },
      { name: "Task management", techstyles: true, houzzPro: true },
      { name: "Team collaboration", techstyles: true, houzzPro: true },
      { name: "Document storage", techstyles: true, houzzPro: true },
      { name: "Client communication log", techstyles: true, houzzPro: true },
    ],
  },
  {
    category: "Finance & Payments",
    features: [
      { name: "Invoice generation", techstyles: true, houzzPro: true },
      { name: "Stripe payment integration", techstyles: true, houzzPro: false },
      { name: "Project profitability tracking", techstyles: true, houzzPro: "partial" },
      { name: "Automated payment reminders", techstyles: true, houzzPro: "partial" },
      { name: "Accounting software sync", techstyles: true, houzzPro: "partial" },
    ],
  },
]

const faqs = [
  {
    question: "What's the main difference between Techstyles and Houzz Pro?",
    answer:
      "Techstyles is an independent platform built specifically for running your design business, while Houzz Pro is tied to the Houzz marketplace ecosystem. Techstyles gives you complete ownership of client relationships without platform fees or commissions.",
  },
  {
    question: "Is Houzz Pro better for getting leads?",
    answer:
      "Houzz Pro includes access to the Houzz marketplace for lead generation, but these leads come with platform dependencies and potential commission fees. Techstyles focuses on helping you manage and convert your own leads more effectively with AI-powered proposals and CRM features.",
  },
  {
    question: "Does Techstyles integrate with Xero?",
    answer:
      "Yes, Techstyles has native two-way Xero integration (the most popular UK accounting software), which Houzz Pro lacks. Invoices, payments, and expenses sync automatically.",
  },
  {
    question: "Can I use both platforms together?",
    answer:
      "Some studios use Houzz for visibility while managing their business in Techstyles. However, most find that Techstyles' CRM and lead management features eliminate the need for Houzz Pro's business tools.",
  },
  {
    question: "Which is better for UK-based studios?",
    answer:
      "Techstyles is purpose-built for UK and European studios with GBP pricing, VAT handling, Xero integration, and UK-based support. Houzz Pro is primarily designed for the US market.",
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

export default function TechstylesVsHouzzProPage() {
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
      { "@type": "ListItem", position: 3, name: "Techstyles vs Houzz Pro", item: "https://techstyles.ai/compare/houzz-pro" },
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
              <h1 className={cn(H1, "text-center")}>Techstyles vs Houzz Pro</h1>
              <p className={cn(Lead, "mt-4 text-center")}>
                Compare an independent, UK-focused platform with the Houzz marketplace ecosystem.
                See which is right for your interior design studio.
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
                      <span>Want an independent platform without marketplace ties</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                      <span>Need native UK accounting integration (Xero)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                      <span>Want AI-powered automation to save time</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                      <span>Prefer to own your client relationships completely</span>
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
                  <div className="mb-4 text-xl font-semibold">Choose Houzz Pro if you...</div>
                  <ul className="space-y-3 text-stone-600">
                    <li className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-stone-400" />
                      <span>Want leads from the Houzz marketplace</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-stone-400" />
                      <span>Already have a strong Houzz presence</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-stone-400" />
                      <span>Are primarily US-based</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-stone-400" />
                      <span>Value Houzz's 3D visualisation tools</span>
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
                    <th className="py-4 px-4 text-center font-semibold text-stone-900 w-32">Houzz Pro</th>
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
                              <FeatureStatus status={feature.houzzPro} />
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
                Start your free 3-month trial. No credit card required. Free migration from Houzz Pro.
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
