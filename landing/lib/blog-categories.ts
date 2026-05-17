export type BlogCategoryId = "workflow" | "studio-management" | "industry-trends" | "best-practices"

export type BlogCategoryFilter = "all" | BlogCategoryId

export const BLOG_CATEGORY_TABS: { id: BlogCategoryFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "workflow", label: "Workflow" },
  { id: "studio-management", label: "Studio Management" },
  { id: "industry-trends", label: "Industry Trends" },
  { id: "best-practices", label: "Best Practices" },
]

const LABELS: Record<BlogCategoryId, string> = {
  workflow: "Workflow",
  "studio-management": "Studio Management",
  "industry-trends": "Industry Trends",
  "best-practices": "Best Practices",
}

export function getCategoryLabel(id: BlogCategoryId): string {
  return LABELS[id]
}

export function isBlogCategoryFilter(value: string | null | undefined): value is BlogCategoryFilter {
  if (!value || value === "all") return value === "all"
  return value in LABELS
}
