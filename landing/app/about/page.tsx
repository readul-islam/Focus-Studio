import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { CtaButton } from "@/components/cta-button"

export const metadata: Metadata = {
  title: "About Techstyles | Our Story & Mission",
  description: "Learn about Techstyles - the team building AI-powered project management software for interior designers. Our mission is to give designers more time to design.",
  alternates: { canonical: "https://focuspilot.io/about" },
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-[30px] sm:text-5xl md:text-[56px] font-medium tracking-tight leading-[1.1] text-stone-900">About Techstyles</h1>
        <p className="mt-6 text-lg text-stone-600">
          We're building the modern operating system for interior design studios. Our mission is simple: give designers more time to design by automating the admin.
        </p>
        <p className="mt-4 text-stone-600">
          Founded in 2024, Techstyles combines deep industry knowledge with cutting-edge AI to create tools that actually understand how design studios work.
        </p>
        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <CtaButton href="/signup">Start free trial</CtaButton>
          <CtaButton href="/" variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </CtaButton>
        </div>
      </div>
    </main>
  )
}
