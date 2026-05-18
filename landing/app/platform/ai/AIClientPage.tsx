"use client"

import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  CheckCircle2,
  Mail,
  Sparkles,
  FileText,
  Wand2,
  Bot,
  Inbox,
  Library,
  ClipboardList,
  ShoppingCart,
  CreditCard,
  ShieldCheck,
  MessageSquareText,
  Link2,
} from "lucide-react"
import { cn } from "@/lib/utils"

const container = "mx-auto max-w-[1200px] px-6 sm:px-8"

function Section({ id, className, children }: { id?: string; className?: string; children: React.ReactNode }) {
  return (
    <section id={id} className={cn("py-16 sm:py-24", className)}>
      <div className={container}>{children}</div>
    </section>
  )
}

function Hero() {
  return (
    <div
      className={cn(
        "relative border-b",
        // Warm gradient just for this page (avoid blue/indigo)
        "bg-gradient-to-b from-amber-50 via-rose-50 to-stone-50",
      )}
    >
      <div className={cn(container, "py-16 sm:py-24")}>
        <div className="grid items-center gap-10 md:grid-cols-12">
          <div className="md:col-span-7">
            <Badge variant="secondary" className="mb-4 inline-flex items-center gap-2 bg-amber-100 text-amber-900">
              <Sparkles className="h-4 w-4" /> AI built for interior design studios
            </Badge>
            <h1 className="text-4xl font-medium tracking-tight sm:text-5xl">
              Work faster with AI that understands interior design
            </h1>
            <p className="mt-4 text-lg text-stone-700">
              From inbox to install—Focuspilot AI triages messages, drafts replies, extracts product specs, generates
              approvals, and accelerates proposals and invoices. Calm, accurate, and studio‑ready.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Badge className="bg-stone-900 text-white">AI Inbox</Badge>
              <Badge variant="outline">Product/spec extraction</Badge>
              <Badge variant="outline">Approvals & summaries</Badge>
              <Badge variant="outline">Proposals & invoices</Badge>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="bg-stone-900 hover:bg-stone-800">
                <Link href="#demos">Try live demos</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/platform/projects">Explore Projects</Link>
              </Button>
            </div>
          </div>
          <div className="md:col-span-5">
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/placeholder.svg?height=480&width=720"
                alt="Illustration of Focuspilot AI features across inbox, approvals, products, and billing"
                className="h-auto w-full rounded-2xl border border-amber-200/60 shadow-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InPageNav() {
  const items = [
    { href: "#inbox", label: "AI Inbox" },
    { href: "#extraction", label: "Product Extraction" },
    { href: "#approvals", label: "Approvals & Summaries" },
    { href: "#billing", label: "Proposals & Invoices" },
    { href: "#integrations", label: "Integrations" },
    { href: "#security", label: "Security" },
    { href: "#faq", label: "FAQ" },
  ]
  return (
    <div className="sticky top-16 z-30 border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className={cn(container, "flex flex-wrap items-center gap-3 py-3")}>
        {items.map((it) => (
          <a
            key={it.href}
            href={it.href}
            className="text-sm text-stone-700 hover:text-stone-900 underline-offset-4 hover:underline"
          >
            {it.label}
          </a>
        ))}
      </div>
    </div>
  )
}

/* Demos */
function AIInboxDemo() {
  const [suggestions, setSuggestions] = useState<string[] | null>(null)
  const [loading, setLoading] = useState(false)
  function onSuggest() {
    setLoading(true)
    setTimeout(() => {
      setSuggestions([
        "Thanks for reaching out — we'll coordinate install for Friday between 9–11am. Attaching the updated schedule.",
        "Appreciate the update. We can move delivery to Monday and adjust the contractor timeline accordingly.",
        "Noted on the lead time. Let's proceed with the in‑stock finish so we hit the install date.",
      ])
      setLoading(false)
    }, 800)
  }
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Inbox className="h-5 w-5" /> AI Inbox
        </CardTitle>
        <CardDescription>Auto-triage messages by project and draft designer-quality replies.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border bg-white">
          <div className="border-b p-3 text-xs text-stone-500">Subject: Delivery update – dining chairs</div>
          <div className="p-4 text-sm text-stone-800">
            Hi team, the supplier can ship 4x chairs now and 2x next week. Earliest combined delivery is Friday. Let me
            know if you want to split shipments.
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={onSuggest} disabled={loading} className="bg-stone-900 hover:bg-stone-800">
            <Bot className="mr-2 h-4 w-4" />
            {loading ? "Thinking..." : "Suggest reply"}
          </Button>
          <Button variant="outline" asChild>
            <Link href="/platform/features/ai-email">
              <Mail className="mr-2 h-4 w-4" />
              See AI Email
            </Link>
          </Button>
        </div>
        {suggestions && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-stone-600">Suggestions</div>
            <ul className="space-y-2">
              {suggestions.map((s, i) => (
                <li key={i} className="rounded-lg border bg-stone-50 p-3 text-sm text-stone-800">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function AIExtractDemo() {
  const [input, setInput] = useState(
    "https://example-supplier.com/products/orbital-brass-chandelier?finish=antique-brass",
  )
  const [result, setResult] = useState<null | Record<string, string>>(null)
  const [loading, setLoading] = useState(false)
  function onExtract() {
    setLoading(true)
    setTimeout(() => {
      setResult({
        name: "Orbital Brass Chandelier",
        vendor: "Example Supplier",
        sku: "OB-12-AB",
        finish: "Antique Brass",
        dimensions: "W 980 x H 520 mm",
        leadTime: "4–6 weeks",
        listPrice: "$1,890",
      })
      setLoading(false)
    }, 900)
  }
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Library className="h-5 w-5" />
          Product & spec extraction
        </CardTitle>
        <CardDescription>Turn links, PDFs, or images into structured product data you can procure.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste product URL or notes"
            aria-label="Product URL or text"
          />
          <Button onClick={onExtract} disabled={loading} className="bg-stone-900 hover:bg-stone-800">
            <Wand2 className="mr-2 h-4 w-4" />
            {loading ? "Extracting..." : "Extract"}
          </Button>
        </div>
        {result && (
          <div className="grid gap-3 sm:grid-cols-2">
            <dl className="rounded-lg border bg-stone-50 p-3 text-sm">
              <dt className="text-xs text-stone-500">Name</dt>
              <dd className="font-medium text-stone-900">{result.name}</dd>
            </dl>
            <dl className="rounded-lg border bg-stone-50 p-3 text-sm">
              <dt className="text-xs text-stone-500">Vendor</dt>
              <dd className="font-medium text-stone-900">{result.vendor}</dd>
            </dl>
            <dl className="rounded-lg border bg-stone-50 p-3 text-sm">
              <dt className="text-xs text-stone-500">SKU</dt>
              <dd className="font-medium text-stone-900">{result.sku}</dd>
            </dl>
            <dl className="rounded-lg border bg-stone-50 p-3 text-sm">
              <dt className="text-xs text-stone-500">Finish</dt>
              <dd className="font-medium text-stone-900">{result.finish}</dd>
            </dl>
            <dl className="rounded-lg border bg-stone-50 p-3 text-sm">
              <dt className="text-xs text-stone-500">Dimensions</dt>
              <dd className="font-medium text-stone-900">{result.dimensions}</dd>
            </dl>
            <dl className="rounded-lg border bg-stone-50 p-3 text-sm">
              <dt className="text-xs text-stone-500">Lead time</dt>
              <dd className="font-medium text-stone-900">{result.leadTime}</dd>
            </dl>
            <dl className="rounded-lg border bg-stone-50 p-3 text-sm">
              <dt className="text-xs text-stone-500">List price</dt>
              <dd className="font-medium text-stone-900">{result.listPrice}</dd>
            </dl>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function AISummaryDemo() {
  const [summary, setSummary] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  function onSummarize() {
    setLoading(true)
    setTimeout(() => {
      setSummary(
        "Client approved the dining chair finish change; vendor can split shipments; install still targeting Friday; awaiting final PO confirmation for chandelier.",
      )
      setLoading(false)
    }, 700)
  }
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <MessageSquareText className="h-5 w-5" />
          Approvals & thread summaries
        </CardTitle>
        <CardDescription>Instant clarity across long email chains, tasks, and approvals.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-lg border bg-white">
          <div className="border-b p-3 text-xs text-stone-500">Thread: Dining space selections</div>
          <div className="space-y-2 p-3 text-sm text-stone-800">
            <div>{"• Client: Can we switch to the antique brass finish to match the pendants?"}</div>
            <div>{"• Vendor: In‑stock in antique brass; lead time 4–6 weeks otherwise."}</div>
            <div>{"• Team: If we split deliveries, we keep the install date."}</div>
          </div>
        </div>
        <Button onClick={onSummarize} disabled={loading} className="bg-stone-900 hover:bg-stone-800">
          <Sparkles className="mr-2 h-4 w-4" />
          {loading ? "Summarizing..." : "Summarize thread"}
        </Button>
        {summary && (
          <div className="rounded-lg border bg-stone-50 p-3 text-sm text-stone-900">
            <strong className="mr-1">Summary:</strong>
            {summary}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function Bento() {
  const items = [
    {
      icon: Mail,
      title: "AI Inbox",
      body: "Route messages to the right project, extract action items, and draft designer‑quality replies that match your tone.",
      href: "/platform/features/ai-email",
      chip: "Communication",
    },
    {
      icon: Library,
      title: "Product/spec extraction",
      body: "Turn supplier links, images and PDFs into structured products—name, SKU, finishes, dimensions, pricing, and lead times.",
      href: "/platform/procurement",
      chip: "Procurement",
    },
    {
      icon: ClipboardList,
      title: "Smart tasks",
      body: "Generate tasks with owners and dates from emails or notes. Keep timelines current automatically.",
      href: "/platform/projects",
      chip: "Projects",
    },
    {
      icon: ShoppingCart,
      title: "PO building",
      body: "Create accurate purchase orders from extracted product data—no copy‑paste, fewer errors.",
      href: "/platform/procurement",
      chip: "Procurement",
    },
    {
      icon: CreditCard,
      title: "Proposals & invoices",
      body: "Draft branded proposals and invoices in minutes with consistent line items and taxes.",
      href: "/platform/finance",
      chip: "Finance",
    },
    {
      icon: FileText,
      title: "Summaries & approvals",
      body: "Summarize long threads and generate approval summaries your clients can act on quickly.",
      href: "/platform/client-portal",
      chip: "Client portal",
    },
  ]
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((it) => {
        const Icon = it.icon
        return (
          <Card key={it.title} className="group h-full transition hover:-translate-y-0.5 hover:shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-stone-900/90 text-white">
                    <Icon className="h-4 w-4" />
                  </span>
                  <CardTitle className="text-base">{it.title}</CardTitle>
                </div>
                <Badge variant="outline">{it.chip}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-stone-700">{it.body}</p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="ghost" className="px-0 text-stone-900">
                <Link href={it.href}>
                  Learn more
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 20 20"
                    className="ml-1 h-4 w-4 transition group-hover:translate-x-0.5"
                    fill="currentColor"
                  >
                    <path d="M10.293 3.293a1 1 0 011.414 0l5 5a.999.999 0 01.083 1.32l-.083.094-5 5a1 1 0 01-1.497-1.32l.083-.094L13.584 11H4a1 1 0 01-.117-1.993L4 9h9.584l-3.291-3.293a1 1 0 010-1.414z" />
                  </svg>
                </Link>
              </Button>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}

function HowItHelps() {
  const bullets = [
    "Less admin, more design — automate the repetitive work between email, products and billing.",
    "Studio‑grade accuracy — extract the details that matter: finishes, dimensions, lead times, pricing.",
    "Client clarity — approvals and summaries your clients actually read and act on.",
    "From brief to install — one calm system across projects, procurement and finance.",
  ]
  return (
    <div className="grid items-start gap-10 md:grid-cols-12">
      <div className="md:col-span-6">
        <h2 className="text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight">What Focuspilot AI does for designers</h2>
        <p className="mt-3 text-stone-700">
          AI that speaks your language. It works behind the scenes so you can keep momentum—with fewer spreadsheets and
          fewer late‑night follow‑ups.
        </p>
        <ul className="mt-6 space-y-3">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-stone-900" />
              <span className="text-stone-800">{b}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <Button asChild className="bg-stone-900 hover:bg-stone-800">
            <Link href="#demos">See AI in action</Link>
          </Button>
        </div>
      </div>
      <div className="md:col-span-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              From link to purchase order—automatically
            </CardTitle>
            <CardDescription>
              Paste a supplier link. AI extracts specs and builds a PO draft you can send in seconds.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Image
              src="/placeholder.svg?height=360&width=640"
              alt="Focuspilot AI extracting a supplier product link and generating a PO draft"
              width={640}
              height={360}
              className="h-auto w-full rounded-lg border"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Integrations() {
  const items = [
    {
      icon: Mail,
      title: "Email",
      body: "Connect your studio inbox to triage messages by project and draft replies faster.",
    },
    {
      icon: Link2,
      title: "Web Clipper",
      body: "Capture products from the web in one click—AI fills specs and pricing.",
    },
    {
      icon: FileText,
      title: "PDFs & tear sheets",
      body: "Extract structured data from supplier PDFs—no retyping.",
    },
  ]
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((it) => {
        const Icon = it.icon
        return (
          <Card key={it.title}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Icon className="h-4 w-4" />
                {it.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-stone-700">{it.body}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function Security() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5" />
          Security & privacy
        </CardTitle>
        <CardDescription>Designed for client trust and professional workflows.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="grid gap-3 sm:grid-cols-2">
          <li className="rounded-lg border bg-stone-50 p-3 text-sm">Role‑based access and client‑safe approvals.</li>
          <li className="rounded-lg border bg-stone-50 p-3 text-sm">
            Clear audit trails for approvals, POs, proposals and invoices.
          </li>
          <li className="rounded-lg border bg-stone-50 p-3 text-sm">Granular project scoping for shared items.</li>
          <li className="rounded-lg border bg-stone-50 p-3 text-sm">Exportable data for finance and compliance.</li>
        </ul>
      </CardContent>
    </Card>
  )
}

function FAQs() {
  const items = [
    {
      q: "Can I control the tone of AI‑generated replies?",
      a: "Yes. Set a studio tone and fine‑tune per project. You can always edit before sending.",
    },
    {
      q: "Does AI extraction work with images and PDFs?",
      a: "Yes. Paste a link, upload a PDF, or drop an image—AI parses name, SKU, finishes, dimensions and more.",
    },
    {
      q: "Can clients see AI summaries in the portal?",
      a: "Yes. Summaries appear alongside selections and invoices in the client portal.",
    },
    {
      q: "How does this help billing?",
      a: "AI creates proposal and invoice drafts from selected products and project context—ready to send.",
    },
  ]
  return (
    <div className="space-y-4">
      {items.map((it) => (
        <Card key={it.q}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{it.q}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-stone-700">{it.a}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Can I control the tone of AI‑generated replies?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Set a studio tone and fine‑tune per project. You can always edit before sending.",
      },
    },
    {
      "@type": "Question",
      name: "Does AI extraction work with images and PDFs?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Paste a link, upload a PDF, or drop an image—AI parses name, SKU, finishes, dimensions and more.",
      },
    },
    {
      "@type": "Question",
      name: "Can clients see AI summaries in the portal?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Summaries appear alongside selections and invoices in the client portal.",
      },
    },
    {
      "@type": "Question",
      name: "How does this help billing?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "AI creates proposal and invoice drafts from selected products and project context—ready to send.",
      },
    },
  ],
}

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Platform",
      item: "/platform",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "AI",
      item: "/platform/ai",
    },
  ],
}

export default function AIClientPage() {
  return (
    <>
      <Hero />
      <InPageNav />

      <Section id="overview">
        <div className="mb-10">
          <h2 className="text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight">The calm AI layer across your studio</h2>
          <p className="mt-3 max-w-3xl text-stone-700">
            The right kind of automation: on‑brand replies, accurate product data, lighter approvals, and faster
            billing. Built for interior designers, not generic office software.
          </p>
        </div>
        <Bento />
      </Section>

      <Section id="demos">
        <h2 className="text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight">AI in action</h2>
        <p className="mt-3 max-w-3xl text-stone-700">
          Three quick demos showing how Focuspilot AI saves time in your daily flow.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AIInboxDemo />
          <AIExtractDemo />
          <AISummaryDemo />
        </div>
      </Section>

      <Section id="inbox" className="pt-0">
        <HowItHelps />
      </Section>

      <Section id="extraction" className="pt-0">
        <div className="grid items-center gap-10 md:grid-cols-12">
          <div className="md:col-span-6">
            <Image
              src="/placeholder.svg?height=360&width=640"
              alt="Extracting product specs from a PDF into structured data"
              width={640}
              height={360}
              className="h-auto w-full rounded-lg border"
            />
          </div>
          <div className="md:col-span-6">
            <h2 className="text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight">Specs without the copy‑paste</h2>
            <p className="mt-3 text-stone-700">
              Turn supplier PDFs and tear sheets into clean, consistent product data. Less admin, fewer mistakes, better
              handoffs to procurement and finance.
            </p>
            <div className="mt-6 flex gap-3">
              <Button asChild className="bg-stone-900 hover:bg-stone-800">
                <Link href="/platform/procurement">See Procurement</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/platform/finance">Explore Finance</Link>
              </Button>
            </div>
          </div>
        </div>
      </Section>

      <Section id="approvals" className="pt-0">
        <div className="grid items-center gap-10 md:grid-cols-12">
          <div className="md:col-span-6">
            <h2 className="text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight">Clear approvals, faster decisions</h2>
            <p className="mt-3 text-stone-700">
              Generate decision‑ready summaries clients can approve in one click. AI keeps context tied to the right
              project and room.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Summarize selections with price, lead time and finish notes.",
                "Track rationale and comments alongside decisions.",
                "Push approved items straight to POs and invoices.",
              ].map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-stone-900" />
                  <span className="text-stone-800">{b}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <Button asChild variant="outline">
                <Link href="/platform/client-portal">Open Client Portal</Link>
              </Button>
            </div>
          </div>
          <div className="md:col-span-6">
            <Image
              src="/placeholder.svg?height=360&width=640"
              alt="AI approval summaries with approve/decline actions"
              width={640}
              height={360}
              className="h-auto w-full rounded-lg border"
            />
          </div>
        </div>
      </Section>

      <Section id="billing" className="pt-0">
        <div className="grid items-center gap-10 md:grid-cols-12">
          <div className="md:col-span-6">
            <Image
              src="/placeholder.svg?height=360&width=640"
              alt="Proposal and invoice drafts with AI‑generated line items"
              width={640}
              height={360}
              className="h-auto w-full rounded-lg border"
            />
          </div>
          <div className="md:col-span-6">
            <h2 className="text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight">Proposals and invoices in minutes</h2>
            <p className="mt-3 text-stone-700">
              Drafts built from your approved selections—consistent line items, taxes and totals. Edit once, send with
              confidence.
            </p>
            <div className="mt-6">
              <Button asChild className="bg-stone-900 hover:bg-stone-800">
                <Link href="/platform/finance">See Finance</Link>
              </Button>
            </div>
          </div>
        </div>
      </Section>

      <Section id="integrations" className="pt-0">
        <h2 className="text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight">Integrations</h2>
        <p className="mt-3 max-w-3xl text-stone-700">
          Focuspilot connects the dots—email, web clipper, PDFs and the tools your studio already uses.
        </p>
        <div className="mt-6">
          <Integrations />
        </div>
      </Section>

      <Section id="security" className="pt-0">
        <Security />
      </Section>

      <Section id="faq" className="pt-0">
        <h2 className="text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight">Frequently asked questions</h2>
        <div className="mt-6">
          <FAQs />
        </div>
      </Section>

      <Section className="pt-0">
        <Card>
          <CardContent className="flex flex-col items-start justify-between gap-6 p-6 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-xl font-semibold tracking-tight">See how it all connects</h3>
              <p className="mt-1 text-stone-700">
                Book a walkthrough—Projects, Procurement, Finance and the Client Portal with AI.
              </p>
            </div>
            <div className="flex gap-3">
              <Button className="bg-stone-900 hover:bg-stone-800">Book a demo</Button>
              <Button variant="outline" asChild>
                <Link href="/platform">Explore Platform</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </Section>

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
    </>
  )
}
