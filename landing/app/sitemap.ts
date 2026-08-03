import type { MetadataRoute } from "next"
import { getAllPosts } from "@/lib/blog-data"
import { studioTemplates } from "@/lib/resources-data"

const baseUrl = "https://focuspilot.io"

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
  { path: "platform/contractor-portal", changeFrequency: "monthly", priority: 0.75 },
  { path: "platform/features/library", changeFrequency: "monthly", priority: 0.75 },
  { path: "platform/features/ai-procurement", changeFrequency: "monthly", priority: 0.75 },
  { path: "platform/features/ai-email", changeFrequency: "monthly", priority: 0.75 },
  { path: "platform/features/approvals", changeFrequency: "monthly", priority: 0.75 },
  { path: "platform/features/invoicing", changeFrequency: "monthly", priority: 0.75 },
  { path: "pricing", changeFrequency: "weekly", priority: 0.85 },
  { path: "blog", changeFrequency: "daily", priority: 0.9 },
  { path: "compare", changeFrequency: "weekly", priority: 0.8 },
  { path: "compare/programa", changeFrequency: "weekly", priority: 0.8 },
  { path: "compare/design-manager", changeFrequency: "weekly", priority: 0.8 },
  { path: "compare/houzz-pro", changeFrequency: "weekly", priority: 0.8 },
  { path: "compare/studio-designer", changeFrequency: "weekly", priority: 0.8 },
  { path: "compare/designfiles", changeFrequency: "weekly", priority: 0.8 },
  { path: "signup", changeFrequency: "monthly", priority: 0.5 },
  { path: "knowledge", changeFrequency: "weekly", priority: 0.7 },
  { path: "customers", changeFrequency: "weekly", priority: 0.7 },
  { path: "changelog", changeFrequency: "weekly", priority: 0.7 },
  { path: "resources/templates", changeFrequency: "weekly", priority: 0.85 },
  { path: "resources/ai-playbook", changeFrequency: "weekly", priority: 0.85 },
  { path: "integrations", changeFrequency: "monthly", priority: 0.6 },
  { path: "about", changeFrequency: "monthly", priority: 0.6 },
  { path: "contact", changeFrequency: "monthly", priority: 0.6 },
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
    priority: 0.85,
  }))

  const templateEntries: MetadataRoute.Sitemap = studioTemplates.map((template) => ({
    url: `${baseUrl}/resources/templates/${template.slug}`,
    lastModified: builtAt,
    changeFrequency: "weekly",
    priority: 0.85,
  }))

  return [...staticEntries, ...blogEntries, ...templateEntries]
}

