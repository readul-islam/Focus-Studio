"use client"

import type React from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { CtaButton } from "@/components/cta-button"
import { cn } from "@/lib/utils"
import {
  CheckCircle2,
  FileText,
  CreditCard,
  Users,
  Zap,
  DollarSign,
  Send,
  Eye,
  Calendar,
  Building2,
} from "lucide-react"
import { PortugueseTilesBg } from "@/components/graphics/portuguese-tiles-bg"

const container = "mx-auto max-w-[1200px] px-6 sm:px-8"
const H1 = "text-[30px] sm:text-5xl md:text-[56px] font-medium tracking-tight leading-[1.1]"
const H2 = "text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight"
const Lead = "text-base sm:text-lg text-stone-600"

// Brand colors from the palette
const CLAY = "#E07A57"
const SLATE = "#4B5960"
const OLIVE = "#6E7A58"
const OCHRE = "#C78A3B"

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-stone-800">
      <CheckCircle2 className="mt-0.5 h-5 w-5 text-stone-700" />
      <span className="text-base">{children}</span>
    </li>
  )
}

function WorkflowStep({
  number,
  title,
  description,
  icon: Icon,
  accent,
}: {
  number: string
  title: string
  description: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  accent: string
}) {
  return (
    <div className="text-center">
      <div
        className="relative z-10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white ring-1 ring-stone-200"
        style={{ backgroundColor: `${accent}14`, color: accent }}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="mb-2 text-sm font-medium text-stone-600">{number}</div>
      <h3 className="mb-2 text-lg font-semibold text-stone-950">{title}</h3>
      <p className="text-sm text-stone-600">{description}</p>
    </div>
  )
}

function BenefitCard({
  title,
  description,
  icon: Icon,
  accent,
}: {
  title: string
  description: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  accent: string
}) {
  return (
    <Card className="border-stone-200 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="p-6">
        <div
          className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-stone-200"
          style={{ backgroundColor: `${accent}14`, color: accent }}
        >
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-stone-950">{title}</h3>
        <p className="text-sm text-stone-600">{description}</p>
      </CardContent>
    </Card>
  )
}

function ProposalInvoiceImageBlock() {
  return (
    <section className="relative overflow-hidden rounded-3xl">
      <div className="absolute inset-0">
        <Image
          src="/images/proposals-kitchen-hero.png"
          alt="Modern luxury kitchen with marble surfaces and warm wood cabinetry"
          fill
          className="object-cover"
          sizes="100vw"
          priority={false}
        />
        <div className="absolute inset-0 bg-stone-900/50" />
      </div>

      <div className="relative px-6 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight text-white">
            Your proposals, professional.
            <br />
            Your invoices, automated.
            <br />
            Your payments, faster.
          </h2>

          <div className="mt-8 flex justify-end">
            <CtaButton
              href="#waitlist"
              variant="white"
                            label="Delight your clients"
              showArrow
              arrowVariant="brand"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default function InvoicingPage() {
  return (
    <main className="bg-white">
      {/* HERO */}
      <section className="relative isolate overflow-hidden pb-10 pt-8 sm:pb-16 sm:pt-12 md:pt-16">
        <PortugueseTilesBg className="opacity-40" height="min(520px, 58vh)" fadeStop={0.6} />

        <div className={cn(container)}>
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="outline" className="rounded-full border-stone-300 bg-stone-50 text-stone-700">
              Proposals & Invoicing
            </Badge>
            <h1 className={cn("mt-4 text-center", H1)}>From proposal to payment in minutes, not days</h1>
            <p className={cn("mt-4 text-center", Lead)}>
              Create stunning proposals, generate professional invoices, and get paid faster with automated workflows
              that connect seamlessly to your projects and client portal.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <CtaButton
                href="/signup"
                variant="slate"
                                label="See it in action"
                showArrow
                arrowVariant="white"
              />
              <CtaButton href="#features" variant="white" label="Explore features" />
            </div>
          </div>

          {/* Hero visual */}
          <div className="mx-auto mt-8 max-w-4xl">
            <Card className="overflow-hidden border-stone-200 shadow-xl">
              <CardContent className="p-2 sm:p-3">
                <Image
                  src="/images/platform/crm/ai-proposal-wizard.png"
                  alt="AI-powered proposal creation interface showing project details, scope definition, and pricing automation"
                  width={1200}
                  height={675}
                  className="h-auto w-full rounded-lg object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1000px"
                  priority={true}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works workflow */}
      <section className="bg-white py-16 sm:py-20">
        <div className={container}>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className={H2}>How proposals and invoicing work in Focuspilot</h2>
            <p className={cn("mt-3", Lead)}>
              A streamlined process that turns project briefs into professional proposals and seamless payment
              collection.
            </p>
          </div>

          <div className="relative mt-12">
            {/* Connecting line */}
            <div className="absolute left-0 right-0 top-6 hidden h-px bg-stone-200 md:block -z-10" aria-hidden="true" />

            <div className="grid gap-8 md:grid-cols-4 md:gap-6">
              <WorkflowStep
                number="01"
                title="Create proposal"
                description="Use AI to draft professional proposals from project briefs with accurate scope and pricing."
                icon={FileText}
                accent={CLAY}
              />
              <WorkflowStep
                number="02"
                title="Client reviews"
                description="Clients receive branded proposals in their portal with clear terms and easy approval process."
                icon={Eye}
                accent={OLIVE}
              />
              <WorkflowStep
                number="03"
                title="Generate invoice"
                description="Approved proposals automatically become invoices with payment links and tracking."
                icon={CreditCard}
                accent={OCHRE}
              />
              <WorkflowStep
                number="04"
                title="Get paid"
                description="Clients pay securely via Stripe with automatic receipt generation and accounting sync."
                icon={DollarSign}
                accent={SLATE}
              />
            </div>
          </div>
        </div>
      </section>

      {/* AI-powered proposals */}
      <section className="bg-stone-50 py-16 sm:py-20">
        <div className={container}>
          <div className="grid items-center gap-10 md:grid-cols-12">
            <div className="md:col-span-6">
              <h2 className={H2}>AI-powered proposal creation</h2>
              <p className={cn("mt-3", Lead)}>
                Transform project briefs into professional proposals in minutes. Our AI understands design workflows and
                creates accurate scope definitions with market-rate pricing.
              </p>
              <ul className="mt-6 space-y-3">
                <Bullet>Generate detailed scope from project requirements</Bullet>
                <Bullet>Automatic pricing based on project complexity and market rates</Bullet>
                <Bullet>Professional templates with your branding</Bullet>
                <Bullet>Version control and revision tracking</Bullet>
              </ul>
              <div className="mt-6 flex gap-3">
                <CtaButton href="#ai" variant="slate" label="Try AI proposals" showArrow arrowVariant="white" />
                <CtaButton href="#templates" variant="white" label="View templates" />
              </div>
            </div>
            <div className="md:col-span-6">
              <div className="grid gap-4">
                <Card className="overflow-hidden border-stone-200 shadow-sm">
                  <CardContent className="p-2">
                    <Image
                      src="/images/platform/crm/ai-scope-definition.png"
                      alt="AI scope definition interface showing automated project breakdown and phase planning"
                      width={800}
                      height={500}
                      className="h-auto w-full rounded-lg object-cover"
                    />
                  </CardContent>
                </Card>
                <Card className="overflow-hidden border-stone-200 shadow-sm">
                  <CardContent className="p-2">
                    <Image
                      src="/images/platform/crm/ai-proposal-pricing.png"
                      alt="AI pricing calculator showing automated cost estimation and fee structure"
                      width={800}
                      height={400}
                      className="h-auto w-full rounded-lg object-cover"
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Automated invoicing */}
      <section className="bg-white py-16 sm:py-20">
        <div className={container}>
          <div className="grid items-center gap-10 md:grid-cols-12">
            <div className="md:col-span-6 md:order-2">
              <h2 className={H2}>Automated invoicing and payments</h2>
              <p className={cn("mt-3", Lead)}>
                Turn approved proposals into invoices instantly. Set up payment schedules, send automated reminders, and
                get paid faster with integrated Stripe payments.
              </p>
              <ul className="mt-6 space-y-3">
                <Bullet>One-click invoice generation from proposals</Bullet>
                <Bullet>Automated payment schedules and milestone billing</Bullet>
                <Bullet>Stripe integration for secure card and ACH payments</Bullet>
                <Bullet>Automatic Xero sync for seamless accounting</Bullet>
              </ul>
              <div className="mt-6 flex gap-3">
                <CtaButton href="#payments" variant="slate" label="Payment options" showArrow arrowVariant="white" />
                <CtaButton href="#integrations" variant="white" label="View integrations" />
              </div>
            </div>
            <div className="md:col-span-6 md:order-1">
              <div className="space-y-4">
                <Card className="overflow-hidden border-stone-200 shadow-sm">
                  <CardContent className="p-2">
                    <Image
                      src="/images/invoice-summary-cards.png"
                      alt="Invoice dashboard showing total invoices and purchase orders summary"
                      width={800}
                      height={200}
                      className="h-auto w-full rounded-lg object-cover"
                    />
                  </CardContent>
                </Card>
                <div className="grid grid-cols-2 gap-4">
                  <Card className="overflow-hidden border-stone-200 shadow-sm">
                    <CardContent className="p-2">
                      <Image
                        src="/images/invoice-buttons.png"
                        alt="Invoice action buttons for creating and syncing with Xero"
                        width={400}
                        height={120}
                        className="h-auto w-full rounded-lg object-cover"
                      />
                    </CardContent>
                  </Card>
                  <Card className="overflow-hidden border-stone-200 shadow-sm">
                    <CardContent className="p-2">
                      <Image
                        src="/images/project-cost-tracking.png"
                        alt="Project cost tracking with delivery progress and budget monitoring"
                        width={400}
                        height={120}
                        className="h-auto w-full rounded-lg object-cover"
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Client experience */}
      <section className="bg-stone-50 py-16 sm:py-20">
        <div className={container}>
          <div className="grid items-center gap-10 md:grid-cols-12">
            <div className="md:col-span-6">
              <h2 className={H2}>Seamless client experience</h2>
              <p className={cn("mt-3", Lead)}>
                Clients receive proposals and invoices through their branded portal. They can review, approve, and
                pay—all in one professional experience that reflects your studio's quality.
              </p>
              <ul className="mt-6 space-y-3">
                <Bullet>Branded client portal with your studio identity</Bullet>
                <Bullet>One-click proposal approval and e-signatures</Bullet>
                <Bullet>Secure payment processing with instant receipts</Bullet>
                <Bullet>Real-time status updates and notifications</Bullet>
              </ul>
              <div className="mt-6">
                <CtaButton
                  href="/platform/client-portal"
                  variant="slate"
                  label="See client portal"
                  showArrow
                  arrowVariant="white"
                />
              </div>
            </div>
            <div className="md:col-span-6">
              <Card className="overflow-hidden border-stone-200 shadow-lg">
                <CardContent className="p-2">
                  <Image
                    src="/images/client-portal/client-view-hero.png"
                    alt="Client portal interface showing proposal review and approval workflow"
                    width={800}
                    height={600}
                    className="h-auto w-full rounded-lg object-cover"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits grid */}
      <section id="features" className="bg-white py-16 sm:py-20">
        <div className={container}>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className={H2}>Why studios choose Focuspilot for proposals and invoicing</h2>
            <p className={cn("mt-3", Lead)}>
              Professional tools that save time, improve cash flow, and delight clients.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <BenefitCard
              title="Faster proposals"
              description="AI-powered proposal generation reduces creation time from hours to minutes while maintaining professional quality."
              icon={Zap}
              accent={OCHRE}
            />
            <BenefitCard
              title="Better cash flow"
              description="Automated payment reminders and easy online payments help you get paid 40% faster on average."
              icon={DollarSign}
              accent={CLAY}
            />
            <BenefitCard
              title="Professional branding"
              description="Fully customizable templates ensure every proposal and invoice reflects your studio's brand and quality."
              icon={Building2}
              accent={OLIVE}
            />
            <BenefitCard
              title="Client satisfaction"
              description="Streamlined approval process and transparent communication keep clients happy and engaged."
              icon={Users}
              accent={SLATE}
            />
            <BenefitCard
              title="Automated workflows"
              description="Set up payment schedules, reminders, and follow-ups that run automatically in the background."
              icon={Calendar}
              accent={OCHRE}
            />
            <BenefitCard
              title="Seamless integration"
              description="Connect with Xero, Stripe, and your project management for a unified business workflow."
              icon={Send}
              accent={CLAY}
            />
          </div>
        </div>
      </section>

      {/* Image block */}
      <section className="py-16 sm:py-20">
        <div className={container}>
          <ProposalInvoiceImageBlock />
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative isolate overflow-hidden py-24" style={{ backgroundColor: "#3F4B51" }}>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: "url('/textures/grain.png')", backgroundSize: "200px 200px" }}
        />
        <div className={container}>
          <div className="mx-auto max-w-4xl text-center">
            <h3 className="text-2xl sm:text-[28px] md:text-[32px] font-medium tracking-tight text-white">
              Professional proposals and faster payments start here
            </h3>
            <p className="mt-3 text-lg text-stone-300">
              Join studios using Focuspilot to streamline their proposal and invoicing workflows.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <CtaButton
                href="/signup"
                variant="slate"
                                label="Start for free"
                showArrow
                arrowVariant="white"
              />
            </div>
            <p className="mt-3 text-xs sm:text-sm text-stone-400">No credit card required</p>
          </div>
        </div>
      </section>
    </main>
  )
}
