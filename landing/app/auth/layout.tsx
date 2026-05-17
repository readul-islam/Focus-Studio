import type { ReactNode } from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Authentication | Focuspilot",
  description: "Sign in or create your Focuspilot account",
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
