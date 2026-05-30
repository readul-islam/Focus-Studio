import type { BlogCategoryId } from "@/lib/blog-categories-base"

export interface BlogPostMeta {
  slug: string
  category: BlogCategoryId
  tags: string[]
  publishedAt: string
  featured?: boolean
  featuredImage: string
  authorId: "maya" | "james" | "elena" | "priya"
}

export interface BlogPost extends BlogPostMeta {
  title: string
  excerpt: string
  content: string
  author: {
    name: string
    role: string
    avatar: string
  }
  readTime: string
}

export type BlogPostContent = {
  title: string
  excerpt: string
  content: string
  readTime: string
}

export type BlogPostsMessages = Record<string, BlogPostContent>

export type BlogAuthorsMessages = Record<string, { name: string; role: string }>

export const BLOG_POST_META: BlogPostMeta[] = [
  {
    slug: "interior-design-project-management-guide",
    category: "best-practices",
    tags: ["Interior Design Project Management", "Project Management", "Client Management", "Jobsite", "Scope of Work", "Profitability"],
    publishedAt: "2026-05-28",
    featured: true,
    featuredImage: "/blog/interior-design-project-management.jpg",
    authorId: "elena",
  },
  {
    slug: "construction-management-interior-designers",
    category: "studio-management",
    tags: ["Construction Management", "Interior Designers", "Jobsite", "General Contractor", "Team Building", "Studio Growth"],
    publishedAt: "2026-05-26",
    featured: true,
    featuredImage: "/blog/construction-management-interior-designers.jpg",
    authorId: "elena",
  },
  {
    slug: "best-interior-design-software-uk",
    category: "studio-management",
    tags: ["UK", "Interior Design Software UK", "Xero", "VAT", "RIBA", "Studio Management"],
    publishedAt: "2026-05-20",
    featured: true,
    featuredImage: "/blog/studio-financial-visibility.jpg",
    authorId: "james",
  },
  {
    slug: "best-interior-design-software-us",
    category: "studio-management",
    tags: ["US", "Interior Design Software", "QuickBooks", "FF&E", "Client Portal", "Studio Management"],
    publishedAt: "2026-05-18",
    featured: true,
    featuredImage: "/blog/studio-operating-system.jpg",
    authorId: "maya",
  },
  {
    slug: "brief-to-task-map-in-minutes",
    category: "workflow",
    tags: ["Workflow", "Tasks", "Kickoff"],
    publishedAt: "2026-05-10",
    featured: true,
    featuredImage: "/blog/workflow-brief-to-task-map.jpg",
    authorId: "maya",
  },
  {
    slug: "procurement-timelines-that-hold",
    category: "workflow",
    tags: ["Procurement", "Timeline", "FF&E"],
    publishedAt: "2026-04-28",
    featured: false,
    featuredImage: "/blog/workflow-procurement-timelines.jpg",
    authorId: "james",
  },
  {
    slug: "email-to-action-items",
    category: "workflow",
    tags: ["Email", "AI", "Communication"],
    publishedAt: "2026-04-12",
    featured: false,
    featuredImage: "/blog/workflow-email-to-tasks.jpg",
    authorId: "maya",
  },
  {
    slug: "studio-operating-system-basics",
    category: "studio-management",
    tags: ["Operations", "Growth", "Process"],
    publishedAt: "2026-05-02",
    featured: false,
    featuredImage: "/blog/studio-operating-system.jpg",
    authorId: "james",
  },
  {
    slug: "client-portals-reduce-approval-delays",
    category: "studio-management",
    tags: ["Client Portal", "Approvals", "Experience"],
    publishedAt: "2026-04-18",
    featured: false,
    featuredImage: "/blog/studio-client-portal.jpg",
    authorId: "priya",
  },
  {
    slug: "financial-visibility-per-project",
    category: "studio-management",
    tags: ["Finance", "Margin", "Reporting"],
    publishedAt: "2026-03-30",
    featured: false,
    featuredImage: "/blog/studio-financial-visibility.jpg",
    authorId: "james",
  },
  {
    slug: "biophilic-design-commercial-studios",
    category: "industry-trends",
    tags: ["Biophilic", "Commercial", "Wellness"],
    publishedAt: "2026-05-08",
    featured: false,
    featuredImage: "/blog/trends-biophilic-commercial.jpg",
    authorId: "elena",
  },
  {
    slug: "material-palettes-clients-request-2026",
    category: "industry-trends",
    tags: ["Materials", "Color", "Specification"],
    publishedAt: "2026-04-22",
    featured: false,
    featuredImage: "/blog/trends-material-palettes.jpg",
    authorId: "elena",
  },
  {
    slug: "ai-assisted-specification-2026",
    category: "industry-trends",
    tags: ["AI", "Specification", "Technology"],
    publishedAt: "2026-04-05",
    featured: false,
    featuredImage: "/blog/trends-ai-specification.jpg",
    authorId: "maya",
  },
  {
    slug: "efficient-remote-design-critiques",
    category: "best-practices",
    tags: ["Critique", "Remote", "Team"],
    publishedAt: "2026-05-05",
    featured: false,
    featuredImage: "/blog/practices-design-critiques.jpg",
    authorId: "elena",
  },
  {
    slug: "prevent-scope-creep-fixed-fee",
    category: "best-practices",
    tags: ["Scope", "Contracts", "Profitability"],
    publishedAt: "2026-04-15",
    featured: false,
    featuredImage: "/blog/practices-scope-creep.jpg",
    authorId: "priya",
  },
  {
    slug: "onboard-designers-two-weeks",
    category: "best-practices",
    tags: ["Onboarding", "Hiring", "Culture"],
    publishedAt: "2026-03-25",
    featured: false,
    featuredImage: "/blog/practices-designer-onboarding.jpg",
    authorId: "james",
  },
]

const AUTHOR_AVATARS: Record<BlogPostMeta["authorId"], string> = {
  maya: "/placeholder.svg",
  james: "/placeholder.svg",
  elena: "/placeholder.svg",
  priya: "/placeholder.svg",
}

export function resolveBlogPost(
  meta: BlogPostMeta,
  posts: BlogPostsMessages,
  authors: BlogAuthorsMessages,
): BlogPost | undefined {
  const content = posts[meta.slug]
  const author = authors[meta.authorId]
  if (!content?.title || !author) return undefined
  return {
    ...meta,
    title: content.title,
    excerpt: content.excerpt,
    content: content.content ?? "",
    readTime: content.readTime,
    author: {
      name: author.name,
      role: author.role,
      avatar: AUTHOR_AVATARS[meta.authorId],
    },
  }
}

export function resolveAllPosts(posts: BlogPostsMessages, authors: BlogAuthorsMessages): BlogPost[] {
  return BLOG_POST_META.map((meta) => resolveBlogPost(meta, posts, authors))
    .filter((post): post is BlogPost => post !== undefined)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
}

export function getFeaturedPostsFrom(posts: BlogPost[]): BlogPost[] {
  return posts.filter((post) => post.featured)
}

export function getPostBySlugFromMessages(
  slug: string,
  posts: BlogPostsMessages,
  authors: BlogAuthorsMessages,
): BlogPost | undefined {
  const meta = BLOG_POST_META.find((m) => m.slug === slug)
  if (!meta) return undefined
  return resolveBlogPost(meta, posts, authors)
}

export function getAllPostsFromMessages(posts: BlogPostsMessages, authors: BlogAuthorsMessages): BlogPost[] {
  return resolveAllPosts(posts, authors)
}

export function getPostsByCategoryFromMessages(
  categoryId: BlogCategoryId,
  posts: BlogPostsMessages,
  authors: BlogAuthorsMessages,
): BlogPost[] {
  return resolveAllPosts(posts, authors).filter((post) => post.category === categoryId)
}
