/**
 * Focuspilot Typography System
 * Based on Perfect Fourth (1.333) scale
 * Inspired by Linear, Vercel, Stripe, Notion design systems
 *
 * Design Philosophy:
 * - Major headings (Hero, H2, CTA) use font-medium for elegant, refined aesthetic
 * - Smaller elements (H3, buttons, labels) use font-semibold for emphasis
 */

// Hero/Page Titles - The largest, most prominent text
// Desktop: 56px | Tablet: 48px | Mobile: 32px
export const HERO = "text-[32px] sm:text-5xl md:text-[56px] font-medium tracking-tight leading-[1.1]"

// Section Headings - Major content dividers
// Desktop: 36px | Tablet: 30px | Mobile: 24px
export const H2 = "text-2xl sm:text-[30px] md:text-4xl font-medium tracking-tight"

// CTA Block Headings - Footer call-to-action sections (smaller than H2)
// Desktop: 32px | Tablet: 28px | Mobile: 24px
export const CTA_HEADING = "text-2xl sm:text-[28px] md:text-[32px] font-medium tracking-tight"

// Feature/Card Headings - Smaller content blocks
// Desktop: 24px | Tablet: 22px | Mobile: 20px
export const H3 = "text-xl sm:text-[22px] md:text-2xl font-semibold tracking-tight"

// Lead/Intro Text - Larger body for emphasis
export const LEAD = "text-base sm:text-lg text-stone-600"

// CTA Description text
export const CTA_BODY = "text-base sm:text-lg"

// CTA Subtext - "No credit card required" etc
export const CTA_SUBTEXT = "text-xs sm:text-sm"

// Brand Color Palette
export const brandColors = {
  // Primary Clay (Warm Terracotta)
  clay: {
    600: "#CE6B4E", // Hover state
    500: "#E07A57", // Primary
    400: "#E68E71", // Tint
    200: "#F1BBAA", // Pill/badge bg
    50: "#FBEAE1",  // Wash
  },
  // Greens (Natural Balance)
  sage: {
    500: "#8FA58F", // Primary accent
    300: "#B9C7B7", // Chips/badges
    100: "#ECF3EC", // Light wash
  },
  olive: {
    600: "#6E7A58", // Muted accent
  },
  // Cool Slate
  slate: {
    900: "#3F4B51", // CTA dark backgrounds
    700: "#4B5960", // Icons on warm bg
    500: "#6B7C85", // Links/secondary
  },
  // Earth Accents
  ochre: {
    500: "#C78A3B", // Highlight/CTA alt
    300: "#D8A864", // Badge
  },
  terracotta: {
    600: "#B75A41", // Deep warmth
  },
  umber: {
    600: "#6A4B3C", // Strong accent
  },
  // Warm Neutrals
  bone: {
    50: "#FAF7F2", // Page base
  },
  greige: {
    100: "#EFEAE2", // Panel
    300: "#D9D5CC", // AI container
    500: "#B6B0A4", // Borders
  },
  taupe: {
    700: "#7D786C", // Sub-headers
  },
  // Text
  ink: "#1F1D1A",
  inkMuted: "#4E4943",
}

// Text colors for different backgrounds
export const colors = {
  light: {
    primary: "text-stone-950",
    secondary: "text-stone-700",
    muted: "text-stone-500",
  },
  dark: {
    primary: "text-white",
    secondary: "text-stone-300",
    muted: "text-stone-400",
  },
  warm: {
    primary: "text-stone-950",
    secondary: "text-stone-900/80",
    muted: "text-stone-900/60",
  },
}

// Visual Hierarchy Ratios (for reference):
// Section H2 = ~64% of Hero (36/56)
// CTA Heading = ~57% of Hero (32/56)
// CTA Heading = ~89% of Section H2 (32/36)
