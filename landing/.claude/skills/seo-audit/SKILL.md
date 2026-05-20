---
name: seo-audit
description: Comprehensive SEO analysis and optimization for landing pages. Use when auditing meta tags, structured data, schema markup, sitemap, internal linking, or page titles. Triggers on keywords like SEO, meta description, schema, JSON-LD, sitemap, search ranking, Google.
allowed-tools: Read, Grep, Glob, Bash(npm run:*), WebFetch
---

# SEO Audit & Optimization

## Overview
Analyze and optimize pages for search engine visibility through technical SEO, on-page optimization, and structured data implementation.

## Checklist

### Technical SEO
- [ ] XML sitemap exists and includes all important pages
- [ ] robots.txt is configured correctly
- [ ] Canonical tags on all pages
- [ ] No duplicate content issues
- [ ] Mobile-friendly (responsive)
- [ ] HTTPS enabled
- [ ] Clean URL structure

### On-Page SEO (Per Page)
- [ ] Unique title tag (50-60 characters, keyword-rich)
- [ ] Meta description (150-160 characters, compelling CTA)
- [ ] Single H1 tag per page (matches intent)
- [ ] Logical heading hierarchy (H2, H3, H4)
- [ ] Alt text on all images (descriptive, not keyword-stuffed)
- [ ] Internal links to related pages
- [ ] External links have rel="noopener noreferrer"

### Structured Data (JSON-LD)
- [ ] Organization schema on homepage
- [ ] BreadcrumbList schema on subpages
- [ ] SoftwareApplication schema for product pages
- [ ] FAQPage schema where applicable
- [ ] LocalBusiness schema if applicable

### Open Graph & Social
- [ ] og:title, og:description, og:image on all pages
- [ ] og:type set correctly (website, article, product)
- [ ] Twitter card tags (summary_large_image)
- [ ] Social images are 1200x630px

## Instructions

1. **Initial Audit**
   - Scan all page files in `/app` directory
   - Check each layout.tsx and page.tsx for metadata exports
   - Validate sitemap.ts includes all live routes
   - Review lib/seo-schemas.tsx for structured data

2. **Title & Description Analysis**
   - Ensure titles are unique across all pages
   - Check character counts (title: 50-60, desc: 150-160)
   - Verify primary keyword placement
   - Ensure brand consistency

3. **Schema Validation**
   - Check JSON-LD syntax validity
   - Verify schema types match page content
   - Test with Google Rich Results Test mentally
   - Ensure URLs use correct domain (focuspilot.io)

4. **Internal Linking Audit**
   - Map out page relationships
   - Identify orphan pages (no internal links)
   - Suggest cross-linking opportunities
   - Check for broken internal links

## Key Files in This Project
- `app/layout.tsx` - Root metadata
- `app/*/layout.tsx` - Section metadata
- `app/*/page.tsx` - Page content and H1 tags
- `app/sitemap.ts` - Dynamic sitemap generation
- `lib/seo-schemas.tsx` - JSON-LD structured data
- `components/seo/breadcrumb-schema.tsx` - Breadcrumb navigation

## Best Practices
- Keep meta descriptions action-oriented with CTA
- Use global positioning; avoid geo-locking titles/meta to a single country unless creating locale-specific pages
- Include pricing signals ("Free trial", "Start free")
- Test changes with Google Search Console
- Monitor Core Web Vitals impact on rankings
