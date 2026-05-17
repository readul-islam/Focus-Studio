import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "AI Email & Communication Tools for Interior Designers | Focuspilot",
  description:
    "Unified inbox with AI-powered project routing, smart replies, and automatic email categorization. Keep all client communication organized by project.",
  keywords: [
    "interior design email management",
    "AI email for designers",
    "design studio communication",
    "project email routing",
    "interior design inbox",
    "client communication software",
  ],
  openGraph: {
                          title: "AI Email & Communication Tools | Focuspilot",
    description: "Unified inbox with AI-powered project routing for interior design studios.",
    url: "https://focuspilot.io/platform/features/ai-email",
    type: "website",
  },
  alternates: {
    canonical: "https://focuspilot.io/platform/features/ai-email",
  },
}

export default function AIEmailLayout({ children }: { children: React.ReactNode }) {
  return children
}
