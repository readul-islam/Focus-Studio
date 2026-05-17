import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Free Templates for Interior Design Studios | Focuspilot",
  description:
    "Download free proposal, contract, FF&E, and invoice templates for interior design studios. Use in Focuspilot with automation and AI.",
  alternates: { canonical: "https://focuspilot.io/resources/templates" },
}

export default function ResourcesTemplatesLayout({ children }: { children: React.ReactNode }) {
  return children
}
