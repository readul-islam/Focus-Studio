import type { Metadata } from "next"
import { Suspense } from "react"
import { BlogPageContent } from "@/components/blog/blog-page-content"

export const metadata: Metadata = {
  title: "Focuspilot Blog | Interior Design Workflows, Procurement & Studio Guides",
  description:
    "Expert insights on interior design workflows, FF&E procurement, studio management & industry trends powered by Focuspilot. Updated weekly for designers & architects.",
  keywords: [
    "Focuspilot",
    "Focuspilot blog",
    "interior design project management",
    "FF&E procurement guide",
    "interior design studio management",
    "design software UK",
    "design software US",
    "interior design CRM",
  ],
  openGraph: {
    title: "Focuspilot Blog | Interior Design Workflows, Procurement & Studio Guides",
    description:
      "Expert insights on interior design workflows, FF&E procurement, studio management & industry trends powered by Focuspilot.",
    type: "website",
    url: "https://focuspilot.io/blog",
    siteName: "Focuspilot",
  },
  twitter: {
    card: "summary_large_image",
    title: "Focuspilot Blog | Interior Design Workflows, Procurement & Studio Guides",
    description:
      "Expert insights on interior design workflows, FF&E procurement, studio management & industry trends powered by Focuspilot.",
  },
  alternates: {
    canonical: "https://focuspilot.io/blog",
  },
}

export default function BlogPage() {
  return (
    <Suspense fallback={null}>
      <BlogPageContent />
    </Suspense>
  )
}

