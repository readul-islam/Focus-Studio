"use client"

import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { Star, Quote } from "lucide-react"
import { CtaButton } from "@/components/cta-button"
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

const testimonials = [
  {
    quote: "Techstyles has transformed how we manage projects. The AI features alone save us 10+ hours a week on admin work that used to consume my evenings.",
    author: "Sarah Mitchell",
    role: "Principal Designer",
    company: "Studio Mitchell",
    rating: 5,
    highlight: "10+ hours saved weekly",
  },
  {
    quote: "Finally, software that actually understands how interior design studios work. The client portal is beautiful and our clients love being able to approve selections online.",
    author: "James Chen",
    role: "Creative Director",
    company: "Chen Interiors",
    rating: 5,
    highlight: "Clients love it",
  },
  {
    quote: "We switched from Programa and haven't looked back. The Xero integration works flawlessly and procurement tracking has eliminated our spreadsheet chaos.",
    author: "Emma Williams",
    role: "Founder",
    company: "Williams Design Co",
    rating: 5,
    highlight: "Seamless Xero sync",
  },
  {
    quote: "The onboarding was smooth and the support team genuinely understands design practice. They've built features we didn't even know we needed.",
    author: "Marcus Thompson",
    role: "Senior Designer",
    company: "Thompson & Associates",
    rating: 5,
    highlight: "Built for designers",
  },
  {
    quote: "Managing FF&E schedules used to be a nightmare. Now our whole team can see what's ordered, what's shipped, and what's installed in real-time.",
    author: "Lisa Park",
    role: "Operations Director",
    company: "Park Design Studio",
    rating: 5,
    highlight: "Real-time visibility",
  },
  {
    quote: "The AI proposal generator paid for the entire subscription in the first month. It's scarily accurate at estimating project timelines and costs.",
    author: "David Okonkwo",
    role: "Founding Partner",
    company: "Okonkwo Design",
    rating: 5,
    highlight: "ROI in first month",
  },
]

const stats = [
  { value: "500+", label: "Design studios" },
  { value: "10hrs", label: "Saved per week" },
  { value: "4.9/5", label: "Average rating" },
  { value: "98%", label: "Retention rate" },
]

function Hero() {
  return (
    <MarketingPageHero contentClassName={cn(container, "pb-12 pt-12 sm:pb-16 md:pt-16")}>
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-stone-300/60 bg-white px-3 py-1 text-xs text-stone-700">
            <Quote className="h-3 w-3" aria-hidden="true" />
            Customer stories
          </span>
          <h1 className={cn("mt-5 text-center", TITLE_H1)}>Loved by design studios</h1>
          <p className="mt-4 text-center text-base sm:text-lg text-stone-600">
            See how interior designers and architects use Techstyles to save time, delight clients, and focus on what they do best.
          </p>
        </Reveal>
    </MarketingPageHero>
  )
}

function Stats() {
  return (
    <section className="bg-stone-50 py-12 sm:py-16">
      <div className={container}>
        <Reveal>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-semibold text-stone-900">{stat.value}</div>
                <div className="mt-1 text-sm text-stone-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function TestimonialGrid() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className={container}>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Reveal key={testimonial.author} delay={index * 50}>
              <Card className="h-full border-stone-200 transition-all hover:shadow-md">
                <CardContent className="flex h-full flex-col p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="mb-3 inline-flex w-fit items-center rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700">
                    {testimonial.highlight}
                  </span>
                  <blockquote className="flex-1 text-stone-700">"{testimonial.quote}"</blockquote>
                  <div className="mt-6 flex items-center gap-3 border-t border-stone-100 pt-4">
                    <div className="h-10 w-10 rounded-full bg-stone-200" />
                    <div>
                      <div className="font-medium text-stone-900">{testimonial.author}</div>
                      <div className="text-sm text-stone-500">
                        {testimonial.role}, {testimonial.company}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
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
              See it for yourself
            </h2>
            <p className="mt-3 text-center text-stone-600">
              Explore the features that designers love.
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
                href="/platform/client-portal"
                className="group rounded-xl border border-stone-200 bg-white p-5 transition-all hover:border-stone-300 hover:shadow-md"
              >
                <h3 className="font-semibold text-stone-900 group-hover:text-stone-700">Client Portal</h3>
                <p className="mt-1 text-sm text-stone-600">Share and get approvals</p>
              </Link>
              <Link
                href="/platform/ai"
                className="group rounded-xl border border-stone-200 bg-white p-5 transition-all hover:border-stone-300 hover:shadow-md"
              >
                <h3 className="font-semibold text-stone-900 group-hover:text-stone-700">AI Features</h3>
                <p className="mt-1 text-sm text-stone-600">Automate the admin</p>
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

function FinalCTA() {
  return (
    <section
      aria-label="Get started"
      className="relative isolate overflow-hidden py-24 text-stone-100"
      style={{ backgroundColor: "#3F4B51" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{ backgroundImage: "url('/textures/grain.png')", backgroundSize: "200px 200px" }}
      />
      <div className={container}>
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl sm:text-[28px] md:text-[32px] font-medium tracking-tight">
            Join 500+ design studios
          </h2>
          <p className="mt-3 text-base sm:text-lg text-stone-300">
            Start your free trial and see why designers love Techstyles.
          </p>
          <div className="mt-8 flex items-center justify-center">
            <CtaButton href="/signup" variant="white" label="Start for free" showArrow arrowVariant="black" />
          </div>
          <p className="mt-3 text-xs sm:text-sm text-stone-400">No credit card required</p>
        </Reveal>
      </div>
    </section>
  )
}

export default function CustomersPage() {
  return (
    <main className="bg-white">
      <Hero />
      <Stats />
      <TestimonialGrid />
      <RelatedLinks />
      <FinalCTA />
    </main>
  )
}
