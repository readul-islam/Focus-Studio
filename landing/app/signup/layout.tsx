import type React from "react"
import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("authSignupPage.meta")
  return {
    title: t("title"),
    description: t("description"),
  }
}

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
