# Focuspilot Help Centre — PRD
**Date:** 2026-02-27  
**Status:** ✅ Shipped (May 2026) — 58 articles, `HelpArticleFeedback`, `HelpArticleScreenshots`  
**Priority:** CRITICAL — third request  
**Owner:** engineer  
**Repo:** `focuspilot`, branch `no==`  
**Local:** http://localhost:3010/help  

---

## Vision

Replace the current single-page AI Clipper page with a **world-class, Intercom-style help centre** that covers every page, feature, and button in the Focuspilot platform — with screenshots.

**Reference:** https://www.intercom.com/help  
**Design bar:** Notion Help, Linear Docs, Intercom Help Centre

---

## Architecture

### URL Structure
```
/help                          → Help Centre homepage (search + categories)
/help/[category]               → Category page (article list)
/help/[category]/[article]     → Individual article with screenshots
```

### Routes to Create
```
/help                          → Homepage
/help/getting-started          → Getting Started category
/help/projects                 → Projects category
/help/crm                      → CRM category
/help/finance                  → Finance category
/help/library                  → Library category
/help/ai-tools                 → AI Tools category
/help/team                     → Team category
/help/reports                  → Reports category
/help/settings                 → Settings category
/help/[category]/[slug]        → Dynamic article page
```

---

## Homepage (`/help`)

### Hero Section
- Large search bar: "Search for help..." (searches article titles + content)
- Subtitle: "How can we help you?"
- No login required to view

### Category Cards (grid, 3 columns)
Each card: icon + category name + article count + short description

| Category | Icon | Description |
|---|---|---|
| Getting Started | Rocket | Set up your studio, invite your team, create your first project |
| Projects | Folder | Manage tasks, docs, finance, procurement, and contractors |
| CRM | Users | Contacts, leads, pipeline, and proposals |
| Finance | DollarSign | Invoices, purchase orders, and financial tracking |
| Library | BookOpen | Products, materials, and your design library |
| AI Tools | Sparkles | AI Clipper, daily brief, and AI-powered features |
| Team | Users2 | Invite members, manage roles and permissions |
| Reports | BarChart | Cost, productivity, profitability, and utilisation reports |
| Settings | Settings | Studio setup, branding, integrations, and preferences |

### Popular Articles Section
- 6 most-visited article links below categories

### Contact/Support Strip
- "Can't find what you're looking for?" → Email support link

---

## Category Pages (`/help/[category]`)

Layout:
- Breadcrumb: Help > Category Name
- Category header: icon + name + description
- Article list: title + short description + read time
- Sidebar: other categories

---

## Article Pages (`/help/[category]/[slug]`)

Layout:
- Breadcrumb: Help > Category > Article
- Article title (h1)
- Last updated date
- Reading time
- Body: rich text with screenshots (Next.js Image components)
- "Was this helpful?" thumbs up/down at bottom
- Related articles (3 max)
- Sidebar: article contents (anchor links)

---

## Articles to Write

### Getting Started
1. **Welcome to Focuspilot** — what the platform is, who it's for
2. **Setting up your Studio** — company name, logo, branding, address
3. **Inviting your team** — adding members, roles
4. **Creating your first Project** — step by step
5. **Navigating the sidebar** — every nav item explained

### Home & Dashboard
6. **Dashboard overview** — KPIs, daily brief, what everything means
7. **Inbox** — messages, notifications, Gmail integration
8. **My Tasks** — personal task list, filters, status
9. **Calendar** — studio calendar, project events, time tracking

### Projects
10. **Projects overview** — project list, creating a project
11. **Project tasks** — creating tasks, assigning, due dates, status
12. **Project docs** — notes, folders, uploading files
13. **Project messages** — internal project chat
14. **Project finance** — project invoices and purchase orders
15. **Project procurement** — managing procurement items
16. **Project contractors** — adding and managing contractors
17. **Project plan** — phases and milestones
18. **Project calendar** — project-specific calendar
19. **Project settings** — project details, client, status

### CRM
20. **CRM overview** — contacts, leads, pipeline, proposals
21. **Contacts** — adding, editing, contact details
22. **Leads** — lead status, converting to project
23. **Pipeline** — Kanban view, moving leads through stages
24. **Proposals** — creating and sending proposals

### Finance
25. **Finance overview** — invoices and purchase orders
26. **Creating an invoice** — line items, VAT, client
27. **Sending an invoice** — email delivery, PDF
28. **Purchase orders** — creating, approving, tracking
29. **Project finance** — linking invoices to projects

### Library
30. **Library overview** — products and materials
31. **Adding products** — manual entry and AI Clipper
32. **Materials** — managing your materials library
33. **Product preview** — how to use the preview feature

### AI Tools
34. **AI Clipper overview** — what it does, how it works
35. **Installing the AI Clipper** — step-by-step Chrome install
36. **Using the AI Clipper** — clipping a product, sending to studio
37. **AI Daily Brief** — what it covers, where to find it
38. **AI Activity** — reviewing AI actions

### Team
39. **Team overview** — managing your studio team
40. **Inviting members** — sending invites, roles
41. **Roles & permissions** — what each role can do

### Reports
42. **Reports overview** — all report types
43. **Cost reports** — understanding cost breakdowns
44. **Productivity reports** — team and project productivity
45. **Profitability reports** — margin and revenue
46. **Utilisation reports** — resource utilisation

### Settings — User
47. **Profile settings** — name, email, avatar
48. **Appearance** — dark/light mode, preferences
49. **Notifications** — what you get notified about
50. **Security** — password change, 2FA
51. **Time tracking** — configuring time tracking

### Settings — Studio
52. **General settings** — studio name, address, currency
53. **Branding** — logo, colours, email signature
54. **Finance settings** — tax rates, payment terms
55. **Team management** — adding/removing members, roles
56. **Integrations** — Xero, Gmail, API keys
57. **Templates** — document and email templates
58. **Audit logs** — viewing activity history

---

## Screenshots

- Take screenshots at 1280×800 of each relevant page at http://localhost:3010
- Store in `/public/help-screenshots/[category]/[slug].png`
- Use Next.js `<Image>` component with alt text
- Annotate screenshots with red arrows/boxes where needed (can be done in code with CSS overlays)

---

## Design Spec

### Colours (use existing CSS vars)
- Background: white / `var(--background)`
- Cards: light grey `#f9f9f9`
- Accent: `#1a1a1a` (dark text)
- Category icons: match sidebar icon colours
- Search bar: full-width, rounded, subtle shadow

### Typography
- Article body: 16px, 1.7 line-height, readable
- Headers: h2/h3 with clear hierarchy
- Code blocks if needed: monospace

### Layout
- Max width: 1100px centered
- Sidebar on articles: sticky, 240px
- Mobile responsive

### NO auth required
- Help centre is PUBLIC — no login needed
- Remove PrivateRoute wrapper from /help routes

---

## Tech Implementation

### Data Structure
Articles stored as **TypeScript objects** in `/lib/help-content/` — no CMS needed for v1.

```typescript
// /lib/help-content/types.ts
interface HelpArticle {
  slug: string
  title: string
  description: string
  category: string
  readTime: number // minutes
  content: string // markdown or JSX
  screenshots: string[] // paths to /public/help-screenshots/
  lastUpdated: string
  related: string[] // slugs
}
```

### Search
- Client-side search using Fuse.js (already likely installed, or add it)
- Search on title + description + content
- Show results as you type (debounced)

### File Structure
```
app/help/
  page.tsx                    → Homepage
  [category]/
    page.tsx                  → Category page
    [slug]/
      page.tsx                → Article page
  layout.tsx                  → Help layout (NO sidebar nav, clean)

lib/help-content/
  types.ts
  articles/
    getting-started.ts
    projects.ts
    crm.ts
    finance.ts
    library.ts
    ai-tools.ts
    team.ts
    reports.ts
    settings.ts
  index.ts                    → exports all, search index

public/help-screenshots/
  getting-started/
  projects/
  crm/
  finance/
  ...
```

---

## Success Criteria

1. `/help` loads — homepage with search + 9 category cards
2. Every category page lists its articles
3. Every article page has: title, body, at least 1 screenshot, related articles
4. Search works — type "invoice" → relevant articles appear
5. No auth required — public access
6. Help Centre link in sidebar (bottom left, above Settings) ✅ already exists
7. Mobile responsive
8. Looks world-class — comparable to Intercom/Notion help

---

## Build Order

1. Layout + homepage skeleton
2. Category pages
3. Article pages (dynamic route)
4. Content — write all 58 articles
5. Screenshots — capture and embed
6. Search
7. Polish + mobile

---

## RULES
- Public route — remove auth guard from /help
- No Supabase, no auth on these pages
- Use existing design system (Tailwind classes from existing components)
- Git commit after each section
- DO NOT touch any other pages
