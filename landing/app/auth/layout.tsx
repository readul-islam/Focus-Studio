import type { ReactNode } from "react"
import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("authLayout.meta")
  return {
    title: t("title"),
    description: t("description"),
  }
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
