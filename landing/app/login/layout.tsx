import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Login | Focuspilot",
  description: "Sign in to your Focuspilot account and access your design studio management tools.",
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
