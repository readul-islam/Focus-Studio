import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AI Product Procurement for Interior Designers | Focuspilot",
  description:
    "AI-powered web clipper extracts product details from any website instantly. Build specifications faster with intelligent product sourcing and vendor matching.",
  keywords: [
    "AI product sourcing",
    "interior design web clipper",
    "AI procurement for designers",
    "product extraction tool",
    "design specification software",
    "intelligent product sourcing",
  ],
  openGraph: {
      title: "AI Product Procurement | Focuspilot",
    description: "AI-powered web clipper extracts product details from any website instantly for interior designers.",
    url: "https://focuspilot.io/platform/features/ai-procurement",
    type: "website",
  },
  alternates: {
    canonical: "https://focuspilot.io/platform/features/ai-procurement",
  },
}

export default function AIProcurementLayout({ children }: { children: React.ReactNode }) {
  return children
}
