---
name: design-review
description: UI/UX design review and improvements for landing pages. Use when analyzing visual hierarchy, spacing, typography, color contrast, accessibility, responsive design, or component consistency. Triggers on keywords like design, UI, UX, layout, spacing, colors, accessibility, mobile, responsive.
allowed-tools: Read, Grep, Glob, Bash(npm run:*)
---

# Design Review & UI/UX Improvements

## Overview
Evaluate and improve visual design, accessibility, component consistency, and user experience across landing pages.

## Design System Checklist

### Visual Hierarchy
- [ ] Clear primary, secondary, tertiary text hierarchy
- [ ] Headings create logical content flow
- [ ] Important elements have visual weight
- [ ] Whitespace guides the eye
- [ ] CTAs stand out from surrounding content

### Typography
- [ ] Font sizes follow a consistent scale
- [ ] Line height appropriate (1.4-1.6 for body)
- [ ] Maximum line length ~65-75 characters
- [ ] Font weights used purposefully
- [ ] Consistent font family usage

### Spacing
- [ ] Consistent spacing scale (4px, 8px, 16px, 24px, 32px, 48px, 64px)
- [ ] Adequate padding in clickable elements
- [ ] Sections have clear visual separation
- [ ] Related items grouped closely
- [ ] Unrelated items have more space

### Color
- [ ] Primary brand color used consistently
- [ ] Secondary colors support hierarchy
- [ ] Sufficient contrast for readability
- [ ] Color not sole indicator of meaning
- [ ] Consistent use of grays/neutrals

### Components
- [ ] Buttons have consistent styles (primary, secondary, ghost)
- [ ] Form inputs have consistent styling
- [ ] Cards follow a unified pattern
- [ ] Icons are consistent size and style
- [ ] Navigation patterns are predictable

## Accessibility Checklist (WCAG 2.1 AA)

### Color Contrast
- [ ] Body text: 4.5:1 minimum contrast ratio
- [ ] Large text (18px+): 3:1 minimum
- [ ] UI components: 3:1 against adjacent colors
- [ ] Focus indicators clearly visible

### Keyboard Navigation
- [ ] All interactive elements focusable
- [ ] Focus order follows visual order
- [ ] No keyboard traps
- [ ] Skip links for main content
- [ ] Focus styles visible and consistent

### Screen Readers
- [ ] Semantic HTML (header, nav, main, footer)
- [ ] Proper heading hierarchy (no skipped levels)
- [ ] Alt text on all meaningful images
- [ ] Form labels associated with inputs
- [ ] ARIA labels where needed

### Interactive Elements
- [ ] Touch targets 44x44px minimum
- [ ] Adequate spacing between touch targets
- [ ] Clear hover/focus/active states
- [ ] Disabled states are clear
- [ ] Loading states communicated

## Responsive Design Checklist

### Breakpoints
- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px - 1439px
- Large: 1440px+

### Mobile Considerations
- [ ] Touch-friendly tap targets
- [ ] Readable text without zooming (16px+ body)
- [ ] No horizontal scrolling
- [ ] Simplified navigation (hamburger menu)
- [ ] Stacked layouts for narrow screens
- [ ] Images scale appropriately

### Tablet Considerations
- [ ] Optimal use of wider space
- [ ] Consider 2-column layouts
- [ ] Touch and hover states both work

### Desktop Considerations
- [ ] Maximum content width (1200-1400px)
- [ ] Multi-column layouts where appropriate
- [ ] Hover states enhance experience
- [ ] Keyboard navigation works well

## This Project's Design System

### Colors (Tailwind)
- Primary: stone-900 (text), stone-600 (secondary text)
- Background: stone-50 (light), white (cards)
- Accent: Custom brand colors (#E07A57 terracotta)
- Borders: stone-200

### Typography
- Font: System font stack via Tailwind
- Scale: text-xs, text-sm, text-base, text-lg, text-xl, text-2xl, text-3xl

### Spacing
- Container: max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8
- Section padding: py-16 sm:py-20 lg:py-24
- Component gaps: gap-4, gap-6, gap-8

### Components
- Buttons: rounded-lg, various sizes
- Cards: rounded-xl border border-stone-200
- Inputs: h-12 rounded-lg border-stone-200

## Instructions

1. **Visual Audit**
   - Review page structure and flow
   - Check spacing consistency
   - Verify typography hierarchy
   - Assess color usage

2. **Accessibility Audit**
   - Run automated tools (axe, WAVE)
   - Test keyboard navigation manually
   - Check color contrast ratios
   - Verify semantic HTML

3. **Responsive Audit**
   - Test at each breakpoint
   - Check touch targets on mobile
   - Verify layouts don't break
   - Test real devices if possible

4. **Component Audit**
   - Document all component variants
   - Check for inconsistencies
   - Suggest consolidation where needed
   - Verify state styles (hover, focus, active, disabled)

## Common Issues to Watch

1. Inconsistent spacing between sections
2. Typography scale not followed
3. Low contrast text (especially grays)
4. Missing focus states on interactive elements
5. Oversized touch targets on desktop
6. Undersized touch targets on mobile
7. Orphaned components with unique styles
8. Images without proper aspect ratios
