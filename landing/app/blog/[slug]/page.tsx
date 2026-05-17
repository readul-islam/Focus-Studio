import type { Metadata } from "next"
import { BlogPostPageClient } from "./BlogPostPageClient"
import { getAllPosts, getPostBySlug } from "@/lib/blog-data"
import { generateArticleSchema, generateBreadcrumbSchema } from "@/lib/seo-schemas"

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = getPostBySlug(params.slug)

  if (!post) {
    return { title: "Post Not Found" }
  }

  return {
    title: `${post.title} | Techstyles Blog`,
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
    alternates: {
      canonical: `https://focuspilot.io/blog/${post.slug}`,
    },
  }
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug)

  if (!post) {
    return <BlogPostPageClient params={params} />
  }

  const articleSchema = generateArticleSchema({
    title: post.title,
    description: post.excerpt,
    url: `https://focuspilot.io/blog/${post.slug}`,
    imageUrl: post.featuredImage.startsWith("http")
      ? post.featuredImage
      : `https://focuspilot.io${post.featuredImage}`,
    authorName: post.author.name,
    publishedTime: post.publishedAt,
    category: post.category,
  })

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://focuspilot.io" },
    { name: "Blog", url: "https://focuspilot.io/blog" },
    { name: post.title, url: `https://focuspilot.io/blog/${post.slug}` },
  ])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <BlogPostPageClient params={params} />
    </>
  )
}
