import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { ContactPageContent } from "@/components/pages/contact-page-content"
import { localeHreflangAlternates } from "@/lib/seo-alternates"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("contactPage.meta")
  return {
    title: t("title"),
    description: t("description"),
    alternates: localeHreflangAlternates("contact"),
  }
}

export default function ContactPage() {
  return <ContactPageContent />
}
