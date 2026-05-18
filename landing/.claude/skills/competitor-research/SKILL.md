---
name: competitor-research
description: Research competitors and create comparison pages for SEO. Use when analyzing competitor products, creating vs comparison pages, researching alternatives, or building competitive positioning content. Triggers on keywords like competitor, comparison, vs, alternative, Houzz Pro, Programa, Studio Designer, DesignFiles, Mydoma.
allowed-tools: Read, Grep, Glob, Bash(npm run:*), WebFetch, WebSearch
---

# Competitor Research & Comparison Pages

## Overview
Research competitor interior design software and create compelling comparison pages that rank for "alternative to" and "vs" search queries.

## Target Competitors

### Primary Competitors (High Priority)
| Competitor | Target Keywords |
|------------|-----------------|
| Houzz Pro | houzz pro alternative, techstyles vs houzz pro |
| Programa | programa alternative, techstyles vs programa |
| Studio Designer | studio designer alternative, techstyles vs studio designer |
| DesignFiles | designfiles alternative, techstyles vs designfiles |

### Secondary Competitors
| Competitor | Target Keywords |
|------------|-----------------|
| Mydoma Studio | mydoma alternative |
| Design Manager | design manager alternative |
| Ivy (now Houzz Pro) | ivy design software alternative |
| Monday.com | project management for interior designers |
| Asana | interior design project management |

## Comparison Page Template

### SEO Requirements
- Title: "[Competitor] Alternative for Interior Designers | Focuspilot vs [Competitor]"
- H1: "Focuspilot vs [Competitor]: Which Interior Design Software is Right for You?"
- Meta description: "Compare Focuspilot and [Competitor] for interior design project management. See features, pricing, and why UK designers choose Focuspilot. Free trial available."

### Page Structure
```
1. Hero Section
   - Clear comparison headline
   - Quick verdict/summary
   - CTA to try Focuspilot

2. Quick Comparison Table
   - Key features side-by-side
   - Pricing comparison
   - Target audience fit

3. Detailed Feature Comparison
   - Project Management
   - Procurement & FF&E
   - Client Portal
   - Finance & Invoicing
   - CRM
   - AI Features

4. Pricing Breakdown
   - Competitor pricing tiers
   - Focuspilot pricing
   - Value comparison

5. Who Should Choose What
   - Best for [use case]: Focuspilot
   - Best for [use case]: Competitor
   - Honest positioning

6. Migration Section
   - How to switch from [Competitor]
   - Data migration support
   - Onboarding help

7. Customer Testimonials
   - Quotes from switchers
   - Before/after stories

8. FAQ Section
   - Common comparison questions
   - Structured data for rich snippets

9. Final CTA
   - Try Focuspilot free
   - Book demo
```

## Research Framework

### Information to Gather
1. **Product Overview**
   - Core features
   - Target market (firm size, specialty)
   - Unique selling points
   - Known weaknesses

2. **Pricing**
   - Pricing tiers
   - Per-user vs flat rate
   - Free trial availability
   - Contract requirements

3. **Feature Gaps**
   - What Focuspilot does better
   - What competitor does better
   - Feature parity areas

4. **Market Positioning**
   - Brand perception
   - Customer reviews (G2, Capterra)
   - Common complaints
   - Praise points

### Research Sources
- Competitor websites
- G2 reviews
- Capterra reviews
- Reddit discussions
- Interior design forums
- LinkedIn posts
- YouTube reviews

## Comparison Content Guidelines

### Tone & Approach
- Be factual and fair (builds trust)
- Acknowledge competitor strengths
- Focus on differentiation, not bashing
- Use specific examples and data
- Let features speak for themselves

### Honesty Framework
```
"[Competitor] is excellent for [use case], but Focuspilot
is purpose-built for [different use case] with features like..."
```

### Claims to Avoid
- Unverifiable superlatives ("best", "fastest")
- Outdated competitor information
- Misleading feature comparisons
- Price comparisons without context

### Claims to Include
- Specific feature differences
- Verifiable facts
- Customer quotes (with permission)
- Use case fit analysis

## Schema Markup for Comparison Pages

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Focuspilot vs [Competitor]",
  "description": "Detailed comparison...",
  "author": {
    "@type": "Organization",
    "name": "Focuspilot"
  },
  "datePublished": "2025-01-08",
  "dateModified": "2025-01-08"
}
```

Also include FAQPage schema for the FAQ section.

## File Locations in This Project

### Existing Comparison Pages
- `/app/compare/programa/page.tsx`
- `/app/compare/design-manager/page.tsx`

### To Create
- `/app/compare/page.tsx` (comparison hub)
- `/app/compare/houzz-pro/page.tsx`
- `/app/compare/studio-designer/page.tsx`
- `/app/compare/designfiles/page.tsx`

### Layout
- `/app/compare/layout.tsx` - Shared comparison layout

## Instructions

1. **Research Phase**
   - Use WebSearch to find current competitor info
   - WebFetch competitor pricing pages
   - Find recent reviews and feedback
   - Document findings

2. **Content Planning**
   - Identify key differentiators
   - Map feature comparisons
   - Note honest strengths/weaknesses
   - Plan page structure

3. **Page Creation**
   - Follow existing comparison page patterns
   - Include proper metadata
   - Add schema markup
   - Create responsive comparison tables

4. **SEO Optimization**
   - Target "vs" and "alternative" keywords
   - Include competitor name in title/H1
   - Add FAQ schema
   - Internal link to relevant features

## Quick Competitor Research Prompts

When asked to research a competitor:
1. Search for "[competitor] interior design software review"
2. Search for "[competitor] pricing 2025"
3. Search for "[competitor] vs alternatives"
4. Fetch their main features page
5. Check G2/Capterra for recent reviews
