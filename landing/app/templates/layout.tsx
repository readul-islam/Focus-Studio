import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Free Templates for Interior Designers | Techstyles",
  description: "Download free templates for interior design projects: proposals, contracts, project briefs, and more. Professionally designed and ready to use.",
  alternates: { canonical: "https://techstyles.ai/templates" },
}

export default function TemplatesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
