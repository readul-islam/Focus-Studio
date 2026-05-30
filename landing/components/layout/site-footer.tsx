"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Facebook, Twitter, Linkedin, Instagram } from "lucide-react"

const container = "mx-auto max-w-[1200px] px-6 sm:px-8"

export function SiteFooter() {
  const t = useTranslations("siteFooter")
  const year = new Date().getFullYear()

  return (
    <footer className="border-t bg-white">
      <div className={cn(container, "grid grid-cols-1 gap-8 py-10 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6")}>
        <div className="space-y-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-semibold">Focuspilot</span>
          </Link>
          <p className="text-sm text-stone-600">{t("tagline")}</p>
        </div>

        <div>
          <div className="font-medium">{t("platform")}</div>
          <ul className="mt-3 space-y-2 text-sm text-stone-600">
            <li><Link href="/platform/projects" className="hover:text-stone-900">{t("links.projectManagement")}</Link></li>
            <li><Link href="/platform/procurement" className="hover:text-stone-900">{t("links.procurementFfe")}</Link></li>
            <li><Link href="/platform/client-portal" className="hover:text-stone-900">{t("links.clientPortal")}</Link></li>
            <li><Link href="/platform/contractor-portal" className="hover:text-stone-900">{t("links.contractorPortal")}</Link></li>
            <li><Link href="/platform/finance" className="hover:text-stone-900">{t("links.financeInvoicing")}</Link></li>
            <li><Link href="/platform/crm" className="hover:text-stone-900">{t("links.crmPipeline")}</Link></li>
            <li><Link href="/platform/ai" className="hover:text-stone-900">{t("links.aiFeatures")}</Link></li>
          </ul>
        </div>

        <div>
          <div className="font-medium">{t("compare")}</div>
          <ul className="mt-3 space-y-2 text-sm text-stone-600">
            <li><Link href="/compare/houzz-pro" className="hover:text-stone-900">{t("links.vsHouzzPro")}</Link></li>
            <li><Link href="/compare/programa" className="hover:text-stone-900">{t("links.vsPrograma")}</Link></li>
            <li><Link href="/compare/studio-designer" className="hover:text-stone-900">{t("links.vsStudioDesigner")}</Link></li>
            <li><Link href="/compare/designfiles" className="hover:text-stone-900">{t("links.vsDesignFiles")}</Link></li>
            <li><Link href="/compare" className="hover:text-stone-900">{t("links.allComparisons")}</Link></li>
          </ul>
        </div>

        <div>
          <div className="font-medium">{t("resources")}</div>
          <ul className="mt-3 space-y-2 text-sm text-stone-600">
            <li><Link href="/blog" className="hover:text-stone-900">{t("links.blog")}</Link></li>
            <li><Link href="/knowledge" className="hover:text-stone-900">{t("links.knowledgeCentre")}</Link></li>
            <li><Link href="/customers" className="hover:text-stone-900">{t("links.customerStories")}</Link></li>
            <li><Link href="/changelog" className="hover:text-stone-900">{t("links.changelog")}</Link></li>
            <li><Link href="/resources/templates" className="hover:text-stone-900">{t("links.templates")}</Link></li>
            <li><Link href="/resources/ai-playbook" className="hover:text-stone-900">{t("links.aiPlaybook")}</Link></li>
          </ul>
        </div>

        <div>
          <div className="font-medium">{t("company")}</div>
          <ul className="mt-3 space-y-2 text-sm text-stone-600">
            <li><Link href="/about" className="hover:text-stone-900">{t("links.about")}</Link></li>
            <li><Link href="/pricing" className="hover:text-stone-900">{t("links.pricing")}</Link></li>
            <li><Link href="/contact" className="hover:text-stone-900">{t("links.contact")}</Link></li>
            <li><Link href="/careers" className="hover:text-stone-900">{t("links.careers")}</Link></li>
            <li><Link href="/integrations" className="hover:text-stone-900">{t("links.integrations")}</Link></li>
          </ul>
        </div>

        <div>
          <div className="font-medium">{t("stayInLoop")}</div>
          <div className="mt-3">
            <Input
              name="footer-email"
              type="email"
              placeholder={t("emailPlaceholder")}
              aria-label={t("emailAria")}
              className="h-12 w-full rounded-lg bg-white text-stone-900 placeholder:text-stone-500 border-stone-200 focus-visible:border-stone-300"
            />
          </div>
          <div className="mt-4 flex gap-3">
            <a href="" target="_blank" rel="noopener noreferrer" aria-label={t("social.facebook")} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-900 ring-1 ring-stone-200 hover:bg-stone-200">
              <Facebook className="h-5 w-5" aria-hidden="true" />
            </a>
            <a href="" target="_blank" rel="noopener noreferrer" aria-label={t("social.twitter")} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-900 ring-1 ring-stone-200 hover:bg-stone-200">
              <Twitter className="h-5 w-5" aria-hidden="true" />
            </a>
            <a href="" target="_blank" rel="noopener noreferrer" aria-label={t("social.linkedin")} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-900 ring-1 ring-stone-200 hover:bg-stone-200">
              <Linkedin className="h-5 w-5" aria-hidden="true" />
            </a>
            <a href="" target="_blank" rel="noopener noreferrer" aria-label={t("social.instagram")} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-900 ring-1 ring-stone-200 hover:bg-stone-200">
              <Instagram className="h-5 w-5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t py-4">
        <div className={cn(container, "flex items-center justify-between text-xs text-stone-500")}>
          <div>{t("copyright", { year })}</div>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-stone-900">{t("privacyPolicy")}</Link>
            <Link href="/terms" className="hover:text-stone-900">{t("termsOfUse")}</Link>
            <Link href="/sitemap.xml" className="hover:text-stone-900">{t("sitemap")}</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
