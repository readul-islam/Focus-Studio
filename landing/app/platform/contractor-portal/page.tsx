import type { Metadata } from "next"
import { Check, Users, FileText, Calendar, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { CtaButton } from "@/components/cta-button"
import { Card, CardContent } from "@/components/ui/card"

const container = "mx-auto max-w-[1200px] px-6 sm:px-8"
const H1 = "text-[30px] sm:text-5xl md:text-[56px] font-medium tracking-tight leading-[1.1]"
const H2 = "text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight"
const Lead = "text-base sm:text-lg text-stone-600"

export const metadata: Metadata = {
  title: "Contractor Portal for Interior Designers | Manage Trades | Focuspilot",
  description: "Give contractors access to project schedules, specifications, and documents. Streamline communication with trades on interior design projects.",
  keywords: [
    "interior design contractor portal",
    "trade management software",
    "contractor collaboration",
    "interior design project coordination",
    "trade scheduling software",
  ],
  openGraph: {
    title: "Contractor Portal for Interior Designers | Focuspilot",
    description: "Give contractors access to project schedules, specifications, and documents. Streamline communication with trades.",
    url: "https://focuspilot.io/platform/contractor-portal",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contractor Portal | Focuspilot",
    description: "Streamline communication with contractors on interior design projects.",
  },
  alternates: {
    canonical: "https://focuspilot.io/platform/contractor-portal",
  },
}

const features = [
  {
    icon: Calendar,
    title: "Shared Schedules",
    description: "Contractors see their tasks, deadlines, and dependencies in real-time",
  },
  {
    icon: FileText,
    title: "Document Access",
    description: "Share specs, drawings, and product sheets with the right contractors",
  },
  {
    icon: MessageSquare,
    title: "Project Messaging",
    description: "Keep all communication in context with project-specific threads",
  },
  {
    icon: Users,
    title: "Team Coordination",
    description: "Coordinate multiple trades and track installation progress",
  },
]

export default function ContractorPortalPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-b from-stone-50 to-white py-16 sm:py-24">
        <div className={container}>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className={cn(H1, "text-center")}>Contractor Portal</h1>
            <p className={cn(Lead, "mt-4 text-center")}>
              Give contractors controlled access to project schedules, specifications, and documents.
              Keep everyone aligned without endless emails.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <CtaButton href="/signup" >Start free trial</CtaButton>
              <CtaButton href="/platform/projects" variant="outline" >See all features</CtaButton>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-20">
        <div className={container}>
          <h2 className={cn(H2, "text-center mb-12")}>Coordinate trades effortlessly</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="border-stone-200">
                <CardContent className="p-6">
                  <div className="rounded-lg bg-stone-100 p-2 w-fit">
                    <feature.icon className="h-5 w-5 text-stone-600" />
                  </div>
                  <h3 className="mt-4 font-semibold text-stone-900">{feature.title}</h3>
                  <p className="mt-2 text-sm text-stone-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-stone-50 py-16 sm:py-20">
        <div className={container}>
          <div className="mx-auto max-w-3xl">
            <h2 className={cn(H2, "text-center mb-12")}>Why contractors love it</h2>
            <div className="space-y-4">
              {[
                "See only what's relevant to their scope",
                "Access schedules and documents from any device",
                "Get notified of changes that affect them",
                "Submit updates and photos from site",
                "No app installation required",
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg bg-white p-4 border border-stone-200">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-stone-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24">
        <div className={container}>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className={cn(H2)}>Ready to streamline contractor coordination?</h2>
            <p className={cn(Lead, "mt-4")}>
              Start your free trial and invite your first contractor in minutes.
            </p>
            <CtaButton href="/signup"  className="mt-8">
              Start free trial
            </CtaButton>
          </div>
        </div>
      </section>
    </main>
  )
}
