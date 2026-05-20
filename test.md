# Focuspilot — Full Application Test Guide

Manual QA guide for the entire Focuspilot monorepo. Each section follows the same pattern:

| Section | Purpose |
|---------|---------|
| **Path** | Where to go in the UI (`App → Area → Feature`) |
| **Prerequisites** | What must exist before testing |
| **Test data** | Copy-paste values for forms |
| **Steps** | What to do |
| **Expected** | Pass criteria |
| **Regression** | Related areas that must still work |

---

## 0. Test environment setup

### 0.1 Start services

| Service | Directory | Command | URL |
|---------|-----------|---------|-----|
| API | `server/` | `python manage.py runserver` | http://localhost:8000 |
| Studio app | `client/` | `pnpm dev` | http://localhost:3000 |
| Client portal | `client_portal/` | `pnpm dev` | http://localhost:3001 |
| Contractor portal | `contractors_portal/` | `pnpm dev` | http://localhost:3002 |
| Marketing | `landing/` | `pnpm dev` | http://localhost:3005 |

### 0.2 Environment

Copy `server/.env.example` → `server/.env`. Minimum for most tests:

- `SECRET_KEY`, `DEBUG=True`, `FRONTEND_URL=http://localhost:3000`
- `RESEND_API_KEY` — contractor invite emails
- `GMAIL_CLIENT_ID` / `GMAIL_CLIENT_SECRET` — Inbox, project Email tab, Calendar
- `XERO_CLIENT_ID` / `XERO_CLIENT_SECRET` — Finance sync
- `STRIPE_*` — Billing checkout (optional)
- `OPENAI_API_KEY` — Daily Brief (optional)

Client: `NEXT_PUBLIC_API_URL=http://localhost:8000`

### 0.3 Test accounts (create once)

| Role | Email | Password | Notes |
|------|-------|----------|-------|
| Studio Admin | `admin.test@focuspilot.dev` | `TestPass1!` | Full permissions, `settings.edit` |
| Studio Manager | `manager.test@focuspilot.dev` | `TestPass1!` | Limited studio settings |
| Studio Member | `member.test@focuspilot.dev` | `TestPass1!` | No `settings.edit` |
| Contractor | `james.fletcher@test.dev` | Access code only | Created via Add Contractor |
| Client portal user | `client.user@test.dev` | Invite from studio | Client portal login |

Use **two browsers** (or profiles) for real-time features: Team chat, presence, task comments.

### 0.4 Global seed data (reference)

Use these names consistently across features so CRM → Project → Finance links work.

| Entity | Value |
|--------|-------|
| Studio name | `Focus Test Studio` |
| Client contact | `Sarah Mitchell` / `sarah.mitchell@mitchellhome.co.uk` / company `Mitchell Home Ltd` |
| Supplier contact | `BuildMart Supplies` / `orders@buildmart.co.uk` |
| Project name | `Riverside Penthouse` |
| Project code | `RIV-2026` |
| Contractor | `James Fletcher` / `Fletcher & Sons` / `james@fletcherbuilders.co.uk` / trade `Joinery` |

---

## 1. Authentication & registration

### 1.1 User registration

**Path:** `Marketing or Studio` → `/register` or `/signup`

**Prerequisites:** None (new email)

**Test data:**

| Field | Value |
|-------|-------|
| Name | `Test User Alpha` |
| Email | `alpha.register@test.dev` |
| Password | `TestPass1!` |
| Confirm password | `TestPass1!` |

**Steps:**

1. Open http://localhost:3000/register
2. Fill all fields; confirm password strength indicator updates
3. Submit
4. Complete email verification if enabled (`/verify-otp`)

**Expected:**

- Account created; redirected to login or onboarding
- Invalid email / weak password show inline errors
- Duplicate email shows API error toast

**Regression:** Login with new account works

---

### 1.2 Login

**Path:** `Studio` → `/login`

**Test data:**

| Field | Value |
|-------|-------|
| Email | `admin.test@focuspilot.dev` |
| Password | `TestPass1!` |

**Steps:**

1. Enter credentials → Sign in
2. Try wrong password → error shown
3. Try Google Sign-In if configured (`/auth/google/callback`)

**Expected:** JWT session; sidebar loads; user name in top bar

---

### 1.3 Password reset

**Path:** `/reset-password` or landing `/auth/forgot-password`

**Test data:** Email `admin.test@focuspilot.dev`

**Steps:** Request reset → open link from email → set new password → login

**Expected:** Old password fails; new password works

---

### 1.4 Studio onboarding wizard

**Path:** `Studio` → `/onboarding` (first login)

**Test data:**

| Step | Fields |
|------|--------|
| Your Role | `Studio Owner` |
| Studio Setup | Studio name `Focus Test Studio`, phone `+44 20 7946 0958` |
| Branding | Upload small PNG logo (optional) |
| Invite Team | `manager.test@focuspilot.dev` role `Manager` |

**Steps:** Complete all 4 steps (`Your Role` → `Studio Setup` → `Branding` → `Invite Team`)

**Expected:** Lands on `/home/dashboard`; studio name visible in settings

---

## 2. Home & personal workspace

### 2.1 Dashboard

**Path:** `Studio` → **Home** → `/home/dashboard`

**Prerequisites:** Logged in; at least one project exists

**Steps:**

1. Open dashboard
2. Verify KPI cards / widgets load (projects, tasks, finance snippets)
3. Click quick actions if present (New Project, New Invoice)

**Expected:** No blank errors; data matches seeded project count

---

### 2.2 AI Inbox

**Path:** `Studio` → **Inbox** → `/ai/inbox`

**Prerequisites:** Gmail connected (`Settings → Studio → Integrations`)

**Test data:** Use a Gmail account added as Google OAuth test user

**Steps:**

1. If disconnected → click **Connect Gmail** → complete OAuth (`/oauth/gmail/callback`)
2. Click **Sync** — messages load
3. Open a thread; reply or archive if supported
4. Link a thread to project `Riverside Penthouse` if UI allows

**Expected:** Threads list; sync does not 500; connect banner disappears when connected

**Regression:** `Settings → Integrations` shows Gmail as connected

---

### 2.3 My Tasks

**Path:** `Studio` → **My Tasks** → `/home/tasks`

**Prerequisites:** Task assigned to logged-in user on any project

**Test data:**

| Field | Value |
|-------|-------|
| Task title | `Review FF&E selections` |
| Description | `Client meeting Friday — confirm kitchen stone` |
| Due date | Next Friday |
| Assignee | Current user |

**Steps:**

1. Open My Tasks — see assigned task from project (see §3.2)
2. Mark complete / change status
3. Filter by project or status

**Expected:** Only user's tasks; status updates persist after refresh

---

### 2.4 Calendar (studio)

**Path:** `Studio` → **Calendar** → `/calendar`

**Prerequisites:** Google Calendar connected (same OAuth as Gmail)

**Test data:**

| Field | Value |
|-------|-------|
| Event title | `Site visit — Riverside` |
| Date | Tomorrow 10:00–11:00 |
| Location | `14 Thames Walk, London` |

**Steps:**

1. Toggle **My calendar** overlay
2. **Add event** — fill title, time, save
3. Navigate week/month views
4. Open `/calendar/studio` if studio-wide view exists

**Expected:** Google events appear when connected; new event visible in Google Calendar app

---

## 3. Project management

### 3.1 Create project

**Path:** `Studio` → **Projects** → `/projects` → **New Project**

**Prerequisites:** Client contact exists (§4.1)

**Test data:**

| Field | Value |
|-------|-------|
| Project name | `Riverside Penthouse` |
| Project code | `RIV-2026` |
| Project type | `Residential` |
| Client | `Sarah Mitchell` / Mitchell Home Ltd |
| Description | `Full interior design — 3-bed penthouse, Thames view` |
| Start date | `2026-06-01` |
| End date | `2026-12-15` |
| Budget | `185000` |
| Currency | `GBP` |
| Payment schedule | `Per Phase` |
| FF&E % | `15` |
| VAT rate | `20` |
| Phase 1 name | `Concept & Mood` |
| Phase 1 duration | `4 weeks` |
| Phase 2 name | `Detail Design` |
| Delivery postcode | `SW11 4NJ` |

**Steps:**

1. Click **New Project** / **Create Project**
2. Fill required fields; add at least 2 phases
3. Assign team members on wizard step if shown
4. Submit

**Expected:** Project card on `/projects`; opening project shows overview with correct budget/currency

---

### 3.2 Project → Tasks

**Path:** `Project` → **Tasks** → `/projects/{id}/tasks`

**Test data:**

| Field | Value |
|-------|-------|
| Task title | `Prepare mood boards` |
| Description | `Living room + master suite` |
| Phase | `Concept & Mood` |
| Assignee | `manager.test@focuspilot.dev` |
| Priority | `High` |
| Due date | `2026-06-20` |

**Steps:**

1. Create task in phase
2. Open task modal — add comment: `Initial palette approved by client`
3. **Browser B:** same task open — comment appears within ~5s
4. Add `@member` mention in comment

**Expected:** Task on board/list; comment sync; mentioned user gets notification (§12)

---

### 3.3 Project → Email (Gmail)

**Path:** `Project` → **Email** → `/projects/{id}/messages`

**Prerequisites:** Gmail connected; email thread exists for client domain

**Steps:**

1. Open Email tab — Gmail threads load
2. Reply to a thread (or compose if supported)
3. Unlink thread from project if option exists

**Expected:** Threads scoped to project; reply sends via Gmail API; Team tab unchanged

---

### 3.4 Project → Team chat

**Path:** `Project` → **Team** → `/projects/{id}/team`

**Prerequisites:** User A and User B on same project

**Test data:**

| Message |
|---------|
| `Kick-off call moved to Tuesday 3pm` |

**Steps:**

1. User A sends message on Team tab
2. User B sees message within ~5s without refresh
3. User A stays on project → User B sees A under **Viewing now** within ~30s
4. User A leaves project → presence clears within ~60s
5. User A posts `@UserB` in chat

**Expected:** Polling delivery; presence heartbeat; mention notification

---

### 3.5 Project → Procurement

**Path:** `Project` → **Procurement** → `/projects/{id}/procurement`

**Prerequisites:** Supplier contact (§4.1); rooms/areas configured if required

**Test data:**

| Field | Value |
|-------|-------|
| Room | `Master Bedroom` |
| Item name | `Custom oak wardrobe` |
| Supplier | `BuildMart Supplies` |
| Quantity | `1` |
| Unit cost | `4200` |
| Status flow | `Ordered` → `Shipped` → `Delivered` |

**Steps:**

1. Add room if empty
2. Add procurement item with supplier and budget
3. Update delivery status through pipeline
4. Verify budget vs actual on row

**Expected:** Item appears in hierarchy; totals update; visible in Reports → Procurement (§9.5)

---

### 3.6 Project → Finance

**Path:** `Project` → **Finance** → `/projects/{id}/finance`

**Steps:**

1. Open project finance overview
2. Navigate to **Invoices** sub-route `/projects/{id}/finance/invoices`
3. Create or open invoice linked to this project (§6.1)
4. Open **Purchase orders** `/projects/{id}/finance/purchase-order`

**Expected:** Project-scoped invoice list; PO list; totals align with studio Finance module

---

### 3.7 Project → Files (documents)

**Path:** `Project` → **Files** → `/projects/{id}/docs`

**Test data:**

| File | Notes |
|------|-------|
| `test-floorplan.pdf` | Any small PDF (< 5 MB) |
| Folder name | `Concept Drawings` |

**Steps:**

1. Create folder `Concept Drawings`
2. Drag-drop upload PDF
3. Open preview
4. Upload second version or rename if supported
5. Share document to contractor (§7.2)

**Expected:** File listed; preview works; folder navigation `/docs/folders/...`

---

### 3.8 Project → Contractors

**Path:** `Project` → **Contractors** → `/projects/{id}/contractors`

**Test data (Create New tab):**

| Field | Value |
|-------|-------|
| First name | `James` |
| Surname | `Fletcher` |
| Company | `Fletcher & Sons Builders` |
| Email | `james@fletcherbuilders.co.uk` |
| Phone | `+44 7700 900123` |
| Trade | `Joinery` |

**Steps:**

1. **Add Contractor** → Create New → fill required fields → submit
2. Note **access code** shown (format e.g. `JFLT-01`)
3. Copy QR / access token from **Project → Settings** (§3.9)
4. **Link Existing** tab — search and link another contractor

**Expected:** Contractor in list; invite email sent if Resend configured; access code displayed once

---

### 3.9 Project → Settings

**Path:** `Project` → **Settings** → `/projects/{id}/settings`

**Steps:**

1. Edit project name/description
2. View **QR code** for contractor portal URL
3. Adjust phases, budget, or archive status if available

**Expected:** Changes persist; QR encodes contractor portal project URL with `access_token`

---

### 3.10 Project → Plan (if enabled)

**Path:** `Project` → `/projects/{id}/plan`

**Steps:** Open plan/Gantt view; drag phase dates if interactive

**Expected:** Timeline reflects phase dates from project wizard

---

## 4. CRM

### 4.1 Add contact (client)

**Path:** `Studio` → **CRM** → `/crm/contacts` → **Add Contact**

**Test data:**

| Field | Value |
|-------|-------|
| Contact type | `Client` |
| Name | `Sarah` |
| Surname | `Mitchell` |
| Company | `Mitchell Home Ltd` |
| Email | `sarah.mitchell@mitchellhome.co.uk` |
| Phone | `+44 20 7946 0123` |
| Address line 1 | `42 Belgravia Lane` |
| City | `London` |
| Postcode | `SW1A 1AA` |
| Country | `United Kingdom` |
| Currency | `GBP` |
| Status | `Active` |

**Steps:** Add Contact → fill → save → open contact detail `/crm/contacts/{id}`

**Expected:** Appears in contacts list; selectable as client on new project

---

### 4.2 Add supplier contact

**Path:** `CRM` → **Add Contact**

**Test data:**

| Field | Value |
|-------|-------|
| Contact type | `Supplier` |
| Name | `BuildMart` |
| Company | `BuildMart Supplies Ltd` |
| Email | `orders@buildmart.co.uk` |
| Trade login URL | `https://trade.buildmart.example/login` (if shown) |

**Expected:** Usable on procurement and PO screens

---

### 4.3 CRM pipeline

**Path:** `Studio` → **CRM** → `/crm/pipeline`

**Test data:**

| Lead name | `Westfield Office Fit-out` |
| Stage | Move from `Lead` → `Proposal` → `Won` |
| Value | `95000` |

**Steps:** Create or drag lead card across stages

**Expected:** Stage persists; counts on pipeline columns update

---

### 4.4 Proposals

**Path:** `CRM` → `/crm/proposals` → **New** `/crm/proposals/new`

**Test data:**

| Field | Value |
|-------|-------|
| Title | `Riverside Penthouse — Design Proposal` |
| Client | `Sarah Mitchell` |
| Project link | `Riverside Penthouse` |
| Summary | `Concept through procurement management` |

**Steps:** Create proposal → open `/crm/proposals/{id}` → edit sections / pricing step

**Expected:** Proposal saves; visible in proposals list

---

## 5. Library

### 5.1 Products library

**Path:** `Studio` → **Library** → `/library/products`

**Test data:**

| Field | Value |
|-------|-------|
| Product name | `Velvet lounge chair — Olive` |
| SKU | `VL-CH-OLV-01` |
| Supplier | `BuildMart Supplies` |
| Unit price | `890` |
| Currency | `GBP` |

**Steps:** Add product → search → open preview `/library/products/preview`

**Expected:** Product card; usable when adding invoice line items or procurement

---

### 5.2 Materials library

**Path:** `Library` → `/library/materials`

**Test data:**

| Field | Value |
|-------|-------|
| Material name | `Calacatta marble slab` |
| Category | `Stone` |
| Finish | `Polished` |

**Expected:** Listed and searchable

---

## 6. Finance (studio-wide)

### 6.1 Create invoice

**Path:** `Studio` → **Finance** → `/finance` → **New Invoice** → `/finance/invoices/new`

**Prerequisites:** Project `Riverside Penthouse`; client `Sarah Mitchell`

**Test data:**

| Field | Value |
|-------|-------|
| Project | `Riverside Penthouse` |
| Client | `Sarah Mitchell` |
| Issue date | Today |
| Due date | +30 days |
| Status | `Draft` |
| Line item description | `Concept design fee — Phase 1` |
| Line amount | `12500` |
| Currency | `GBP` |

**Steps:**

1. Create invoice with one line item → save
2. Open `/finance/invoices/{id}` — edit status to `Sent`
3. Open PDF `/finance/invoices/pdf/{InvID}` — print layout loads

**Expected:** Invoice on `/finance/invoices`; appears in Reports → Finance; project finance tab lists it

---

### 6.2 Purchase orders (studio)

**Path:** `Finance` → `/finance/purchase-order`

**Test data:**

| Field | Value |
|-------|-------|
| PO number | `PO-RIV-001` |
| Supplier | `BuildMart Supplies` |
| Project | `Riverside Penthouse` |
| Line item | `Oak flooring supply` |
| Amount | `6800` |

**Steps:** Create PO → open detail `/finance/purchase-order/{id}` → PDF `/finance/purchase-order/pdf/{PoID}`

**Expected:** PO status tracked; procurement report includes spend

---

### 6.3 Finance hub

**Path:** `/finance`

**Steps:** Verify summary cards, overdue invoices, links to invoices and POs

**Expected:** Totals consistent with created invoice/PO

---

## 7. Contractor portal

### 7.1 QR / access code login

**Path:** `Contractor portal` → http://localhost:3002 → `/project/{accessToken}`

**Prerequisites:** Contractor added (§3.8); access code e.g. `JFLT-01`

**Steps:**

1. Scan QR or open project URL from studio project settings
2. Enter personal access code
3. Land on contractor dashboard

**Expected:** Auth succeeds; wrong code rejected

---

### 7.2 Contractor — documents

**Path:** `Contractor portal` → **Files** → `/documents`

**Prerequisites:** Studio shared document from project Files (§3.7)

**Steps:** Verify shared file visible; download/open works

**Expected:** Only shared docs visible; studio-private docs hidden

---

### 7.3 Contractor — procurement

**Path:** `Contractor portal` → **Procurement** → `/procurement`

**Steps:** View items shared for project; confirm statuses match studio

**Expected:** Read-only or limited edit per permissions

---

### 7.4 Contractor — messages

**Path:** `Contractor portal` → **Messages** → `/messages`

**Test data:** `Delivery scheduled Thursday AM`

**Steps:** Send message → verify studio sees it in contractor messages dialog

**Expected:** Message thread works both directions

---

### 7.5 Contractor — profile & insurance

**Path:** `Contractor portal` → **Profile** → `/profile`

**Test data:**

| Field | Value |
|-------|-------|
| Emergency contact | `Jane Fletcher` |
| Insurance doc | Upload PDF |
| Expiry date | `2027-01-01` |

**Steps:** Update profile; upload insurance certificate

**Expected:** Studio contractors list shows insurance status / expiry badge

---

## 8. Client portal

### 8.1 Client login & dashboard

**Path:** `Client portal` → http://localhost:3001

**Prerequisites:** Client user invited for project

**Steps:** Login → **Dashboard** `/dashboard`

**Expected:** Project summary visible; no studio admin menus

---

### 8.2 Client — documents

**Path:** `Client portal` → **Documents** → `/documents`

**Steps:** List shared files; open preview

**Expected:** Matches documents shared to client from studio

---

### 8.3 Client — procurement

**Path:** `Client portal` → **Procurement** → `/procurement`

**Steps:** View item list and delivery status for client-visible items

**Expected:** Data matches studio project procurement (client-visible subset)

---

### 8.4 Client — finance

**Path:** `Client portal` → **Finances** → `/finance`

**Steps:** View invoices shared with client; check amounts and status

**Expected:** No access to other clients' invoices

---

## 9. Reports

**Path:** `Studio` → **Reports** → `/reports`

**Prerequisites:** Seed project with time entries, invoice, procurement item

### 9.1 Overview

**Path:** `/reports/overview`

**Steps:** Change period filter (week/month/quarter) → verify KPI cards and sparklines

**Expected:** Revenue, costs, hours, overdue invoices reflect seed data

---

### 9.2 Projects report

**Path:** `/reports/projects`

**Steps:** Expand `Riverside Penthouse` → phases → timelogs; sort by budget burn

**Expected:** RAG health status; fee vs cost column populated

---

### 9.3 Team report

**Path:** `/reports/team`

**Steps:**

1. Tab **Hours** — export CSV
2. Tab **Utilisation** — bars vs 80% target
3. Tab **Timesheet** — week grid
4. Drill-down `/reports/team/{id}`

**Expected:** Logged hours match time entries (§10)

---

### 9.4 Finance report

**Path:** `/reports/finance`

**Steps:** Check invoice aging, revenue by project, PO spend by supplier

**Expected:** Invoice `12500` and PO `6800` appear in correct buckets

---

### 9.5 Procurement report

**Path:** `/reports/procurement`

**Steps:** Expand project → room → item; check delivery pipeline

**Expected:** `Custom oak wardrobe` shows correct status

---

### 9.6 Revenue & P&L

**Path:** `/reports/revenue`

**Steps:** Monthly P&L; 12-month trend; per-project profitability table

**Expected:** Margin % calculates; period comparison KPIs change with filter

---

## 10. Time tracking

### 10.1 Log time entry

**Path:** `Studio` → **Home** → `/home/time` or `Settings → User → Time Tracking`

**Test data:**

| Field | Value |
|-------|-------|
| Project | `Riverside Penthouse` |
| Phase / Task | `Concept & Mood` / `Prepare mood boards` |
| Date | Today |
| Hours | `3.5` |
| Notes | `Mood board revisions` |

**Steps:** Add entry → save → view week grid

**Expected:** Entry on timesheet; feeds Reports → Team hours

---

### 10.2 User time tracking settings

**Path:** `Settings → User → Time Tracking` → `/settings/user/time-tracking`

**Steps:** Set default project, rounding, or weekly target if available

**Expected:** Settings apply to new time entries

---

## 11. Team directory

**Path:** `Studio` → **Team** → `/teams`

**Prerequisites:** Admin invited users (§12.2)

**Steps:**

1. View all studio members
2. Open member card / profile
3. Filter by role

**Expected:** Matches `Settings → Studio → Team` list

---

## 12. Settings

### 12.1 User profile

**Path:** `Settings → User → Profile` → `/settings/user/profile`

**Test data:**

| Field | Value |
|-------|-------|
| Display name | `Alex Admin` |
| Job title | `Studio Owner` |
| Phone | `+44 20 7946 0958` |

**Expected:** Saves; top bar name updates

---

### 12.2 Studio team invites

**Path:** `Settings → Studio → Team` → `/settings/studio/team`

**Test data:**

| Email | Role |
|-------|------|
| `newmember@test.dev` | `Member` |

**Steps:** Invite → accept invite in second browser → user appears on `/teams`

**Expected:** Invite email sent; role applied

---

### 12.3 Roles & permissions

**Path:** `Settings → Studio → Roles` → `/settings/studio/roles`

**Prerequisites:** Login as Admin

**Steps:**

1. Toggle permission e.g. `finance.view` off for Member role
2. Login as Member → **Finance** hidden from sidebar

**Expected:** `PermissionGuard` blocks direct URL access

---

### 12.4 Studio general & branding

**Path:** `Settings → Studio → General` → `/settings/studio/general`

**Test data:**

| Field | Value |
|-------|-------|
| Studio display name | `Focus Test Studio` |
| Default currency | `GBP` |
| Logo | Upload PNG |

**Expected:** Invoice PDFs show studio logo and name

---

### 12.5 Project templates

**Path:** `Settings → Studio → Templates` → `/settings/studio/templates`

**Test data:**

| Template name | `Residential Standard` |
| Phases | `Concept`, `Design Development`, `Procurement`, `Install` |

**Steps:** Create template → use on new project wizard

**Expected:** Phases pre-filled when template selected

---

### 12.6 Integrations

**Path:** `Settings → Studio → Integrations` → `/settings/studio/integrations`

| Integration | Test action | Callback route |
|-------------|-------------|----------------|
| Xero | Connect → select org | `/oauth/xero/callback` |
| Gmail | Connect | `/oauth/gmail/callback` |
| Google Calendar | Connect | Same Gmail OAuth |
| Notion | Connect → map database | `/oauth/notion/callback` |

**Expected:** Connected badge; disconnect works; no duplicate connections

---

### 12.7 API & webhooks (Zapier)

**Path:** `Settings → Studio → API & webhooks` → `/settings/studio/api`

**Test data:**

| Item | Value |
|------|-------|
| API key label | `Zapier test` |
| Webhook URL | Zapier catch hook URL |

**Steps:**

1. Create API key → copy `fp_live_…`
2. Add webhook → **Test** payload
3. `POST /integrations/v1/projects/create/` with Bearer token (see `docs/ZAPIER.md`)

**Expected:** Webhook receives test event; project creates via API

---

### 12.8 Stripe billing

**Path:** `Settings → Studio → Upgrade plan` → `/settings/studio/billing`

**Prerequisites:** `STRIPE_*` env vars set

**Steps:** Start checkout → complete test card → `/billing/success`; open customer portal

**Expected:** Subscription status updates; cancel returns to `/billing/cancel`

---

### 12.9 Public profile

**Path:** `Settings → Studio → Public profile` → `/settings/studio/public-profile`

**Test data:**

| Field | Value |
|-------|-------|
| Headline | `Boutique interior design — London` |
| About | `Award-winning residential studios since 2018` |
| Slug | `focus-test-studio` |

**Steps:**

1. Fill headline + about → Save
2. Import completed project to portfolio
3. Add client review (name + quote)
4. **Publish**
5. Open http://localhost:3005/studio/focus-test-studio in private window

**Expected:** Public page live; unpublish hides it

---

### 12.10 User security & appearance

| Path | Test |
|------|------|
| `/settings/user/security` | Change password; 2FA UI loads (enable if implemented) |
| `/settings/user/appearance` | Theme `Dark`, density `Compact`, accent `Blue` → save → persists after reload |
| `/settings/user/notifications` | Toggle email/in-app flags → trigger mention → notification respects pref |

---

### 12.11 Studio finance settings

**Path:** `/settings/studio/finance`

**Steps:** Set default VAT, invoice prefix, payment terms

**Expected:** New invoices inherit defaults

---

### 12.12 Audit logs

**Path:** `/settings/studio/audit-logs`

**Steps:** Perform settings change → refresh audit log

**Expected:** Entry with user, action, timestamp

---

## 13. AI tools

### 13.1 Daily Brief

**Path:** `Studio` → `/ai/daily-brief` (or card on dashboard)

**Prerequisites:** `OPENAI_API_KEY` or local LLM

**Steps:** Generate brief → read priorities → mark action tracked

**Expected:** Brief generates without 500; `/ai/daily-brief/test` works for dev

---

### 13.2 AI Activity

**Path:** `Studio` → **AI Activity** → `/ai/activity`

**Steps:** Open activity feed; filter by type if available

**Expected:** Lists clipper runs, brief generations, etc.

---

### 13.3 AI Clipper (browser extension)

**Path:** Install extension → use on supplier product page

**Test data:** Product URL from trade site; target project `Riverside Penthouse`

**Steps:** Clip product → review in popup → add to library/procurement

**Expected:** Product created in library with scraped fields

---

## 14. Help centre

**Path:** `Studio` → **Help Center** → `/help`

**Steps:**

1. Search `invoice` → results show finance articles
2. Open category `/help/projects`
3. Open article `/help/projects/create-a-project`
4. Follow related article link

**Expected:** Markdown renders; breadcrumbs correct; 58 articles reachable

---

## 15. Notifications

**Path:** `/notifications`

**Steps:**

1. Trigger @mention (§3.4)
2. Open notifications bell → see unread item
3. Mark read → navigate to source

**Expected:** Count decreases; link opens correct project/task

---

## 16. Marketing site (landing)

**Base URL:** http://localhost:3005

| # | Path | Test |
|---|------|------|
| 16.1 | `/` | Hero, nav, CTA to signup |
| 16.2 | `/pricing` | Plans render; CTA links work |
| 16.3 | `/platform/projects` | Feature page loads |
| 16.4 | `/platform/ai` | AI platform page |
| 16.5 | `/resources/ai-playbook` | Playbook content |
| 16.6 | `/compare/programa` | Compare page |
| 16.7 | `/studio/focus-test-studio` | Public profile (§12.9) |
| 16.8 | `/auth/signup` | Signup form submits |
| 16.9 | `/auth/login` | Login redirects to app |
| 16.10 | `/changelog` | Entries list |

**Expected:** No broken images; SEO metadata present; mobile layout acceptable

---

## 17. Changelog (in-app)

**Path:** `/changelog` and `/changelog/{id}`

**Steps:** Open list → open single entry

**Expected:** Content matches API `server/changelog`

---

## 18. End-to-end scenario (smoke test)

Run in order (~45 min) to validate cross-module flow:

1. **Register** admin account → **Onboarding** complete
2. **CRM** → add client `Sarah Mitchell`
3. **Projects** → create `Riverside Penthouse` linked to Sarah
4. **Project → Tasks** → create task, add comment (two browsers)
5. **Project → Team** → send chat message
6. **Project → Procurement** → add item
7. **Finance** → create invoice for project
8. **Project → Contractors** → add James Fletcher → note access code
9. **Contractor portal** → login with code → view procurement
10. **Time** → log 3.5 hours on project
11. **Reports → Overview** → verify KPIs
12. **Settings → Integrations** → connect Gmail → **Inbox** sync
13. **Help** → search `contractor`

**Pass:** No step blocks the next; data visible across modules.

---

## 19. Test checklist template (per feature)

Copy for each new feature:

```markdown
### Feature: [Name]

**Path:** Studio → … → …

**Prerequisites:**
- [ ]

**Test data:**
| Field | Value |
|-------|-------|
| title | |
| description | |

**Steps:**
1.
2.

**Expected:**
-

**Regression:**
-
```

---

## 20. Known limitations (skip or expect partial)

| Feature | Status |
|---------|--------|
| 2FA | UI only — not fully enabled |
| PDF export on all report pages | Partial |
| Client portal Stripe payments | Marketing only |
| WebSockets for Team chat | Polling ~5s (not instant) |
| Gantt on `/projects/{id}/plan` | May be partial |

---

**Last updated:** 20 May 2026  
**Apps covered:** `client/`, `server/`, `contractors_portal/`, `client_portal/`, `landing/`
