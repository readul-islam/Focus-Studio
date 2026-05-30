"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { CtaButton } from "@/components/cta-button"
import { LanguageSwitcher } from "@/components/language-switcher"
import { MegaNavPlatform } from "@/components/navigation/mega-nav"
import { ResourcesMenu } from "@/components/navigation/resources-menu"
import { useShowHeaderCta } from "@/hooks/use-show-header-cta"
import { useIsMobile } from "@/hooks/use-mobile"
import { useTranslations } from "next-intl"
import * as React from "react"
import * as LucideReact from "lucide-react"
import { AuthBrandMark } from "../auth/auth-brand-mark"

const container = "mx-auto max-w-[1200px] px-4 sm:px-6 md:px-8" // Reduced mobile padding from 6 to 4

export function SiteHeader({ showCta }: { showCta?: boolean }) {
  const t = useTranslations("siteHeader")
  const tm = useTranslations("siteHeader.mobile")
  // If a prop is not provided, compute automatically based on #overview visibility.
  const autoShow = useShowHeaderCta("overview", 0.2)
  const visible = typeof showCta === "boolean" ? showCta : autoShow

  const isMobile = useIsMobile()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  React.useEffect(() => {
    if (!isMobile && mobileMenuOpen) {
      setMobileMenuOpen(false)
    }
  }, [isMobile, mobileMenuOpen])

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false)
      }
    }

    if (mobileMenuOpen) {
      document.addEventListener("keydown", handleEscape)
      // Prevent body scroll when menu is open
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = ""
    }
  }, [mobileMenuOpen])

  return (
    <>
      <header className="sticky top-0 z-60 border-b border-stone-200 bg-stone-50 backdrop-blur">
        <div className={cn(container, "flex items-center justify-between py-2.5 sm:py-3")}>
          {" "}
          {/* Reduced mobile padding */}
          <Link href="/" className="group flex items-center gap-2">
            {/* <span className="text-sm sm:text-base font-semibold tracking-tight">Focuspilot</span>{" "} */}
            {/* Fluid logo text */}
            <AuthBrandMark />
          </Link>
          {/* Desktop Navigation - unchanged */}
          <nav className="hidden items-center gap-6 text-sm md:flex" aria-label={t("primaryNavAria")}>
            <MegaNavPlatform />
            <Link href="/platform/ai" className="text-stone-700 hover:text-stone-900">
              {t("ai")}
            </Link>
            <ResourcesMenu />
          </nav>
          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              <LanguageSwitcher />
            </div>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg p-2 text-stone-700 hover:bg-stone-100 hover:text-stone-900 md:hidden"
              aria-expanded={mobileMenuOpen}
              aria-label={t("toggleMenu")}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <LucideReact.X className="h-6 w-6" /> : <LucideReact.Menu className="h-6 w-6" />}
            </button>

            <div className="hidden md:flex md:items-center md:gap-2">
              <CtaButton href="/login" variant="grey" label={t("login")} />
              <CtaButton href="/signup" variant="clay" label={t("startForFree")} />
            </div>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />

          {/* Mobile menu panel */}
          <div className="fixed inset-x-0 top-0 bg-white border-b border-stone-200 shadow-lg">
            {/* Header with close button */}
            <div className={cn(container, "flex items-center justify-between py-3 border-b border-stone-100")}>
              <Link href="/" className="group flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                <span className="font-semibold tracking-tight">Focuspilot</span>
              </Link>

              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg p-2 text-stone-700 hover:bg-stone-100"
                onClick={() => setMobileMenuOpen(false)}
                aria-label={t("closeMenu")}
              >
                <LucideReact.X className="h-6 w-6" />
              </button>
            </div>

            {/* Mobile navigation content */}
            <div className="px-6 py-6 space-y-6 max-h-[calc(100vh-80px)] overflow-y-auto">
              <div className="flex justify-end pb-2 border-b border-stone-100">
                <LanguageSwitcher />
              </div>
              {/* Platform section */}
              <div>
                <h3 className="text-lg font-semibold text-stone-900 mb-4">{tm("platform")}</h3>
                <div className="space-y-4">
                  <Link
                    href="/platform/ai"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LucideReact.Sparkles className="h-5 w-5 text-stone-600" />
                    <div>
                      <div className="font-medium text-stone-900">{tm("aiTitle")}</div>
                      <div className="text-sm text-stone-600">{tm("aiDesc")}</div>
                    </div>
                  </Link>

                  <Link
                    href="/platform/projects"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LucideReact.ClipboardList className="h-5 w-5 text-stone-600" />
                    <div>
                      <div className="font-medium text-stone-900">{tm("projectManagementTitle")}</div>
                      <div className="text-sm text-stone-600">{tm("projectManagementDesc")}</div>
                    </div>
                  </Link>

                  <Link
                    href="/platform/procurement"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LucideReact.ShoppingCart className="h-5 w-5 text-stone-600" />
                    <div>
                      <div className="font-medium text-stone-900">{tm("procurementTitle")}</div>
                      <div className="text-sm text-stone-600">{tm("procurementDesc")}</div>
                    </div>
                  </Link>

                  <Link
                    href="/platform/finance"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LucideReact.CreditCard className="h-5 w-5 text-stone-600" />
                    <div>
                      <div className="font-medium text-stone-900">{tm("financeTitle")}</div>
                      <div className="text-sm text-stone-600">{tm("financeDesc")}</div>
                    </div>
                  </Link>

                  <Link
                    href="/platform/client-portal"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LucideReact.Users className="h-5 w-5 text-stone-600" />
                    <div>
                      <div className="font-medium text-stone-900">{tm("clientPortalTitle")}</div>
                      <div className="text-sm text-stone-600">{tm("clientPortalDesc")}</div>
                    </div>
                  </Link>

                  <Link
                    href="/platform/crm"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LucideReact.Building2 className="h-5 w-5 text-stone-600" />
                    <div>
                      <div className="font-medium text-stone-900">{tm("crmTitle")}</div>
                      <div className="text-sm text-stone-600">{tm("crmDesc")}</div>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Key Features section */}
              <div>
                <h3 className="text-lg font-semibold text-stone-900 mb-4">{tm("keyFeatures")}</h3>
                <div className="space-y-4">
                  <Link
                    href="/platform/features/ai-email"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LucideReact.Mail className="h-5 w-5 text-stone-600" />
                    <div>
                      <div className="font-medium text-stone-900">{tm("communicationTitle")}</div>
                      <div className="text-sm text-stone-600">{tm("communicationDesc")}</div>
                    </div>
                  </Link>

                  <Link
                    href="/platform/features/approvals"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LucideReact.CheckCircle2 className="h-5 w-5 text-stone-600" />
                    <div>
                      <div className="font-medium text-stone-900">{tm("approvalsTitle")}</div>
                      <div className="text-sm text-stone-600">{tm("approvalsDesc")}</div>
                    </div>
                  </Link>

                  <Link
                    href="/platform/features/ai-procurement"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LucideReact.Sparkles className="h-5 w-5 text-stone-600" />
                    <div>
                      <div className="font-medium text-stone-900">{tm("aiProcurementTitle")}</div>
                      <div className="text-sm text-stone-600">{tm("aiProcurementDesc")}</div>
                    </div>
                  </Link>

                  <Link
                    href="/platform/features/library"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LucideReact.Library className="h-5 w-5 text-stone-600" />
                    <div>
                      <div className="font-medium text-stone-900">{tm("productLibraryTitle")}</div>
                      <div className="text-sm text-stone-600">{tm("productLibraryDesc")}</div>
                    </div>
                  </Link>

                  <Link
                    href="/platform/features/invoicing"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LucideReact.FileText className="h-5 w-5 text-stone-600" />
                    <div>
                      <div className="font-medium text-stone-900">{tm("proposalsInvoicesTitle")}</div>
                      <div className="text-sm text-stone-600">{tm("proposalsInvoicesDesc")}</div>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Resources section */}
              <div>
                <h3 className="text-lg font-semibold text-stone-900 mb-4">{tm("resources")}</h3>
                <div className="space-y-2">
                  <Link
                    href="/blog"
                    className="block p-3 rounded-lg hover:bg-stone-50 text-stone-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {tm("blog")}
                  </Link>
                  <Link
                    href="/knowledge"
                    className="block p-3 rounded-lg hover:bg-stone-50 text-stone-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {tm("knowledgeCentre")}
                  </Link>
                  <Link
                    href="/resources/templates"
                    className="block p-3 rounded-lg hover:bg-stone-50 text-stone-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {tm("templates")}
                  </Link>
                  <Link
                    href="/resources/ai-playbook"
                    className="block p-3 rounded-lg hover:bg-stone-50 text-stone-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {tm("aiPlaybook")}
                  </Link>
                  <Link
                    href="/contact"
                    className="block p-3 rounded-lg hover:bg-stone-50 text-stone-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {tm("contact")}
                  </Link>
                </div>
              </div>

              {/* Mobile CTA buttons */}
              <div className="pt-4 border-t border-stone-200 space-y-3">
                <CtaButton href="/login" variant="grey" label={t("login")} className="w-full justify-center" />
                <CtaButton href="/signup" variant="clay" label={t("startForFree")} className="w-full justify-center" />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
