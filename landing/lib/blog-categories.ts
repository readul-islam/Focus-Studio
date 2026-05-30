"use client"

import { useTranslations } from "next-intl"
import { BLOG_CATEGORY_TABS, type BlogCategoryFilter, type BlogCategoryId } from "./blog-categories-base"

export type { BlogCategoryFilter, BlogCategoryId }
export { BLOG_CATEGORY_TABS, getCategoryLabel, isBlogCategoryFilter } from "./blog-categories-base"

export function useBlogCategoryTabs() {
  const t = useTranslations("blogCategories")
  return BLOG_CATEGORY_TABS.map((tab) => ({
    id: tab.id,
    label: tab.id === "all" ? t("all") : t(tab.id),
  }))
}

export function useCategoryLabel(id: BlogCategoryId): string {
  const t = useTranslations("blogCategories")
  return t(id)
}
