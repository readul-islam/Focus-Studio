import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getLocale, getTranslations } from "next-intl/server"
import { BlogPostPageClient } from "./BlogPostPageClient"
import { BLOG_POST_META, getPostBySlugFromMessages } from "@/lib/blog-data"
import { loadBlogMessages } from "@/lib/blog-messages"
import { localeHreflangAlternates } from "@/lib/seo-alternates"
import { generateArticleSchema, generateBreadcrumbSchema } from "@/lib/seo-schemas"

export async function generateStaticParams() {
  return BLOG_POST_META.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const locale = await getLocale()
  const { blogPosts, blogAuthors } = loadBlogMessages(locale)
  const post = getPostBySlugFromMessages(params.slug, blogPosts, blogAuthors)
  const t = await getTranslations("blogPage.postMeta")

  if (!post) {
    return { title: t("notFoundTitle") }
  }

  return {
    title: `${post.title}${t("titleSuffix")}`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.publishedAt,
      authors: [post.author.name],
      section: post.category,
      tags: post.tags,
      images: [{ url: post.featuredImage, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [post.featuredImage],
    },
    alternates: localeHreflangAlternates(`blog/${post.slug}`),
  }
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const locale = await getLocale()
  const { blogPosts, blogAuthors } = loadBlogMessages(locale)
  const post = getPostBySlugFromMessages(params.slug, blogPosts, blogAuthors)
  const t = await getTranslations("blogPage.breadcrumb")

  if (!post) {
    notFound()
  }

  const articleSchema = generateArticleSchema({
    title: post.title,
    description: post.excerpt,
    url: `https://focuspilot.io/blog/${post.slug}`,
    image: post.featuredImage.startsWith("http")
      ? post.featuredImage
      : `https://focuspilot.io${post.featuredImage}`,
    author: post.author.name,
    publishedTime: post.publishedAt,
  })

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: t("home"), url: "https://focuspilot.io" },
    { name: t("blog"), url: "https://focuspilot.io/blog" },
    { name: post.title, url: `https://focuspilot.io/blog/${post.slug}` },
  ])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <BlogPostPageClient post={post} />
    </>
  )
}
