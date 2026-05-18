import type { Metadata } from "next"
import AIPlatformPage from "./ai-platform-page"

export const metadata: Metadata = {
  title: "AI for Interior Design Studios | Focuspilot",
  description:
    "AI built for design studios: daily brief, email routing, procurement assist, and proposals — connected to your projects. Human approval on every client-facing output.",
  alternates: { canonical: "https://focuspilot.io/platform/ai" },
  openGraph: {
    title: "AI for Interior Design Studios | Focuspilot",
    description:
      "Daily brief, smart inbox, procurement assist, and AI proposals — project context first, human approval always.",
    url: "https://focuspilot.io/platform/ai",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI for Interior Design Studios | Focuspilot",
    description:
      "AI built for design studios — inbox, procurement, and proposals tied to real project data.",
  },
}

export default function AIPage() {
  return <AIPlatformPage />
}
