"use client"

import { useMemo } from "react"
import { useMessages } from "next-intl"
import { useCategoryLabel } from "@/lib/blog-categories"
import {
  BLOG_POST_META,
  getFeaturedPostsFrom,
  getPostBySlugFromMessages,
  resolveAllPosts,
  type BlogAuthorsMessages,
  type BlogPost,
  type BlogPostsMessages,
} from "@/lib/blog-data"

function useBlogMessages() {
  const messages = useMessages() as {
    blogPosts?: BlogPostsMessages
    blogAuthors?: BlogAuthorsMessages
  }
  return {
    posts: messages.blogPosts ?? {},
    authors: messages.blogAuthors ?? {},
  }
}

export function useBlogPosts(): BlogPost[] {
  const { posts, authors } = useBlogMessages()
  return useMemo(() => resolveAllPosts(posts, authors), [posts, authors])
}

export function useFeaturedPosts(): BlogPost[] {
  const all = useBlogPosts()
  return useMemo(() => getFeaturedPostsFrom(all), [all])
}

export function usePostBySlug(slug: string): BlogPost | undefined {
  const { posts, authors } = useBlogMessages()
  return useMemo(() => getPostBySlugFromMessages(slug, posts, authors), [slug, posts, authors])
}

export function useCategoryDisplayFor(post: BlogPost): string {
  return useCategoryLabel(post.category)
}

export { BLOG_POST_META }
