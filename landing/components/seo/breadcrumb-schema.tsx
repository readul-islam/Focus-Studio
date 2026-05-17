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

// Pre-defined breadcrumb paths for platform pages
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
  // Feature pages
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
