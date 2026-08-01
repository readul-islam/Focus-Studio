"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Facebook, Twitter, Linkedin, Instagram } from "lucide-react"

const container = "mx-auto max-w-[1200px] px-6 sm:px-8"

export function SiteFooter() {
  return (
    <footer className="border-t bg-white">
      <div className={cn(container, "grid grid-cols-1 gap-8 py-10 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6")}>
        {/* Brand */}
        <div className="space-y-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-semibold">Focuspilot</span>
          </Link>
          <p className="text-sm text-stone-600">Calm, premium tools for interior design studios & architects.</p>
        </div>

        {/* Platform */}
        <div>
          <div className="font-medium">Platform</div>
          <ul className="mt-3 space-y-2 text-sm text-stone-600">
            <li>
              <Link href="/platform/projects" className="hover:text-stone-900">
                Project Management
              </Link>
            </li>
            <li>
              <Link href="/platform/procurement" className="hover:text-stone-900">
                Procurement & FF&E
              </Link>
            </li>
            <li>
              <Link href="/platform/client-portal" className="hover:text-stone-900">
                Client Portal
              </Link>
            </li>
            <li>
              <Link href="/platform/contractor-portal" className="hover:text-stone-900">
                Contractor Portal
              </Link>
            </li>
            <li>
              <Link href="/platform/finance" className="hover:text-stone-900">
                Finance & Invoicing
              </Link>
            </li>
            <li>
              <Link href="/platform/crm" className="hover:text-stone-900">
                CRM & Pipeline
              </Link>
            </li>
            <li>
              <Link href="/platform/ai" className="hover:text-stone-900">
                AI Features
              </Link>
            </li>
          </ul>
        </div>

        {/* Compare */}
        <div>
          <div className="font-medium">Compare</div>
          <ul className="mt-3 space-y-2 text-sm text-stone-600">
            <li>
              <Link href="/compare/houzz-pro" className="hover:text-stone-900">
                vs Houzz Pro
              </Link>
            </li>
            <li>
              <Link href="/compare/programa" className="hover:text-stone-900">
                vs Programa
              </Link>
            </li>
            <li>
              <Link href="/compare/studio-designer" className="hover:text-stone-900">
                vs Studio Designer
              </Link>
            </li>
            <li>
              <Link href="/compare/designfiles" className="hover:text-stone-900">
                vs DesignFiles
              </Link>
            </li>
            <li>
              <Link href="/compare" className="hover:text-stone-900">
                All Comparisons
              </Link>
            </li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <div className="font-medium">Resources</div>
          <ul className="mt-3 space-y-2 text-sm text-stone-600">
            <li>
              <Link href="/blog" className="hover:text-stone-900">
                Blog
              </Link>
            </li>
            <li>
              <Link href="/knowledge" className="hover:text-stone-900">
                Knowledge Centre
              </Link>
            </li>
            <li>
              <Link href="/customers" className="hover:text-stone-900">
                Customer Stories
              </Link>
            </li>
            <li>
              <Link href="/changelog" className="hover:text-stone-900">
                Changelog
              </Link>
            </li>
            <li>
              <Link href="/resources/templates" className="hover:text-stone-900">
                Templates
              </Link>
            </li>
            <li>
              <Link href="/resources/ai-playbook" className="hover:text-stone-900">
                AI Playbook
              </Link>
            </li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <div className="font-medium">Company</div>
          <ul className="mt-3 space-y-2 text-sm text-stone-600">
            <li>
              <Link href="/about" className="hover:text-stone-900">
                About
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="hover:text-stone-900">
                Pricing
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-stone-900">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/sale" className="font-semibold text-amber-800 hover:text-amber-900 inline-flex items-center gap-1">
                <span>Domain & Brand Sale</span>
                <span className="text-[9px] bg-amber-200 text-amber-900 px-1 py-0.2 rounded font-mono uppercase">Sedo</span>
              </Link>
            </li>
            <li>
              <Link href="/careers" className="hover:text-stone-900">
                Careers
              </Link>
            </li>
            <li>
              <Link href="/integrations" className="hover:text-stone-900">
                Integrations
              </Link>
            </li>
          </ul>
        </div>

        {/* Newsletter & Social */}
        <div>
          <div className="font-medium">Stay in the loop</div>
          <div className="mt-3">
            <Input
              name="footer-email"
              type="email"
              placeholder="Enter your email"
              aria-label="Enter your email"
              className="h-12 w-full rounded-lg bg-white text-stone-900 placeholder:text-stone-500 border-stone-200 focus-visible:border-stone-300"
            />
          </div>
          <div className="mt-4 flex gap-3">
            <a
              href=""
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow Focuspilot on Facebook"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-900 ring-1 ring-stone-200 hover:bg-stone-200"
            >
              <Facebook className="h-5 w-5" aria-hidden="true" />
            </a>
            <a
              href=""
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow Focuspilot on Twitter"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-900 ring-1 ring-stone-200 hover:bg-stone-200"
            >
              <Twitter className="h-5 w-5" aria-hidden="true" />
            </a>
            <a
              href=""
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow Focuspilot on LinkedIn"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-900 ring-1 ring-stone-200 hover:bg-stone-200"
            >
              <Linkedin className="h-5 w-5" aria-hidden="true" />
            </a>
            <a
              href=""
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow Focuspilot on Instagram"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-900 ring-1 ring-stone-200 hover:bg-stone-200"
            >
              <Instagram className="h-5 w-5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t py-4">
        <div className={cn(container, "flex items-center justify-between text-xs text-stone-500")}>
          <div>&copy; {new Date().getFullYear()} Focuspilot. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-stone-900">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-stone-900">
              Terms of Use
            </Link>
            <Link href="/sitemap.xml" className="hover:text-stone-900">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
