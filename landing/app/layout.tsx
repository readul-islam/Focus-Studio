import type { ReactNode } from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { NextIntlClientProvider } from "next-intl"
import { getLocale, getMessages, getTranslations } from "next-intl/server"
import "@/app/globals.css"
import { ClientLayout } from "@/components/layout/client-layout"
import { localeHreflangAlternates } from "@/lib/seo-alternates"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-inter",
})

const SOFTWARE_FEATURE_KEYS = [
  "projectManagement",
  "crm",
  "procurement",
  "clientPortal",
  "finance",
  "library",
] as const

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = await getTranslations("siteMeta")
  const ogLocale = locale === "ja-JP" ? "ja_JP" : "en_US"

  return {
    metadataBase: new URL("https://focuspilot.io"),
    title: {
      default: t("title"),
      template: "%s",
    },
    description: t("description"),
    keywords: t.raw("keywords") as string[],
    authors: [{ name: "Focuspilot" }],
    creator: "Focuspilot",
    publisher: "Focuspilot",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      type: "website",
      locale: ogLocale,
      url: "https://focuspilot.io",
      siteName: "Focuspilot",
      title: t("title"),
      description: t("description"),
      images: [
        {
          url: "/images/og-image.png",
          width: 1200,
          height: 630,
          alt: t("ogImageAlt"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: ["/images/twitter-image.png"],
      creator: "@focuspilot",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: localeHreflangAlternates(),
    category: "technology",
  }
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale()
  const messages = await getMessages()
  const t = await getTranslations("siteMeta.jsonLd")

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://focuspilot.io/#organization",
    name: "Focuspilot",
    url: "https://focuspilot.io",
    logo: {
      "@type": "ImageObject",
      url: "https://focuspilot.io/images/logo.png",
      width: 200,
      height: 60,
    },
    description: t("organization.description"),
    foundingDate: "2024",
    sameAs: [
      "https://twitter.com/focuspilot",
      "https://linkedin.com/company/focuspilot",
      "https://instagram.com/focuspilot",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: t("organization.contactType"),
      email: "hello@focuspilot.io",
      availableLanguage: [t("organization.availableLanguage")],
    },
  }

  const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": "https://focuspilot.io/#software",
    name: "Focuspilot",
    applicationCategory: "BusinessApplication",
    applicationSubCategory: t("software.applicationSubCategory"),
    operatingSystem: "Web",
    description: t("software.description"),
    url: "https://focuspilot.io",
    author: {
      "@id": "https://focuspilot.io/#organization",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "GBP",
      description: t("software.offerDescription"),
      availability: "https://schema.org/InStock",
    },
    featureList: SOFTWARE_FEATURE_KEYS.map((key) => t(`software.features.${key}`)),
    screenshot: "https://focuspilot.io/images/og-image.png",
  }

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://focuspilot.io/#website",
    name: "Focuspilot",
    url: "https://focuspilot.io",
    publisher: {
      "@id": "https://focuspilot.io/#organization",
    },
    potentialAction: {
      "@type": "SearchAction",
      target: "https://focuspilot.io/blog?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  }

  return (
    <html lang={locale} className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://blob.v0.dev" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://hebbkx1anhila5yf.public.blob.vercel-storage.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://blob.v0.dev" />
        <link rel="dns-prefetch" href="https://hebbkx1anhila5yf.public.blob.vercel-storage.com" />

        <script async src="https://www.googletagmanager.com/gtag/js?id=G-3R3VTRBYJT"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-3R3VTRBYJT');
            `,
          }}
        />

        <meta name="theme-color" content="#ffffff" />
        <meta name="color-scheme" content="light" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([organizationSchema, softwareApplicationSchema, websiteSchema]),
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
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
      <body className={inter.className}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ClientLayout>{children}</ClientLayout>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
