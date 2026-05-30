import type React from "react"
import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("authForgotPasswordPage.meta")
  return {
    title: t("title"),
    description: t("description"),
  }
}

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children
}
