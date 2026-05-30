import type { ReactNode } from "react"
import { NextIntlClientProvider } from "next-intl"
import { getLocale, getMessages } from "next-intl/server"
import { loadBlogSummaries } from "@/lib/blog-messages"

export default async function BlogLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale()
  const baseMessages = await getMessages()
  const blogSummaries = loadBlogSummaries(locale)

  return (
    <NextIntlClientProvider locale={locale} messages={{ ...baseMessages, ...blogSummaries }}>
      {children}
    </NextIntlClientProvider>
  )
}
