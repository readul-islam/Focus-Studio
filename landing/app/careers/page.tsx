import type { Metadata } from "next"
import { ArrowLeft } from "lucide-react"
import { CtaButton } from "@/components/cta-button"

export const metadata: Metadata = {
  title: "Careers at Techstyles | Join Our Team",
  description: "Join the Techstyles team. We're building AI-powered software for interior designers and looking for passionate people to help us grow.",
  alternates: { canonical: "https://techstyles.ai/careers" },
}

export default function CareersPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-[30px] sm:text-5xl md:text-[56px] font-medium tracking-tight leading-[1.1] text-stone-900">Careers at Techstyles</h1>
        <p className="mt-6 text-lg text-stone-600">
          We're building tools that help interior designers focus on what they love. Join us if you're passionate about great software and beautiful design.
        </p>
        <div className="mt-12 rounded-xl border border-stone-200 bg-stone-50 p-8">
          <p className="text-stone-600">
            We're a small, growing team. While we don't have open positions listed right now, we're always interested in hearing from talented people.
          </p>
          <p className="mt-4 text-stone-600">
            Send us an email at{" "}
            <a href="mailto:careers@techstyles.ai" className="text-stone-900 underline hover:no-underline">
              careers@techstyles.ai
            </a>
          </p>
        </div>
        <div className="mt-8">
          <CtaButton href="/" variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </CtaButton>
        </div>
      </div>
    </main>
  )
}
