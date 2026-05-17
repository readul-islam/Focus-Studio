import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign Up - Techstyles",
  description: "Create your Techstyles account and transform your design studio workflow with AI-powered tools.",
}

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
