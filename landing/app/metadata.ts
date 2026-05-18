import type { Metadata } from "next"

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Focuspilot",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "Interior design studio management software for project management, procurement, client collaboration, and finance.",
  url: "https://focuspilot.io",
  author: {
    "@type": "Organization",
    name: "Focuspilot",
    url: "https://focuspilot.io",
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Free trial available",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    reviewCount: "127",
  },
  featureList: [
    "Project Management",
    "CRM for Design Studios",
    "Procurement Management",
    "Client Portal",
    "Finance & Billing",
    "AI-Powered Features",
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL("https://focuspilot.io"),
  title: {
    default: "Focuspilot - Interior Design Studio Management Software",
    template: "%s | Focuspilot",  
  },
  description:
    "The modern operating system for interior designers and architects. Streamline projects, procurement, client collaboration, and finance in one beautiful workspace.",
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
    locale: "en_US",
    url: "https://focuspilot.io",
    siteName: "Focuspilot",
    title: "Focuspilot - Interior Design Studio Management Software",
    description:
      "The modern operating system for interior designers and architects. Streamline projects, procurement, client collaboration, and finance in one beautiful workspace.",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Focuspilot - Interior Design Studio Management Software",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Focuspilot - Interior Design Studio Management Software",
    description:
      "The modern operating system for interior designers and architects. Streamline projects, procurement, client collaboration, and finance in one beautiful workspace.",
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
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code",
  },
  alternates: {
    canonical: "https://focuspilot.io",
  },
  category: "technology",
}

export { jsonLd }
