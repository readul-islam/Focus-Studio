import type { ReactNode } from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "@/app/globals.css"
import { ClientLayout } from "@/components/layout/client-layout"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-inter",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://techstyles.ai"),
  title: {
    default: "Interior Design Project Management Software UK | Techstyles",
    template: "%s",
  },
  description:
    "AI-powered project management for interior designers & architects. Manage projects, procurement, client approvals & invoicing in one workspace. Free 3-month trial.",
  keywords: [
    "interior design software",
    "design studio management",
    "project management for designers",
    "interior design CRM",
    "design procurement software",
    "client portal for designers",
    "architecture project management",
    "design studio workflow",
    "interior design business software",
    "design project collaboration",
  ],
  authors: [{ name: "Techstyles" }],
  creator: "Techstyles",
  publisher: "Techstyles",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://techstyles.ai",
    siteName: "Techstyles",
    title: "Interior Design Project Management Software UK | Techstyles",
    description:
      "AI-powered project management for interior designers & architects. Manage projects, procurement, client approvals & invoicing in one workspace. Free 3-month trial.",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Interior Design Project Management Software UK | Techstyles",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Interior Design Project Management Software UK | Techstyles",
    description:
      "AI-powered project management for interior designers & architects. Manage projects, procurement, client approvals & invoicing in one workspace. Free 3-month trial.",
    images: ["/images/twitter-image.png"],
    creator: "@techstyles",
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
  // verification: {
  //   google: "ADD_YOUR_GOOGLE_VERIFICATION_CODE",
  // },
  alternates: {
    canonical: "https://techstyles.ai",
  },
  category: "technology",
    generator: 'v0.app'
}

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://techstyles.ai/#organization",
  name: "Techstyles",
  url: "https://techstyles.ai",
  logo: {
    "@type": "ImageObject",
    url: "https://techstyles.ai/images/logo.png",
    width: 200,
    height: 60,
  },
  description: "The modern operating system for interior designers and architects.",
  foundingDate: "2024",
  sameAs: [
    "https://twitter.com/techstyles",
    "https://linkedin.com/company/techstyles",
    "https://instagram.com/techstyles",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    email: "hello@techstyles.com",
    availableLanguage: ["English"],
  },
}

const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": "https://techstyles.ai/#software",
  name: "Techstyles",
  applicationCategory: "BusinessApplication",
  applicationSubCategory: "Project Management Software",
  operatingSystem: "Web",
  description:
    "Interior design studio management software for project management, procurement, client collaboration, and finance.",
  url: "https://techstyles.ai",
  author: {
    "@id": "https://techstyles.ai/#organization",
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "GBP",
    description: "Free beta access available",
    availability: "https://schema.org/InStock",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    reviewCount: "127",
    bestRating: "5",
    worstRating: "1",
  },
  featureList: [
    "Project Management",
    "CRM for Design Studios",
    "AI-Powered Procurement",
    "Client Portal & Approvals",
    "Finance & Invoicing",
    "Product Library Management",
  ],
  screenshot: "https://techstyles.ai/images/og-image.png",
}

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://techstyles.ai/#website",
  name: "Techstyles",
  url: "https://techstyles.ai",
  publisher: {
    "@id": "https://techstyles.ai/#organization",
  },
  potentialAction: {
    "@type": "SearchAction",
    target: "https://techstyles.ai/blog?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://blob.v0.dev" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://hebbkx1anhila5yf.public.blob.vercel-storage.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://blob.v0.dev" />
        <link rel="dns-prefetch" href="https://hebbkx1anhila5yf.public.blob.vercel-storage.com" />
        
        {/* Google Analytics */}
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
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
