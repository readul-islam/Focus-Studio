---
name: performance-audit
description: Website performance optimization and Core Web Vitals analysis. Use when auditing page speed, bundle size, image optimization, lazy loading, or runtime performance. Triggers on keywords like performance, speed, slow, Core Web Vitals, LCP, CLS, FID, bundle size, lighthouse.
allowed-tools: Read, Grep, Glob, Bash(npm run:*), Bash(npx:*)
---

# Performance Audit & Optimization

## Overview
Optimize page load speed, Core Web Vitals, bundle size, and runtime performance for better UX and SEO rankings.

## Core Web Vitals Targets

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| LCP (Largest Contentful Paint) | < 2.5s | 2.5s - 4s | > 4s |
| FID (First Input Delay) | < 100ms | 100ms - 300ms | > 300ms |
| CLS (Cumulative Layout Shift) | < 0.1 | 0.1 - 0.25 | > 0.25 |
| INP (Interaction to Next Paint) | < 200ms | 200ms - 500ms | > 500ms |

## Performance Checklist

### Image Optimization
- [ ] Using next/image for all images
- [ ] Images have explicit width/height (prevents CLS)
- [ ] Using modern formats (WebP with AVIF where supported)
- [ ] Responsive images with srcset
- [ ] Lazy loading for below-fold images
- [ ] Priority loading for LCP image
- [ ] Images properly sized (not oversized)
- [ ] Placeholder blur for large images

### JavaScript Optimization
- [ ] Code splitting by route (automatic in Next.js)
- [ ] Dynamic imports for heavy components
- [ ] Third-party scripts loaded async/defer
- [ ] No blocking scripts in head
- [ ] Tree shaking working properly
- [ ] Bundle size monitored

### CSS Optimization
- [ ] Critical CSS inlined (Next.js handles this)
- [ ] Unused CSS removed (Tailwind purge)
- [ ] No render-blocking stylesheets
- [ ] CSS animations use transform/opacity
- [ ] No layout thrashing from style changes

### Font Optimization
- [ ] Using next/font for self-hosting
- [ ] Font display: swap for FOIT prevention
- [ ] Preloading critical fonts
- [ ] Subset fonts to needed characters
- [ ] Limited font weights loaded

### Server & Caching
- [ ] Static pages pre-rendered where possible
- [ ] Proper cache headers on static assets
- [ ] CDN configured for global delivery
- [ ] API responses cached appropriately
- [ ] ISR (Incremental Static Regeneration) where beneficial

## Next.js Specific Optimizations

### App Router Best Practices
```tsx
// Use Server Components by default (no "use client")
// Only add "use client" for interactivity

// Good: Server Component
export default function Page() {
  return <StaticContent />
}

// Only when needed: Client Component
"use client"
export function InteractiveWidget() {
  const [state, setState] = useState()
  return <button onClick={() => setState(...)}>Click</button>
}
```

### Image Component Usage
```tsx
import Image from 'next/image'

// Hero image (priority for LCP)
<Image
  src="/hero.png"
  alt="Hero description"
  width={1200}
  height={600}
  priority
  placeholder="blur"
  blurDataURL="data:image/..."
/>

// Below-fold image (lazy loaded)
<Image
  src="/feature.png"
  alt="Feature description"
  width={600}
  height={400}
  loading="lazy"
/>
```

### Dynamic Imports
```tsx
import dynamic from 'next/dynamic'

// Heavy component loaded only when needed
const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false // Disable SSR if not needed
})
```

### Font Optimization
```tsx
// app/layout.tsx
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export default function RootLayout({ children }) {
  return (
    <html className={inter.variable}>
      <body>{children}</body>
    </html>
  )
}
```

## Common Performance Issues

### LCP Issues
1. Large unoptimized hero images
2. Render-blocking resources
3. Slow server response time
4. Client-side rendering of above-fold content
5. Font loading blocking text paint

### CLS Issues
1. Images without dimensions
2. Ads/embeds without reserved space
3. Dynamically injected content
4. Web fonts causing FOIT/FOUT
5. Animations that trigger layout

### FID/INP Issues
1. Long JavaScript tasks blocking main thread
2. Large JavaScript bundles
3. Excessive hydration work
4. Complex event handlers
5. Layout thrashing in interactions

## Analysis Commands

```bash
# Build and analyze bundle
npm run build
npx @next/bundle-analyzer

# Lighthouse audit
npx lighthouse http://localhost:3001 --view

# Check bundle sizes
ls -la .next/static/chunks/*.js | sort -k5 -n

# Find large dependencies
npx depcheck
npx cost-of-modules
```

## This Project's Performance Priorities

### Current Stack
- Next.js 14.2.25 (App Router)
- React 18/19
- Tailwind CSS (purged in production)
- Lucide React (tree-shakeable icons)

### Key Areas to Monitor
1. Homepage LCP (hero image)
2. Platform pages image loading
3. Client-side navigation speed
4. Form interactivity responsiveness
5. Mobile performance (slower devices)

### Quick Wins
1. Add `priority` to hero images
2. Use `loading="lazy"` for below-fold images
3. Dynamic import heavy components
4. Ensure all images have width/height
5. Minimize client-side JavaScript

## Instructions

1. **Measure Baseline**
   - Run Lighthouse on key pages
   - Document current Core Web Vitals
   - Identify largest resources

2. **Analyze Issues**
   - Check image optimization
   - Review JavaScript bundles
   - Identify render-blocking resources
   - Check for CLS sources

3. **Prioritize Fixes**
   - Focus on LCP first (biggest impact)
   - Then CLS (user experience)
   - Then FID/INP (interactivity)

4. **Implement & Verify**
   - Make one change at a time
   - Measure after each change
   - Document improvements
   - Monitor in production
