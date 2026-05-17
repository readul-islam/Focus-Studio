import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Changelog | What's New in Techstyles",
  description: "See the latest updates, features, and improvements to Techstyles. We ship weekly to make your interior design workflow better.",
  alternates: { canonical: "https://focuspilot.io/changelog" },
}

export default function ChangelogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
