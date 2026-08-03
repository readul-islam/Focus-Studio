"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Clock, Tag, X } from "lucide-react"
import {
  getCategoryLabel,
  isBlogCategoryFilter,
  type BlogCategoryFilter,
} from "@/lib/blog-categories"
import { getAllPosts, getCategoryDisplay, getFeaturedPosts, type BlogPost } from "@/lib/blog-data"
import { BlogHero } from "@/components/blog/blog-hero"
import SloganBanner from "@/components/sections/slogan-banner"

function filterPosts(
  posts: BlogPost[],
  activeCategory: BlogCategoryFilter,
  activeTag: string | null,
): BlogPost[] {
  let result = posts

  if (activeCategory !== "all") {
    result = result.filter((post) => post.category === activeCategory)
  }

  if (activeTag) {
    const normalizedTag = activeTag.toLowerCase().trim()
    result = result.filter((post) =>
      post.tags.some((t) => t.toLowerCase().trim() === normalizedTag),
    )
  }

  return result
}

export function BlogPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const allPosts = useMemo(() => getAllPosts(), [])
  const [activeFilter, setActiveFilter] = useState<BlogCategoryFilter>("all")
  const [activeTag, setActiveTag] = useState<string | null>(null)

  useEffect(() => {
    const category = searchParams.get("category")
    if (isBlogCategoryFilter(category)) {
      setActiveFilter(category)
    } else {
      setActiveFilter("all")
    }

    const tagParam = searchParams.get("tag")
    if (tagParam) {
      setActiveTag(tagParam)
    } else {
      setActiveTag(null)
    }
  }, [searchParams])

  const featuredSlug = getFeaturedPosts()[0]?.slug

  const visiblePosts = useMemo(() => {
    const filtered = filterPosts(allPosts, activeFilter, activeTag)
    if (activeFilter === "all" && !activeTag && featuredSlug) {
      return filtered.filter((post) => post.slug !== featuredSlug)
    }
    return filtered
  }, [allPosts, activeFilter, activeTag, featuredSlug])

  const handleClearTag = () => {
    setActiveTag(null)
    const params = new URLSearchParams(searchParams.toString())
    params.delete("tag")
    const newQuery = params.toString()
    router.push(newQuery ? `/blog?${newQuery}` : "/blog", { scroll: false })
  }

  const handleFilterChange = (filter: BlogCategoryFilter) => {
    setActiveFilter(filter)
    const params = new URLSearchParams(searchParams.toString())
    if (filter === "all") {
      params.delete("category")
    } else {
      params.set("category", filter)
    }
    const newQuery = params.toString()
    router.push(newQuery ? `/blog?${newQuery}` : "/blog", { scroll: false })
  }

  let gridHeading = activeFilter === "all" ? "More articles" : getCategoryLabel(activeFilter)
  if (activeTag) {
    gridHeading = `Articles tagged with "${activeTag}"`
  }

  return (
    <main className="bg-white">
      <BlogHero activeFilter={activeFilter} onFilterChange={handleFilterChange} />

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
              {gridHeading}
            </h2>

            {activeTag && (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3.5 py-1.5 text-sm font-medium text-stone-800 border border-stone-200">
                  <Tag className="h-3.5 w-3.5 text-stone-500" />
                  <span>Tag: <strong>{activeTag}</strong></span>
                  <button
                    type="button"
                    onClick={handleClearTag}
                    className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-stone-500 hover:bg-stone-200 hover:text-stone-900 transition-colors"
                    aria-label="Clear tag filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              </div>
            )}
          </div>

          {visiblePosts.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-stone-600 text-lg">No articles found matching your selected filter.</p>
              {(activeTag || activeFilter !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveFilter("all")
                    setActiveTag(null)
                    router.push("/blog", { scroll: false })
                  }}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 transition-colors"
                >
                  Show all articles
                </button>
              )}
            </div>
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

