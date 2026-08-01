import type { MetadataRoute } from "next"
import { getAllPosts } from "@/lib/blog-data"
import { studioTemplates } from "@/lib/resources-data"

const baseUrl = "https://focuspilot.io"

/** High-priority SEO blog articles. */
const HIGH_PRIORITY_BLOG_SLUGS = new Set([
  "definitive-guide-interior-design-project-management",
  "mastering-ffe-procurement-software-guide",
  "ai-interior-design-studio-procurement-client-approvals",
  "the-complete-focuspilot-brand-identity-guide-signage-cards-social",
  "why-focuspilot-is-the-ultimate-ai-studio-operating-system",
  "scaling-interior-design-practices-with-focuspilot",
  "best-interior-design-software-uk",
  "best-interior-design-software-us",
])

type RouteConfig = {
  path: string
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>
  priority: number
}

/** Marketing pages we want indexed (auth/dev routes live in robots disallow). */
const staticRoutes: RouteConfig[] = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "sale", changeFrequency: "weekly", priority: 0.95 },
  { path: "platform/projects", changeFrequency: "weekly", priority: 0.9 },
  { path: "platform/procurement", changeFrequency: "weekly", priority: 0.9 },
  { path: "platform/ai", changeFrequency: "weekly", priority: 0.9 },
  { path: "platform/finance", changeFrequency: "weekly", priority: 0.9 },
  { path: "platform/client-portal", changeFrequency: "weekly", priority: 0.9 },
  { path: "platform/crm", changeFrequency: "weekly", priority: 0.9 },
  { path: "platform/contractor-portal", changeFrequency: "monthly", priority: 0.7 },
  { path: "platform/features/library", changeFrequency: "monthly", priority: 0.7 },
  { path: "platform/features/ai-procurement", changeFrequency: "monthly", priority: 0.7 },
  { path: "platform/features/ai-email", changeFrequency: "monthly", priority: 0.7 },
  { path: "platform/features/approvals", changeFrequency: "monthly", priority: 0.7 },
  { path: "platform/features/invoicing", changeFrequency: "monthly", priority: 0.7 },
  { path: "pricing", changeFrequency: "monthly", priority: 0.8 },
  { path: "blog", changeFrequency: "weekly", priority: 0.8 },
  { path: "compare", changeFrequency: "monthly", priority: 0.6 },
  { path: "compare/programa", changeFrequency: "monthly", priority: 0.6 },
  { path: "compare/design-manager", changeFrequency: "monthly", priority: 0.6 },
  { path: "compare/houzz-pro", changeFrequency: "monthly", priority: 0.6 },
  { path: "compare/studio-designer", changeFrequency: "monthly", priority: 0.6 },
  { path: "compare/designfiles", changeFrequency: "monthly", priority: 0.6 },
  { path: "signup", changeFrequency: "monthly", priority: 0.5 },
  { path: "knowledge", changeFrequency: "weekly", priority: 0.5 },
  { path: "customers", changeFrequency: "monthly", priority: 0.5 },
  { path: "changelog", changeFrequency: "weekly", priority: 0.5 },
  { path: "resources/templates", changeFrequency: "monthly", priority: 0.5 },
  { path: "resources/ai-playbook", changeFrequency: "monthly", priority: 0.55 },
  { path: "integrations", changeFrequency: "monthly", priority: 0.5 },
  { path: "about", changeFrequency: "monthly", priority: 0.5 },
  { path: "contact", changeFrequency: "yearly", priority: 0.5 },
  { path: "careers", changeFrequency: "monthly", priority: 0.4 },
  { path: "privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "terms", changeFrequency: "yearly", priority: 0.3 },
]

function toUrl(path: string): string {
  return path ? `${baseUrl}/${path}` : baseUrl
}

export default function sitemap(): MetadataRoute.Sitemap {
  const builtAt = new Date()

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map(
    ({ path, changeFrequency, priority }) => ({
      url: toUrl(path),
      lastModified: builtAt,
      changeFrequency,
      priority,
    }),
  )

  const blogEntries: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: "weekly",
    priority: HIGH_PRIORITY_BLOG_SLUGS.has(post.slug) ? 0.85 : 0.65,
  }))

  const templateEntries: MetadataRoute.Sitemap = studioTemplates.map((template) => ({
    url: `${baseUrl}/resources/templates/${template.slug}`,
    lastModified: builtAt,
    changeFrequency: "monthly",
    priority: 0.5,
  }))

  return [...staticEntries, ...blogEntries, ...templateEntries]
}
