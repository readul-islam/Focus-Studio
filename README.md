# TechStyles — Project Management & Financial Operations Platform

## 📋 Table of Contents
- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Target Customers](#target-customers)
- [Tech Stack](#tech-stack)
- [Implemented Features](#implemented-features)
- [Features in Progress](#features-in-progress)
- [Revenue Model](#revenue-model)
- [Project Status & Roadmap](#project-status--roadmap)
- [Getting Started](#getting-started)
- [Architecture](#architecture)

---

## 🎯 Overview

**TechStyles** is a comprehensive B2B SaaS platform designed specifically for architecture and design studios. It provides an integrated workspace to manage projects, teams, finances, procurement, clients, and contractors — all in one unified platform.

The platform serves as the single source of truth for a design studio's operations, enabling streamlined workflows, better financial visibility, and improved team collaboration.

**Current Version:** 0.1.0 (Active Development)  
**Repository:** `baselinq/Studio` (monorepo: frontend + backend)

---

## 🔍 Problem Statement

Design and architecture studios face significant operational challenges:

### Pain Points
1. **Fragmented Tools** — Studios rely on 5+ disconnected platforms (project management, accounting, invoicing, time tracking, document storage)
2. **Financial Blind Spots** — No integrated view of project profitability, budget burn, or cost tracking across all projects
3. **Contractor Chaos** — Disconnected contractor management with no centralized portal, QR-based site access, or insurance/cert tracking
4. **Team Visibility Gap** — Lack of real-time insights into team utilization, capacity, and productivity
5. **Manual Workflows** — Heavy reliance on email, spreadsheets, and manual data entry for project updates, procurement, and invoicing
6. **Xero Integration** — Accounting operations remain siloed from project operations
7. **Document Management** — No centralized library for designs, materials, or reference documents
8. **Client Communication** — Limited visibility for contractors on site vs clients in office

### Solution
**TechStyles** unifies all operations into one platform, providing:
- Real-time project visibility and profitability tracking
- Integrated finance management with Xero
- Contractor portal with QR-based site access
- Team capacity and utilization reporting
- Automated invoicing and procurement workflows
- Centralized document library
- AI-powered tools (daily briefs, intelligent clipper)

---

## 👥 Target Customers

### Primary Market Segments

1. **Mid-Market Design Studios** (10–50 employees)
   - Architects and architectural practices
   - Interior design firms
   - Multi-disciplinary design consultancies
   - Landscape design studios
   - Engineers with design focus

2. **Design-Focused Contractors**
   - Building design consultancies
   - Boutique architecture firms
   - Structural/MEP design practices

3. **Geographic Focus** (Phase 1)
   - UK-based (primary)
   - EU and APAC (future phases)

### Customer Profile
- **Decision Maker:** Studio owner, Finance director, Operations manager
- **Budget:** £3–10k/year per studio
- **Pain Point:** Managing complex multi-phase projects with multiple teams, contractors, and tight budgets
- **Current Tools:** Confluence/Notion + Excel + Xero + Manual processes

---

## 💻 Tech Stack

### Frontend
- **Framework:** Next.js 14.2 with App Router
- **Language:** TypeScript
- **Styling:** TailwindCSS + PostCSS
- **UI Library:** Radix UI + shadcn/ui components
- **State Management:** React Query (@tanstack/react-query), local React state
- **Forms:** React Hook Form + Zod validation
- **Charts & Visualization:** Recharts, Embla Carousel
- **PDF Handling:** @react-pdf-viewer, @react-pdf/renderer, pdfjs-dist
- **Rich Text:** React Markdown, Remark GFM
- **Animation:** Framer Motion, Lottie React
- **Data Grid:** React Virtual, SortableHOC
- **Document Viewer:** @cyntler/react-doc-viewer
- **Drag & Drop:** @dnd-kit
- **HTTP Client:** Axios

### Backend
- **Framework:** Django 5.2.7
- **API:** Django REST Framework 3.16.1
- **Authentication:** djangorestframework-simplejwt (JWT)
- **CORS:** django-cors-headers
- **Database:** SQLite (local), PostgreSQL (production-ready)
- **API Documentation:** drf-spectacular
- **Cloud Storage:** django-storages (S3 compatible)
- **Image Processing:** Pillow

### External Integrations
- **Accounting:** Xero API
- **Email:** Gmail OAuth, Resend (email delivery)
- **AI/ML:** OpenAI, Ollama (local LLM support)
- **Time Tracking:** Time tracker module (internal)
- **Analytics:** Custom reporting engine
- **Payments:** Stripe (planned)

### Deployment
- **Backend:** Django + Gunicorn on EC2 ([docs/EC2-DEPLOYMENT.md](docs/EC2-DEPLOYMENT.md)) or ECS ([docs/AWS-DEPLOYMENT.md](docs/AWS-DEPLOYMENT.md))
- **Frontend:** Next.js on Vercel ([docs/VERCEL-DEPLOYMENT.md](docs/VERCEL-DEPLOYMENT.md))
- **Storage:** AWS S3 (via django-storages)
- **Environment:** .env-based configuration

---

## ✅ Implemented Features

### 1. **Project Management** (Core)
- ✅ Create and manage projects with phases
- ✅ Task creation and assignment within phases
- ✅ Project timeline and Gantt view (planned)
- ✅ Document upload and versioning per project
- ✅ Cost tracking and budget management
- ✅ Project status and health indicators
- ✅ Multi-phase project workflows

### 2. **Team & Collaboration** (Partial)
- ✅ Team member invitations
- ✅ Role-based access control (Admin, Manager, Member)
- ✅ User profile management
- ✅ Team member directory
- ✅ Permissions matrix (hidden/incomplete)
- ✅ Notification preferences (hidden/incomplete)
- ⏳ Real-time collaboration features

### 3. **Finance & Invoicing** (Core)
- ✅ Invoice creation and management
- ✅ Invoice templates
- ✅ Payment tracking
- ✅ Outstanding invoice reports
- ✅ Xero integration (read invoices, sync data)
- ✅ Purchase order management
- ✅ Budget vs. actual tracking
- ⏳ Multi-currency support (partial)
- ⏳ Payment reminders and automation

### 4. **Procurement** (Partial)
- ✅ Purchase order creation
- ✅ Supplier management
- ✅ Item tracking (ordered, shipped, delivered)
- ✅ Budget allocation per project/room
- ✅ Delivery status tracking
- ⏳ Supplier performance analytics
- ⏳ Automated reorder alerts

### 5. **CRM & Contacts** (Core)
- ✅ Contact database (clients, leads, contractors)
- ✅ Contact type classification
- ✅ Contact details (email, phone, address)
- ✅ Lead pipeline (mock)
- ✅ Proposal management (basic)
- ✅ Communication history (email integration pending)
- ⏳ Advanced lead scoring

### 6. **Document Library** (Core)
- ✅ Centralized document storage
- ✅ File organization by project/category
- ✅ File preview (PDFs, images, Office docs)
- ✅ Document versioning
- ✅ Drag-and-drop upload
- ✅ Search functionality
- ⏳ Advanced permission management

### 7. **Contractor Portal** (Partial — V1)
- ✅ Contractor dashboard
- ✅ Procurement visibility for contractors
- ✅ Document access (basic)
- ⏳ QR code generation and scanning
- ⏳ Personal access codes (6-char codes like JFLT-01)
- ⏳ Insurance and certification tracking
- ⏳ Contractor profile (trade, company, emergency contact)
- ⏳ Email invite system

### 8. **Time Tracking & Reporting** (Partial)
- ✅ Time entry logging
- ✅ Daily/weekly timesheet views
- ✅ Project-based time tracking
- ✅ Team utilization reports
- ✅ Hours vs. capacity analytics
- ⏳ Automatic tracking via browser/desktop app
- ⏳ Mobile time entry

### 9. **Reports & Analytics** (Partial — Being Rebuilt)
- ✅ Overview dashboard (summary KPIs)
- ✅ Project profitability reports
- ✅ Team utilization and capacity reports
- ✅ Finance reports (revenue, costs, margins)
- ✅ Procurement spend breakdown
- ✅ Invoice aging reports
- ✅ PDF export capability
- ⏳ Advanced report builder
- ⏳ Scheduled report delivery

### 10. **AI Tools** (Partial)
- ✅ AI Clipper (smart document summarization)
- ✅ Daily Brief (AI-generated work summary)
- ✅ Prompt library
- ⏳ AI-powered proposal generation
- ⏳ Intelligent task recommendations

### 11. **Settings & Integrations** (Partial)
- ✅ Studio branding (logo upload) — hidden in nav
- ✅ User security settings — hidden in nav
- ✅ Appearance/theme preferences — hidden in nav
- ✅ Xero integration setup
- ✅ Gmail integration (basic OAuth)
- ✅ Default project templates — hidden in nav
- ⏳ Stripe payment integration (stub only)
- ⏳ Zapier/webhooks support

### 12. **Authentication & Onboarding** (Core)
- ✅ User registration and email verification
- ✅ Password reset flow
- ✅ OAuth integrations (Gmail, Xero)
- ✅ Two-factor authentication (2FA) — hidden in nav
- ✅ Studio onboarding wizard
- ✅ Team invitation flow

### 13. **Help Centre** (Planned — PRD Complete)
- ⏳ World-class documentation (Intercom-style)
- ⏳ Search across all articles
- ⏳ Category-based organization (Projects, CRM, Finance, etc.)
- ⏳ Screenshots and visual guides
- ⏳ Popular articles and quick links
- ⏳ Feedback tracking ("Was this helpful?")

---

## 🚀 Features in Progress

### Phase 1: Contractor Portal V2 (High Priority)
**Status:** PRD Complete, Development In-Progress  
**Timeline:** Days 1–2 (estimated)

#### Scope
1. **Backend: Add Contractor API**
   - Create endpoint: `POST /contractor_portal/add/`
   - Auto-generate 6-char access codes (e.g., `JFLT-01`)
   - Send invite emails via Resend
   - Store contractor profile (name, company, trade, emergency contact)
   - Link contractor to project

2. **Backend: Document Sharing API**
   - Wire existing `POST /contractor_portal/share-document/` to frontend
   - Track which contractor can access which documents

3. **Frontend: Add Contractor Dialog**
   - Form: Name, Surname, Company, Email, Phone, Trade (dropdown)
   - Submit to real API endpoint
   - Show access code on success

4. **Contractor QR Code System**
   - Generate permanent QR per project
   - QR encodes: `contractor.techstyles.ai/project/{project_token}`
   - Landing: Personal access code entry
   - One code per contractor (permanent unless revoked)

5. **Insurance & Certification Tracking**
   - Document upload per contractor
   - Expiry date tracking
   - Expiry alerts

#### Deliverables
- [ ] `POST /contractor_portal/add/` endpoint (Django)
- [ ] Contractor invite email template
- [ ] Add Contractor dialog (React component)
- [ ] QR code generation and display
- [ ] Access code validation
- [ ] Insurance upload flow

---

### Phase 2: Help Centre (Critical — Third Priority)
**Status:** PRD Complete, Design In-Progress  
**Timeline:** Estimated 3–5 days  
**Reference:** Intercom, Linear Docs, Notion Help

#### Scope
1. **Homepage** (`/help`)
   - Search bar (searches titles + content)
   - 9 category cards with icons and article counts
   - Popular articles section
   - Support contact strip

2. **Category Pages** (`/help/[category]`)
   - Category header with icon and description
   - List of articles with previews
   - Sidebar navigation

3. **Article Pages** (`/help/[category]/[slug]`)
   - Rich text with screenshots
   - Table of contents with anchor links
   - Helpful rating (thumbs up/down)
   - Related articles
   - Last updated date

4. **Categories**
   - Getting Started
   - Projects
   - CRM
   - Finance
   - Library
   - AI Tools
   - Team
   - Reports
   - Settings

#### Deliverables
- [ ] Homepage design + implementation
- [ ] Dynamic article routing
- [ ] Search functionality (client-side or API)
- [ ] Article database/CMS (TBD)
- [ ] Screenshot galleries
- [ ] 50+ articles with screenshots

---

### Phase 3: Reports Rebuild (High Priority)
**Status:** PRD Complete, Development In-Progress  
**Branch:** `feature/reports-redesign`

#### Scope
1. **Consolidation**: Reduce from 8 report pages to 6
   - Utilization folds into Team page as a tab
   - Delete: productivity, sales, cost, profitability, utilisation (standalone)

2. **Infrastructure**
   - [ ] Add breadcrumb component (`ReportBreadcrumb.tsx`)
   - [ ] Upgrade KPI cards with period comparison (vs. last month)
   - [ ] Add PDF export button with `@media print` styles
   - [ ] Consistent header + filter bar on every page

3. **6 Report Pages**

   **Overview Page**
   - KPI cards (revenue, costs, net margin, hours logged)
   - 12-week sparkline for hours trend
   - Top 5 projects by budget burn
   - Top 5 overdue invoices
   - Team capacity heatmap
   - Recent activity feed

   **Projects Page**
   - Expandable project tree (project → phases → timelogs)
   - Budget burn bars (hours + fees)
   - Project health RAG status
   - Fee vs. cost profitability column
   - Sortable columns

   **Team Page** (merged with Utilisation)
   - Tab 1: Hours (hours per person, CSV export)
   - Tab 2: Utilisation (logged ÷ capacity, RAG bars, 80% target)
   - Tab 3: Timesheet (week-by-week grid, person × week)
   - Drill-down to person details
   - PDF export for timesheet

   **Finance Page**
   - Revenue waterfall (invoiced → collected → overdue)
   - Cash flow forecast
   - Invoice aging (bars + sortable table)
   - PO spend by supplier
   - Revenue by project
   - Search by project/client

   **Procurement Page**
   - KPI strip (total items, spend, budget delta, delivery %)
   - Project → room → item hierarchy (expandable)
   - Budget vs actual per project
   - Delivery pipeline (Ordered → Shipped → Delivered)
   - Supplier spend breakdown
   - Overdue items highlight

   **Revenue & P&L Page**
   - Monthly P&L statement (Revenue → Costs → Net)
   - 12-month trend (bars + margin % line)
   - Per-project profitability table
   - Cost breakdown (staff vs procurement pie chart)
   - Margin trend sparklines
   - Period comparison KPIs

#### Deliverables
- [ ] Delete old standalone report pages
- [ ] Update hub page with 6 cards only
- [ ] Build all 6 report pages with design system compliance
- [ ] Consistent KPI cards + filter bars
- [ ] PDF export functionality
- [ ] Loading skeletons + empty states

---

### Phase 4: Settings Overhaul (Medium Priority)
**Status:** PRD Complete  
**Branch:** `fix/settings-overhaul` (to be created)

#### Scope
1. **Visibility Changes** — Unhide currently hidden pages
   - [ ] Branding (studio logo upload)
   - [ ] Team management
   - [ ] Roles & permissions
   - [ ] Templates (default phases/tasks)
   - [ ] Security (password, 2FA)
   - [ ] Notifications preferences
   - [ ] Appearance/theme

2. **Admin Gate**
   - [ ] Apply `isAdmin` check to Studio settings section
   - [ ] Only admins see: Team, Roles, Branding, Finance, Templates

3. **Gmail Integration Move**
   - [ ] Remove Gmail section from User Profile
   - [ ] Add Gmail connect banner to `/app/inbox/`
   - [ ] Shows "Connect Gmail" when disconnected
   - [ ] Shows "Gmail connected" indicator when active

4. **Integrations Page Redesign**
   - [ ] Connected card style: green left border, green "Connected" badge
   - [ ] Disconnected card style: stone bg, muted text, "Connect" CTA
   - [ ] Remove Stripe (fake, not wired)
   - [ ] Keep Xero (real, wired)
   - [ ] Remove Gmail (moved to Inbox)

#### Deliverables
- [ ] Sidebar nav uncommented
- [ ] Admin gate implemented
- [ ] Gmail moved to Inbox with connect flow
- [ ] Integrations page redesigned
- [ ] All hidden pages functional and visible

---

## 💰 Revenue Model

### Pricing Strategy

**SaaS Subscription Model** with tiered pricing:

#### Tier 1: Starter (£99–149/month)
- Up to 5 team members
- 10 active projects
- Basic invoicing
- Document storage (10GB)
- Email support
- Core CRM features
- **Ideal For:** Solo practitioners, small teams

#### Tier 2: Professional (£299–399/month)
- Up to 20 team members
- Unlimited projects
- Advanced invoicing + Xero sync
- Document storage (100GB)
- Time tracking
- Advanced reports (3 months of history)
- Contractor portal (QR codes, 10 contractors)
- Priority email + chat support
- **Ideal For:** Mid-size studios (10–30 people)

#### Tier 3: Enterprise (Custom pricing)
- Unlimited team members
- Unlimited projects
- Full feature set
- Unlimited storage
- 24/7 dedicated support
- API access
- Custom integrations
- SSO / Advanced security
- **Ideal For:** Large studios, networks

### Revenue Streams

1. **Recurring SaaS Revenue** (Primary)
   - Monthly/annual subscriptions
   - Target: 80–100 studios within 12 months
   - ARR projection (Year 1): £150–300k

2. **Premium Features** (Secondary)
   - Advanced AI tools (£49–99/month add-on)
   - Extra storage tiers
   - Dedicated onboarding (£2–5k one-time)

3. **Implementation & Training** (Tertiary)
   - Studio setup and data migration: £1–3k per studio
   - Team training workshops: £500–1,500 per session

4. **Partner Revenue** (Future)
   - Reseller partnerships (design platforms, accounting software)
   - API licensing to third parties
   - App marketplace (third-party integrations)

### Financial Projections (Estimated)

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| Studios (customers) | 50–75 | 200–300 | 500+ |
| ARR | £150–250k | £600–900k | £1.5–2.5M |
| Gross Margin | 75–80% | 80–85% | 85–90% |
| Payback Period | 8–12 months | 5–8 months | 3–5 months |

---

## 📊 Project Status & Roadmap

### Feature Completion Breakdown

| Category | Status | Progress |
|----------|--------|----------|
| **Core Features** | MVP Ready | 70% |
| Project Management | Complete | 85% |
| Finance & Invoicing | Core Done | 75% |
| CRM | Core Done | 70% |
| Team Management | Partial | 60% |
| **Advanced Features** | In Progress | 40% |
| Contractor Portal | V1 Complete | 50% |
| Reports | Redesign | 30% |
| Help Centre | Planned | 10% |
| AI Tools | Partial | 50% |
| **Polish & Maintenance** | Ongoing | 20% |
| Settings Overhaul | Planned | 10% |
| Performance Optimization | Ongoing | 40% |
| Documentation | Ongoing | 30% |
| Mobile Responsiveness | Ongoing | 60% |

### Timeline (Next 6 Months)

#### May 2026 (Current)
- [ ] Contractor Portal V2 finalization
- [ ] Reports rebuild (Phase 1–3)
- [ ] Settings overhaul
- [x] Initial .gitignore setup

#### June 2026
- [ ] Help Centre launch
- [ ] Contractor portal QR codes + insurance tracking
- [ ] Mobile optimization push

#### July–August 2026
- [ ] Advanced reporting features
- [ ] AI tools expansion
- [ ] Beta testing with 3–5 studios

#### September 2026
- [ ] Private beta launch
- [ ] Marketing & sales prep
- [ ] Customer feedback loops

#### October–December 2026
- [ ] Public beta launch
- [ ] Customer onboarding (10–15 early adopters)
- [ ] Feature iteration based on feedback

---

## 🛠 Getting Started

### Prerequisites
- Node.js 18+ (frontend)
- Python 3.10+ (backend)
- **Windows:** If `python` is not recognized, install Python 3.10+ from [python.org](https://www.python.org/downloads/) (enable **Add python.exe to PATH** during setup), or run: `winget install Python.Python.3.12 --accept-package-agreements`
- pnpm (package manager)
- PostgreSQL (for production)

### Frontend Setup

```bash
cd client
pnpm install
pnpm dev
```

**Frontend runs on:** http://localhost:3000

### Backend Setup

All of the following commands assume your shell’s working directory is **`server`** (that is where `.venv` and `requirements.txt` are created).

```bash
cd server
python -m venv .venv
```

Activate the virtual environment (pick one):

- **macOS / Linux:** `source .venv/bin/activate`
- **Windows (PowerShell):** `.\.venv\Scripts\Activate.ps1`  
  If execution of scripts is disabled, run once: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
- **Windows (Command Prompt):** `.venv\Scripts\activate.bat`

Then:

```bash
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

**Backend runs on:** http://localhost:8000

### Environment Variables

#### Frontend (`.env.local` — local dev only)

For **Vercel production**, set the same keys in the Vercel dashboard or CLI — see [docs/VERCEL-DEPLOYMENT.md](docs/VERCEL-DEPLOYMENT.md).

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Backend (`.env`)
```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3
XERO_CLIENT_ID=your-xero-id
XERO_CLIENT_SECRET=your-xero-secret
```

---

## 🏗 Architecture

### Frontend Architecture (Next.js)

```
client/
├── app/                    # Next.js App Router pages
│   ├── projects/          # Project management pages
│   ├── finance/           # Finance & invoicing
│   ├── crm/               # Contact management
│   ├── reports/           # Analytics & reports
│   ├── settings/          # User & studio settings
│   ├── help/              # Help centre (planned)
│   └── [other modules]
├── components/            # Reusable React components
│   ├── ui/               # shadcn/ui components
│   ├── shared/           # Shared components
│   └── [feature modules]
├── hooks/                # Custom React hooks
├── lib/                  # Utilities & helpers
├── styles/              # Global styles
├── types/               # TypeScript types
└── services/            # API service layer (axios)
```

### Backend Architecture (Django)

```
server/
├── techstyles/          # Main Django project settings
├── projects/            # Project management app
├── finance/             # Invoicing & payments app
├── crm/                 # Contact management app
├── contractor_portal/   # Contractor portal app
├── reports/             # Analytics & reports app
├── users/               # User authentication app
├── time_tracker/        # Time tracking app
├── notifications/       # Notifications app
├── xero/                # Xero integration app
├── gmail/               # Gmail integration app
├── documents/           # Document library app
├── library/             # Product/material library app
└── manage.py            # Django management CLI
```

### API Communication Pattern

```
Frontend (Next.js) ←→ Django REST API ←→ External Services
                        (JWT Auth)    ├─ Xero
                                      ├─ Gmail
                                      ├─ OpenAI
                                      └─ AWS S3
```

---

## 📝 Development Guidelines

### Code Quality Standards

See [CLAUDE.md](./client/CLAUDE.md) for detailed frontend standards (Next.js best practices, performance, validation, scalability).

### Key Principles
1. **Scalability First** — Code for millions of users
2. **Type Safety** — Full TypeScript coverage
3. **Performance** — Optimize Core Web Vitals
4. **Security** — Never trust client input
5. **Accessibility** — WCAG 2.1 AA compliant
6. **Testing** — Unit and integration tests (in progress)

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Follow the code standards in CLAUDE.md
3. Test thoroughly before submitting PR
4. Ensure all linting passes: `pnpm lint`
5. Write meaningful commit messages

---

## 📞 Support & Contact

For questions or issues:
- **Help Centre:** http://localhost:3000/help (when available)
- **Email Support:** support@techstyles.ai (production)
- **Bug Reports:** GitHub Issues (when repo is public)

---

## 📄 License

Proprietary — All rights reserved. TechStyles © 2026.

---

## 🎯 Success Metrics (KPIs)

### User Acquisition
- 50–100 design studios signed up (Year 1)
- 300–500 team members across all studios

### Engagement
- 70%+ weekly active users
- Average 3+ hours/week in platform
- 80%+ feature adoption rate

### Revenue
- £150–300k ARR (Year 1)
- £600–900k ARR (Year 2)
- 90%+ gross margins

### Customer Satisfaction
- NPS: 50+ (aim for 60+)
- Retention: 85%+ (monthly)
- Support tickets: <1% of user base

---

**Last Updated:** 15 May 2026  
**Maintained By:** TechStyles Development Team
