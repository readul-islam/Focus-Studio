import { getApiUrl } from "./env"

export type PublicPortfolioItem = {
  id: number
  title: string
  summary: string
  location: string
  project_type: string
  project_type_label: string
  year: number | null
  image_url: string | null
  is_featured: boolean
}

export type PublicReview = {
  id: number
  author_name: string
  author_title: string
  rating: number
  body: string
}

export type PublicTeamMember = {
  name: string
  title: string
  profile_picture_url: string | null
}

export type PublicStudioProfile = {
  slug: string
  studio_name: string
  headline: string
  tagline: string
  about: string
  cover_image_url: string | null
  logo_url: string | null
  location_display: string
  founded_year: number | null
  team_size_display: string
  services: string[]
  specialties: string[]
  website_url: string
  linkedin_url: string
  instagram_url: string
  pinterest_url: string
  houzz_url: string
  contact_email_public: string
  contact_phone_public: string
  portfolio: PublicPortfolioItem[]
  reviews: PublicReview[]
  team: PublicTeamMember[]
  average_rating: number | null
  review_count: number
}

export async function fetchPublicStudioProfile(
  slug: string,
): Promise<PublicStudioProfile | null> {
  const res = await fetch(`${getApiUrl()}/public_profiles/public/${slug}/`, {
    cache: "no-store",
  })
  if (!res.ok) return null
  return res.json()
}
