import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AI Playbook for Interior Design Studios | Focuspilot",
  description:
    "Practical AI workflows for interior design studios: email, procurement, proposals, and governance. Prompts and guardrails you can use today.",
  alternates: { canonical: "https://focuspilot.io/resources/ai-playbook" },
}

export default function AiPlaybookLayout({ children }: { children: React.ReactNode }) {
  return children
}
