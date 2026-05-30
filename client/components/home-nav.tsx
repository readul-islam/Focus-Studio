"use client"

import { usePathname } from "next/navigation"
import { NavPills } from "@/components/shared/nav-pills"
import { useTranslations } from "next-intl"

// Global Home section nav — uses the shared NavPills so spacing, fonts, and
// active styles are identical across all Home pages and do not "move" per tab.
export function HomeNav() {
  const pathname = usePathname()
  const t = useTranslations("homeNav")

  const items = [
    { label: t("tasks"), href: "/home/tasks" },
    { label: t("inbox"), href: "/home/inbox" },
    { label: t("calendar"), href: "/home/calendar" },
    { label: t("timeTracking"), href: "/home/time" },
  ]

  return <NavPills id="home-nav" items={items} activeHref={pathname} />
}
