import type { Metadata } from "next"
import Link from "next/link"
import { Mail, MessageSquare } from "lucide-react"
import { CtaButton } from "@/components/cta-button"

export const metadata: Metadata = {
  title: "Contact Techstyles | Get in Touch",
  description: "Contact the Techstyles team. We'd love to hear from you - whether you have questions about our interior design software or want to book a demo.",
  alternates: { canonical: "https://focuspilot.io/contact" },
}

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-[30px] sm:text-5xl md:text-[56px] font-medium tracking-tight leading-[1.1] text-stone-900">Get in Touch</h1>
        <p className="mt-6 text-lg text-stone-600">
          Have questions about Techstyles? Want to book a demo? We'd love to hear from you.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-stone-200 p-6">
            <Mail className="mx-auto h-8 w-8 text-stone-600" />
            <h2 className="mt-4 font-semibold text-stone-900">Email Us</h2>
            <p className="mt-2 text-sm text-stone-600">For general enquiries and support</p>
            <a href="mailto:hello@techstyles.ai" className="mt-4 inline-block text-stone-900 underline hover:no-underline">
              hello@techstyles.ai
            </a>
          </div>
          <div className="rounded-xl border border-stone-200 p-6">
            <MessageSquare className="mx-auto h-8 w-8 text-stone-600" />
            <h2 className="mt-4 font-semibold text-stone-900">Book a Demo</h2>
            <p className="mt-2 text-sm text-stone-600">See Techstyles in action</p>
            <CtaButton href="/signup" className="mt-4">
              Schedule demo
            </CtaButton>
          </div>
        </div>
      </div>
    </main>
  )
}
