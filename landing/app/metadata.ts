import type { Metadata } from "next"

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Techstyles",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "Interior design studio management software for project management, procurement, client collaboration, and finance.",
  url: "https://techstyles.ai",
  author: {
    "@type": "Organization",
    name: "Techstyles",
    url: "https://techstyles.ai",
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
  metadataBase: new URL("https://techstyles.ai"),
  title: {
    default: "Techstyles - Interior Design Studio Management Software",
    template: "%s | Techstyles",
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
    locale: "en_US",
    url: "https://techstyles.ai",
    siteName: "Techstyles",
    title: "Techstyles - Interior Design Studio Management Software",
    description:
      "The modern operating system for interior designers and architects. Streamline projects, procurement, client collaboration, and finance in one beautiful workspace.",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Techstyles - Interior Design Studio Management Software",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Techstyles - Interior Design Studio Management Software",
    description:
      "The modern operating system for interior designers and architects. Streamline projects, procurement, client collaboration, and finance in one beautiful workspace.",
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
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code",
  },
  alternates: {
    canonical: "https://techstyles.ai",
  },
  category: "technology",
}

export { jsonLd }
