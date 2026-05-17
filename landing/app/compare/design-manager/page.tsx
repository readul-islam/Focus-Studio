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
  title: "Focuspilot vs Design Manager | Modern Interior Design Software 2026",
  description:
    "Compare Focuspilot vs Design Manager. Modern cloud software vs legacy desktop. AI features, real-time collaboration, mobile access. Migrate free from Design Manager.",
  keywords: [
    "Focuspilot vs Design Manager",
    "Design Manager alternative",
    "interior design software comparison",
    "modern design studio software",
    "UK interior design software",
  ],
  openGraph: {
    title: "Focuspilot vs Design Manager | Modern Interior Design Software 2026",
    description:
      "Compare Focuspilot vs Design Manager. Modern cloud software vs legacy desktop. AI features, real-time collaboration, mobile access. Migrate free from Design Manager.",
    type: "article",
    url: "https://focuspilot.io/compare/design-manager",
  },
  twitter: {
    card: "summary_large_image",
    title: "Focuspilot vs Design Manager | Modern Interior Design Software 2026",
    description: "Compare Focuspilot vs Design Manager. Modern cloud software vs legacy desktop. AI features, real-time collaboration, mobile access.",
  },
  alternates: {
    canonical: "https://focuspilot.io/compare/design-manager",
  },
}

const comparisonData = [
  {
    category: "User Experience",
    features: [
      { name: "Modern cloud-based interface", focuspilot: true, designManager: "partial" },
      { name: "Mobile-responsive design", focuspilot: true, designManager: false },
      { name: "Real-time collaboration", focuspilot: true, designManager: "partial" },
      { name: "No installation required", focuspilot: true, designManager: false },
      { name: "Regular feature updates", focuspilot: true, designManager: "partial" },
    ],
  },
  {
    category: "AI & Automation",
    features: [
      { name: "AI email drafting", focuspilot: true, designManager: false },
      { name: "AI product sourcing", focuspilot: true, designManager: false },
      { name: "Automated payment reminders", focuspilot: true, designManager: "partial" },
      { name: "Smart proposal generation", focuspilot: true, designManager: false },
      { name: "Workflow automation", focuspilot: true, designManager: "partial" },
    ],
  },
  {
    category: "Client Experience",
    features: [
      { name: "Branded client portal", focuspilot: true, designManager: true },
      { name: "In-portal payments", focuspilot: true, designManager: false },
      { name: "Mobile client access", focuspilot: true, designManager: false },
      { name: "Real-time approval notifications", focuspilot: true, designManager: "partial" },
      { name: "Client comment threads", focuspilot: true, designManager: true },
    ],
  },
  {
    category: "Financial Management",
    features: [
          { name: "Project budgeting", focuspilot: true, designManager: true },
      { name: "Invoice generation", focuspilot: true, designManager: true },
      { name: "Xero integration", focuspilot: true, designManager: "partial" },
        { name: "Stripe payments", focuspilot: true, designManager: false },
      { name: "Profitability reporting", focuspilot: true, designManager: true },
      { name: "Purchase order management", focuspilot: true, designManager: true },
    ],
  },
  {
    category: "Procurement",
    features: [
      { name: "Product library", focuspilot: true, designManager: true },
      { name: "Supplier database", focuspilot: true, designManager: true },
      { name: "Trade pricing management", focuspilot: true, designManager: true },
      { name: "AI alternative finder", focuspilot: true, designManager: false },
      { name: "Order tracking", focuspilot: true, designManager: true },
    ],
  },
]

const faqs = [
  {
    question: "How is Focuspilot different from Design Manager?",
    answer:
      "Focuspilot is a modern, cloud-native platform built for today's design studios. Unlike Design Manager's legacy desktop software, Focuspilot offers AI-powered features, real-time collaboration, mobile access, and integrated client payments. It's designed for studios who want modern tools without the complexity of traditional software.",
  },
  {
    question: "Is Design Manager better for larger studios?",
    answer:
      "Design Manager has historically served larger studios, but Focuspilot scales effectively from solo designers to 50+ person teams. Our AI features actually help smaller teams punch above their weight by automating admin tasks that would otherwise require additional staff.",
  },
  {
    question: "Can I access Focuspilot on mobile?",
    answer:
      "Yes. Focuspilot is fully responsive and works on any device with a browser. Your clients also get mobile-optimised portal access for approvals and payments. Design Manager requires desktop installation for full functionality.",
  },
  {
    question: "Which has better accounting integration?",
    answer:
      "Focuspilot has native two-way sync with Xero and QuickBooks, with automatic invoice and payment reconciliation. Design Manager supports accounting exports but requires more manual work to keep systems in sync.",
  },
  {
    question: "Is Focuspilot suitable for commercial projects?",
    answer:
      "Absolutely. While Focuspilot excels at residential projects, our procurement, approval, and financial tools handle commercial projects of any size. Multi-location projects, multiple stakeholder approvals, and complex budgeting are all supported.",
  },
  {
    question: "What about training and support?",
    answer:
        "Focuspilot is designed to be intuitive—most users are productive within hours, not weeks. We offer free onboarding calls, in-app guidance, and responsive support. Design Manager typically requires formal training sessions.",
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

export default function TechstylesVsDesignManagerPage() {
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
      { "@type": "ListItem", position: 1, name: "Home", item: "https://focuspilot.io" },
      { "@type": "ListItem", position: 2, name: "Compare", item: "https://focuspilot.io/compare" },
      {
        "@type": "ListItem",
        position: 3,
        name: "Focuspilot vs Design Manager",
        item: "https://focuspilot.io/compare/design-manager",
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {/* Hero */}
      <section className="bg-gradient-to-b from-stone-50 to-white py-16 sm:py-24">
        <div className={container}>
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="outline" className="mb-4 border-stone-300 text-stone-600">
              Software Comparison
            </Badge>
            <h1 className={cn(H1, "text-center")}>Focuspilot vs Design Manager</h1>
            <p className={cn(Lead, "mt-4 text-center")}>
              Comparing modern cloud software with legacy desktop systems. See why studios are switching to Focuspilot
              for AI-powered workflows, mobile access, and integrated client payments.
            </p>
          </div>
        </div>
      </section>

      {/* Best For Section */}
      <section className="py-16 sm:py-20">
        <div className={container}>
          <h2 className={cn(H2, "text-center mb-12")}>Which is right for your studio?</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-2 border-stone-900">
              <CardContent className="p-6 sm:p-8">
                <div className="mb-4 text-xl font-semibold">Choose Focuspilot if you want...</div>
                <ul className="space-y-3 text-stone-600">
                  <li className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                    <span>Modern, cloud-based software that works anywhere</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                    <span>AI features that save hours on emails and sourcing</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                    <span>Clients to approve and pay through one portal</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                    <span>Simple, predictable per-user pricing</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                    <span>Quick setup without IT involvement</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-stone-200">
              <CardContent className="p-6 sm:p-8">
                <div className="mb-4 text-xl font-semibold">Design Manager may suit you if...</div>
                <ul className="space-y-3 text-stone-600">
                  <li className="flex items-start gap-3">
                    <Minus className="mt-0.5 h-5 w-5 flex-shrink-0 text-stone-400" />
                    <span>You prefer desktop software with local installation</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Minus className="mt-0.5 h-5 w-5 flex-shrink-0 text-stone-400" />
                    <span>You have existing Design Manager workflows and data</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Minus className="mt-0.5 h-5 w-5 flex-shrink-0 text-stone-400" />
                    <span>Your team doesn't need mobile or remote access</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Minus className="mt-0.5 h-5 w-5 flex-shrink-0 text-stone-400" />
                    <span>AI and automation features aren't priorities</span>
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
                  <th className="py-4 text-center font-semibold">Focuspilot</th>
                  <th className="py-4 text-center font-semibold">Design Manager</th>
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
                              <FeatureStatus status={feature.focuspilot} />
                          </div>
                        </td>
                        <td className="py-3 text-center">
                          <div className="flex justify-center">
                              <FeatureStatus status={feature.focuspilot} />
                            <FeatureStatus status={feature.designManager} />
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
            <h2 className={cn(H2, "text-center mb-6")}>Migrating from Design Manager?</h2>
            <p className={cn(Lead, "text-center mb-10")}>
              Our team helps you transition smoothly. Most studios are fully operational within 5-7 days.
            </p>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-stone-900 text-sm font-semibold text-white">
                  1
                </div>
                <div>
                  <div className="font-semibold">Data export assistance</div>
                  <p className="text-stone-600">
                    We guide you through exporting your Design Manager data and handle the technical conversion.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-stone-900 text-sm font-semibold text-white">
                  2
                </div>
                <div>
                  <div className="font-semibold">Product & supplier import</div>
                  <p className="text-stone-600">
                    Your entire product library transfers with images, specs, and pricing. Supplier relationships
                    preserved.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-stone-900 text-sm font-semibold text-white">
                  3
                </div>
                <div>
                  <div className="font-semibold">Client portal setup</div>
                  <p className="text-stone-600">
                    Active clients receive branded portal invitations. Previous approval history is available for
                    reference.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-stone-900 text-sm font-semibold text-white">
                  4
                </div>
                <div>
                  <div className="font-semibold">Team onboarding</div>
                  <p className="text-stone-600">
                    Each team member gets a personalised orientation. Our intuitive design means most are productive
                    same-day.
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
          <h2 className={cn(H2, "text-center mb-10")}>Discover what Techstyles can do</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/platform/projects"
              className="group rounded-lg border border-stone-200 p-6 transition-colors hover:border-stone-300 hover:bg-stone-50"
            >
              <div className="font-semibold">Project Management</div>
              <p className="mt-1 text-sm text-stone-600">Timelines, tasks, and team collaboration</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-stone-900 group-hover:gap-2 transition-all">
                Learn more <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
            <Link
              href="/platform/ai"
              className="group rounded-lg border border-stone-200 p-6 transition-colors hover:border-stone-300 hover:bg-stone-50"
            >
              <div className="font-semibold">AI Features</div>
              <p className="mt-1 text-sm text-stone-600">Email drafting, product sourcing, and more</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-stone-900 group-hover:gap-2 transition-all">
                Learn more <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
            <Link
              href="/platform/crm"
              className="group rounded-lg border border-stone-200 p-6 transition-colors hover:border-stone-300 hover:bg-stone-50"
            >
              <div className="font-semibold">CRM</div>
              <p className="mt-1 text-sm text-stone-600">Lead capture, pipeline, and client relationships</p>
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
            <h2 className="text-2xl sm:text-[28px] md:text-[32px] font-medium tracking-tight text-stone-900">Experience modern design software</h2>
            <p className="mt-3 text-base sm:text-lg text-stone-700">See why studios are moving from legacy systems to Focuspilot.</p>
            <div className="mt-8 flex justify-center">
              <CtaButton href="/signup" variant="slate" label="Start for free" showArrow arrowVariant="white" />
            </div>
            <p className="mt-3 text-xs sm:text-sm text-stone-600">No credit card required</p>
          </div>
        </div>
      </section>
    </>
  )
}
