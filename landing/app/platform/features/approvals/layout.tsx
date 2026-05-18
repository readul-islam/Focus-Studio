import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Client Approval Software for Interior Designers | Focuspilot",
  description:
    "Streamline client sign-offs with beautiful approval workflows. Get faster decisions on selections, budgets, and design directions with Focuspilot approval tools.",
  keywords: [
    "interior design approvals",
    "client sign-off software",
    "design approval workflow",
    "selection approval system",
    "interior design client approvals",
    "design decision tracking",
  ],
  openGraph: {
    title: "Client Approval Software | Focuspilot",
    description: "Streamline client sign-offs with beautiful approval workflows for interior design projects.",
    url: "https://focuspilot.io/platform/features/approvals",
    type: "website",
  },
  alternates: {
    canonical: "https://focuspilot.io/platform/features/approvals",
  },
}

export default function ApprovalsLayout({ children }: { children: React.ReactNode }) {
  return children
}
