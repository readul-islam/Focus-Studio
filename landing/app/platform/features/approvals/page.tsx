"use client"
import Image from "next/image"
import { CheckCircle2, Clock, Users, FileCheck, Bell, Zap, Shield, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { CtaButton } from "@/components/cta-button"
import { PortugueseTilesBg } from "@/components/graphics/portuguese-tiles-bg"

const container = "mx-auto max-w-[1200px] px-6 sm:px-8"
const TITLE_H1 = "text-[30px] sm:text-5xl md:text-[56px] font-medium tracking-tight leading-[1.1]"
const TITLE_H2 = "text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight"

function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-white">
      <PortugueseTilesBg className="top-0" height="min(520px, 58vh)" opacity={0.08} />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-30"
        style={{
          background:
            "radial-gradient(60% 46% at 50% 0%, rgba(214,177,150,0.14) 0%, rgba(214,177,150,0.06) 42%, transparent 72%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-40 opacity-[0.06]"
        style={{ backgroundImage: "url('/textures/grain.png')", backgroundSize: "200px 200px" }}
      />

      <div className={cn(container, "pb-10 pt-8 sm:pb-16 sm:pt-12 md:pt-16")}>
        <div className="mx-auto max-w-4xl">
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-stone-300/60 bg-white px-3 py-1 text-xs text-stone-700">
              <FileCheck className="h-3 w-3 text-stone-600" />
              <span>Client approvals made simple</span>
            </div>
          </div>

          <h1 className={cn("mt-5 text-center", TITLE_H1)}>Get client sign-off faster with seamless approvals.</h1>

          <p className="mt-4 text-center text-base sm:text-lg text-stone-600">
            Transform endless email chains and missed approvals into a streamlined workflow. Get real-time
            notifications, track progress, and keep projects moving forward.
          </p>

          <div className="mx-auto mt-6 flex justify-center">
            <CtaButton
              href="/signup"
              variant="slate"
              size="lg"
              label="Start free trial"
              showArrow
              arrowVariant="white"
            />
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-6xl">
          <Card className="overflow-hidden border-stone-200 shadow-xl">
            <CardContent className="p-2 sm:p-3">
              <div className="relative w-full">
                <Image
                  src="/images/platform/projects/client-portal-overview.png"
                  alt="Focuspilot approval workflow showing client portal with pending approvals, comments, and real-time status updates"
                  width={1600}
                  height={900}
                  priority={true}
                  className="h-auto w-full rounded-lg bg-stone-50 object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1200px"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

function ApprovalFlow() {
  const steps = [
    {
      number: "01",
      title: "Share for approval",
      description:
        "Upload designs, samples, or documents directly to your project. Set approval deadlines and add context.",
      icon: FileCheck,
      color: "#E07A57", // Brand clay color
    },
    {
      number: "02",
      title: "Client reviews",
      description: "Clients receive instant notifications and can review, comment, and approve from any device.",
      icon: Users,
      color: "#166534", // Brand emerald
    },
    {
      number: "03",
      title: "Track progress",
      description: "See approval status in real-time. Get notified when decisions are made or deadlines approach.",
      icon: Clock,
      color: "#D97706", // Amber
    },
    {
      number: "04",
      title: "Move forward",
      description: "Approved items automatically update project timelines. Keep momentum with automated next steps.",
      icon: Zap,
      color: "#4B5960", // Brand slate
    },
  ]

  return (
    <section className="bg-white py-20 sm:py-24">
      <div className={container}>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className={TITLE_H2}>How approvals work in Focuspilot</h2>
          <p className="mt-3 text-lg text-stone-600">
            A simple, visual process that keeps everyone aligned and projects on track.
          </p>
        </div>

        <div className="relative mt-16">
          <div
            className="absolute left-0 right-0 top-6 hidden h-px bg-stone-200 lg:block"
            style={{ left: "12.5%", right: "12.5%", width: "75%" }}
          />

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div key={step.number} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div
                    className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl ring-1 bg-white"
                    style={{
                      backgroundColor: `${step.color}14`,
                      ringColor: `${step.color}28`,
                    }}
                  >
                    <step.icon className="h-5 w-5" style={{ color: step.color }} />
                  </div>
                  <div className="mt-4 text-sm font-medium text-stone-500">{step.number}</div>
                  <h3 className="mt-2 text-xl font-semibold text-stone-900">{step.title}</h3>
                  <p className="mt-2 text-sm text-stone-600 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function FeatureBlocks() {
  const features = [
    {
      title: "Real-time notifications",
      description:
        "Never miss an approval again. Get instant notifications when clients review, comment, or approve items.",
      benefits: [
        "Instant email and in-app notifications",
        "Customizable reminder schedules",
        "Mobile-friendly approval links",
        "Deadline tracking and alerts",
      ],
      image: {
        src: "/images/client-portal/messages-updates.png",
        alt: "Real-time notification system showing approval requests and status updates",
        width: 1280,
        height: 840,
      },
    },
    {
      title: "Visual approval workflow",
      description:
        "Present designs beautifully with context. Clients can see exactly what they're approving with full project context.",
      benefits: [
        "High-resolution image galleries",
        "Side-by-side comparisons",
        "Contextual project information",
        "Mobile-optimized viewing",
      ],
      image: {
        src: "/images/platform/projects/docs-updated.png",
        alt: "Visual approval interface showing design presentations and client feedback",
        width: 1280,
        height: 840,
      },
    },
    {
      title: "Version control & history",
      description: "Keep track of every revision and decision. Never lose sight of what was approved when.",
      benefits: [
        "Complete approval history",
        "Version comparison tools",
        "Audit trail for all decisions",
        "Rollback to previous versions",
      ],
      image: {
        src: "/images/platform/projects/docs-grid.png",
        alt: "Document version control showing approval history and revision tracking",
        width: 1280,
        height: 840,
      },
    },
  ]

  return (
    <section className="bg-stone-50 py-20 sm:py-24">
      <div className={container}>
        <div className="space-y-20 sm:space-y-24">
          {features.map((feature, index) => {
            const isEven = index % 2 === 0
            return (
              <div key={feature.title} className="grid items-center gap-10 md:grid-cols-12 lg:gap-14">
                <div className={cn("md:col-span-6", isEven ? "md:order-1" : "md:order-2")}>
                  <div className="mx-auto max-w-xl">
                    <h2 className={cn("mt-2", TITLE_H2)}>{feature.title}</h2>
                    <p className="mt-3 text-stone-600">{feature.description}</p>
                    <ul className="mt-6 space-y-3">
                      {feature.benefits.map((benefit) => (
                        <li key={benefit} className="flex items-start gap-3 text-stone-800">
                          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "#166534" }} />
                          <span className="text-base">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className={cn("md:col-span-6", isEven ? "md:order-2" : "md:order-1")}>
                  <div className="relative">
                    <Image
                      src={feature.image.src || "/placeholder.svg"}
                      alt={feature.image.alt}
                      width={feature.image.width}
                      height={feature.image.height}
                      className="h-auto w-full rounded-xl object-cover shadow-lg"
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 55vw, 640px"
                      priority={false}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function ApprovalsImageBlock() {
  return (
    <section className="py-20 sm:py-24">
      <div className={container}>
        <div className="relative overflow-hidden rounded-3xl">
          <div className="absolute inset-0">
            <Image
              src="/images/screenshot-202025-08-19-20at-2011.jpeg"
              alt="Modern interior design studio with natural lighting and organized workspace"
              width={1600}
              height={800}
              className="h-full w-full object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1200px"
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>

          <div className="relative px-8 py-16 sm:px-12 sm:py-20 lg:px-16 lg:py-24">
            <div className="mx-auto max-w-2xl">
              <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Your clients, delighted.
                <br />
                Your approvals, streamlined.
                <br />
                Your projects, on time.
              </h2>

              <div className="mt-8 flex justify-start">
                <button className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-base font-medium text-stone-900 shadow-lg transition-all hover:bg-stone-50 hover:shadow-xl">
                  <span>Transform approvals</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function BenefitsGrid() {
  const benefits = [
    {
      icon: Clock,
      title: "Faster decisions",
      description: "Reduce approval time from days to hours with streamlined workflows and instant notifications.",
      color: "#D97706", // Amber
    },
    {
      icon: Shield,
      title: "Secure & compliant",
      description:
        "Enterprise-grade security with audit trails and compliance features for professional peace of mind.",
      color: "#4B5960", // Brand slate
    },
    {
      icon: Users,
      title: "Better client experience",
      description: "Give clients a professional, easy-to-use portal that makes them feel involved and informed.",
      color: "#166534", // Brand emerald
    },
    {
      icon: Bell,
      title: "Never miss deadlines",
      description: "Automated reminders and deadline tracking ensure approvals don't become project bottlenecks.",
      color: "#E07A57", // Brand clay
    },
    {
      icon: FileCheck,
      title: "Complete transparency",
      description: "Everyone sees the same information. No more confusion about what's been approved or pending.",
      color: "#7C2D12", // Brown
    },
    {
      icon: Zap,
      title: "Automated workflows",
      description:
        "Approvals trigger next steps automatically, keeping your projects moving without manual intervention.",
      color: "#4338CA", // Indigo
    },
  ]

  return (
    <section className="bg-white py-20 sm:py-24">
      <div className={container}>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className={TITLE_H2}>Why designers love Focuspilot approvals</h2>
          <p className="mt-3 text-lg text-stone-600">
            Transform client communication from chaos to clarity with features built for design professionals.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => (
            <Card key={benefit.title} className="border-stone-200 bg-white">
              <CardContent className="p-6">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg ring-1"
                  style={{
                    backgroundColor: `${benefit.color}14`,
                    ringColor: `${benefit.color}28`,
                  }}
                >
                  <benefit.icon className="h-5 w-5" style={{ color: benefit.color }} />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-stone-900">{benefit.title}</h3>
                <p className="mt-2 text-sm text-stone-600 leading-relaxed">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function BigCTA() {
  return (
    <section
      id="waitlist"
      className="relative isolate overflow-hidden py-24 text-stone-100"
      style={{ backgroundColor: "#3F4B51" }}
      aria-labelledby="cta-heading"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{ backgroundImage: "url('/textures/grain.png')", backgroundSize: "200px 200px" }}
      />
      <div className={container}>
        <div className="mx-auto max-w-3xl text-center">
          <h2 id="cta-heading" className="text-2xl sm:text-[28px] md:text-[32px] font-medium tracking-tight">
            Stop chasing approvals. Start designing.
          </h2>
          <p className="mt-3 text-base sm:text-lg text-stone-300">
            Join hundreds of design studios using Focuspilot to streamline client approvals and keep projects on track.
          </p>
          <div className="mt-8 flex justify-center">
            <CtaButton href="/signup" variant="white" label="Start for free" showArrow arrowVariant="black" />
          </div>
          <p className="mt-3 text-xs sm:text-sm text-stone-400">No credit card required</p>
        </div>
      </div>
    </section>
  )
}

export default function ApprovalsPage() {
  return (
    <>
      <Hero />
      <ApprovalFlow />
      <FeatureBlocks />
      <ApprovalsImageBlock />
      <BenefitsGrid />
      <BigCTA />
    </>
  )
}
