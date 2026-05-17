"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Clock } from "lucide-react"
import {
  getCategoryLabel,
  isBlogCategoryFilter,
  type BlogCategoryFilter,
} from "@/lib/blog-categories"
import { getAllPosts, getCategoryDisplay, getFeaturedPosts, type BlogPost } from "@/lib/blog-data"
import { BlogHero } from "@/components/blog/blog-hero"
import SloganBanner from "@/components/sections/slogan-banner"

function filterPosts(posts: BlogPost[], active: BlogCategoryFilter): BlogPost[] {
  if (active === "all") return posts
  return posts.filter((post) => post.category === active)
}

export function BlogPageContent() {
  const searchParams = useSearchParams()
  const allPosts = useMemo(() => getAllPosts(), [])
  const [activeFilter, setActiveFilter] = useState<BlogCategoryFilter>("all")

  useEffect(() => {
    const category = searchParams.get("category")
    if (isBlogCategoryFilter(category)) {
      setActiveFilter(category)
    }
  }, [searchParams])

  const featuredSlug = getFeaturedPosts()[0]?.slug

  const visiblePosts = useMemo(() => {
    const filtered = filterPosts(allPosts, activeFilter)
    if (activeFilter === "all" && featuredSlug) {
      return filtered.filter((post) => post.slug !== featuredSlug)
    }
    return filtered
  }, [allPosts, activeFilter, featuredSlug])

  const gridHeading =
    activeFilter === "all" ? "More articles" : getCategoryLabel(activeFilter)

  return (
    <main className="bg-white">
      <BlogHero activeFilter={activeFilter} onFilterChange={setActiveFilter} />

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-10 text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
            {gridHeading}
          </h2>
          {visiblePosts.length === 0 ? (
            <p className="text-center text-stone-600">No articles in this category yet.</p>
          ) : (
            <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {visiblePosts.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
                  <article>
                    <div className="overflow-hidden rounded-xl">
                      <div className="relative aspect-[4/3] w-full bg-stone-100">
                        <Image
                          src={post.featuredImage || "/placeholder.svg"}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>
                    </div>

                    <div className="mt-6">
                      <span className="text-xs font-medium uppercase tracking-wider text-stone-500">
                        {getCategoryDisplay(post)}
                      </span>
                      <h3 className="mt-3 text-xl font-semibold leading-tight text-stone-900 sm:text-[22px]">
                        {post.title}
                      </h3>
                      <p className="mt-3 line-clamp-2 text-base leading-relaxed text-stone-600">{post.excerpt}</p>

                      <div className="mt-4 flex items-center gap-4 text-sm text-stone-500">
                        <span className="font-medium text-stone-700">{post.author.name}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4" />
                          {post.readTime}
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <SloganBanner />
    </main>
  )
}
