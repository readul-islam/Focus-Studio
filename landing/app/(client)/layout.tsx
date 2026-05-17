"use client"

import type { ReactNode } from "react"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { usePathname } from "next/navigation"

export function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isAuthPage =
    pathname?.startsWith("/signup") ||
    pathname?.startsWith("/auth/signup") ||
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/auth/login")

  return (
    <>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://blob.v0.dev" />
        <link rel="dns-prefetch" href="https://hebbkx1anhila5yf.public.blob.vercel-storage.com" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="color-scheme" content="light" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Force scroll to top on page load
              if ('scrollRestoration' in history) {
                history.scrollRestoration = 'manual';
              }
              window.addEventListener('beforeunload', () => {
                window.scrollTo(0, 0);
              });
            `,
          }}
        />
      </head>
      {!isAuthPage && <SiteHeader />}
      <main>{children}</main>
      {!isAuthPage && <SiteFooter />}
    </>
  )
}
