import type { Metadata } from "next"
import { CtaButton } from "@/components/cta-button"

export const metadata: Metadata = {
  title: "Focuspilot Pricing | Interior Design Software from £49/user | Free Trial",
  description:
    "Simple, transparent pricing for interior design studios. Free 3-month beta or £49/user/month Professional. All AI features included. No setup fees. Start free today.",
  openGraph: {
    title: "Focuspilot Pricing | Interior Design Software from £49/user | Free Trial",
    description: "Simple, transparent pricing for interior design studios. Free 3-month beta or £49/user/month Professional. All AI features included. No setup fees.",
    type: "website",
    url: "https://focuspilot.io/pricing",
  },
  twitter: {
    card: "summary_large_image",
    title: "Focuspilot Pricing | Interior Design Software from £49/user | Free Trial",
    description: "Simple, transparent pricing for interior design studios. Free 3-month beta or £49/user/month Professional. All AI features included.",
  },
  alternates: {
    canonical: "https://focuspilot.io/pricing",
  },
}

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What happens after the beta period?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Beta users will be offered special pricing and the option to lock in their rate before we officially launch. You'll have plenty of notice before any billing begins.",
      },
    },
    {
      "@type": "Question",
      name: "How does the user pricing work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Your first 5 users are £49 per user per month. Users 6+ are £39 per user per month. You only pay for active users, and you can add or remove users at any time.",
      },
    },
    {
      "@type": "Question",
      name: "Can I try before I buy?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Join our beta for free access, or start a 14-day free trial of the Professional plan. No credit card required for beta access.",
      },
    },
    {
      "@type": "Question",
      name: "What payment methods do you accept?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We accept all major credit and debit cards. Annual billing options are available with a discount. Contact us for invoicing or alternative payment arrangements.",
      },
    },
    {
      "@type": "Question",
      name: "Is there a setup fee or contract?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No setup fees, no hidden costs, and no long-term contracts. Pay monthly and cancel anytime. We believe in earning your business every month.",
      },
    },
    {
      "@type": "Question",
      name: "Do you offer discounts for annual billing?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes! Annual billing saves you 2 months (equivalent to 16% off). Contact our sales team for custom enterprise pricing for studios with 20+ users.",
      },
    },
  ],
}

const pricingSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Focuspilot Professional",
  description: "Interior design studio management software with AI-powered features",
  brand: {
    "@type": "Brand",
    name: "Focuspilot",
  },
  offers: [
    {
      "@type": "Offer",
      name: "Beta Access",
      price: "0",
      priceCurrency: "GBP",
      description: "Full platform access during beta period",
      availability: "https://schema.org/InStock",
    },
    {
      "@type": "Offer",
      name: "Professional Plan",
      price: "49",
      priceCurrency: "GBP",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "49",
        priceCurrency: "GBP",
        unitText: "user per month",
      },
      description: "First 5 users at £49/month, additional users at £39/month",
      availability: "https://schema.org/InStock",
    },
    {
      "@type": "Offer",
      name: "Enterprise Plan",
      description: "Custom pricing for studios with 20+ users — SSO, API access, and dedicated support",
      availability: "https://schema.org/InStock",
    },
  ],
}

export default function PricingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingSchema) }} />

      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-stone-50 to-white py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-1.5 text-sm text-stone-700">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ backgroundColor: "#8FA58F" }}></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: "#8FA58F" }}></span>
                </span>
                Beta program now open
              </div>

              <h1 className="text-[30px] sm:text-5xl md:text-[56px] font-medium tracking-tight leading-[1.1] text-stone-900 mb-6">
                Simple, transparent pricing
              </h1>

              <p className="text-base sm:text-lg leading-relaxed text-stone-600 max-w-2xl mx-auto">
                Join early and get unlimited access for free during beta. Scale with confidence as your studio grows.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-12 sm:py-20 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              {/* Beta Plan */}
              <div className="relative rounded-2xl border-2 border-stone-200 bg-white p-6 sm:p-8 shadow-sm hover:shadow-lg transition-shadow">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl sm:text-2xl font-medium text-stone-900">Beta Access</h2>
                    <span className="rounded-full px-3 py-1 text-xs font-medium" style={{ backgroundColor: "#ECF3EC", color: "#6E7A58" }}>
                      Limited spots
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl sm:text-5xl font-bold text-stone-900">Free</span>
                  </div>
                  <p className="text-sm sm:text-base text-stone-600">Full platform access during beta</p>
                </div>

                <ul className="space-y-3 sm:space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <svg
                      className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: "#8FA58F" }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm sm:text-base text-stone-700">Unlimited users during beta period</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg
                      className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: "#8FA58F" }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm sm:text-base text-stone-700">All AI features included</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg
                      className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: "#8FA58F" }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm sm:text-base text-stone-700">Project management & CRM</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg
                      className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: "#8FA58F" }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm sm:text-base text-stone-700">Client portal & approvals</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg
                      className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: "#8FA58F" }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm sm:text-base text-stone-700">AI procurement & library</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg
                      className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: "#8FA58F" }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm sm:text-base text-stone-700">Priority support & feedback</span>
                  </li>
                </ul>

                <a
                  href="/signup"
                  className="block w-full rounded-lg bg-stone-900 px-4 py-3 text-center text-sm sm:text-base font-medium text-white hover:bg-stone-800 transition-colors"
                >
                  Join beta waitlist
                </a>
              </div>

              {/* Professional Plan */}
              <div className="relative rounded-2xl border-2 border-stone-900 bg-stone-900 p-6 sm:p-8 shadow-xl">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-stone-900 shadow-sm">
                    Most popular
                  </span>
                </div>

                <div className="mb-6">
                  <h2 className="text-xl sm:text-2xl font-medium text-white mb-4">Professional</h2>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl sm:text-5xl font-bold text-white">£49</span>
                    <span className="text-stone-300 text-base sm:text-lg">/user/month</span>
                  </div>
                  <p className="text-sm sm:text-base text-stone-300">First 5 users • £39/user for additional users</p>
                </div>

                <ul className="space-y-3 sm:space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <svg
                      className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: "#B9C7B7" }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm sm:text-base text-white">Everything in Beta, forever</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg
                      className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: "#B9C7B7" }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm sm:text-base text-white">Unlimited projects & clients</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg
                      className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: "#B9C7B7" }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm sm:text-base text-white">Advanced AI automation</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg
                      className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: "#B9C7B7" }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm sm:text-base text-white">Custom branding & white-label</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg
                      className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: "#B9C7B7" }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm sm:text-base text-white">Priority support & onboarding</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg
                      className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: "#B9C7B7" }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm sm:text-base text-white">99.9% uptime SLA</span>
                  </li>
                </ul>

                <a
                  href="/signup"
                  className="block w-full rounded-lg bg-white px-4 py-3 text-center text-sm sm:text-base font-medium text-stone-900 hover:bg-stone-100 transition-colors"
                >
                  Start free trial
                </a>
              </div>

              {/* Enterprise Plan */}
              <div className="relative rounded-2xl border-2 border-stone-200 bg-white p-6 sm:p-8 shadow-sm hover:shadow-lg transition-shadow md:col-span-2 lg:col-span-1">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl sm:text-2xl font-medium text-stone-900">Enterprise</h2>
                    <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-medium text-stone-600">
                      20+ users
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl sm:text-5xl font-bold text-stone-900">Custom</span>
                  </div>
                  <p className="text-sm sm:text-base text-stone-600">Tailored pricing for large studios & networks</p>
                </div>

                <ul className="space-y-3 sm:space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <svg
                      className="h-5 w-5 flex-shrink-0 mt-0.5"
                      style={{ color: "#8FA58F" }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm sm:text-base text-stone-700">Everything in Professional</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg
                      className="h-5 w-5 flex-shrink-0 mt-0.5"
                      style={{ color: "#8FA58F" }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm sm:text-base text-stone-700">Unlimited users & projects</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg
                      className="h-5 w-5 flex-shrink-0 mt-0.5"
                      style={{ color: "#8FA58F" }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm sm:text-base text-stone-700">SSO & advanced security</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg
                      className="h-5 w-5 flex-shrink-0 mt-0.5"
                      style={{ color: "#8FA58F" }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm sm:text-base text-stone-700">API access & custom integrations</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg
                      className="h-5 w-5 flex-shrink-0 mt-0.5"
                      style={{ color: "#8FA58F" }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm sm:text-base text-stone-700">Dedicated account manager</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg
                      className="h-5 w-5 flex-shrink-0 mt-0.5"
                      style={{ color: "#8FA58F" }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm sm:text-base text-stone-700">Annual billing & invoicing options</span>
                  </li>
                </ul>

                <a
                  href="mailto:sales@focuspilot.io?subject=Enterprise%20plan"
                  className="block w-full rounded-lg border-2 border-stone-900 bg-white px-4 py-3 text-center text-sm sm:text-base font-medium text-stone-900 hover:bg-stone-50 transition-colors"
                >
                  Contact sales
                </a>
              </div>
            </div>

            {/* Pricing Note */}
            <div className="mt-12 text-center">
              <p className="text-sm text-stone-600 max-w-2xl mx-auto">
                All plans include a 14-day free trial. No credit card required. Beta users get locked-in rates when we
                launch.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 sm:py-24 bg-stone-50">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight text-stone-900 mb-4">Frequently asked questions</h2>
              <p className="text-base sm:text-lg leading-relaxed text-stone-600">
                Everything you need to know about pricing and plans
              </p>
            </div>

            <div className="space-y-6">
              <div className="rounded-xl border border-stone-200 bg-white p-6">
                <h3 className="text-lg font-medium text-stone-900 mb-2">What happens after the beta period?</h3>
                <p className="text-base text-stone-600">
                  Beta users will be offered special pricing and the option to lock in their rate before we officially
                  launch. You'll have plenty of notice before any billing begins.
                </p>
              </div>

              <div className="rounded-xl border border-stone-200 bg-white p-6">
                <h3 className="text-lg font-medium text-stone-900 mb-2">How does the user pricing work?</h3>
                <p className="text-base text-stone-600">
                  Your first 5 users are £49 per user per month. Users 6+ are £39 per user per month. You only pay for
                  active users, and you can add or remove users at any time.
                </p>
              </div>

              <div className="rounded-xl border border-stone-200 bg-white p-6">
                <h3 className="text-lg font-medium text-stone-900 mb-2">Can I try before I buy?</h3>
                <p className="text-base text-stone-600">
                  Join our beta for free access, or start a 14-day free trial of the Professional plan. No credit card
                  required for beta access.
                </p>
              </div>

              <div className="rounded-xl border border-stone-200 bg-white p-6">
                <h3 className="text-lg font-medium text-stone-900 mb-2">What payment methods do you accept?</h3>
                <p className="text-base text-stone-600">
                  We accept all major credit and debit cards. Annual billing options are available with a discount.
                  Contact us for invoicing or alternative payment arrangements.
                </p>
              </div>

              <div className="rounded-xl border border-stone-200 bg-white p-6">
                <h3 className="text-lg font-medium text-stone-900 mb-2">Is there a setup fee or contract?</h3>
                <p className="text-base text-stone-600">
                  No setup fees, no hidden costs, and no long-term contracts. Pay monthly and cancel anytime. We believe
                  in earning your business every month.
                </p>
              </div>

              <div className="rounded-xl border border-stone-200 bg-white p-6">
                <h3 className="text-lg font-medium text-stone-900 mb-2">
                  Do you offer discounts for annual billing?
                </h3>
                <p className="text-base text-stone-600">
                  Yes! Annual billing saves you 2 months (equivalent to 16% off). Contact our sales team for custom
                  enterprise pricing for studios with 20+ users.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-[#3F4B51]">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-[28px] md:text-[32px] font-medium tracking-tight text-white">Ready to transform your studio?</h2>
            <p className="mt-3 text-base sm:text-lg text-stone-300">
              Join design studios already using Focuspilot to save time, reduce admin, and deliver better client
              experiences.
            </p>
            <div className="mt-8 flex justify-center">
              <CtaButton href="/signup" variant="white" label="Start for free" showArrow arrowVariant="black" />
            </div>
            <p className="mt-3 text-xs sm:text-sm text-stone-400">No credit card required</p>
          </div>
        </section>
      </main>
    </>
  )
}
