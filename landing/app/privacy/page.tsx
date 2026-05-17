import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | Techstyles",
  description: "Techstyles privacy policy. Learn how we collect, use, and protect your data.",
  alternates: { canonical: "https://focuspilot.io/privacy" },
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-24">
        <h1 className="text-[30px] sm:text-5xl md:text-[56px] font-medium tracking-tight leading-[1.1] text-stone-900">Privacy Policy</h1>
        <p className="mt-4 text-sm text-stone-500">Last updated: January 2025</p>

        <div className="mt-12 space-y-8 text-stone-600">
          <section>
            <h2 className="text-xl font-semibold text-stone-900">1. Information We Collect</h2>
            <p className="mt-3">
              We collect information you provide directly, including account details, project data, and communications. We also collect usage data to improve our service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900">2. How We Use Your Information</h2>
            <p className="mt-3">
              We use your information to provide and improve Techstyles, communicate with you, and ensure security. We never sell your data to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900">3. Data Security</h2>
            <p className="mt-3">
              We implement industry-standard security measures to protect your data, including encryption in transit and at rest, regular security audits, and access controls.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900">4. Your Rights</h2>
            <p className="mt-3">
              Under GDPR, you have the right to access, correct, delete, or export your data. Contact us at privacy@techstyles.ai to exercise these rights.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900">5. Contact Us</h2>
            <p className="mt-3">
              For privacy-related questions, contact us at{" "}
              <a href="mailto:privacy@techstyles.ai" className="text-stone-900 underline hover:no-underline">
                privacy@techstyles.ai
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
