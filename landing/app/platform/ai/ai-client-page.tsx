"use client"

import * as React from "react"
import Link from "next/link"
import {
  Sparkles,
  Mail,
  PackageSearch,
  CheckCircle2,
  FileText,
  Receipt,
  MessageSquare,
  Shield,
  Wand2,
  Timer,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

function SectionHeading({
  id,
  eyebrow,
  title,
  desc,
}: {
  id: string
  eyebrow?: string
  title: string
  desc?: string
}) {
  return (
    <div id={id} className="scroll-mt-24">
      {eyebrow ? (
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700 ring-1 ring-stone-200">
          <Sparkles className="h-3.5 w-3.5 text-stone-700" />
          <span>{eyebrow}</span>
        </div>
      ) : null}
      <h2 className="text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight text-stone-950">{title}</h2>
      {desc ? <p className="mt-2 max-w-2xl text-stone-600">{desc}</p> : null}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 text-center">
      <div className="text-2xl font-semibold text-stone-900">{value}</div>
      <div className="mt-1 text-xs text-stone-600">{label}</div>
    </div>
  )
}

const AIClientPage = () => {
  const [demoLoading, setDemoLoading] = React.useState<string | null>(null)
  const [aiReply, setAiReply] = React.useState("")
  const [aiSpec, setAiSpec] = React.useState("")
  const [aiSummary, setAiSummary] = React.useState("")

  function simulate(task: "reply" | "spec" | "summary") {
    setDemoLoading(task)
    setTimeout(() => {
      if (task === "reply") {
        setAiReply(
          "Hi Claire — Thanks for the note! We can source the boucle in a warmer ivory and hit the 8–10 week lead time. I’ll send a moodboard and two alternates for your review today. Best, Lena",
        )
      } else if (task === "spec") {
        setAiSpec(
          [
            "Product: Mid‑century Accent Chair",
            "Vendor: Atelier West",
            "Finish: Walnut",
            "Upholstery: Bouclé, Ivory",
            "Dimensions: 29”W × 32”D × 31”H",
            "List: $1,150 | Trade: $920",
            "Lead time: 8–10 weeks",
            "Notes: COM available, 8 yards",
          ].join("\n"),
        )
      } else {
        setAiSummary(
          "Thread summary: Client prefers warmer neutrals and softer silhouettes; budget flexible if timeline improves. Action items: 1) Send two ivory boucle alternates, 2) Propose expedited vendor, 3) Confirm install window for week of Oct 14.",
        )
      }
      setDemoLoading(null)
    }, 900)
  }

  return (
    <main className="bg-white">
      {/* Distinct warm gradient hero */}
      <section className="relative isolate" aria-label="AI for interior design studios">
        <div
          className="absolute inset-0 -z-10"
          aria-hidden="true"
          style={{
            background: "linear-gradient(180deg, #FFF4EA 0%, #FFEFEA 24%, #FFF8F5 60%, #FFFFFF 100%)",
          }}
        />
        <div
          className="absolute inset-0 -z-10 opacity-60 mix-blend-multiply"
          aria-hidden="true"
          style={{
            backgroundImage:
              "radial-gradient(60rem 30rem at 20% 0%, rgba(224,122,87,0.22) 0%, rgba(224,122,87,0) 60%), radial-gradient(50rem 26rem at 80% 0%, rgba(245,158,11,0.18) 0%, rgba(245,158,11,0) 60%)",
          }}
        />
        <div className="container mx-auto max-w-[1200px] px-6 sm:px-8">
          <div className="flex flex-col items-start gap-6 py-16 sm:py-20 md:py-24">
            <Badge className="bg-stone-900 text-white hover:bg-stone-900/90">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              Focuspilot AI
            </Badge>
            <h1 className="max-w-3xl text-4xl font-medium tracking-tight text-stone-950 sm:text-5xl">
              AI that understands interior design workflows
            </h1>
            <p className="max-w-2xl text-lg text-stone-700">
              Draft replies, extract product specs, auto‑build POs, summarize threads, and speed up proposals and
              invoices—without breaking your studio’s calm.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="bg-stone-900 text-white hover:bg-stone-800">
                <Link href="/contact">
                  Book a demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-stone-300 bg-transparent">
                <Link href="#demos">See it in action</Link>
              </Button>
              <div className="flex items-center gap-6 pl-1">
                <Stat label="Faster replies" value="3–5x" />
                <Stat label="Spec extraction" value="~90%+" />
                <Stat label="Draft time saved" value="hrs/week" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* On-page anchor nav */}
      <div className="sticky top-[60px] z-30 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto max-w-[1200px] px-6 sm:px-8">
          <div className="flex flex-wrap gap-2 py-3 text-sm">
            {[
              { href: "#capabilities", label: "Capabilities" },
              { href: "#demos", label: "Demos" },
              { href: "#approvals", label: "Approvals" },
              { href: "#finance", label: "Finance" },
              { href: "#security", label: "Security" },
              { href: "#faq", label: "FAQ" },
            ].map((it) => (
              <a
                key={it.href}
                href={it.href}
                className="rounded-lg px-3 py-1.5 text-stone-700 ring-1 ring-stone-200 hover:bg-stone-100"
              >
                {it.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Capabilities bento */}
      <section className="container mx-auto max-w-[1200px] px-6 py-12 sm:px-8 sm:py-16">
        <SectionHeading
          id="capabilities"
          eyebrow="Capabilities"
          title="Where AI shows up in Focuspilot"
          desc="Focused automation across communication, procurement, approvals, and finance—built for studio reality."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="border-stone-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-stone-700" />
                AI Inbox & Reply
              </CardTitle>
              <CardDescription>Auto‑triage, tone‑perfect drafts, and project routing.</CardDescription>
            </CardHeader>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/placeholder.svg?height=160&width=640"
              alt="AI inbox drafting demo"
              className="h-40 w-full rounded-b-xl object-cover"
            />
          </Card>

          <Card className="border-stone-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PackageSearch className="h-5 w-5 text-stone-700" />
                Spec Extraction
              </CardTitle>
              <CardDescription>Pull product details from emails, PDFs, and the web.</CardDescription>
            </CardHeader>
            <img
              src="/placeholder.svg?height=160&width=640"
              alt="AI extracting product specs from documents"
              className="h-40 w-full rounded-b-xl object-cover"
            />
          </Card>

          <Card className="border-stone-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-stone-700" />
                Approvals Assistant
              </CardTitle>
              <CardDescription>Consolidate comments, suggest rationale, log decisions.</CardDescription>
            </CardHeader>
            <img
              src="/placeholder.svg?height=160&width=640"
              alt="Approvals assistant consolidating feedback"
              className="h-40 w-full rounded-b-xl object-cover"
            />
          </Card>

          <Card className="border-stone-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-stone-700" />
                Proposal Drafting
              </CardTitle>
              <CardDescription>Assemble scopes and line items from notes and boards.</CardDescription>
            </CardHeader>
            <img
              src="/placeholder.svg?height=160&width=640"
              alt="AI proposal drafting from notes and moodboards"
              className="h-40 w-full rounded-b-xl object-cover"
            />
          </Card>

          <Card className="border-stone-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-stone-700" />
                Invoice Assist
              </CardTitle>
              <CardDescription>Group items, taxes, and retainers with one click.</CardDescription>
            </CardHeader>
            <img
              src="/placeholder.svg?height=160&width=640"
              alt="AI helps group invoice line items and taxes"
              className="h-40 w-full rounded-b-xl object-cover"
            />
          </Card>

          <Card className="border-stone-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-stone-700" />
                Summaries & Tasks
              </CardTitle>
              <CardDescription>Summarize threads and turn decisions into tasks.</CardDescription>
            </CardHeader>
            <img
              src="/placeholder.svg?height=160&width=640"
              alt="AI turns thread summaries into tasks"
              className="h-40 w-full rounded-b-xl object-cover"
            />
          </Card>
        </div>
      </section>

      {/* Interactive demos */}
      <section id="demos" className="container mx-auto max-w-[1200px] px-6 py-12 sm:px-8 sm:py-16">
        <SectionHeading
          id="demos-heading"
          eyebrow="Live previews"
          title="Try the flows designers use daily"
          desc="Quick, interactive previews of AI reply, spec extraction, and conversation summary."
        />
        <Tabs defaultValue="reply" className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="reply">AI Reply</TabsTrigger>
            <TabsTrigger value="spec">Spec Extraction</TabsTrigger>
            <TabsTrigger value="summary">Thread Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="reply" className="mt-4">
            <Card className="border-stone-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-stone-700" />
                  Draft a client reply
                </CardTitle>
                <CardDescription>Paste an inquiry and get a tone‑perfect draft.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <textarea
                  className="w-full rounded-lg border border-stone-300 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-stone-300"
                  rows={5}
                  defaultValue={`Hi — Can we get an ivory boucle accent chair with walnut legs under $1,200 and delivered before November? Concerned about lead times. – Claire`}
                  aria-label="Client message"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => simulate("reply")}
                    disabled={demoLoading !== null}
                    className="bg-stone-900 text-white hover:bg-stone-800"
                  >
                    {demoLoading === "reply" ? "Generating…" : "Generate reply"}
                  </Button>
                  <Button variant="outline" onClick={() => setAiReply("")}>
                    Reset
                  </Button>
                </div>
                {aiReply ? (
                  <div className="rounded-lg border border-stone-200 bg-stone-50 p-3 text-sm text-stone-800">
                    {aiReply}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="spec" className="mt-4">
            <Card className="border-stone-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PackageSearch className="h-5 w-5 text-stone-700" />
                  Extract product specs
                </CardTitle>
                <CardDescription>Drop in an email or PDF text—get structured specs instantly.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <textarea
                  className="w-full rounded-lg border border-stone-300 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-stone-300"
                  rows={5}
                  defaultValue={`Atelier West — Mid-century Accent Chair in walnut. Ivory boucle upholstery. 29" W x 32" D x 31" H. List $1,150, Trade $920. Lead time 8–10 weeks. COM 8 yards.`}
                  aria-label="Source content"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => simulate("spec")}
                    disabled={demoLoading !== null}
                    className="bg-stone-900 text-white hover:bg-stone-800"
                  >
                    {demoLoading === "spec" ? "Extracting…" : "Extract specs"}
                  </Button>
                  <Button variant="outline" onClick={() => setAiSpec("")}>
                    Reset
                  </Button>
                </div>
                {aiSpec ? (
                  <pre className="whitespace-pre-wrap rounded-lg border border-stone-200 bg-stone-50 p-3 text-xs text-stone-800">
                    {aiSpec}
                  </pre>
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summary" className="mt-4">
            <Card className="border-stone-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-stone-700" />
                  Summarize a thread
                </CardTitle>
                <CardDescription>Turn a busy client thread into decisions and next steps.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <textarea
                  className="w-full rounded-lg border border-stone-300 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-stone-300"
                  rows={5}
                  defaultValue={`Client: prefer warmer neutral, worried about November install. Designer: two alternates ready, can expedite with vendor B. Client: ok with budget if timeline improves.`}
                  aria-label="Conversation transcript"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => simulate("summary")}
                    disabled={demoLoading !== null}
                    className="bg-stone-900 text-white hover:bg-stone-800"
                  >
                    {demoLoading === "summary" ? "Summarizing…" : "Summarize"}
                  </Button>
                  <Button variant="outline" onClick={() => setAiSummary("")}>
                    Reset
                  </Button>
                </div>
                {aiSummary ? (
                  <div className="rounded-lg border border-stone-200 bg-stone-50 p-3 text-sm text-stone-800">
                    {aiSummary}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      {/* Approvals assistant focus */}
      <section className="container mx-auto max-w-[1200px] px-6 py-12 sm:px-8 sm:py-16">
        <SectionHeading
          id="approvals"
          eyebrow="Client portal"
          title="Approvals with less back‑and‑forth"
          desc="Combine client comments into clear rationale, suggest next best actions, and keep a clean history for every decision."
        />
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Card className="border-stone-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-stone-700" />
                Consolidated comments
              </CardTitle>
              <CardDescription>One concise summary across email, portal, and files.</CardDescription>
            </CardHeader>
            <CardContent>
              <img
                src="/placeholder.svg?height=220&width=800"
                alt="Consolidated comments with suggested rationale"
                className="h-56 w-full rounded-lg border border-stone-200 object-cover"
              />
            </CardContent>
          </Card>

          <Card className="border-stone-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-stone-700" />
                Suggested next steps
              </CardTitle>
              <CardDescription>Turn decisions into tasks, alternates, or PO drafts.</CardDescription>
            </CardHeader>
            <CardContent>
              <img
                src="/placeholder.svg?height=220&width=800"
                alt="AI suggests actionable next steps"
                className="h-56 w-full rounded-lg border border-stone-200 object-cover"
              />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Finance acceleration */}
      <section className="container mx-auto max-w-[1200px] px-6 py-12 sm:px-8 sm:py-16">
        <SectionHeading
          id="finance"
          eyebrow="Finance"
          title="From board to bill—faster"
          desc="Draft proposals from notes and boards, then assemble invoices with correct groupings, taxes, and retainers."
        />
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <Card className="border-stone-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-stone-700" />
                Proposal drafting
              </CardTitle>
              <CardDescription>Line items from meeting notes and moodboards.</CardDescription>
            </CardHeader>
            <CardContent>
              <img
                src="/placeholder.svg?height=160&width=640"
                alt="AI proposal drafting"
                className="h-40 w-full rounded-lg border border-stone-200 object-cover"
              />
            </CardContent>
          </Card>

          <Card className="border-stone-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-stone-700" />
                Invoice assist
              </CardTitle>
              <CardDescription>Group items and taxes in one click.</CardDescription>
            </CardHeader>
            <CardContent>
              <img
                src="/placeholder.svg?height=160&width=640"
                alt="AI invoice assistance"
                className="h-40 w-full rounded-lg border border-stone-200 object-cover"
              />
            </CardContent>
          </Card>

          <Card className="border-stone-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-stone-700" />
                Time saved
              </CardTitle>
              <CardDescription>Hours back each week for design work.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between rounded-lg border border-stone-200 bg-stone-50 p-4">
                <div className="text-stone-700">
                  <div className="text-2xl font-semibold">6–10 hrs</div>
                  <div className="text-xs">Typical weekly time saved</div>
                </div>
                <Badge variant="secondary" className="bg-stone-100 text-stone-800">
                  Studio average
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Security */}
      <section className="container mx-auto max-w-[1200px] px-6 py-12 sm:px-8 sm:py-16">
        <SectionHeading
          id="security"
          eyebrow="Trust"
          title="Private by default"
          desc="Your data stays yours. Opt‑out of training, project scoping controls, and clear audit history."
        />
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <Card className="border-stone-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-stone-700" />
                Data controls
              </CardTitle>
              <CardDescription>Per‑workspace policies and admin control.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-inside list-disc text-sm text-stone-700">
                <li>Project‑scoped access</li>
                <li>Opt‑out of model training</li>
                <li>Redaction for payments and PII</li>
              </ul>
            </CardContent>
          </Card>
          <Card className="border-stone-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-stone-700" />
                Sensible defaults
              </CardTitle>
              <CardDescription>Helpful, reversible, and logged.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-inside list-disc text-sm text-stone-700">
                <li>Always shows the source</li>
                <li>One‑click undo</li>
                <li>Full decision history</li>
              </ul>
            </CardContent>
          </Card>
          <Card className="border-stone-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-stone-700" />
                Works with your taste
              </CardTitle>
              <CardDescription>Style prompts tuned for studio tone.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-inside list-disc text-sm text-stone-700">
                <li>Tone presets per client</li>
                <li>Brand style and vocabulary</li>
                <li>Reusable templates</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto max-w-[1200px] px-6 pb-16 sm:px-8 sm:pb-24">
        <SectionHeading id="faq" eyebrow="Answers" title="AI FAQs for designers" />
        <Accordion type="single" collapsible className="mt-6">
          <AccordionItem value="1">
            <AccordionTrigger>Can I edit everything the AI drafts?</AccordionTrigger>
            <AccordionContent>
              Yes. You can review, tweak, and undo any AI suggestion before sending or saving. We keep a clear change
              history per item.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="2">
            <AccordionTrigger>What sources does spec extraction support?</AccordionTrigger>
            <AccordionContent>
              Email bodies, pasted PDFs, and web product pages. You can also clip items from the browser and send them
              straight into a project’s library.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="3">
            <AccordionTrigger>Does it learn my studio’s voice?</AccordionTrigger>
            <AccordionContent>
              You can save tone and style presets per client, plus brand vocabulary. Replies and summaries follow your
              chosen presets by default.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="4">
            <AccordionTrigger>How do we connect to billing and vendors?</AccordionTrigger>
            <AccordionContent>
              Proposals and invoices export cleanly. Vendor updates can be summarized and logged to the right project
              automatically.
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Bottom CTA */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-stone-50 p-6">
          <div>
            <h3 className="text-lg font-semibold text-stone-900">See Focuspilot AI in your studio’s flow</h3>
            <p className="text-sm text-stone-600">Share a typical week—we’ll tailor a 20‑minute walkthrough.</p>
          </div>
          <div className="flex gap-3">
            <Button asChild className="bg-stone-900 text-white hover:bg-stone-800">
              <Link href="/contact">Book a demo</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/platform/features/ai-email">Explore Communication</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* JSON‑LD for Breadcrumb + FAQ */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Platform", item: "https://example.com/platform" },
              { "@type": "ListItem", position: 2, name: "AI", item: "https://example.com/platform/ai" },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Can I edit everything the AI drafts?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes. You can review, tweak, and undo any AI suggestion before sending or saving. We keep a clear change history per item.",
                },
              },
              {
                "@type": "Question",
                name: "What sources does spec extraction support?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Email bodies, pasted PDFs, and web product pages. You can also clip items from the browser and send them straight into a project’s library.",
                },
              },
              {
                "@type": "Question",
                name: "Does it learn my studio’s voice?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "You can save tone and style presets per client, plus brand vocabulary. Replies and summaries follow your chosen presets by default.",
                },
              },
              {
                "@type": "Question",
                name: "How do we connect to billing and vendors?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Proposals and invoices export cleanly. Vendor updates can be summarized and logged to the right project automatically.",
                },
              },
            ],
          }),
        }}
      />
    </main>
  )
}

export default AIClientPage
