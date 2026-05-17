import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Proposals & Invoicing for Interior Designers | Focuspilot",
  description:
    "Create professional proposals, automate invoicing, and get paid faster. AI-powered pricing recommendations and branded PDF generation for interior design studios.",
  keywords: [
    "interior design proposals",
    "design studio invoicing",
    "AI proposal generator",
    "interior design billing",
    "design project quotes",
    "automated invoicing for designers",
  ],
  openGraph: {
    title: "Proposals & Invoicing | Focuspilot",
    description: "Create professional proposals and automate invoicing for your interior design studio.",
    url: "https://focuspilot.io/platform/features/invoicing",
    type: "website",
  },
  alternates: {
    canonical: "https://focuspilot.io/platform/features/invoicing",
  },
}

export default function InvoicingLayout({ children }: { children: React.ReactNode }) {
  return children
}
