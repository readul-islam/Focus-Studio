"use client"

import type { ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  MapPin, Globe, Mail, Phone, Star, Linkedin, Instagram,
  ExternalLink, Users, Calendar,
} from "lucide-react"
import type { PublicStudioProfile } from "@/lib/public-profile"
import { cn } from "@/lib/utils"

const container = "mx-auto max-w-[1100px] px-6 sm:px-8"

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn("size-4", i <= rating ? "fill-amber-400 text-amber-400" : "text-stone-300")}
        />
      ))}
    </div>
  )
}

function SocialLink({ href, label, icon }: { href: string; label: string; icon: ReactNode }) {
  if (!href) return null
  return (
    <a
      href={href.startsWith("http") ? href : `https://${href}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-sm text-stone-600 hover:text-stone-900 transition-colors"
    >
      {icon}
      <span>{label}</span>
      <ExternalLink className="size-3 opacity-50" />
    </a>
  )
}

export function StudioPublicProfileClient({ profile }: { profile: PublicStudioProfile }) {
  const featured = profile.portfolio.filter((p) => p.is_featured)
  const rest = profile.portfolio.filter((p) => !p.is_featured)
  const orderedPortfolio = [...featured, ...rest]

  return (
    <div className="min-h-screen bg-[#faf9f7] text-stone-900">
      {/* Cover */}
      <div className="relative h-48 sm:h-64 md:h-72 bg-gradient-to-br from-stone-200 via-stone-100 to-[#e8e4df] overflow-hidden">
        {profile.cover_image_url ? (
          <Image
            src={profile.cover_image_url}
            alt=""
            fill
            className="object-cover"
            priority
            unoptimized
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      <div className={cn(container, "-mt-16 sm:-mt-20 relative z-10 pb-20")}>
        {/* Header card */}
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="shrink-0">
              {profile.logo_url ? (
                <div className="relative size-24 sm:size-28 rounded-xl border border-stone-200 bg-white overflow-hidden shadow-md">
                  <Image src={profile.logo_url} alt={profile.studio_name} fill className="object-contain p-2" unoptimized />
                </div>
              ) : (
                <div className="size-24 sm:size-28 rounded-xl bg-stone-800 text-white flex items-center justify-center text-2xl font-medium">
                  {(profile.studio_name || "S").charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium uppercase tracking-wider text-stone-500 mb-1">Design Studio</p>
              <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-stone-900">
                {profile.studio_name}
              </h1>
              {profile.headline ? (
                <p className="mt-2 text-lg text-stone-700">{profile.headline}</p>
              ) : null}
              {profile.tagline ? (
                <p className="mt-1 text-stone-500">{profile.tagline}</p>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-stone-600">
                {profile.location_display ? (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-4" />
                    {profile.location_display}
                  </span>
                ) : null}
                {profile.founded_year ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="size-4" />
                    Est. {profile.founded_year}
                  </span>
                ) : null}
                {profile.team_size_display ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="size-4" />
                    {profile.team_size_display}
                  </span>
                ) : null}
                {profile.average_rating != null && profile.review_count > 0 ? (
                  <span className="inline-flex items-center gap-2">
                    <Stars rating={Math.round(profile.average_rating)} />
                    <span>{profile.average_rating} ({profile.review_count} reviews)</span>
                  </span>
                ) : null}
              </div>

              <div className="mt-5 flex flex-wrap gap-4">
                {profile.website_url ? (
                  <SocialLink href={profile.website_url} label="Website" icon={<Globe className="size-4" />} />
                ) : null}
                {profile.linkedin_url ? (
                  <SocialLink href={profile.linkedin_url} label="LinkedIn" icon={<Linkedin className="size-4" />} />
                ) : null}
                {profile.instagram_url ? (
                  <SocialLink href={profile.instagram_url} label="Instagram" icon={<Instagram className="size-4" />} />
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            {profile.about ? (
              <section>
                <h2 className="text-xl font-medium text-stone-900 mb-4">About</h2>
                <p className="text-stone-600 leading-relaxed whitespace-pre-wrap">{profile.about}</p>
              </section>
            ) : null}

            {orderedPortfolio.length > 0 ? (
              <section>
                <h2 className="text-xl font-medium text-stone-900 mb-6">Past work</h2>
                <div className="grid sm:grid-cols-2 gap-6">
                  {orderedPortfolio.map((item) => (
                    <article
                      key={item.id}
                      className="group bg-white rounded-xl border border-stone-200/80 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="aspect-[4/3] relative bg-stone-100">
                        {item.image_url ? (
                          <Image src={item.image_url} alt={item.title} fill className="object-cover" unoptimized />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-stone-400 text-sm">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-medium text-stone-900">{item.title}</h3>
                          {item.project_type_label ? (
                            <span className="text-xs text-stone-500 shrink-0">{item.project_type_label}</span>
                          ) : null}
                        </div>
                        {item.location || item.year ? (
                          <p className="text-xs text-stone-500 mt-1">
                            {[item.location, item.year].filter(Boolean).join(" · ")}
                          </p>
                        ) : null}
                        {item.summary ? (
                          <p className="text-sm text-stone-600 mt-2 line-clamp-3">{item.summary}</p>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            {profile.reviews.length > 0 ? (
              <section>
                <h2 className="text-xl font-medium text-stone-900 mb-6">Client reviews</h2>
                <div className="space-y-4">
                  {profile.reviews.map((r) => (
                    <blockquote
                      key={r.id}
                      className="bg-white rounded-xl border border-stone-200/80 p-5 shadow-sm"
                    >
                      <Stars rating={r.rating} />
                      <p className="mt-3 text-stone-700 leading-relaxed">&ldquo;{r.body}&rdquo;</p>
                      <footer className="mt-3 text-sm text-stone-500">
                        <span className="font-medium text-stone-800">{r.author_name}</span>
                        {r.author_title ? ` — ${r.author_title}` : ""}
                      </footer>
                    </blockquote>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <aside className="space-y-8">
            {(profile.services?.length > 0 || profile.specialties?.length > 0) ? (
              <section className="bg-white rounded-xl border border-stone-200/80 p-5 shadow-sm">
                {profile.services?.length > 0 ? (
                  <>
                    <h3 className="text-sm font-medium text-stone-900 mb-3">Services</h3>
                    <ul className="flex flex-wrap gap-2 mb-4">
                      {profile.services.map((s) => (
                        <li key={s} className="text-xs px-2.5 py-1 rounded-full bg-stone-100 text-stone-700">
                          {s}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}
                {profile.specialties?.length > 0 ? (
                  <>
                    <h3 className="text-sm font-medium text-stone-900 mb-3">Specialties</h3>
                    <ul className="flex flex-wrap gap-2">
                      {profile.specialties.map((s) => (
                        <li key={s} className="text-xs px-2.5 py-1 rounded-full bg-[#f0ebe3] text-stone-700">
                          {s}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}
              </section>
            ) : null}

            {profile.team?.length > 0 ? (
              <section className="bg-white rounded-xl border border-stone-200/80 p-5 shadow-sm">
                <h3 className="text-sm font-medium text-stone-900 mb-4">Team</h3>
                <ul className="space-y-3">
                  {profile.team.map((m, i) => (
                    <li key={i} className="flex items-center gap-3">
                      {m.profile_picture_url ? (
                        <div className="relative size-10 rounded-full overflow-hidden bg-stone-100 shrink-0">
                          <Image src={m.profile_picture_url} alt="" fill className="object-cover" unoptimized />
                        </div>
                      ) : (
                        <div className="size-10 rounded-full bg-stone-200 flex items-center justify-center text-sm font-medium text-stone-600 shrink-0">
                          {m.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-stone-900">{m.name}</p>
                        {m.title ? <p className="text-xs text-stone-500">{m.title}</p> : null}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {(profile.contact_email_public || profile.contact_phone_public) ? (
              <section className="bg-white rounded-xl border border-stone-200/80 p-5 shadow-sm">
                <h3 className="text-sm font-medium text-stone-900 mb-3">Contact</h3>
                <div className="space-y-2 text-sm">
                  {profile.contact_email_public ? (
                    <a
                      href={`mailto:${profile.contact_email_public}`}
                      className="flex items-center gap-2 text-stone-600 hover:text-stone-900"
                    >
                      <Mail className="size-4" />
                      {profile.contact_email_public}
                    </a>
                  ) : null}
                  {profile.contact_phone_public ? (
                    <a
                      href={`tel:${profile.contact_phone_public}`}
                      className="flex items-center gap-2 text-stone-600 hover:text-stone-900"
                    >
                      <Phone className="size-4" />
                      {profile.contact_phone_public}
                    </a>
                  ) : null}
                </div>
              </section>
            ) : null}

            <p className="text-xs text-stone-400 text-center">
              Powered by{" "}
              <Link href="https://focuspilot.io" className="underline hover:text-stone-600">
                Focuspilot
              </Link>
            </p>
          </aside>
        </div>
      </div>
    </div>
  )
}
