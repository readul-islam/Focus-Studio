import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Integrations | Connect Focuspilot with Your Tools",
  description: "Focuspilot integrates with Xero, QuickBooks, Stripe, Google Calendar, and more. Connect your interior design workflow with the tools you already use.",
  alternates: { canonical: "https://focuspilot.io/integrations" },
}

export default function IntegrationsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
