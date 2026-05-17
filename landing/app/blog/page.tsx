import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Clock } from "lucide-react"
import { getAllPosts } from "@/lib/blog-data"
import SloganBanner from "@/components/sections/slogan-banner"

export const metadata: Metadata = {
  title: "Interior Design Studio Blog | Tips, Guides & Industry Insights | Techstyles",
  description:
    "Expert insights on interior design workflows, studio management & industry trends. Practical guides for running a successful design studio. Updated weekly.",
  openGraph: {
    title: "Interior Design Studio Blog | Tips, Guides & Industry Insights | Techstyles",
    description:
      "Expert insights on interior design workflows, studio management & industry trends. Practical guides for running a successful design studio.",
    type: "website",
    url: "https://focuspilot.io/blog",
  },
  twitter: {
    card: "summary_large_image",
    title: "Interior Design Studio Blog | Tips, Guides & Industry Insights | Techstyles",
    description: "Expert insights on interior design workflows, studio management & industry trends. Practical guides for running a successful design studio.",
  },
  alternates: {
    canonical: "https://focuspilot.io/blog",
  },
}

export default function BlogPage() {
  const allPosts = getAllPosts()

  return (
    <main className="bg-white">
      <section className="border-b py-14 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-[30px] sm:text-5xl md:text-[56px] font-medium tracking-tight leading-[1.1] text-stone-900">
              Insights for Modern Design Studios
            </h1>
            <p className="mt-6 text-base sm:text-lg leading-relaxed text-stone-600">
              Expert perspectives on workflow optimization, industry trends, and the future of interior design practice.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b bg-stone-50 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="text-sm font-medium text-stone-700">Filter by:</span>
            <button className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-stone-800">
              All
            </button>
            <button className="rounded-full bg-white px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100">
              Workflow
            </button>
            <button className="rounded-full bg-white px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100">
              Studio Management
            </button>
            <button className="rounded-full bg-white px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100">
              Industry Trends
            </button>
            <button className="rounded-full bg-white px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100">
              Best Practices
            </button>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {allPosts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
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
                    <span className="text-xs font-medium uppercase tracking-wider text-stone-500">{post.category}</span>
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
        </div>
      </section>

      <SloganBanner />
    </main>
  )
}
