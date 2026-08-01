"use client"

import Link from "next/link"
import Image from "next/image"
import { Clock, ArrowRight, BookOpen } from "lucide-react"
import { getAllPosts, getCategoryDisplay, type BlogPost } from "@/lib/blog-data"

const container = "mx-auto max-w-[1200px] px-6 sm:px-8"

export default function LatestBlogs() {
  const posts: BlogPost[] = getAllPosts().slice(0, 3)

  return (
    <section className="border-t border-stone-200/80 bg-white py-16 sm:py-24">
      <div className={container}>
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700 mb-3">
              <BookOpen className="h-3.5 w-3.5 text-stone-600" />
              <span>INSIGHTS & GUIDES</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-stone-900">
              Latest Blog
            </h2>
            <p className="mt-2 text-base text-stone-600 max-w-xl">
              Expert guides, studio management workflows, and industry trends to help grow your interior design practice.
            </p>
          </div>

          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-stone-50 px-5 py-2.5 text-sm font-semibold text-stone-800 hover:bg-stone-100 hover:border-stone-400 transition-all self-start md:self-auto"
          >
            <span>Explore all articles</span>
            <ArrowRight className="h-4 w-4 text-stone-600" />
          </Link>
        </div>

        {/* Blog Cards Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group flex flex-col h-full">
              <article className="flex flex-col h-full overflow-hidden rounded-2xl border border-stone-200/90 bg-stone-50/50 p-4 transition-all duration-300 hover:shadow-lg hover:border-stone-300 hover:-translate-y-1">
                {/* Image */}
                <div className="overflow-hidden rounded-xl bg-stone-200 relative aspect-[16/10] w-full">
                  <Image
                    src={post.featuredImage || "/placeholder.svg"}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-stone-800 shadow-xs border border-white/50">
                      {getCategoryDisplay(post)}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="mt-5 flex flex-col flex-1 px-1 pb-1">
                  <h3 className="text-lg font-semibold leading-snug text-stone-900 group-hover:text-stone-700 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="mt-2.5 line-clamp-2 text-sm text-stone-600 leading-relaxed">
                    {post.excerpt}
                  </p>

                  <div className="mt-auto pt-5 flex items-center justify-between text-xs text-stone-500 border-t border-stone-200/60">
                    <span className="font-medium text-stone-700">{post.author.name}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-stone-400" />
                      {post.readTime}
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
