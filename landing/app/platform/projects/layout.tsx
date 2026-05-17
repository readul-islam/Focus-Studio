import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Interior Design Project Management Software | Track Projects | Focuspilot",
  description:
    "Manage interior design projects from concept to completion. Track timelines, budgets, tasks & team collaboration. Purpose-built for UK design studios. Start free.",
  keywords: [
    "interior design project management",
    "design project tracking",
    "interior design workflow",
    "design studio project software",
    "project management for designers",
    "interior design timeline management",
  ],
  openGraph: {
    title: "Interior Design Project Management Software | Track Projects | Focuspilot",
    description:
      "Manage interior design projects from concept to completion. Track timelines, budgets, tasks & team collaboration. Purpose-built for UK design studios. Start free.",
    url: "https://focuspilot.io/platform/projects",
    type: "website",
    images: [
      {
        url: "/images/og-projects.png",
        width: 1200,
        height: 630,
        alt: "Focuspilot project management dashboard for interior designers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Interior Design Project Management Software | Track Projects | Focuspilot",
    description: "Manage interior design projects from concept to completion. Track timelines, budgets, tasks & team collaboration. Purpose-built for UK design studios.",
  },
  alternates: {
    canonical: "https://focuspilot.io/platform/projects",
  },
}

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return children
}
