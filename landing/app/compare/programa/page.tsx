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
  title: "Techstyles vs Programa | Interior Design Software Comparison 2026",
  description:
    "Compare Techstyles vs Programa for interior design studios. See differences in AI features, UK pricing, Xero integration & client portals. Switch with free migration.",
  keywords: [
    "Techstyles vs Programa",
    "Programa alternative",
    "interior design software comparison",
    "design studio management software",
    "procurement software for designers",
  ],
  openGraph: {
    title: "Techstyles vs Programa | Interior Design Software Comparison 2026",
    description:
      "Compare Techstyles vs Programa for interior design studios. See differences in AI features, UK pricing, Xero integration & client portals. Switch with free migration.",
    type: "article",
    url: "https://focuspilot.io/compare/programa",
  },
  twitter: {
    card: "summary_large_image",
    title: "Techstyles vs Programa | Interior Design Software Comparison 2026",
    description: "Compare Techstyles vs Programa for interior design studios. See differences in AI features, UK pricing, Xero integration & client portals.",
  },
  alternates: {
    canonical: "https://focuspilot.io/compare/programa",
  },
}

const comparisonData = [
  {
    category: "Procurement",
    features: [
      { name: "Product library with pricing", techstyles: true, programa: true },
      { name: "AI-powered product sourcing", techstyles: true, programa: false },
      { name: "Purchase order generation", techstyles: true, programa: true },
      { name: "Supplier management", techstyles: true, programa: true },
      { name: "Trade pricing integration", techstyles: true, programa: "partial" },
      { name: "Bulk order management", techstyles: true, programa: false },
    ],
  },
  {
    category: "Client Approvals",
    features: [
      { name: "Client approval portal", techstyles: true, programa: true },
      { name: "Comments & revisions", techstyles: true, programa: true },
      { name: "In-portal payments", techstyles: true, programa: false },
      { name: "Real-time status updates", techstyles: true, programa: "partial" },
      { name: "Mobile-optimised portal", techstyles: true, programa: "partial" },
    ],
  },
  {
    category: "Finance & Invoicing",
    features: [
      { name: "Invoice generation", techstyles: true, programa: true },
      { name: "Xero/QuickBooks sync", techstyles: true, programa: true },
      { name: "Stripe payments", techstyles: true, programa: false },
      { name: "Project profitability tracking", techstyles: true, programa: "partial" },
      { name: "Automated payment reminders", techstyles: true, programa: false },
      { name: "Multi-currency support", techstyles: true, programa: true },
    ],
  },
  {
    category: "Project Management",
    features: [
      { name: "Project timelines & phases", techstyles: true, programa: true },
      { name: "Task management", techstyles: true, programa: true },
      { name: "Team collaboration", techstyles: true, programa: true },
      { name: "AI email drafting", techstyles: true, programa: false },
      { name: "Document storage", techstyles: true, programa: true },
      { name: "Client communication log", techstyles: true, programa: "partial" },
    ],
  },
  {
    category: "CRM",
    features: [
      { name: "Lead capture forms", techstyles: true, programa: "partial" },
      { name: "Pipeline management", techstyles: true, programa: true },
      { name: "Contact database", techstyles: true, programa: true },
      { name: "AI-powered proposals", techstyles: true, programa: false },
      { name: "Automated follow-ups", techstyles: true, programa: false },
    ],
  },
]

const faqs = [
  {
    question: "What's the main difference between Techstyles and Programa?",
    answer:
      "Techstyles is built specifically for UK and European interior design studios with native Xero integration, Stripe payments, and AI-powered features like email drafting and product sourcing. Programa is US-focused with QuickBooks integration. Techstyles also includes in-portal client payments and automated invoicing that Programa lacks.",
  },
  {
    question: "Is Techstyles better for small studios or larger teams?",
    answer:
      "Techstyles scales from solo designers to 50+ person studios. Our pricing model (£49/user for first 5, then £39/user) is designed for growing teams. Programa's per-project pricing can become expensive for studios managing many concurrent projects.",
  },
  {
    question: "Can I migrate from Programa to Techstyles?",
    answer:
      "Yes. We offer free migration assistance including: product library import, client contact transfer, and project history migration. Most studios are fully operational on Techstyles within one week.",
  },
  {
    question: "Does Techstyles work with UK accounting software?",
    answer:
      "Absolutely. Techstyles has native two-way sync with Xero (the most popular UK accounting software) and QuickBooks. Invoices, payments, and expenses sync automatically.",
  },
  {
    question: "Which has better procurement features?",
    answer:
      "Techstyles includes AI-powered product sourcing that finds alternatives and trade pricing automatically. We also support bulk order management and supplier relationship tracking that Programa doesn't offer.",
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

export default function TechstylesVsProgramaPage() {
  // FAQ Schema
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

  // Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://techstyles.app" },
      { "@type": "ListItem", position: 2, name: "Compare", item: "https://techstyles.app/compare" },
      {
        "@type": "ListItem",
        position: 3,
        name: "Techstyles vs Programa",
        item: "https://techstyles.app/compare/programa",
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {/* Removed SiteHeader and SiteFooter components */}
      <main className="min-h-screen bg-white">
        {/* Hero */}
        <section className="bg-gradient-to-b from-stone-50 to-white py-16 sm:py-24">
          <div className={container}>
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="outline" className="mb-4 border-stone-300 text-stone-600">
                Software Comparison
              </Badge>
              <h1 className={cn(H1, "text-center")}>Techstyles vs Programa</h1>
              <p className={cn(Lead, "mt-4 text-center")}>
                A detailed comparison for interior design studios choosing between Techstyles and Programa. See how
                procurement, approvals, invoicing, and project workflows compare.
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
                      <span>Are based in the UK or Europe and use Xero</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                      <span>Want AI-powered email drafting and product sourcing</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                      <span>Need clients to pay directly through the approval portal</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                      <span>Run a residential or boutique commercial practice</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                      <span>Want per-user pricing that scales with your team</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-stone-200">
                <CardContent className="p-6 sm:p-8">
                  <div className="mb-4 text-xl font-semibold">Programa might suit you if you...</div>
                  <ul className="space-y-3 text-stone-600">
                    <li className="flex items-start gap-3">
                      <Minus className="mt-0.5 h-5 w-5 flex-shrink-0 text-stone-400" />
                      <span>Are US-based and heavily use QuickBooks</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Minus className="mt-0.5 h-5 w-5 flex-shrink-0 text-stone-400" />
                      <span>Prefer per-project pricing over per-user</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Minus className="mt-0.5 h-5 w-5 flex-shrink-0 text-stone-400" />
                      <span>Don't need AI features or in-portal payments</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Minus className="mt-0.5 h-5 w-5 flex-shrink-0 text-stone-400" />
                      <span>Already have established Programa workflows</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="bg-stone-50 py-16 sm:py-20">
          <div className={container}>
            <h2 className={cn(H2, "text-center mb-12")}>Feature-by-feature comparison</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] border-collapse">
                <thead>
                  <tr className="border-b border-stone-200">
                    <th className="py-4 text-left font-semibold">Feature</th>
                    <th className="py-4 text-center font-semibold">Techstyles</th>
                    <th className="py-4 text-center font-semibold">Programa</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((section) => (
                    <>
                      <tr key={section.category} className="bg-stone-100">
                        <td colSpan={3} className="py-3 px-4 font-semibold text-stone-900">
                          {section.category}
                        </td>
                      </tr>
                      {section.features.map((feature) => (
                        <tr key={feature.name} className="border-b border-stone-100">
                          <td className="py-3 px-4 text-stone-700">{feature.name}</td>
                          <td className="py-3 text-center">
                            <div className="flex justify-center">
                              <FeatureStatus status={feature.techstyles} />
                            </div>
                          </td>
                          <td className="py-3 text-center">
                            <div className="flex justify-center">
                              <FeatureStatus status={feature.programa} />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-center text-sm text-stone-500">
              <Check className="inline h-4 w-4 text-green-600" /> Full support &nbsp;
              <Minus className="inline h-4 w-4 text-amber-500" /> Partial/limited &nbsp;
              <X className="inline h-4 w-4 text-stone-300" /> Not available
            </p>
          </div>
        </section>

        {/* Migration Section */}
        <section className="py-16 sm:py-20">
          <div className={container}>
            <div className="mx-auto max-w-3xl">
              <h2 className={cn(H2, "text-center mb-6")}>Switching from Programa?</h2>
              <p className={cn(Lead, "text-center mb-10")}>
                We make migration painless. Here's what happens in your first week with Techstyles.
              </p>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-stone-900 text-sm font-semibold text-white">
                    1
                  </div>
                  <div>
                    <div className="font-semibold">Product library import</div>
                    <p className="text-stone-600">
                      We import your entire product library including images, pricing, and supplier details. Trade
                      discounts are preserved.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-stone-900 text-sm font-semibold text-white">
                    2
                  </div>
                  <div>
                    <div className="font-semibold">Client & contact migration</div>
                    <p className="text-stone-600">
                      All client records, contact details, and communication history transfer seamlessly. No re-entry
                      required.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-stone-900 text-sm font-semibold text-white">
                    3
                  </div>
                  <div>
                    <div className="font-semibold">Active project setup</div>
                    <p className="text-stone-600">
                      Current projects are recreated with timelines, budgets, and approval status intact. Clients get
                      new portal access.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-stone-900 text-sm font-semibold text-white">
                    4
                  </div>
                  <div>
                    <div className="font-semibold">Accounting sync</div>
                    <p className="text-stone-600">
                      Connect Xero or QuickBooks in minutes. Historical data syncs automatically so reporting is
                      immediate.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-stone-50 py-16 sm:py-20">
          <div className={container}>
            <div className="mx-auto max-w-3xl">
              <h2 className={cn(H2, "text-center mb-10")}>Frequently asked questions</h2>
              <Accordion type="single" collapsible className="space-y-3">
                {faqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`faq-${index}`}
                    className="rounded-lg border border-stone-200 bg-white px-6"
                  >
                    <AccordionTrigger className="text-left font-medium hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-stone-600">{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* Internal Links */}
        <section className="py-16 sm:py-20">
          <div className={container}>
            <h2 className={cn(H2, "text-center mb-10")}>Explore Techstyles features</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Link
                href="/platform/procurement"
                className="group rounded-lg border border-stone-200 p-6 transition-colors hover:border-stone-300 hover:bg-stone-50"
              >
                <div className="font-semibold">Procurement</div>
                <p className="mt-1 text-sm text-stone-600">AI-powered product sourcing and supplier management</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-stone-900 group-hover:gap-2 transition-all">
                  Learn more <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
              <Link
                href="/platform/client-portal"
                className="group rounded-lg border border-stone-200 p-6 transition-colors hover:border-stone-300 hover:bg-stone-50"
              >
                <div className="font-semibold">Client Portal</div>
                <p className="mt-1 text-sm text-stone-600">Approvals, payments, and real-time project updates</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-stone-900 group-hover:gap-2 transition-all">
                  Learn more <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
              <Link
                href="/platform/finance"
                className="group rounded-lg border border-stone-200 p-6 transition-colors hover:border-stone-300 hover:bg-stone-50"
              >
                <div className="font-semibold">Finance & Invoicing</div>
                <p className="mt-1 text-sm text-stone-600">Budgets, invoices, and accounting integrations</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-stone-900 group-hover:gap-2 transition-all">
                  Learn more <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-[#EFEAE2] py-24">
          <div className={container}>
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-2xl sm:text-[28px] md:text-[32px] font-medium tracking-tight text-stone-900">Ready to switch?</h2>
              <p className="mt-3 text-base sm:text-lg text-stone-700">
                Start your free trial and see why studios are choosing Techstyles over Programa.
              </p>
              <div className="mt-8 flex justify-center">
                <CtaButton href="/signup" variant="slate" label="Start for free" showArrow arrowVariant="white" />
              </div>
              <p className="mt-3 text-xs sm:text-sm text-stone-600">No credit card required</p>
            </div>
          </div>
        </section>
      </main>
      {/* Removed SiteFooter component */}
    </>
  )
}
