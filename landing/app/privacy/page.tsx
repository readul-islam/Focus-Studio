import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | Focuspilot",
  description: "Focuspilot privacy policy. Learn how we collect, use, and protect your data.",
  alternates: { canonical: "https://focuspilot.io/privacy" },
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-24">
        <h1 className="text-[30px] sm:text-5xl md:text-[56px] font-medium tracking-tight leading-[1.1] text-stone-900">Privacy Policy</h1>
        <p className="mt-4 text-sm text-stone-500">Last updated: May 2026</p>

        <div className="mt-12 space-y-8 text-stone-600">
          <section>
            <h2 className="text-xl font-semibold text-stone-900">1. Information We Collect</h2>
            <p className="mt-3">
              We collect information you provide directly, including account details, project data, and communications. We also collect usage data to improve our service.
            </p>
            <p className="mt-3">
              If you connect Google (Gmail or Google Calendar), we access only the data needed for the features you use, such as email threads with your clients, calendar events, and message metadata. We do not request broader access than required for those features.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900">2. How We Use Your Information</h2>
            <p className="mt-3">
              We use your information to provide and improve Focuspilot, communicate with you, and ensure security. We never sell your personal data or Google user data to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900">3. Google User Data</h2>
            <p className="mt-3">
              When you connect Gmail or Google Calendar, Focuspilot (&quot;we&quot;, &quot;us&quot;) accesses Google user data only to provide studio inbox, reply, calendar overlay, and related productivity features you enable. We use this data to sync client-related email threads, send replies from the app, show calendar events, and generate optional AI summaries or draft improvements when you use those features.
            </p>
            <p className="mt-3">
              We do not use Google user data to train generalized machine-learning or artificial-intelligence models. Optional AI features (such as thread summaries or reply polish) send limited email content to our AI provider solely to return a result for your request; we do not permit that provider to use your data to train its public models.
            </p>
            <p className="mt-3">
              Google user data is stored on our servers only as long as needed to provide the service (for example, cached email threads linked to your studio and clients). You can disconnect Google at any time in Settings → Integrations, which stops new access and allows you to request deletion of stored copies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900">4. Sharing, Transfer, and Disclosure of Google User Data</h2>
            <p className="mt-3">
              We do not sell, rent, or license Google user data. We share, transfer, or disclose Google user data only in the limited circumstances below:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>
                <strong className="text-stone-800">Service providers (processors):</strong> We use infrastructure and software vendors that process data on our behalf under contract, solely to operate Focuspilot—for example cloud hosting, databases, email delivery, and (when you use AI inbox features) OpenAI for on-demand summarization or draft assistance. These providers may access Google user data only to perform services for us and must protect it consistent with this policy.
              </li>
              <li>
                <strong className="text-stone-800">Your studio team:</strong> Email and calendar information synced into Focuspilot may be visible to other authenticated members of your studio according to your account permissions, because the product is a shared workspace for your business.
              </li>
              <li>
                <strong className="text-stone-800">Google:</strong> Data is obtained through Google&apos;s APIs under your authorization; Google&apos;s own privacy policy applies to your Google account.
              </li>
              <li>
                <strong className="text-stone-800">Legal and safety:</strong> We may disclose information if required by law, regulation, legal process, or to protect the rights, safety, and security of Focuspilot, our users, or others.
              </li>
            </ul>
            <p className="mt-3">
              We do not share Google user data with advertisers, data brokers, or unrelated third parties for their own marketing or product development.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900">5. Data Security</h2>
            <p className="mt-3">
              We implement industry-standard security measures to protect your data, including encryption in transit and at rest, access controls, and secure storage of OAuth tokens. Google API access uses OAuth 2.0; we do not store your Google account password.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900">6. Your Rights</h2>
            <p className="mt-3">
              Under GDPR and similar laws, you have the right to access, correct, delete, or export your data, including data derived from Google services. Disconnect Google in the app or contact us to revoke access and request deletion of stored Google-derived data. Contact{" "}
              <a href="mailto:privacy@focuspilot.io" className="text-stone-900 underline hover:no-underline">
                privacy@focuspilot.io
              </a>{" "}
              to exercise these rights.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900">7. Contact Us</h2>
            <p className="mt-3">
              For privacy-related questions, contact us at{" "}
              <a href="mailto:privacy@focuspilot.io" className="text-stone-900 underline hover:no-underline">
                privacy@focuspilot.io
              </a>
              . Focuspilot is operated from the United Kingdom. For Google API Services, our use and transfer of information received from Google APIs adheres to the{" "}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                className="text-stone-900 underline hover:no-underline"
                rel="noopener noreferrer"
                target="_blank"
              >
                Google API Services User Data Policy
              </a>
              , including the Limited Use requirements.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
