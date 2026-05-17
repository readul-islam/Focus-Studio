import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Interior Design Invoicing & Accounting Software | Xero Integration | Focuspilot",
  description:
    "Streamline interior design studio finances. Create invoices, track project profitability, sync with Xero & QuickBooks. Real-time budget vs actual tracking. Start free.",
  keywords: [
    "interior design invoicing",
    "design studio finance software",
    "interior design billing",
    "project budget tracking",
    "design studio accounting",
    "interior design financial management",
  ],
  openGraph: {
    title: "Interior Design Invoicing & Accounting Software | Xero Integration | Focuspilot",
    description:
      "Streamline interior design studio finances. Create invoices, track project profitability, sync with Xero & QuickBooks. Real-time budget vs actual tracking. Start free.",
    url: "https://focuspilot.io/platform/finance",
    type: "website",
    images: [
      {
        url: "/images/og-finance.png",
        width: 1200,
        height: 630,
        alt: "Focuspilot finance dashboard for interior design studios",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Interior Design Invoicing & Accounting Software | Xero Integration | Focuspilot",
    description: "Streamline interior design studio finances. Create invoices, track project profitability, sync with Xero & QuickBooks.",
  },
  alternates: {
    canonical: "https://focuspilot.io/platform/finance",
  },
}

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
  return children
}
