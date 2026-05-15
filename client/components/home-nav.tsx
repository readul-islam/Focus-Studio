"use client"

import { usePathname } from "next/navigation"
import { NavPills } from "@/components/shared/nav-pills"

// Global Home section nav — uses the shared NavPills so spacing, fonts, and
// active styles are identical across all Home pages and do not "move" per tab.
export function HomeNav() {
  const pathname = usePathname()

  const items = [
    { label: "Tasks", href: "/home/tasks" },
    { label: "Inbox", href: "/home/inbox" },
    { label: "Calendar", href: "/home/calendar" },
    { label: "Time Tracking", href: "/home/time" },
  ]

  return <NavPills id="home-nav" items={items} activeHref={pathname} />
}
