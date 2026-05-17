import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Interior Design Client Portal Software | Approvals & Payments | Techstyles",
  description:
    "Give clients a branded portal to approve selections, track deliveries & pay invoices. One-click approvals, real-time updates, integrated payments via Stripe. Try free.",
  keywords: [
    "interior design client portal",
    "design client collaboration",
    "client approval software",
    "interior design client management",
    "design selection approvals",
    "client project portal",
  ],
  openGraph: {
    title: "Interior Design Client Portal Software | Approvals & Payments | Techstyles",
    description:
      "Give clients a branded portal to approve selections, track deliveries & pay invoices. One-click approvals, real-time updates, integrated payments via Stripe. Try free.",
    url: "https://techstyles.ai/platform/client-portal",
    type: "website",
    images: [
      {
        url: "/images/og-client-portal.png",
        width: 1200,
        height: 630,
        alt: "Techstyles client portal for interior design approvals",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Interior Design Client Portal Software | Approvals & Payments | Techstyles",
    description: "Give clients a branded portal to approve selections, track deliveries & pay invoices. One-click approvals, real-time updates.",
  },
  alternates: {
    canonical: "https://techstyles.ai/platform/client-portal",
  },
}

export default function ClientPortalLayout({ children }: { children: React.ReactNode }) {
  return children
}
