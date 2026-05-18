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
        url: "https://focuspilot.io/images/techstyles-logo.png",
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
    logo: "https://focuspilot.io/images/techstyles-logo.png",
    sameAs: [
      "https://twitter.com/techstyles",
      "https://linkedin.com/company/techstyles",
      "https://instagram.com/techstyles",
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
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "49",
      priceCurrency: "GBP",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: "150",
    },
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
