"use client"

import Link from "next/link"
import Image from "next/image"
import { Calendar, Clock, ArrowLeft, Twitter, Facebook, Linkedin, LinkIcon } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useBlogPosts, useCategoryDisplayFor } from "@/lib/use-blog-posts"
import type { BlogPost } from "@/lib/blog-data"
import { CtaButton } from "@/components/cta-button"

function RelatedPostCard({ post }: { post: BlogPost }) {
  const categoryLabel = useCategoryDisplayFor(post)

  return (
    <Link href={`/blog/${post.slug}`} className="group">
      <article>
        <div className="overflow-hidden rounded-xl">
          <div className="relative aspect-[4/3] w-full">
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
          <span className="text-xs font-medium uppercase tracking-wider text-stone-500">{categoryLabel}</span>
          <h3 className="mt-3 text-xl font-semibold leading-tight text-stone-900">{post.title}</h3>
          <p className="mt-3 line-clamp-2 text-base leading-relaxed text-stone-600">{post.excerpt}</p>
          <div className="mt-4 text-sm text-stone-500">{post.readTime}</div>
        </div>
      </article>
    </Link>
  )
}

export function BlogPostPageClient({ post }: { post: BlogPost }) {
  const t = useTranslations("blogPost")
  const ts = useTranslations("platformShared")
  const locale = useLocale()
  const allPosts = useBlogPosts()
  const categoryLabel = useCategoryDisplayFor(post)
  const dateLocale = locale === "ja-JP" ? "ja-JP" : "en-US"

  const relatedPosts = allPosts
    .filter(
      (p) => p.slug !== post.slug && (p.category === post.category || p.tags.some((tag) => post.tags.includes(tag))),
    )
    .slice(0, 3)

  const shareUrl = `https://focuspilot.io/blog/${post.slug}`
  const shareTitle = encodeURIComponent(post.title)

  return (
    <article className="bg-white">
      <nav className="border-b py-4" aria-label="Breadcrumb">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition-colors hover:text-stone-900"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("backToBlog")}
          </Link>
        </div>
      </nav>

      <header className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
        <span className="inline-block rounded-full bg-stone-900 px-4 py-1.5 text-xs font-medium tracking-wide text-white">
          {categoryLabel}
        </span>

        <h1 className="mt-6 text-center text-3xl font-medium leading-tight tracking-tight text-stone-900 sm:text-left sm:text-4xl sm:leading-tight lg:text-5xl lg:leading-tight">
          {post.title}
        </h1>

        <p className="mt-6 text-center text-base leading-relaxed text-stone-600 sm:text-left sm:text-lg lg:text-xl">
          {post.excerpt}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-6 border-t border-stone-200 pt-8">
          <div className="flex items-center gap-3">
            <Image
              src={post.author.avatar || "/placeholder.svg"}
              alt={post.author.name}
              width={48}
              height={48}
              className="h-12 w-12 rounded-full object-cover"
            />
            <div>
              <div className="font-semibold text-stone-900">{post.author.name}</div>
              <div className="text-sm text-stone-600">{post.author.role}</div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-stone-500">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {new Date(post.publishedAt).toLocaleDateString(dateLocale, {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {post.readTime}
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl">
          <div className="relative aspect-[21/9] w-full">
            <Image
              src={post.featuredImage || "/placeholder.svg"}
              alt={post.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1280px) 100vw, 1280px"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
        <div className="mb-10 flex flex-wrap items-center gap-3 border-b border-stone-200 pb-8">
          <span className="text-sm font-medium text-stone-700">{t("shareArticle")}</span>
          <a
            href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-700 transition-colors hover:bg-stone-900 hover:text-white"
            aria-label={t("shareTwitter")}
          >
            <Twitter className="h-4 w-4" />
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-700 transition-colors hover:bg-stone-900 hover:text-white"
            aria-label={t("shareLinkedIn")}
          >
            <Linkedin className="h-4 w-4" />
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-700 transition-colors hover:bg-stone-900 hover:text-white"
            aria-label={t("shareFacebook")}
          >
            <Facebook className="h-4 w-4" />
          </a>
          <button
            onClick={() => {
              navigator.clipboard.writeText(shareUrl)
            }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-700 transition-colors hover:bg-stone-900 hover:text-white"
            aria-label={t("copyLink")}
          >
            <LinkIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="blog-article-content" dangerouslySetInnerHTML={{ __html: post.content }} />

        {post.tags.length > 0 && (
          <div className="mt-14 flex flex-wrap items-center gap-3 border-t border-stone-200 pt-8">
            <span className="text-sm font-medium text-stone-700">{t("tagged")}</span>
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/blog?tag=${encodeURIComponent(tag)}`}
                className="rounded-full bg-stone-100 px-4 py-2 text-sm text-stone-700 transition-colors hover:bg-stone-200"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}
      </div>

      {relatedPosts.length > 0 && (
        <section className="py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-10 text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight text-stone-900 sm:mb-14">
              {t("continueReading")}
            </h2>

            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
              {relatedPosts.map((relatedPost) => (
                <RelatedPostCard key={relatedPost.slug} post={relatedPost} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section
        className="border-t bg-[#3F4B51] py-24"
        style={{
          backgroundImage: "url('/textures/grain.png')",
          backgroundSize: "200px 200px",
          backgroundBlendMode: "multiply",
          opacity: 0.98,
        }}
      >
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-[28px] md:text-[32px] font-medium tracking-tight text-white">
            {t("finalCtaTitle")}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-stone-300 sm:text-lg">{t("finalCtaSubtitle")}</p>
          <div className="mt-8 flex justify-center">
            <CtaButton href="/signup" variant="white" label={ts("startForFree")} showArrow arrowVariant="black" />
          </div>
          <p className="mt-4 text-xs text-stone-400 sm:text-sm">{ts("noCreditCardRequired")}</p>
        </div>
      </section>
    </article>
  )
}
