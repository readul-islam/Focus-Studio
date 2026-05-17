import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Integrations | Connect Techstyles with Your Tools",
  description: "Techstyles integrates with Xero, QuickBooks, Stripe, Google Calendar, and more. Connect your interior design workflow with the tools you already use.",
  alternates: { canonical: "https://techstyles.ai/integrations" },
}

export default function IntegrationsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
