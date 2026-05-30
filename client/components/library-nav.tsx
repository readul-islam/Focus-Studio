"use client"

import { usePathname } from "next/navigation"
import { NavPills } from "@/components/shared/nav-pills"
import { useTranslations } from "next-intl"

/**
 * Library nav — order and routes preserved.
 * Only styling is unified to exactly match Projects.
 */
export function LibraryNav() {
  const pathname = usePathname()
  const t = useTranslations("libraryNav")

  const items = [
    { label: t("products"), href: "/library/products" },
    { label: t("materials"), href: "/library/materials" },
  ]

  return <NavPills id="library-nav" items={items} activeHref={pathname} />
}
