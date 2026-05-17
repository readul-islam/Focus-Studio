"use client"

import type React from "react"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import * as LucideReact from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import FeatureBlocks from "@/components/sections/feature-blocks"
import AttentionBanner from "@/components/sections/attention-banner"
import SloganBanner from "@/components/sections/slogan-banner"
import { CtaButton } from "@/components/cta-button"
import { LandingHeroBackground } from "@/components/landing-hero-background"

const container = "mx-auto max-w-[1200px] px-6 sm:px-8"
// H1: 30px mobile → 48px tablet → 56px desktop (was 60px) with medium weight for better readability
const TITLE_H1 = "text-[30px] sm:text-5xl md:text-[56px] font-medium tracking-tight leading-[1.1]"
const TITLE_H2 = "text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight"

function useParallax(speed = 0.05) {
  const ref = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Prevent parallax on mobile to avoid scroll issues
    if (window.innerWidth < 768) return

    let raf = 0
    const onScroll = () => {
      raf = requestAnimationFrame(() => {
        const y = Math.min(window.scrollY * speed, 100) // Cap the parallax effect
        el.style.transform = `translateY(${y}px)`
      })
    }

    // Small delay to ensure page is fully loaded
    setTimeout(() => {
      onScroll()
      window.addEventListener("scroll", onScroll, { passive: true })
    }, 100)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("scroll", onScroll)
    }
  }, [speed])
  return ref
}

function Reveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
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
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setTimeout(() => setShow(true), delay)
            io.disconnect()
          }
        })
      },
      { threshold: 0.15 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [delay])
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

function Hero() {
  const parallaxRef = useParallax(0.03)
  return (
    <section id="overview" className="relative isolate overflow-hidden bg-stone-50">
      <LandingHeroBackground />

      <div className={cn(container, "relative z-10 pb-10 pt-8 sm:pb-16 sm:pt-12 md:pt-16")}>
        <Reveal className="mx-auto max-w-5xl text-center">
          <span className="inline-flex items-center rounded-full border border-stone-300/60 bg-white px-3 py-1 text-xs text-stone-700">
            <span className="sm:hidden">{"AI Project Management"}</span>
            <span className="hidden sm:inline">{"Projects • Procurement • Payments"}</span>
          </span>
          <h1 className={cn("mt-5 text-center", TITLE_H1)}>
            <span className="sm:hidden">{"AI-Powered Project Management"}</span>
            <span className="hidden sm:inline">
              {"AI-Powered Project Management Software for Interior Designers"}
            </span>
          </h1>
          <p className="mt-4 text-center text-base sm:text-lg text-stone-600">
            <span className="sm:hidden">
              {"From first brief to final invoice - timelines, budgets, and approvals handled automatically."}
            </span>
            <span className="hidden sm:inline">
              {
                "From first inquiry to final invoice, Techstyles transforms chaotic spreadsheets and endless emails into live timelines, real-time budgets, and one-click client approvals."
              }
            </span>
          </p>
          <div className="mx-auto mt-5 flex justify-center">
            <CtaButton href="/signup" variant="slate" label="Start for free" showArrow arrowVariant="white" />
          </div>
        </Reveal>

        <Reveal>
          <div ref={parallaxRef} className="mx-auto mt-8 max-w-6xl sm:mt-10 will-change-transform">
            <Card className="overflow-hidden border-stone-200 shadow-xl">
              <CardContent className="p-2 sm:p-3">
                <div className="relative w-full">
                  <Image
                    src="/images/app/dashboard-projects-board.png"
                    alt="Techstyles project management dashboard showing active interior design projects including Chelsea Penthouse, Cotswold Country Home, and Bath Boutique Hotel with progress tracking, budgets, and team assignments"
                    width={1600}
                    height={900}
                    priority={true}
                    className="h-auto w-full rounded-lg bg-stone-50 object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1200px"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function LogoCloud() {
  const logos = [
    {
      src: "/logos/ten-interiors.png",
      alt: "TEN interiors design studio logo",
      name: "TEN interiors",
    },
    {
      src: "/logos/sarah-long-design.png",
      alt: "Sarah Long Design Studio logo",
      name: "Sarah Long Design Studio",
    },
    {
      src: "/logos/souq-studio.png",
      alt: "Souq.Studio design studio logo",
      name: "Souq.Studio",
    },
    {
      src: "/logos/your-design-studio.png",
      alt: "Your Design Studio logo",
      name: "Your Design Studio",
    },
    {
      src: "/logos/arc-architects.png",
      alt: "ARC architects studio logo",
      name: "ARC architects",
    },
    {
      src: "/logos/dl-arch-design.png",
      alt: "DL ARCH + DESIGN studio logo",
      name: "DL ARCH + DESIGN",
    },
  ]
  return (
    <section className="bg-white py-12" aria-labelledby="trusted-studios">
      <div className={container}>
        <h2 id="trusted-studios" className="text-center text-xl font-medium text-stone-500">
          Powering the industry's most innovative studios
        </h2>
        <div className="mt-6 grid grid-cols-2 items-center gap-6 sm:grid-cols-3 md:grid-cols-6">
          {logos.map((logo, idx) => (
            <Image
              key={idx}
              src={logo.src || "/placeholder.svg"}
              alt={logo.alt}
              width={200}
              height={200}
              loading="lazy"
              className="mx-auto h-16 w-auto object-contain"
              sizes="(max-width: 768px) 33vw, (max-width: 1280px) 16vw, 200px"
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function AiLayer() {
  const cards = [
    {
      icon: LucideReact.Wand2,
      title: "AI assistant",
      text: "Ask AI to draft your email, create a task, summarise a meeting or reorganise your day.",
      iconColor: "text-stone-600",
    },
    {
      icon: LucideReact.GitBranch,
      title: "AI tasks",
      text: "Instantly turn that brief into a task map—complete with dependencies, dates, and owners.",
      iconColor: "text-stone-600",
    },
    {
      icon: LucideReact.ShoppingCart,
      title: "AI procurement",
      text: "Web-clip any product, pull specs & pricing, and raise the PO (with tracking) in one click.",
      iconColor: "text-stone-600",
    },
    {
      icon: LucideReact.AudioLines,
      title: "AI note-taker",
      text: "Auto-transcribe meetings or site visits into action-items, RFIs, and searchable project notes.",
      iconColor: "text-stone-600",
    },
  ]

  const pills = [
    { label: "Library", href: "/platform/features/library", icon: LucideReact.BookOpen },
    { label: "Workflow", href: "/platform/projects", icon: LucideReact.GitBranch },
    { label: "AI", href: "/platform/ai", icon: LucideReact.Sparkles, active: true },
    { label: "Insights", href: "/platform/finance", icon: LucideReact.BarChart3 },
    { label: "Automation", href: "/platform/features/ai-email", icon: LucideReact.Bot },
  ]

  return (
    <section id="ai" className="relative bg-white py-16 text-stone-900 sm:py-20" aria-labelledby="ai-features">
      <div className={container}>
        {/* Header & sub-line */}
        <div className="mx-auto max-w-3xl text-center">
          <h2 id="ai-features" className="text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight">
            The future of design management is intelligent
          </h2>
          <p className="mt-3 text-left sm:text-center text-base sm:text-lg text-stone-600">
            {
              "Move beyond standard project tools. Techstyles is the first interior design platform with an intelligent AI layer that automates admin, anticipates needs, and frees you up to focus on creative work."
            }
          </p>
        </div>

        {/* Washed painted container */}
        <div
          className="relative mx-auto mt-10 max-w-6xl overflow-hidden rounded-3xl border p-4 sm:p-6 md:p-7"
          style={{
            // Warm greige base from the reference
            backgroundColor: "#D9D5CC",
          }}
        >
          {/* Slightly warmer border to sit on the greige */}
          <div
            className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] ring-1 ring-stone-300/70"
            aria-hidden
          />

          {/* Paint texture wash (very subtle) */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] bg-center"
            style={{
              backgroundImage: "url('/textures/paint-wash.png')",
              backgroundSize: "cover",
              opacity: 0.18,
              mixBlendMode: "multiply",
            }}
          />

          {/* Soft vignette/uneven wash lighting */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit]"
            style={{
              background:
                "radial-gradient(120% 80% at 50% 0%, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.03) 45%, rgba(255,255,255,0.06) 100%)",
            }}
          />

          {/* Gentle inner highlights/shadows for depth */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_1px_0_rgba(255,255,255,0.35),inset_0_-1px_0_rgba(0,0,0,0.05)]"
          />

          {/* Cards */}
          <div className="relative grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4 sm:gap-7">
            {cards.map((c) => (
              <Card
                key={c.title}
                className="rounded-2xl border border-stone-200 bg-white text-stone-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <CardContent className="p-6 sm:p-7">
                  <c.icon className={`h-6 w-6 ${c.iconColor}`} aria-hidden="true" />
                  <h3 className="mt-5 text-lg font-semibold leading-tight text-stone-950 sm:text-xl">{c.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-800 sm:text-base">{c.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Section nav pills (light theme) */}
        <nav
          className="mx-auto mt-10 flex max-w-6xl flex-wrap items-center justify-center gap-3"
          aria-label="Platform features"
        >
          {pills.map((p) => {
            const Icon = p.icon
            const active = Boolean((p as any).active)
            return (
              <Button
                key={p.label}
                asChild
                variant="outline"
                className={
                  active
                    ? "h-12 rounded-full bg-stone-900 px-6 text-white hover:bg-stone-800 focus-visible:ring-2 focus-visible:ring-stone-400"
                    : "h-12 rounded-full border-stone-300 bg-white px-6 text-stone-800 hover:bg-stone-50 focus-visible:ring-2 focus-visible:ring-stone-300"
                }
              >
                <Link href={p.href} aria-current={active ? "page" : undefined} aria-label={`${p.label} features`}>
                  <span className="inline-flex items-center gap-2">
                    {Icon ? (
                      <Icon
                        className={active ? "h-4 w-4" : "h-4 w-4 text-stone-700"}
                        style={active ? { color: "#F7CF52" } : undefined}
                        aria-hidden="true"
                      />
                    ) : null}
                    <span>{p.label}</span>
                  </span>
                </Link>
              </Button>
            )
          })}
        </nav>
      </div>
    </section>
  )
}

function DesignerTestimonials() {
  const people = [
    {
      name: "Tess H.",
      role: "Design studio",
      avatar:
        "/images/u5454174911-i-need-a-thumbnail-image-of-a-headshot-of-a-femai-25209f6b-0e97-4edd-95f6-51427c50486b-3.png",
      studioLogo: "/logos/souq-studio.png",
      quote: "From proposal to payment, it just works.",
    },
    {
      name: "Sarah",
      role: "Interior designer",
      avatar:
        "/images/u5454174911-i-need-a-thumbnail-image-of-a-headshot-of-a-femai-25209f6b-0e97-4edd-95f6-51427c50486b-1.png",
      studioLogo: "/logos/studio-mind.png",
      quote:
        "Techstyles transformed the way I manage my business. I can now focus more on creativity and less on admin!",
    },
    {
      name: "James",
      role: "Design studio owner",
      avatar:
        "/images/u5454174911-i-need-a-thumbnail-image-of-a-headshot-of-a-profe-5caf6ba9-5e7d-4e36-ad28-1af76d277ba5-3.png",
      studioLogo: "/logos/houzz-black.png",
      quote: "Clients love the clarity. We love the speed.",
    },
  ]
  const [active, setActive] = useState(0)
  const current = people[active]

  return (
    <section id="stories" className="bg-stone-50 py-20 sm:py-24" aria-labelledby="testimonials">
      <div className={container}>
        <Reveal className="mx-auto max-w-4xl text-center">
          <h2 id="testimonials" className={TITLE_H2}>
            How designers are saving 10+ hours a week
          </h2>
        </Reveal>

        <Reveal className="mt-10">
          {/* Ensure equal column heights */}
          <div className="grid items-stretch gap-6 md:grid-cols-12 lg:gap-8">
            {/* Left: Partner logos list (enlarged, uniform, no arrows here) */}
            <div className="md:col-span-3">
              <div className="h-full rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
                <ul
                  className="flex h-full flex-col justify-between gap-5"
                  role="tablist"
                  aria-label="Customer testimonials"
                >
                  {people.map((p, i) => {
                    const isActive = i === active
                    return (
                      <li key={p.name} role="presentation">
                        <button
                          onClick={() => setActive(i)}
                          className={cn(
                            "w-full rounded-2xl border transition",
                            "flex h-28 items-center justify-center sm:h-32 md:h-36 px-4",
                            isActive
                              ? "border-stone-900 bg-stone-100/80"
                              : "border-stone-200 bg-white hover:border-stone-300",
                          )}
                          role="tab"
                          aria-selected={isActive}
                          aria-controls={`testimonial-${i}`}
                          aria-label={`View testimonial from ${p.name} at ${p.role}`}
                        >
                          <Image
                            src={p.studioLogo || "/placeholder.svg?height=56&width=240&query=partner%20logo"}
                            alt={`${p.name}'s studio logo`}
                            width={320}
                            height={96}
                            className={cn(
                              "w-auto max-h-[74%] sm:max-h-[80%] md:max-h-[85%] object-contain",
                              isActive ? "opacity-100" : "opacity-85",
                            )}
                            sizes="(max-width: 768px) 60vw, (max-width: 1280px) 20vw, 260px"
                            priority={false}
                          />
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>

            {/* Middle: Portrait */}
            <div className="md:col-span-5">
              <div className="h-full overflow-hidden rounded-3xl border border-stone-200 bg-white">
                <Image
                  src={current.avatar || "/placeholder.svg"}
                  alt={`Portrait of ${current.name}, ${current.role}`}
                  width={1000}
                  height={1250}
                  className="h-full w-full object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 45vw, 520px"
                  unoptimized
                />
              </div>
            </div>

            {/* Right: Quote */}
            <div className="md:col-span-4">
              <div
                className="flex h-full items-center rounded-3xl border border-stone-200 bg-stone-100/80 p-8 sm:p-10"
                role="tabpanel"
                id={`testimonial-${active}`}
              >
                <div>
                  <blockquote className="text-base sm:text-2xl md:text-3xl leading-relaxed text-stone-900">
                    {`"${current.quote}"`}
                  </blockquote>
                  <cite className="mt-4 not-italic">
                    <div className="font-semibold text-stone-900">{current.name}</div>
                    <div className="text-sm text-stone-600">{current.role}</div>
                  </cite>
                </div>
              </div>
            </div>
          </div>

          {/* Centered navigation controls below the block */}
          <div className="mt-8 flex justify-center gap-4">
            <Button
              type="button"
              variant="outline"
              className="h-11 w-11 rounded-full p-0 bg-white"
              onClick={() => setActive((prev) => (prev - 1 + people.length) % people.length)}
              aria-label="Previous testimonial"
            >
              <LucideReact.ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 w-11 rounded-full p-0 bg-white"
              onClick={() => setActive((prev) => (prev + 1) % people.length)}
              aria-label="Next testimonial"
            >
              <LucideReact.ChevronRight className="h-5 w-5" aria-hidden="true" />
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function BigCTA() {
  return (
    <section
      id="waitlist"
      className="relative isolate overflow-hidden py-24 text-stone-100"
      style={{ backgroundColor: "#3F4B51" }}
      aria-labelledby="cta-heading"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{ backgroundImage: "url('/textures/grain.png')", backgroundSize: "200px 200px" }}
      />
      <div className={container}>
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <h2 id="cta-heading" className="text-2xl sm:text-[28px] md:text-[32px] font-medium tracking-tight">
              {"Get visibility over your studio, team and projects."}
            </h2>
            <p className="mt-3 text-base sm:text-lg text-stone-300">
              {"Wave goodbye to uncertainty with Techstyles - your AI-powered studio operating system"}
            </p>
            <div className="mt-8 flex justify-center">
              <CtaButton href="/signup" variant="white" label="Start for free" showArrow arrowVariant="black" />
            </div>
            <p className="mt-3 text-xs sm:text-sm text-stone-400">{"No credit card required"}</p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t bg-white" role="contentinfo">
      <div className={cn(container, "grid grid-cols-1 gap-8 py-10 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5")}>
        <div className="space-y-3">
          <Link href="/" className="flex items-center gap-2" aria-label="Techstyles Home">
            <Image
              src="/images/branding/techstyles-mark.png"
              alt="Techstyles logo"
              width={24}
              height={24}
              className="h-6 w-6 rounded-md object-cover"
              priority={false}
            />
            <span className="font-semibold">Techstyles</span>
          </Link>
          <p className="text-sm text-stone-600">Calm, premium tools for interior design studios & architects.</p>
        </div>

        <nav aria-labelledby="platform-nav">
          <h3 id="platform-nav" className="font-medium">
            Platform
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-stone-600">
            <li>
              <Link href="/platform" className="hover:text-stone-900">
                Product Overview
              </Link>
            </li>
            <li>
              <Link href="/platform/crm" className="hover:text-stone-900">
                CRM
              </Link>
            </li>
            <li>
              <Link href="/platform/projects" className="hover:text-stone-900">
                Project Management
              </Link>
            </li>
            <li>
              <Link href="/platform/finance" className="hover:text-stone-900">
                Finance
              </Link>
            </li>
            <li>
              <Link href="/platform/client-portal" className="hover:text-stone-900">
                Client Portal
              </Link>
            </li>
            <li>
              <Link href="/platform/procurement" className="hover:text-stone-900">
                Procurement
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-labelledby="resources-nav">
          <h3 id="resources-nav" className="font-medium">
            Resources
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-stone-600">
            <li>
              <Link href="/resources" className="hover:text-stone-900">
                Resources
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-stone-900">
                Blog
              </Link>
            </li>
            <li>
              <Link href="#stories" className="hover:text-stone-900">
                Customer stories
              </Link>
            </li>
            <li>
              <Link href="/compare/programa" className="hover:text-stone-900">
                Techstyles vs Programa
              </Link>
            </li>
            <li>
              <Link href="/compare/design-manager" className="hover:text-stone-900">
                Techstyles vs Design Manager
              </Link>
            </li>
            <li>
              <Link href="/knowledge" className="hover:text-stone-900">
                Knowledge Centre
              </Link>
            </li>
            <li>
              <Link href="/changelog" className="hover:text-stone-900">
                Changelog
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-labelledby="company-nav">
          <h3 id="company-nav" className="font-medium">
            Company
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-stone-600">
            <li>
              <Link href="/about" className="hover:text-stone-900">
                About
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="hover:text-stone-900">
                Pricing
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-stone-900">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/careers" className="hover:text-stone-900">
                Careers
              </Link>
            </li>
            <li>
              <Link href="/partners" className="hover:text-stone-900">
                Partners
              </Link>
            </li>
            <li>
              <Link href="/sitemap.xml" className="hover:text-stone-900">
                Sitemap
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h3 className="font-medium">Stay in the loop</h3>
          <form className="mt-3" aria-label="Newsletter signup">
            <label htmlFor="footer-email" className="sr-only">
              Enter your email address
            </label>
            <Input
              id="footer-email"
              name="footer-email"
              type="email"
              placeholder="Enter your email"
              aria-label="Enter your email"
              className="h-12 w-full rounded-lg bg-white text-stone-900 placeholder:text-stone-500 border-stone-200 focus-visible:border-stone-300"
            />
          </form>
          <div className="mt-4 flex gap-3">
            <a
              href="https://facebook.com/techstyles"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow Techstyles on Facebook"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-900 ring-1 ring-stone-200 hover:bg-stone-200"
            >
              <LucideReact.Facebook className="h-5 w-5" aria-hidden="true" />
            </a>
            <a
              href="https://twitter.com/techstyles"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow Techstyles on Twitter"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-900 ring-1 ring-stone-200 hover:bg-stone-200"
            >
              <LucideReact.Twitter className="h-5 w-5" aria-hidden="true" />
            </a>
            <a
              href="https://instagram.com/techstyles"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow Techstyles on Instagram"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-900 ring-1 ring-stone-200 hover:bg-stone-200"
            >
              <LucideReact.Instagram className="h-5 w-5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t py-4">
        <div className={cn(container, "flex items-center justify-between text-xs text-stone-500")}>
          <div>©Copyright 2025 Techstyles. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-stone-900">
              Privacy policy
            </Link>
            <Link href="/terms" className="hover:text-stone-900">
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

// JSON-LD structured data for homepage
const homepageSchema = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://techstyles.ai/#organization",
    name: "Techstyles",
    url: "https://techstyles.ai",
    logo: {
      "@type": "ImageObject",
      url: "https://techstyles.ai/images/logo.png",
      width: 200,
      height: 60,
    },
    description: "AI-powered project management software for interior designers and architects.",
    foundingDate: "2024",
    sameAs: [
      "https://twitter.com/techstyles",
      "https://linkedin.com/company/techstyles",
      "https://instagram.com/techstyles",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "hello@techstyles.ai",
      availableLanguage: ["English"],
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": "https://techstyles.ai/#software",
    name: "Techstyles",
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Project Management Software",
    operatingSystem: "Web",
    description:
      "Interior design studio management software for project management, procurement, client collaboration, and finance.",
    url: "https://techstyles.ai",
    author: { "@id": "https://techstyles.ai/#organization" },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "GBP",
      description: "Free 3-month beta access available",
      availability: "https://schema.org/InStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "150",
      bestRating: "5",
      worstRating: "1",
    },
    featureList: [
      "Project Management",
      "CRM for Design Studios",
      "AI-Powered Procurement",
      "Client Portal & Approvals",
      "Finance & Invoicing",
      "Product Library Management",
    ],
    screenshot: "https://techstyles.ai/images/og-image.png",
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://techstyles.ai/#website",
    name: "Techstyles",
    url: "https://techstyles.ai",
    publisher: { "@id": "https://techstyles.ai/#organization" },
    potentialAction: {
      "@type": "SearchAction",
      target: "https://techstyles.ai/blog?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  },
]

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageSchema) }}
      />
      <Hero />
      <LogoCloud />
      <AttentionBanner />
      <FeatureBlocks />
      <AiLayer />
      <SloganBanner />
      <DesignerTestimonials />
      <BigCTA />
    </>
  )
}
