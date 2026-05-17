import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "FF&E Procurement Software for Interior Designers | Techstyles",
  description:
    "Streamline FF&E procurement with AI-powered product sourcing. Auto-generate POs, track deliveries, manage vendors. 94% on-time delivery rate. Try free for 3 months.",
  keywords: [
    "interior design procurement",
    "design product sourcing",
    "FF&E procurement software",
    "interior design purchase orders",
    "vendor management for designers",
    "design studio procurement",
  ],
  openGraph: {
    title: "FF&E Procurement Software for Interior Designers | Techstyles",
    description:
      "Streamline FF&E procurement with AI-powered product sourcing. Auto-generate POs, track deliveries, manage vendors. 94% on-time delivery rate. Try free for 3 months.",
    url: "https://techstyles.ai/platform/procurement",
    type: "website",
    images: [
      {
        url: "/images/og-procurement.png",
        width: 1200,
        height: 630,
        alt: "Techstyles procurement dashboard for interior designers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FF&E Procurement Software for Interior Designers | Techstyles",
    description: "Streamline FF&E procurement with AI-powered product sourcing. Auto-generate POs, track deliveries, manage vendors.",
  },
  alternates: {
    canonical: "https://techstyles.ai/platform/procurement",
  },
}

export default function ProcurementLayout({ children }: { children: React.ReactNode }) {
  return children
}
