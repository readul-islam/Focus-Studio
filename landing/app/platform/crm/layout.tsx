import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Interior Design CRM Software | Lead to Project Pipeline | Focuspilot",
  description:
    "Manage interior design leads, clients & proposals in one CRM built for designers. AI-powered proposals, pipeline tracking, seamless project conversion. Start free.",
  keywords: [
    "interior design CRM",
    "design studio CRM",
    "interior design lead management",
    "design client relationship management",
    "interior design sales pipeline",
    "design studio client tracking",
  ],
  openGraph: {
    title: "Interior Design CRM Software | Lead to Project Pipeline | Focuspilot",
    description:
      "Manage interior design leads, clients & proposals in one CRM built for designers. AI-powered proposals, pipeline tracking, seamless project conversion. Start free.",
    url: "https://focuspilot.io/platform/crm",
    type: "website",
    images: [
      {
        url: "/images/og-crm.png",
        width: 1200,
        height: 630,
        alt: "Focuspilot CRM dashboard for interior design studios",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Interior Design CRM Software | Lead to Project Pipeline | Focuspilot",
    description: "Manage interior design leads, clients & proposals in one CRM built for designers. AI-powered proposals, pipeline tracking.",
  },
  alternates: {
    canonical: "https://focuspilot.io/platform/crm",
  },
}

export default function CRMLayout({ children }: { children: React.ReactNode }) {
  return children
}
