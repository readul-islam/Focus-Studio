"use client"

import { useMemo } from "react"
import { useTranslations } from "next-intl"
import { generateBreadcrumbSchema } from "@/lib/seo-schemas"

interface BreadcrumbItem {
  name: string
  url: string
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[]
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = generateBreadcrumbSchema(items)

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
}

const BASE_URL = "https://focuspilot.io"

export type PlatformBreadcrumbKey =
  | "projects"
  | "finance"
  | "crm"
  | "clientPortal"
  | "procurement"
  | "ai"
  | "aiEmail"
  | "approvals"
  | "library"
  | "aiProcurement"
  | "invoicing"

const PLATFORM_PAGE_CONFIG: Record<
  PlatformBreadcrumbKey,
  { path: string; labelKey: string; isFeature?: boolean }
> = {
  projects: { path: "/platform/projects", labelKey: "projects" },
  finance: { path: "/platform/finance", labelKey: "finance" },
  crm: { path: "/platform/crm", labelKey: "crm" },
  clientPortal: { path: "/platform/client-portal", labelKey: "clientPortal" },
  procurement: { path: "/platform/procurement", labelKey: "procurement" },
  ai: { path: "/platform/ai", labelKey: "ai" },
  aiEmail: { path: "/platform/features/ai-email", labelKey: "aiEmail", isFeature: true },
  approvals: { path: "/platform/features/approvals", labelKey: "approvals", isFeature: true },
  library: { path: "/platform/features/library", labelKey: "library", isFeature: true },
  aiProcurement: { path: "/platform/features/ai-procurement", labelKey: "aiProcurement", isFeature: true },
  invoicing: { path: "/platform/features/invoicing", labelKey: "invoicing", isFeature: true },
}

export function usePlatformBreadcrumbs(key: PlatformBreadcrumbKey): BreadcrumbItem[] {
  const t = useTranslations("platformShared.breadcrumb")
  const config = PLATFORM_PAGE_CONFIG[key]

  return useMemo(() => {
    const items: BreadcrumbItem[] = [
      { name: t("home"), url: BASE_URL },
      { name: t("platform"), url: `${BASE_URL}/platform` },
    ]

    if (config.isFeature) {
      items.push({ name: t("features"), url: `${BASE_URL}/platform/features` })
    }

    items.push({
      name: t(config.labelKey),
      url: `${BASE_URL}${config.path}`,
    })

    return items
  }, [config.isFeature, config.labelKey, config.path, t])
}

/** @deprecated Use usePlatformBreadcrumbs hook for locale-aware labels */
export const platformBreadcrumbs = {
  projects: [
    { name: "Home", url: BASE_URL },
    { name: "Platform", url: `${BASE_URL}/platform` },
    { name: "Projects", url: `${BASE_URL}/platform/projects` },
  ],
  finance: [
    { name: "Home", url: BASE_URL },
    { name: "Platform", url: `${BASE_URL}/platform` },
    { name: "Finance", url: `${BASE_URL}/platform/finance` },
  ],
  crm: [
    { name: "Home", url: BASE_URL },
    { name: "Platform", url: `${BASE_URL}/platform` },
    { name: "CRM", url: `${BASE_URL}/platform/crm` },
  ],
  clientPortal: [
    { name: "Home", url: BASE_URL },
    { name: "Platform", url: `${BASE_URL}/platform` },
    { name: "Client Portal", url: `${BASE_URL}/platform/client-portal` },
  ],
  procurement: [
    { name: "Home", url: BASE_URL },
    { name: "Platform", url: `${BASE_URL}/platform` },
    { name: "Procurement", url: `${BASE_URL}/platform/procurement` },
  ],
  ai: [
    { name: "Home", url: BASE_URL },
    { name: "Platform", url: `${BASE_URL}/platform` },
    { name: "AI", url: `${BASE_URL}/platform/ai` },
  ],
  aiEmail: [
    { name: "Home", url: BASE_URL },
    { name: "Platform", url: `${BASE_URL}/platform` },
    { name: "Features", url: `${BASE_URL}/platform/features` },
    { name: "AI Email", url: `${BASE_URL}/platform/features/ai-email` },
  ],
  approvals: [
    { name: "Home", url: BASE_URL },
    { name: "Platform", url: `${BASE_URL}/platform` },
    { name: "Features", url: `${BASE_URL}/platform/features` },
    { name: "Approvals", url: `${BASE_URL}/platform/features/approvals` },
  ],
  library: [
    { name: "Home", url: BASE_URL },
    { name: "Platform", url: `${BASE_URL}/platform` },
    { name: "Features", url: `${BASE_URL}/platform/features` },
    { name: "Product Library", url: `${BASE_URL}/platform/features/library` },
  ],
  aiProcurement: [
    { name: "Home", url: BASE_URL },
    { name: "Platform", url: `${BASE_URL}/platform` },
    { name: "Features", url: `${BASE_URL}/platform/features` },
    { name: "AI Procurement", url: `${BASE_URL}/platform/features/ai-procurement` },
  ],
  invoicing: [
    { name: "Home", url: BASE_URL },
    { name: "Platform", url: `${BASE_URL}/platform` },
    { name: "Features", url: `${BASE_URL}/platform/features` },
    { name: "Invoicing", url: `${BASE_URL}/platform/features/invoicing` },
  ],
}
