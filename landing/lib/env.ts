/** Public env — marketing site talks to Django API and redirects into the studio app. */

/** API base URL — always localhost in dev so Google OAuth redirect_uri matches Console. */
export function getApiUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8000"
  return raw.replace("127.0.0.1", "localhost")
}

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "http://localhost:3000"
}

/** Marketing / landing site (public studio profiles, blog, etc.) */
export function getMarketingUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_MARKETING_URL?.replace(/\/$/, "") || "http://localhost:3005"
  return raw.replace("127.0.0.1", "localhost")
}
