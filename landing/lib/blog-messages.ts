import enBlog from "../messages/blog/en-US.json"
import jaBlog from "../messages/blog/ja-JP.json"
import type { BlogAuthorsMessages, BlogPostsMessages } from "./blog-data"
import { mergeMessagesWithFallback } from "./locale-messages"

const blogBundles = {
  "en-US": enBlog,
  "ja-JP": jaBlog,
} as const

type BlogBundle = {
  blogPosts: BlogPostsMessages
  blogAuthors: BlogAuthorsMessages
}

export function loadBlogMessages(locale: string): BlogBundle {
  const fallback = blogBundles["en-US"] as BlogBundle
  if (locale === "en-US") {
    return fallback
  }

  const overlay = (blogBundles[locale as keyof typeof blogBundles] ?? fallback) as BlogBundle
  return mergeMessagesWithFallback(fallback, overlay) as BlogBundle
}

/** List/card views only — omits article HTML bodies from the client bundle. */
export function loadBlogSummaries(locale: string): BlogBundle {
  const full = loadBlogMessages(locale)
  const summaries: BlogPostsMessages = {}

  for (const [slug, post] of Object.entries(full.blogPosts)) {
    summaries[slug] = {
      title: post.title,
      excerpt: post.excerpt,
      readTime: post.readTime,
      content: "",
    }
  }

  return { blogPosts: summaries, blogAuthors: full.blogAuthors }
}
