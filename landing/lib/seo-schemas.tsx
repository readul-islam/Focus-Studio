// SEO Schema Generators for structured data

export interface BreadcrumbItem {
  name: string
  url: string
}

export interface ArticleSchemaProps {
  title: string
  description: string
  author: string
  publishedTime: string
  modifiedTime?: string
  image?: string
  url: string
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function generateArticleSchema({
  title,
  description,
  author,
  publishedTime,
  modifiedTime,
  image,
  url,
}: ArticleSchemaProps) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: description,
    author: {
      "@type": "Person",
      name: author,
    },
    datePublished: publishedTime,
    dateModified: modifiedTime || publishedTime,
    image: image,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    publisher: {
      "@type": "Organization",
      name: "Focuspilot",
      logo: {
        "@type": "ImageObject",
        url: "https://focuspilot.io/images/logo.png",
      },
    },
  }
}

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Focuspilot",
    url: "https://focuspilot.io",
    logo: "https://focuspilot.io/images/logo.png",
    sameAs: [
      "https://twitter.com/focuspilot",
      "https://linkedin.com/company/focuspilot",
      "https://instagram.com/focuspilot",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+44-000-000-0000",
      contactType: "customer service",
      areaServed: ["GB", "EU"],
      availableLanguage: "English",
    },
  }
}

export function generateSoftwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Focuspilot",
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Interior Design Studio Management Software",
    operatingSystem: "Web",
    url: "https://focuspilot.io",
    description:
      "Focuspilot is the modern interior design studio operating system for project management, FF&E procurement, client approval portals, and accounting sync.",
    offers: {
      "@type": "Offer",
      price: "49",
      priceCurrency: "GBP",
      availability: "https://schema.org/InStock",
    },
    featureList: [
      "Interior Design Project Management",
      "FF&E Procurement & Web Clipper",
      "Client Approval Portal",
      "Xero & QuickBooks Financial Sync",
      "AI Email & Brief Automation",
    ],
  }
}

export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }
}
