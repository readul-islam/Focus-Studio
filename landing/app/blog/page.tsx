import type { Metadata } from "next"
import { Suspense } from "react"
import { BlogPageContent } from "@/components/blog/blog-page-content"

export const metadata: Metadata = {
  title: "Interior Design Studio Blog | Tips, Guides & Industry Insights | Focuspilot",
  description:
    "Expert insights on interior design workflows, studio management & industry trends. Practical guides for running a successful design studio. Updated weekly.",
  openGraph: {
    title: "Interior Design Studio Blog | Tips, Guides & Industry Insights | Focuspilot",
    description:
      "Expert insights on interior design workflows, studio management & industry trends. Practical guides for running a successful design studio.",
    type: "website",
    url: "https://focuspilot.io/blog",
  },
  twitter: {
    card: "summary_large_image",
    title: "Interior Design Studio Blog | Tips, Guides & Industry Insights | Focuspilot",
    description:
      "Expert insights on interior design workflows, studio management & industry trends. Practical guides for running a successful design studio.",
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
