import type React from "react"
import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("authVerifyOtpPage.meta")
  return {
    title: t("title"),
    description: t("description"),
  }
}

export default function VerifyOtpLayout({ children }: { children: React.ReactNode }) {
  return children
}
