import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getMarketingUrl } from "@/lib/env"
import { fetchPublicStudioProfile } from "@/lib/public-profile"
import { StudioPublicProfileClient } from "./StudioPublicProfileClient"

export const dynamic = "force-dynamic"

type Props = { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params
  const profile = await fetchPublicStudioProfile(slug)
  if (!profile) {
    return { title: "Studio not found | Focuspilot" }
  }
  const title = profile.headline
    ? `${profile.headline} | ${profile.studio_name}`
    : `${profile.studio_name} — Interior Design Studio`
  const description =
    profile.tagline ||
    profile.about?.slice(0, 160) ||
    `View ${profile.studio_name}'s portfolio, team, and client reviews.`
  const image = profile.cover_image_url || profile.logo_url || "/images/og-image.png"

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      url: `${getMarketingUrl()}/studio/${slug}`,
      images: image ? [{ url: image, width: 1200, height: 630, alt: profile.studio_name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
    robots: { index: true, follow: true },
  }
}

export default async function StudioPublicProfilePage({ params }: Props) {
  const { slug } = params
  const profile = await fetchPublicStudioProfile(slug)
  if (!profile) notFound()
  return <StudioPublicProfileClient profile={profile} />
}
