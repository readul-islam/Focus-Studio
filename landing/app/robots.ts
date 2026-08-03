import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/admin/",
        "/private/",
        "/auth/",
        "/login",
        "/forgot-password",
        "/verify-otp",
        "/palette",
        "/style-guide/",
        "/*.php",
        "/parking.php",
      ],
    },
    sitemap: "https://focuspilot.io/sitemap.xml",
    host: "https://focuspilot.io",
  }
}

