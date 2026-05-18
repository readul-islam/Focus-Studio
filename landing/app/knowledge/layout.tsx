import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Knowledge Centre | Focuspilot Help & Guides",
  description: "Learn how to use Focuspilot with our guides, tutorials, and help articles. Get the most out of your interior design project management software.",
  alternates: { canonical: "https://focuspilot.io/knowledge" },
}

export default function KnowledgeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
