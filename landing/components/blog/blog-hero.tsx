"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, BookOpen, ChevronRight, Clock, Home } from "lucide-react"
import { useTranslations } from "next-intl"
import { MarketingPageHero } from "@/components/marketing/marketing-page-hero"
import { useBlogCategoryTabs, type BlogCategoryFilter } from "@/lib/blog-categories"
import { useBlogPosts, useCategoryDisplayFor, useFeaturedPosts } from "@/lib/use-blog-posts"
import { cn } from "@/lib/utils"

const TITLE_H1 = "text-[30px] sm:text-5xl md:text-[56px] font-medium tracking-tight leading-[1.1]"

type BlogHeroProps = {
  activeFilter: BlogCategoryFilter
  onFilterChange: (filter: BlogCategoryFilter) => void
}

function FeaturedPostCard({ post }: { post: NonNullable<ReturnType<typeof useFeaturedPosts>[number]> }) {
  const t = useTranslations("blogHero")
  const categoryLabel = useCategoryDisplayFor(post)

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group relative block overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-[0_8px_30px_rgba(28,25,23,0.06)] transition-shadow hover:shadow-[0_12px_40px_rgba(28,25,23,0.1)]"
    >
      <span className="absolute left-4 top-4 z-10 rounded-full bg-stone-900 px-3 py-1 text-xs font-medium text-white">
        {t("featuredLabel")}
      </span>
      <div className="relative aspect-[16/10] w-full bg-stone-100">
        <Image
          src={post.featuredImage}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          sizes="(max-width: 1024px) 100vw, 420px"
          priority
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-stone-900/50 via-transparent to-transparent"
          aria-hidden
        />
      </div>
      <div className="p-5 sm:p-6">
        <span className="text-xs font-medium uppercase tracking-wider text-stone-500">{categoryLabel}</span>
        <h2 className="mt-2 text-lg font-semibold leading-snug text-stone-900 transition-colors group-hover:text-stone-700 sm:text-xl">
          {post.title}
        </h2>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-stone-600">{post.excerpt}</p>
        <div className="mt-4 flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-sm text-stone-500">
            <Clock className="h-4 w-4" aria-hidden />
            {post.readTime}
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-stone-900">
            {t("readArticle")}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </span>
        </div>
      </div>
    </Link>
  )
}

export function BlogHero({ activeFilter, onFilterChange }: BlogHeroProps) {
  const t = useTranslations("blogHero")
  const tc = useTranslations("blogCategories")
  const categoryTabs = useBlogCategoryTabs()
  const allPosts = useBlogPosts()
  const featuredPosts = useFeaturedPosts()
  const featuredPost = featuredPosts[0] ?? allPosts[0]
  const articleCount = allPosts.length
  const topicCount = categoryTabs.length - 1

  return (
    <MarketingPageHero
      className="border-b"
      gridHeight="min(640px, 75vh)"
      gridFadeStop={0.62}
      contentClassName="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
    >
        <nav aria-label="Breadcrumb" className="pt-8 sm:pt-10">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-stone-500">
            <li>
              <Link href="/" className="inline-flex items-center gap-1 transition-colors hover:text-stone-900">
                <Home className="h-3.5 w-3.5" aria-hidden />
                {t("breadcrumbHome")}
              </Link>
            </li>
            <li aria-hidden>
              <ChevronRight className="h-3.5 w-3.5" />
            </li>
            <li className="font-medium text-stone-900" aria-current="page">
              {t("breadcrumbBlog")}
            </li>
          </ol>
        </nav>

        <div className="mt-8 grid gap-10 pb-10 lg:grid-cols-[1fr_minmax(0,420px)] lg:items-center lg:gap-14 lg:pb-14">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-stone-300/70 bg-white/90 px-3 py-1 text-xs font-medium text-stone-700 shadow-sm backdrop-blur-sm">
              <BookOpen className="h-3.5 w-3.5" aria-hidden />
              {t("badge")}
            </span>

            <h1 className={cn("mt-5 text-stone-900", TITLE_H1)}>{t("title")}</h1>

            <p className="mt-5 text-base leading-relaxed text-stone-600 sm:text-lg">{t("subtitle")}</p>

            <dl className="mt-8 flex flex-wrap gap-3">
              <div className="rounded-xl border border-stone-200/80 bg-white/80 px-4 py-3 backdrop-blur-sm">
                <dt className="text-xs font-medium uppercase tracking-wider text-stone-500">{t("statsArticles")}</dt>
                <dd className="mt-0.5 text-lg font-semibold text-stone-900">{articleCount}</dd>
              </div>
              <div className="rounded-xl border border-stone-200/80 bg-white/80 px-4 py-3 backdrop-blur-sm">
                <dt className="text-xs font-medium uppercase tracking-wider text-stone-500">{t("statsTopics")}</dt>
                <dd className="mt-0.5 text-lg font-semibold text-stone-900">{topicCount}</dd>
              </div>
              <div className="rounded-xl border border-stone-200/80 bg-white/80 px-4 py-3 backdrop-blur-sm">
                <dt className="text-xs font-medium uppercase tracking-wider text-stone-500">{t("statsUpdated")}</dt>
                <dd className="mt-0.5 text-lg font-semibold text-stone-900">{t("statsUpdatedValue")}</dd>
              </div>
            </dl>
          </div>

          {featuredPost && <FeaturedPostCard post={featuredPost} />}
        </div>

        <div className="border-t border-stone-200/70 bg-white/75 py-5 backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-center gap-3" role="tablist" aria-label={tc("filterBy")}>
            <span className="text-sm font-medium text-stone-700">{tc("filterBy")}</span>
            {categoryTabs.map((tab) => {
              const isActive = activeFilter === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => onFilterChange(tab.id)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-stone-900 text-white shadow-sm hover:bg-stone-800"
                      : "border border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-100",
                  )}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
    </MarketingPageHero>
  )
}
