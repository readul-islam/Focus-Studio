"use client"

import type React from "react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { ArrowRight, Book, FileText, Video, HelpCircle, Search, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { MarketingPageHero } from "@/components/marketing/marketing-page-hero"

const container = "mx-auto max-w-[1200px] px-6 sm:px-8"
const TITLE_H1 = "text-[30px] sm:text-5xl md:text-[56px] font-medium tracking-tight leading-[1.1]"

function useReveal({ threshold = 0.12, delay = 0 } = {}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [show, setShow] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReduced) {
      setShow(true)
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setShow(true), delay)
          io.disconnect()
        }
      },
      { threshold },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold, delay])
  return { ref, show }
}

function Reveal({
  children,
  className,
  delay = 0,
  threshold = 0.12,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  threshold?: number
}) {
  const { ref, show } = useReveal({ threshold, delay })
  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out",
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
        className,
      )}
    >
      {children}
    </div>
  )
}

const categories = [
  {
    title: "Getting Started",
    icon: Book,
    description: "Set up your account and learn the basics",
    articles: [
      { title: "Quick start guide", time: "5 min" },
      { title: "Account setup", time: "3 min" },
      { title: "Inviting team members", time: "2 min" },
      { title: "First project walkthrough", time: "8 min" },
    ],
    color: "#A56A52",
  },
  {
    title: "Features",
    icon: FileText,
    description: "Deep dives into Focuspilot features",
    articles: [
      { title: "Project management", time: "10 min" },
      { title: "Procurement & POs", time: "8 min" },
      { title: "Client portal", time: "6 min" },
      { title: "Finance & invoicing", time: "7 min" },
    ],
    color: "#6F8B7A",
  },
  {
    title: "Video Tutorials",
    icon: Video,
    description: "Watch and learn at your own pace",
    articles: [
      { title: "Platform overview", time: "12 min" },
      { title: "AI features demo", time: "8 min" },
      { title: "Client portal setup", time: "6 min" },
      { title: "Xero integration", time: "5 min" },
    ],
    color: "#B6893C",
  },
  {
    title: "FAQ",
    icon: HelpCircle,
    description: "Quick answers to common questions",
    articles: [
      { title: "Billing & pricing", time: "3 min" },
      { title: "Data & security", time: "4 min" },
      { title: "Integrations", time: "3 min" },
      { title: "Migration help", time: "5 min" },
    ],
    color: "#63708C",
  },
]

function Hero() {
  return (
    <MarketingPageHero contentClassName={cn(container, "pb-12 pt-12 sm:pb-16 md:pt-16")}>
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-stone-300/60 bg-white px-3 py-1 text-xs text-stone-700">
            <Book className="h-3 w-3" aria-hidden="true" />
            Help & guides
          </span>
          <h1 className={cn("mt-5 text-center", TITLE_H1)}>Knowledge Centre</h1>
          <p className="mt-4 text-center text-base sm:text-lg text-stone-600">
            Guides, tutorials, and answers to help you get the most from Focuspilot.
          </p>
          <div className="mt-8 mx-auto max-w-lg">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" aria-hidden="true" />
              <input
                type="search"
                placeholder="Search articles..."
                className="w-full rounded-lg border border-stone-200 bg-white py-3 pl-12 pr-4 text-stone-900 placeholder:text-stone-400 focus:border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-200"
              />
            </div>
          </div>
        </Reveal>
    </MarketingPageHero>
  )
}

function CategoryGrid() {
  return (
    <section className="bg-stone-50 py-16 sm:py-20">
      <div className={container}>
        <div className="grid gap-6 sm:grid-cols-2">
          {categories.map((category, index) => {
            const Icon = category.icon
            return (
              <Reveal key={category.title} delay={index * 50}>
                <Card className="h-full border-stone-200 bg-white transition-all hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg p-2.5" style={{ backgroundColor: `${category.color}15` }}>
                        <Icon className="h-5 w-5" style={{ color: category.color }} aria-hidden="true" />
                      </div>
                      <div>
                        <h2 className="font-medium text-stone-900">{category.title}</h2>
                        <p className="text-sm text-stone-500">{category.description}</p>
                      </div>
                    </div>
                    <ul className="mt-5 space-y-3">
                      {category.articles.map((article) => (
                        <li key={article.title}>
                          <button className="group flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors hover:bg-stone-50">
                            <span className="text-sm text-stone-700 group-hover:text-stone-900">{article.title}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-stone-400">{article.time}</span>
                              <ChevronRight className="h-4 w-4 text-stone-400 transition-transform group-hover:translate-x-0.5 group-hover:text-stone-600" aria-hidden="true" />
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function ContactSupport() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className={container}>
        <Reveal>
          <div className="mx-auto max-w-2xl rounded-2xl bg-stone-50 border border-stone-200 p-8 sm:p-10 text-center">
            <HelpCircle className="mx-auto h-10 w-10 text-stone-400" aria-hidden="true" />
            <h2 className="mt-4 text-xl sm:text-2xl font-medium text-stone-900">
              Can't find what you're looking for?
            </h2>
            <p className="mt-2 text-stone-600">
              Our support team is here to help. Get in touch and we'll respond within 24 hours.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-stone-800"
              >
                Contact support
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/changelog"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-stone-200 bg-white px-5 py-2.5 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50"
              >
                View changelog
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function RelatedLinks() {
  return (
    <section className="bg-stone-50 py-16 sm:py-20">
      <div className={container}>
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <h2 className="text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight text-center text-stone-900">
              Explore the platform
            </h2>
            <p className="mt-3 text-center text-stone-600">
              Learn more about what Focuspilot can do.
            </p>
          </Reveal>
          <Reveal delay={100}>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Link
                href="/platform/projects"
                className="group rounded-xl border border-stone-200 bg-white p-5 transition-all hover:border-stone-300 hover:shadow-md"
              >
                <h3 className="font-semibold text-stone-900 group-hover:text-stone-700">Projects</h3>
                <p className="mt-1 text-sm text-stone-600">Manage timelines and tasks</p>
              </Link>
              <Link
                href="/platform/ai"
                className="group rounded-xl border border-stone-200 bg-white p-5 transition-all hover:border-stone-300 hover:shadow-md"
              >
                <h3 className="font-semibold text-stone-900 group-hover:text-stone-700">AI Features</h3>
                <p className="mt-1 text-sm text-stone-600">Automate the admin</p>
              </Link>
              <Link
                href="/integrations"
                className="group rounded-xl border border-stone-200 bg-white p-5 transition-all hover:border-stone-300 hover:shadow-md"
              >
                <h3 className="font-semibold text-stone-900 group-hover:text-stone-700">Integrations</h3>
                <p className="mt-1 text-sm text-stone-600">Connect your tools</p>
              </Link>
              <Link
                href="/pricing"
                className="group rounded-xl border border-stone-200 bg-white p-5 transition-all hover:border-stone-300 hover:shadow-md"
              >
                <h3 className="font-semibold text-stone-900 group-hover:text-stone-700">Pricing</h3>
                <p className="mt-1 text-sm text-stone-600">Start free today</p>
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

export default function KnowledgePage() {
  return (
    <main className="bg-white">
      <Hero />
      <CategoryGrid />
      <ContactSupport />
      <RelatedLinks />
    </main>
  )
}
