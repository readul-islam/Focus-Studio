import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service | Focuspilot",
  description: "Focuspilot terms of service. Read our terms and conditions for using the platform.",
  alternates: { canonical: "https://focuspilot.io/terms" },
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-24">
        <h1 className="text-[30px] sm:text-5xl md:text-[56px] font-medium tracking-tight leading-[1.1] text-stone-900">Terms of Service</h1>
        <p className="mt-4 text-sm text-stone-500">Last updated: March 2026</p>

        <div className="mt-12 space-y-8 text-stone-600">
          <section>
            <h2 className="text-xl font-semibold text-stone-900">1. Acceptance of Terms</h2>
            <p className="mt-3">
              By accessing or using Focuspilot, you agree to be bound by these Terms of Service. If you disagree with any part, you may not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900">2. Description of Service</h2>
            <p className="mt-3">
            Focuspilot provides project management, procurement, and business tools for interior design studios. We reserve the right to modify or discontinue features with reasonable notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900">3. User Accounts</h2>
            <p className="mt-3">
              You are responsible for maintaining the security of your account and all activities under it. You must provide accurate information and keep it updated.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900">4. Payment Terms</h2>
            <p className="mt-3">
              Paid plans are billed in advance. You can cancel at any time; access continues until the end of your billing period. Refunds are handled on a case-by-case basis.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900">5. Intellectual Property</h2>
            <p className="mt-3">
              You retain ownership of your data. We retain ownership of the Focuspilot platform, including software, design, and documentation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900">6. Contact</h2>
            <p className="mt-3">
              For questions about these terms, contact us at{" "}
              <a href="mailto:legal@focuspilot.io" className="text-stone-900 underline hover:no-underline">
                legal@focuspilot.io
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
