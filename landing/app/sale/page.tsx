import type { Metadata } from "next"
import Link from "next/link"
import {
  Tag,
  ShieldCheck,
  Globe,
  Code2,
  Linkedin,
  Facebook,
  Palette,
  Mail,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Copy,
} from "lucide-react"
import { CopyEmailButton } from "./copy-email-button"

export const metadata: Metadata = {
  title: "Domain, SaaS Codebase & Brand Assets for Sale | Focuspilot",
  description:
    "Acquire the premium Focuspilot domain, complete Next.js 14 website codebase, official LinkedIn page, and Facebook page. Listed on Sedo for safe escrow transaction. Contact: dev.hero.us@gmail.com",
  alternates: { canonical: "https://focuspilot.io/sale" },
}

const assets = [
  {
    icon: Globe,
    title: "Premium Brand Domain",
    subtitle: "Short, memorable, highly authoritative domain name",
    description:
      "A premium, brandable domain name ideally suited for modern AI SaaS platforms, design studio operating systems, or workflow automation tools.",
    badge: "Domain Included",
  },
  {
    icon: Code2,
    title: "Full SaaS Web Codebase",
    subtitle: "Production-ready Next.js 14 & Tailwind CSS engine",
    description:
      "Clean, scalable TypeScript code architecture featuring a high-converting landing page, component library, SEO optimization, and responsive design.",
    badge: "Next.js 14 + Tailwind",
  },
  {
    icon: Linkedin,
    title: "Official LinkedIn Page",
    subtitle: "Established corporate social presence",
    description:
      "Handover of the official LinkedIn company page to maintain continuous brand credibility, professional networking, and B2B engagement.",
    badge: "Social Handle",
  },
  {
    icon: Facebook,
    title: "Official Facebook Page",
    subtitle: "Verified social brand asset",
    description:
      "Full admin transfer of the official Facebook page for integrated multi-channel marketing, social proof, and audience targeting.",
    badge: "Social Handle",
  },
  {
    icon: Palette,
    title: "Complete Design System",
    subtitle: "Curated UI tokens, graphics & brand assets",
    description:
      "Includes all design system components, custom vector graphics, color palettes, icons, and marketing collateral for seamless extension.",
    badge: "Design Package",
  },
  {
    icon: ShieldCheck,
    title: "Listed & Verified on Sedo",
    subtitle: "100% Safe Escrow Transfer Guarantee",
    description:
      "The entire transaction is listed on Sedo.com (world's premier domain broker), ensuring buyer protection, safe funds transfer, and smooth asset handover.",
    badge: "Sedo Escrow",
  },
]

export default function SalePage() {
  const sellerEmail = "dev.hero.us@gmail.com"

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900 selection:bg-amber-200 selection:text-amber-900 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-stone-200 bg-gradient-to-b from-stone-900 via-stone-900 to-amber-950 text-stone-100 py-16 sm:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="mx-auto max-w-[1100px] px-6 text-center relative z-10">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-4 py-1.5 text-xs sm:text-sm font-semibold text-amber-300 border border-amber-500/30 backdrop-blur-md mb-6">
            <Tag className="h-4 w-4 text-amber-400 animate-pulse" />
            <span>EXCLUSIVELY FOR SALE • LISTED ON SEDO.COM</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.15]">
            Acquire <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-yellow-400">Focuspilot</span> Brand Package & SaaS Assets
          </h1>

          <p className="mt-6 text-base sm:text-xl text-stone-300 max-w-3xl mx-auto leading-relaxed">
            A complete, turnkey digital asset package including the premium domain name, full Next.js 14 codebase, official LinkedIn & Facebook pages, and complete design system.
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href={`mailto:${sellerEmail}?subject=Inquiry%20Regarding%20Focuspilot%20Domain%20%26%20Website%20Sale`}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-6 py-3.5 text-sm sm:text-base transition-all shadow-lg hover:shadow-amber-500/25 hover:scale-[1.02]"
            >
              <Mail className="h-5 w-5" />
              <span>Contact Seller ({sellerEmail})</span>
            </a>

            <a
              href="https://sedo.com/search/?keyword=focuspilot"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-100 font-semibold px-6 py-3.5 text-sm sm:text-base border border-stone-700 hover:border-amber-500/40 transition-all"
            >
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <span>Buy Safely on Sedo</span>
              <ExternalLink className="h-4 w-4 text-stone-400" />
            </a>
          </div>

          {/* Quick Badges */}
          <div className="mt-12 flex flex-wrap justify-center items-center gap-6 text-xs sm:text-sm text-stone-400 border-t border-stone-800/80 pt-8">
            <span className="flex items-center gap-1.5 text-stone-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Domain Name Included
            </span>
            <span className="flex items-center gap-1.5 text-stone-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Web Codebase Handover
            </span>
            <span className="flex items-center gap-1.5 text-stone-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" /> LinkedIn & Facebook Pages
            </span>
            <span className="flex items-center gap-1.5 text-stone-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Sedo Escrow Protection
            </span>
          </div>
        </div>
      </section>

      {/* Main Included Assets Section */}
      <section className="mx-auto max-w-[1200px] px-6 pt-16 sm:pt-20">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-100 px-3 py-1 rounded-full uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-amber-600" /> Complete Acquisition Package
          </div>
          <h2 className="mt-4 text-2xl sm:text-4xl font-bold tracking-tight text-stone-900">
            What is Included in the Sale?
          </h2>
          <p className="mt-3 text-stone-600 text-sm sm:text-base">
            Everything you need to launch, scale, or integrate this brand instantly without starting from scratch.
          </p>
        </div>

        {/* Grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {assets.map((item, idx) => {
            const Icon = item.icon
            return (
              <div
                key={idx}
                className="group relative rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm hover:shadow-md hover:border-amber-400/60 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="rounded-xl bg-amber-500/10 p-3 text-amber-700 group-hover:bg-amber-500 group-hover:text-stone-950 transition-colors">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-stone-100 text-stone-700 text-[11px] font-semibold px-2.5 py-1 border border-stone-200">
                    {item.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-stone-900 group-hover:text-amber-800 transition-colors">
                  {item.title}
                </h3>
                <div className="text-xs font-medium text-amber-700 mt-0.5">{item.subtitle}</div>
                <p className="mt-3 text-sm text-stone-600 leading-relaxed">{item.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Sedo Guarantee Banner */}
      <section className="mx-auto max-w-[1200px] px-6 mt-16 sm:mt-20">
        <div className="relative rounded-3xl bg-gradient-to-r from-stone-900 via-stone-900 to-stone-800 text-stone-100 p-8 sm:p-12 border border-stone-700 overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <ShieldCheck className="h-64 w-64 text-amber-400" />
          </div>

          <div className="relative z-10 grid gap-8 md:grid-cols-12 items-center">
            <div className="md:col-span-8">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800 mb-4">
                <ShieldCheck className="h-4 w-4" /> SEDO ESCROW GUARANTEED
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Secure & Risk-Free Acquisition via Sedo.com
              </h3>
              <p className="mt-3 text-stone-300 text-sm sm:text-base leading-relaxed">
                This digital asset portfolio is officially listed on <strong className="text-amber-300">Sedo.com</strong>, the world&apos;s leading domain transfer and escrow marketplace. 
                Sedo holds the payment safely in escrow and verifies domain ownership transfer before funds are released, protecting both buyer and seller 100%.
              </p>
            </div>

            <div className="md:col-span-4 flex flex-col gap-3 justify-center">
              <a
                href="https://sedo.com/search/?keyword=focuspilot"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold py-3.5 px-6 transition-all shadow-lg hover:shadow-amber-500/20"
              >
                View Listing on Sedo
              </a>
              <CopyEmailButton email={sellerEmail} />
            </div>
          </div>
        </div>
      </section>

      {/* Direct Contact & Offer Section */}
      <section className="mx-auto max-w-[1200px] px-6 mt-16 sm:mt-20">
        <div className="rounded-3xl border border-amber-300/80 bg-gradient-to-b from-amber-50/60 to-white p-8 sm:p-12 shadow-sm text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-amber-500/20 text-amber-800 mb-6">
            <Mail className="h-7 w-7" />
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-stone-900">
            Have Questions or Want to Make an Offer?
          </h2>
          <p className="mt-3 text-stone-600 text-sm sm:text-base max-w-xl mx-auto">
            Contact the owner directly via email to discuss pricing, custom handover terms, or ask any technical/branding questions.
          </p>

          {/* Email Box */}
          <div className="mt-8 inline-flex flex-wrap items-center justify-center gap-3 bg-white p-3 rounded-2xl border border-stone-300 shadow-xs max-w-md mx-auto w-full">
            <div className="flex items-center gap-2 px-3 py-1 text-stone-900 font-mono text-sm sm:text-base font-semibold">
              <Mail className="h-4 w-4 text-amber-600" />
              <span>{sellerEmail}</span>
            </div>
            <CopyEmailButton email={sellerEmail} variant="compact" />
          </div>

          <div className="mt-6 text-xs text-stone-500">
            Pre-filled subject: <span className="font-mono text-stone-700">&quot;Inquiry Regarding Focuspilot Sale&quot;</span>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mx-auto max-w-[900px] px-6 mt-16 sm:mt-20">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-700 bg-stone-200 px-3 py-1 rounded-full">
            <HelpCircle className="h-3.5 w-3.5 text-stone-600" /> FAQs
          </div>
          <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-stone-900">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-stone-200 bg-white p-6">
            <h3 className="font-semibold text-stone-900 text-base">How will the asset transfer take place?</h3>
            <p className="mt-2 text-sm text-stone-600">
              The transaction is conducted safely through Sedo.com. Once the purchase price is agreed upon or paid, Sedo provides escrow service, transfer instructions, and domain authorization codes (EPP). We simultaneously transfer admin ownership of the GitHub codebase repository, LinkedIn page, and Facebook page.
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-6">
            <h3 className="font-semibold text-stone-900 text-base">What social media accounts are included?</h3>
            <p className="mt-2 text-sm text-stone-600">
              The official company pages on LinkedIn and Facebook are included. Admin privileges will be transferred directly to your designated email account upon payment confirmation.
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-6">
            <h3 className="font-semibold text-stone-900 text-base">Can I customize or rebrand the Next.js codebase after purchase?</h3>
            <p className="mt-2 text-sm text-stone-600">
              Yes, 100%. The full repository source code is handed over without restriction. You get complete rights to modify, deploy, rebrand, or integrate the code into your existing tools.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
