"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { CtaButton } from "@/components/cta-button"
import { MegaNavPlatform } from "@/components/navigation/mega-nav"
import { ResourcesMenu } from "@/components/navigation/resources-menu"
import { SaleBanner } from "@/components/layout/sale-banner"
import { useShowHeaderCta } from "@/hooks/use-show-header-cta"
import { useIsMobile } from "@/hooks/use-mobile"
import * as React from "react"
import * as LucideReact from "lucide-react"
import { AuthBrandMark } from "../auth/auth-brand-mark"

const container = "mx-auto max-w-[1200px] px-4 sm:px-6 md:px-8" // Reduced mobile padding from 6 to 4

export function SiteHeader({ showCta }: { showCta?: boolean }) {
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
      <SaleBanner />
      <header className="sticky top-0 z-60 border-b border-stone-200 bg-stone-50 backdrop-blur">
        <div className={cn(container, "flex items-center justify-between py-2.5 sm:py-3")}>
          {" "}
          {/* Reduced mobile padding */}
          <Link href="/" className="group flex items-center gap-2">
            {/* <span className="text-sm sm:text-base font-semibold tracking-tight">Focuspilot</span>{" "} */}
            {/* Fluid logo text */}
            <AuthBrandMark />
          </Link>
          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 text-sm md:flex" aria-label="Primary">
            <MegaNavPlatform />
            <Link href="/platform/ai" className="text-stone-700 hover:text-stone-900 font-medium">
              AI
            </Link>
            <ResourcesMenu />
            <Link
              href="/sale"
              className="inline-flex items-center gap-1.5 font-semibold text-amber-900 bg-gradient-to-r from-amber-200 to-amber-100 hover:from-amber-300 hover:to-amber-200 px-3 py-1 rounded-full text-xs border border-amber-300 shadow-xs transition-all hover:scale-[1.02]"
            >
              <LucideReact.Tag className="h-3 w-3 text-amber-700" />
              <span>Asset Sale</span>
              <span className="rounded bg-amber-800 text-[10px] text-amber-100 px-1 py-0.2 font-mono uppercase font-bold">SEDO</span>
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg p-2 text-stone-700 hover:bg-stone-100 hover:text-stone-900 md:hidden"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <LucideReact.X className="h-6 w-6" /> : <LucideReact.Menu className="h-6 w-6" />}
            </button>

            <div className="hidden md:flex md:items-center md:gap-2">
              <CtaButton href="/login" variant="grey" label="Login" />
              <CtaButton href="/signup" variant="clay" label="Start for free" />
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
                aria-label="Close navigation menu"
              >
                <LucideReact.X className="h-6 w-6" />
              </button>
            </div>

            {/* Mobile navigation content */}
            <div className="px-6 py-6 space-y-6 max-h-[calc(100vh-80px)] overflow-y-auto">
              {/* Asset Sale Highlight */}
              <Link
                href="/sale"
                className="flex items-center gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="rounded-lg bg-amber-500/20 p-2 text-amber-700">
                  <LucideReact.Tag className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold flex items-center gap-2">
                    <span>Domain & Assets For Sale</span>
                    <span className="text-[10px] bg-amber-800 text-amber-100 px-1.5 py-0.5 rounded font-mono">SEDO</span>
                  </div>
                  <div className="text-xs text-amber-800/80">Domain, Codebase, LinkedIn & Facebook Pages</div>
                </div>
              </Link>

              {/* Platform section */}
              <div>
                <h3 className="text-lg font-semibold text-stone-900 mb-4">Platform</h3>
                <div className="space-y-4">
                  <Link
                    href="/platform/ai"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LucideReact.Sparkles className="h-5 w-5 text-stone-600" />
                    <div>
                      <div className="font-medium text-stone-900">AI</div>
                      <div className="text-sm text-stone-600">Intelligent automation</div>
                    </div>
                  </Link>

                  <Link
                    href="/platform/projects"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LucideReact.ClipboardList className="h-5 w-5 text-stone-600" />
                    <div>
                      <div className="font-medium text-stone-900">Project management</div>
                      <div className="text-sm text-stone-600">Phases, tasks, timelines</div>
                    </div>
                  </Link>

                  <Link
                    href="/platform/procurement"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LucideReact.ShoppingCart className="h-5 w-5 text-stone-600" />
                    <div>
                      <div className="font-medium text-stone-900">Procurement</div>
                      <div className="text-sm text-stone-600">Sourcing, POs, tracking</div>
                    </div>
                  </Link>

                  <Link
                    href="/platform/finance"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LucideReact.CreditCard className="h-5 w-5 text-stone-600" />
                    <div>
                      <div className="font-medium text-stone-900">Finance</div>
                      <div className="text-sm text-stone-600">Proposals, invoices, payments</div>
                    </div>
                  </Link>

                  <Link
                    href="/platform/client-portal"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LucideReact.Users className="h-5 w-5 text-stone-600" />
                    <div>
                      <div className="font-medium text-stone-900">Client portal</div>
                      <div className="text-sm text-stone-600">Approvals, files, messaging</div>
                    </div>
                  </Link>

                  <Link
                    href="/platform/crm"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LucideReact.Building2 className="h-5 w-5 text-stone-600" />
                    <div>
                      <div className="font-medium text-stone-900">CRM</div>
                      <div className="text-sm text-stone-600">Lead → project pipeline</div>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Key Features section */}
              <div>
                <h3 className="text-lg font-semibold text-stone-900 mb-4">Key Features</h3>
                <div className="space-y-4">
                  <Link
                    href="/platform/features/ai-email"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LucideReact.Mail className="h-5 w-5 text-stone-600" />
                    <div>
                      <div className="font-medium text-stone-900">Communication</div>
                      <div className="text-sm text-stone-600">Unified inbox with project routing</div>
                    </div>
                  </Link>

                  <Link
                    href="/platform/features/approvals"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LucideReact.CheckCircle2 className="h-5 w-5 text-stone-600" />
                    <div>
                      <div className="font-medium text-stone-900">Approvals</div>
                      <div className="text-sm text-stone-600">Client sign-off and decision tracking</div>
                    </div>
                  </Link>

                  <Link
                    href="/platform/features/ai-procurement"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LucideReact.Sparkles className="h-5 w-5 text-stone-600" />
                    <div>
                      <div className="font-medium text-stone-900">AI Product Procurement</div>
                      <div className="text-sm text-stone-600">Web clipper with instant AI extraction</div>
                    </div>
                  </Link>

                  <Link
                    href="/platform/features/library"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LucideReact.Library className="h-5 w-5 text-stone-600" />
                    <div>
                      <div className="font-medium text-stone-900">Product Library</div>
                      <div className="text-sm text-stone-600">Centralized product database with AI sourcing</div>
                    </div>
                  </Link>

                  <Link
                    href="/platform/features/invoicing"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LucideReact.FileText className="h-5 w-5 text-stone-600" />
                    <div>
                      <div className="font-medium text-stone-900">Proposals & invoices</div>
                      <div className="text-sm text-stone-600">AI proposals and automated billing</div>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Resources section */}
              <div>
                <h3 className="text-lg font-semibold text-stone-900 mb-4">Resources</h3>
                <div className="space-y-2">
                  <Link
                    href="/blog"
                    className="block p-3 rounded-lg hover:bg-stone-50 text-stone-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Blog
                  </Link>
                  <Link
                    href="/knowledge"
                    className="block p-3 rounded-lg hover:bg-stone-50 text-stone-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Knowledge Centre
                  </Link>
                  <Link
                    href="/resources/templates"
                    className="block p-3 rounded-lg hover:bg-stone-50 text-stone-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Templates
                  </Link>
                  <Link
                    href="/resources/ai-playbook"
                    className="block p-3 rounded-lg hover:bg-stone-50 text-stone-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    AI Playbook
                  </Link>
                  <Link
                    href="/contact"
                    className="block p-3 rounded-lg hover:bg-stone-50 text-stone-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Contact
                  </Link>
                </div>
              </div>

              {/* Mobile CTA buttons */}
              <div className="pt-4 border-t border-stone-200 space-y-3">
                <CtaButton href="/login" variant="grey" label="Login" className="w-full justify-center" />
                <CtaButton href="/signup" variant="clay" label="Start for free" className="w-full justify-center" />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
