"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"

export function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  const isAuthPage =
    pathname?.startsWith("/signup") ||
    pathname?.startsWith("/auth/") ||
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/forgot-password") ||
    pathname?.startsWith("/verify-otp")

  return (
    <>
      {!isAuthPage && <SiteHeader />}
      <main>{children}</main>
      {!isAuthPage && <SiteFooter />}
    </>
  )
}
