# Focus-Studio / Focuspilot — End-to-End Testing Guide

> **Apps:** Studio (`client/`) · Client Portal (`client_portal/`) · Contractor Portal (`contractors_portal/`) · API (`server/`)  
> **Local URLs:** Studio `http://localhost:3000` · Client `http://localhost:3001` · Contractor `http://localhost:3002` · API `http://localhost:8000`

---

## 1. Overview & Testing Principles

### What this document covers

Manual end-to-end QA across all three user-facing apps, anchored on **one hero project** (`Riverside Penthouse`) that links CRM → Studio → Client Portal → Contractor Portal.

### Testing format (every test entry)

Each test uses:

- **Name** — feature under test
- **Explanation** — why it matters and when the test ends (pass criteria)
- **Path** — step-by-step UI flow
- **Mock data** — exact values to enter
- **Visibility** — cross-app checks (Studio ↔ portals)
- **Others** — API endpoints, permissions, known issues

### Principles

1. **Use consistent mock data** (§3) so CRM, finance, and portals stay linked.
2. **Verify data at each step** — don't only check UI; confirm API responses in DevTools Network tab.
3. **Use 4 browser profiles** — Admin Studio, Manager Studio, Contractor Portal, Client Portal.
4. **Test ends when** pass criteria are met OR a documented gap is confirmed (§8).
5. **Refresh portals** after Studio changes to confirm sync.

### Recommended browser layout

```
┌─────────────────────────┬─────────────────────────┐
│  A: Studio (Admin)      │  B: Studio (Manager)    │
│  localhost:3000         │  localhost:3000         │
├─────────────────────────┼─────────────────────────┤
│  C: Contractor Portal   │  D: Client Portal       │
│  localhost:3002         │  localhost:3001         │
└─────────────────────────┴─────────────────────────┘
```

---

## 2. Prerequisites

### 2.1 Start all services (4 terminals)

```powershell
# Terminal 1 — API
cd server
.\.venv\Scripts\Activate.ps1
python manage.py migrate
python manage.py runserver

# Terminal 2 — Studio
cd client
pnpm dev

# Terminal 3 — Client portal
cd client_portal
pnpm dev

# Terminal 4 — Contractor portal
cd contractors_portal
pnpm dev
```

### 2.2 Environment variables

**Server** (`server/.env`):

```env
SECRET_KEY=dev-secret-key
DEBUG=True
FRONTEND_URL=http://localhost:3000
CLIENT_PORTAL_URL=http://localhost:3001
CONTRACTOR_PORTAL_URL=http://localhost:3002
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002
RESEND_API_KEY=re_xxx          # Required for invite emails
```

**Each frontend** (`.env.local`):

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Optional integrations:**

| Integration | Env | Studio path |
|-------------|-----|-------------|
| Gmail/Calendar | `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET` | `/settings/studio/integrations` |
| Xero | `XERO_CLIENT_ID`, `XERO_CLIENT_SECRET` | `/settings/studio/integrations` |
| Notion | Notion OAuth keys | `/settings/studio/integrations` |
| Stripe billing | `STRIPE_*` | `/settings/studio/billing` |
| OpenAI / AI | `OPENAI_API_KEY` or `NEXT_PUBLIC_AI_USE_MOCK=true` | `/ai/inbox`, `/design` |

### 2.3 Test accounts

Register at `http://localhost:3000/register` or use:

| Role | Email | Password | Browser |
|------|-------|----------|---------|
| Studio Admin | `admin.test@focuspilot.dev` | `TestPass1!` | A |
| Studio Manager | `manager.test@focuspilot.dev` | `TestPass1!` | B |
| Studio Member | `member.test@focuspilot.dev` | `TestPass1!` | Permission tests |

Portal users are **created from Studio** during project setup (not pre-seeded).

---

## 3. Master Test Project Setup (Anchor Data)

Use these values everywhere. The full lifecycle test (§4) assumes this data.

### Studio

| Field | Value |
|-------|-------|
| Studio name | `Focus Test Studio` |
| Currency | `GBP` |
| Timezone | `Europe/London` |

### CRM — Client (Sarah Mitchell)

| Field | Value |
|-------|-------|
| Type | Client (`CL`) |
| Name / Surname | `Sarah` / `Mitchell` |
| Company | `Mitchell Home Ltd` |
| Email | `sarah.mitchell@mitchellhome.co.uk` |
| Phone | `+44 20 7946 0123` |
| Address | `42 Belgravia Lane`, London `SW1A 1AA`, UK |

### CRM — Supplier (BuildMart)

| Field | Value |
|-------|-------|
| Type | Supplier (`SP`) |
| Company | `BuildMart Supplies Ltd` |
| Email | `orders@buildmart.co.uk` |
| Phone | `+44 20 7946 0999` |

### Hero project — Riverside Penthouse

| Field | Value |
|-------|-------|
| Name | `Riverside Penthouse` |
| Code | `RIV-2026` |
| Type | Residential |
| Client | Sarah Mitchell / Mitchell Home Ltd |
| Description | `Full interior design — 3-bed penthouse, Thames view` |
| Budget | `185000` GBP |
| Dates | `2026-06-01` → `2026-12-15` |
| Payment schedule | Per Phase |
| FF&E % | `15` |
| VAT | `20%` |
| Delivery postcode | `SW11 4NJ` |

**Phases:** `Concept & Mood` (4w) · `Detail Design` (6w) · `Procurement & Install` (12w)  
**Rooms:** `Master Bedroom` · `Living Room` · `Kitchen`

### Tasks

| Title | Phase | Assignee | Due | Priority |
|-------|-------|----------|-----|----------|
| `Prepare mood boards` | Concept & Mood | manager.test@focuspilot.dev | 2026-06-20 | High |
| `Review FF&E selections` | Detail Design | admin.test@focuspilot.dev | Next Friday | Medium |
| `Site measure — kitchen` | Detail Design | member.test@focuspilot.dev | 2026-07-01 | Low |

**Team chat message:** `Kick-off call moved to Tuesday 3pm`

### Procurement

| Room | Item | Supplier | Qty | Cost | client_access | contractor share |
|------|------|----------|-----|------|---------------|------------------|
| Master Bedroom | `Custom oak wardrobe` | BuildMart | 1 | 4200 | ✅ Yes | ✅ James Fletcher |
| Living Room | `Velvet sectional sofa` | BuildMart | 1 | 8900 | ✅ Yes | ❌ No |
| Kitchen | `Quartz worktop` | BuildMart | 1 | 3200 | ❌ No | ❌ No |

### Finance

| Doc | Details |
|-----|---------|
| Invoice | Client Sarah · Project Riverside · Line `Concept design fee — Phase 1` · `12500` GBP · Status **Sent** (`inv_sent=true`) |
| PO | `PO-RIV-001` · BuildMart · Line `Oak flooring supply` · `6800` GBP |

### Documents

| Item | Share |
|------|-------|
| Folder `Concept Drawings` | — |
| `test-floorplan.pdf` (< 5 MB) | Client ✅ + Contractor ✅ |
| `mood-board-v1.pdf` | Client ✅ only |
| Link `https://example.com/inspiration` (type LINK) | Client ✅ |

### Contractor — James Fletcher

| Field | Value |
|-------|-------|
| Name | `James Fletcher` |
| Company | `Fletcher & Sons Builders` |
| Email | `james@fletcherbuilders.co.uk` |
| Phone | `+44 7700 900123` |
| Trade | `Joinery` |
| Access code | Note on create (e.g. `JFLT-01`) |
| Emergency contact | `Jane Fletcher` / `+44 7700 900456` |
| Insurance expiry | `2027-01-01` |
| Insurance doc | Upload any small PDF |

### Client portal credentials

Created from Studio → **Project → Settings → Invite Client to Onboard**:

| Field | Value |
|-------|-------|
| Login email | Same as CRM client email OR generated (e.g. `client.user@test.dev`) |
| Password | Set by invite API (often equals email until changed) |
| Portal URL | http://localhost:3001/login |

### Optional anchor data

| Entity | Value |
|--------|-------|
| Library product | `Herringbone oak flooring`, SKU `FLR-OAK-HB-01`, £85/m², BuildMart |
| Proposal | `Riverside Penthouse — Concept Phase`, £45,000, Sarah Mitchell |
| Time entry | 3.5h on "Prepare mood boards", notes `Mood board revisions` |
| Lead | Tom Hartley, `Hartley Developments`, £95,000, stage `Qualified` |

---

## 4. Master Flow — One Project Full Lifecycle

Run steps **4.1–4.27 in order**. Each uses the standard test format.

---

### 4.1 Studio Login

**Name:** Studio Login

**Explanation:** Confirms JWT auth and sidebar access. Test ends when dashboard loads with full admin permissions.

**Path:**

1. Open `http://localhost:3000/login`
2. Enter `admin.test@focuspilot.dev` / `TestPass1!`
3. Click **Sign in**
4. Confirm redirect to `/home/dashboard`

**Mock data:** Admin credentials above.

**Visibility:** N/A (Studio only).

**Others:** If 2FA enabled, continue at `/verify-2fa`. API: `POST /user/login/`.

---

### 4.2 Create CRM Contacts

**Name:** Create CRM Contacts

**Explanation:** Contacts are the source of truth for clients, suppliers, and portal users. Test ends when Sarah (CL) and BuildMart (SP) appear in contacts list.

**Path:**

1. Sidebar → **CRM** → `/crm/contacts`
2. Click **Add Contact**
3. Create **Sarah Mitchell** (Client) with §3 data
4. Create **BuildMart Supplies Ltd** (Supplier)
5. Search each contact — verify saved

**Mock data:** §3 CRM section.

**Visibility:** Sarah becomes the client portal user later; BuildMart links to PO/procurement.

**Others:** API: `POST /crm/clients/`. Contact types: `CL`, `CN`, `SP`.

---

### 4.3 Create Project — Riverside Penthouse

**Name:** Create Project — Riverside Penthouse

**Explanation:** Project is the anchor for all cross-app tests. Test ends when project card appears with correct budget, client, and phases.

**Path:**

1. Sidebar → **Projects** → `/projects`
2. Click **Add Project** / **New Project**
3. Fill §3 hero project fields
4. Select client **Sarah Mitchell**
5. Add 3 phases (or apply template) and save the project
6. **Add rooms** (not in the New Project wizard): Project → **Settings** → **Rooms** → `/projects/{id}/settings?section=rooms`
   - Add: `Master Bedroom`, `Living Room`, `Kitchen`
   - Click **Save** on the Rooms section (required — rooms are not linked until saved)
7. Open project overview `/projects/{id}`

**Mock data:** §3 hero project (`RIV-2026`, budget £185,000).

**Visibility:** Project will appear in both portals after invite/share steps.

**Others:** API: `POST /projects/projects/`. Optional: seed default phases via `/projects/project-phases/seed-defaults/`.

---

### 4.4 Add Tasks

**Name:** Add Tasks

**Explanation:** Validates phase-scoped task management and assignment. Test ends when 3 tasks appear in correct phase columns.

**Path:**

1. Project → **Tasks** tab → `/projects/{id}/tasks`
2. Click **+ Add Task** for each task in §3
3. Assign to manager/admin/member respectively
4. Set due dates and priorities
5. Verify tasks appear in List view and correct phase

**Mock data:** §3 tasks table (3 tasks).

**Visibility:** Assigned tasks appear in assignee's **My Tasks** (`/home/tasks`).

**Others:** API: `POST /task/tasks/`. Supports List + Timeline views. Task comments use `/collaboration/notify-mention/`.

---

### 4.5 Team Chat & Presence

**Name:** Team Chat & Presence

**Explanation:** Real-time collaboration (polling v1). Test ends when message sent in Browser B appears in Browser A within ~5 seconds.

**Path:**

1. Browser B: Login as `manager.test@focuspilot.dev`
2. Navigate to `/projects/{id}/team`
3. Type: `Kick-off call moved to Tuesday 3pm` → Send
4. Browser A: Same page — verify message appears
5. Check presence indicator ("Viewing now")

**Mock data:** Chat message above.

**Visibility:** Studio only (not in client/contractor portals).

**Others:** API: `POST /collaboration/messages/`, `GET /collaboration/presence/`. Polling interval ~5s.

---

### 4.6 Add Procurement Items

**Name:** Add Procurement Items

**Explanation:** Procurement drives client approvals and contractor visibility. Test ends when 3 items exist across 3 rooms.

> **Note:** The Procurement tab has **no Add button**. Items are added via **Library → Products → Add to Project** (or AI Clipper). The Procurement page is for viewing, status, POs, and sharing.

**Path:**

1. **Prerequisites:** §4.2 BuildMart supplier in CRM; §4.3 Riverside Penthouse with rooms saved in **Settings → Rooms** (`Master Bedroom`, `Living Room`, `Kitchen`)
2. Sidebar → **Library** → **Products** → `/library/products`
3. Click **Add Product** and create each §3 item (set supplier = **BuildMart Supplies Ltd**, price = §3 cost):
   - `Custom oak wardrobe` — £4,200
   - `Velvet sectional sofa` — £8,900
   - `Quartz worktop` — £3,200
4. For each product: hover the card → **Add to Project** (or open product sheet → **Add to Project**)
   - Project: **Riverside Penthouse**
   - Room: match §3 table (`Master Bedroom` / `Living Room` / `Kitchen`)
   - Qty: `1` → Submit
5. Project → **Procurement** → `/projects/{id}/procurement` — verify 3 items grouped by room
6. In the **Status** column: wardrobe → **Ordered**; sofa & worktop → **Quoting** (default)

**Mock data:** §3 procurement (3 items, 3 rooms).

**Visibility:** Only items with `client_access=true` appear in client portal. Only explicitly shared items appear in contractor portal.

**Others:** API: `POST /projects/procurements/` with `{ project, room, product, quantity, studio, created_by }`. Alternative: clip a product in AI Inbox → **Add to Project**.

---

### 4.7 Enable Client Procurement Visibility

**Name:** Enable Client Procurement Visibility

**Explanation:** Client portal filters by per-item `client_access`. Test ends when wardrobe + sofa are visible in client portal; worktop is not.

> **UI note:** The procurement page has a project-level **Client Portal** switch (top-right) that sets `client_access=true` on **all** items at once. Per-row toggles are not in the UI yet.

**Path (current UI — all items shared):**

1. Project → **Procurement** → toggle **Client Portal** **on**
2. Reload page — switch stays on
3. **Client portal** `/procurement` → all 3 items visible

**Path (E2E target — 2 of 3 items, via API):**

1. Enable **Client Portal** switch (step above)
2. DevTools or API client: `PATCH /projects/procurements/{worktop_id}/` with `{ "client_access": false }`
3. Reload client portal — wardrobe + sofa only

**Mock data:** 2 of 3 items enabled (worktop hidden).

**Visibility:**

- **Client portal** `/procurement` → sees items where `client_access=true`
- **Contractor portal** → unaffected (uses explicit share, not `client_access`)

**Others:** Project toggle: `POST /projects/client-access/` with `{ project_id, client_access }`. Per item: `PATCH /projects/procurements/{id}/`.

---

### 4.8 Create & Send Invoice

**Name:** Create & Send Invoice

**Explanation:** Client portal only shows invoices with `inv_sent=true`. Test ends when invoice is **Sent** and visible in studio finance.

**Path:**

1. Sidebar → **Finance** → `/finance/invoices/new` (or project finance tab)
2. Client: Sarah Mitchell · Project: Riverside
3. Line: `Concept design fee — Phase 1` · Amount: `12500` GBP
4. Save as Draft → change status to **Sent**
5. Verify at `/finance/invoices` and `/projects/{id}/finance/invoices`

**Mock data:** §3 finance invoice (£12,500).

**Visibility:**

- **Client portal** `/finance` → invoice £12,500 visible
- Draft invoices must NOT appear in client portal

**Others:** API: `POST /finance/invoices/`. PDF at `/finance/invoices/pdf/{id}`.

---

### 4.9 Create Purchase Order

**Name:** Create Purchase Order

**Explanation:** PO tracks supplier spend. Test ends when PO-RIV-001 saved and appears in finance + reports.

**Path:**

1. `/finance/purchase-order` → Create new PO
2. Supplier: BuildMart · Project: Riverside
3. Line: `Oak flooring supply` · `6800` GBP
4. Save → verify in list and project finance tab

**Mock data:** §3 PO (`PO-RIV-001`, £6,800).

**Visibility:** Studio + reports only (not in portals).

**Others:** API: `POST /finance/purchase-orders/`. Can create from procurement via `create-po-from-procurement`.

---

### 4.10 Upload & Organize Documents

**Name:** Upload & Organize Documents

**Explanation:** Document library is shared to portals via flags and explicit contractor share. Test ends when folder + 2 PDFs uploaded.

**Path:**

1. Project → **Files** → `/projects/{id}/docs`
2. Create folder `Concept Drawings`
3. Upload `test-floorplan.pdf` and `mood-board-v1.pdf` (< 5 MB each)
4. Open folder — verify preview works
5. Toggle **Client access** on both files

**Mock data:** §3 documents. Use any small PDF for testing.

**Visibility:**

- **Client portal** `/documents` → both files (client_access=true)
- **Contractor portal** → floorplan only after explicit share (step 4.12)

**Others:** API: `POST /documents/documents/`. Bulk client access: `bulk_update_client_access`.

---

### 4.11 Add Contractor to Project

**Name:** Add Contractor to Project

**Explanation:** Creates contractor CRM record, access code, and portal credentials. Test ends when contractor card shows access code and insurance badge.

**Path:**

1. Project → **Contractors** → `/projects/{id}/contractors`
2. Click **Add Contractor**
3. Fill James Fletcher details (§3)
4. Submit → note access code (e.g. `JFLT-01`)
5. Verify contractor card with trade, insurance status

**Mock data:** §3 contractor (James Fletcher).

**Visibility:**

- **Contractor portal** login works with email + password OR QR + access code
- Studio contractors tab is source of truth

**Others:** API: `POST /contractor_portal/add/`. Returns `access_code`. Resend email if `RESEND_API_KEY` set. QR URL from project settings: `http://localhost:3002/project/{accessToken}`.

---

### 4.12 Share Document with Contractor

**Name:** Share Document with Contractor

**Explanation:** Contractor portal shows only explicitly shared docs (not all project files). Test ends when floorplan appears in contractor portal.

**Path:**

1. On Contractors tab, click James Fletcher card → **Share Files**
2. Select `test-floorplan.pdf` (and/or folder)
3. Confirm share
4. Verify `POST /contractor_portal/bulk-share-documents/` returns 200

**Mock data:** `test-floorplan.pdf` only (`mood-board-v1.pdf` stays client-only).

**Visibility:**

- **Contractor portal** `/documents` → floorplan visible
- **Client portal** → both files still visible (independent flags)
- `mood-board-v1.pdf` must NOT appear in contractor portal

**Others:** Remove share: `POST /contractor_portal/remove-shared-document/`.

---

### 4.13 Share Procurement with Contractor

**Name:** Share Procurement with Contractor

**Explanation:** Contractor sees only shared procurement items. Test ends when oak wardrobe appears in contractor procurement.

**Path:**

1. Project → **Procurement** → select oak wardrobe row
2. Share with **James Fletcher** (row menu or bulk share with `?shareWith={contractorId}`)
3. Confirm `POST /contractor_portal/share-procurement/` or `bulk-share-procurements/` → 200

**Mock data:** Master Bedroom · Custom oak wardrobe.

**Visibility:**

- **Contractor portal** `/procurement` → wardrobe only
- **Client portal** → wardrobe + sofa (client_access), not contractor-share dependent

**Others:** Contractor can approve/reject: `PATCH /contractor_portal/procurements/{id}/`.

---

### 4.14 Invite Client to Portal

**Name:** Invite Client to Portal

**Explanation:** Generates client portal credentials linked to project. Test ends when credentials dialog shows login URL and password.

**Path:**

1. Project → **Settings** → `/projects/{id}/settings`
2. Find **Invite Client to Onboard** / **Generate Client Login**
3. Select Sarah Mitchell (or use CRM email)
4. Click Generate → copy email, password, portal URL
5. Optionally copy email HTML / send via Resend

**Mock data:** `sarah.mitchell@mitchellhome.co.uk` or generated `client.user@test.dev`.

**Visibility:**

- **Client portal** `http://localhost:3001/login` — credentials work
- Client sees only their project data

**Others:** API: `POST /client_portal/generate-client-login/`, `POST /client_portal/copy-client-credentials/`.

---

### 4.15 Contractor Portal Login (QR + Access Code)

**Name:** Contractor Portal Login

**Explanation:** Validates contractor auth flow. Test ends when contractor dashboard shows Riverside Penthouse.

**Path (Option A — QR):**

1. Studio → Project Settings → copy QR URL / access token
2. Browser C: open `http://localhost:3002/project/{accessToken}`
3. Enter access code `JFLT-01` → Submit

**Path (Option B — Email):**

1. Browser C: `http://localhost:3002/login`
2. Email: `james@fletcherbuilders.co.uk` + password from invite
3. If multiple projects → `/select-project` → pick Riverside
4. Land on `/dashboard` — verify project name, address

**Mock data:** James Fletcher credentials + access code.

**Visibility:** Contractor sees only shared items for selected project.

**Others:** API: `POST /contractor_portal/project/{uuid}/auth/`, `GET /contractor_portal/dashboard/`.

---

### 4.16 Contractor — View Shared Documents

**Name:** Contractor — View Shared Documents

**Explanation:** Confirms document share pipeline. Test ends when floorplan opens in PDF viewer and viewed badge appears.

**Path:**

1. Contractor sidebar → **Files** → `/documents`
2. Verify `test-floorplan.pdf` listed (not mood-board)
3. Click file → PDF viewer opens
4. Verify viewed status updates (`POST .../mark_viewed/`)

**Mock data:** Shared `test-floorplan.pdf` only.

**Visibility:** Cross-check Studio contractors tab — `viewed_at` / view count updates.

**Others:** Folder nav: `/documents/folder/{id}`. Download, image lightbox supported.

---

### 4.17 Contractor — Approve Procurement

**Name:** Contractor — Approve Procurement

**Explanation:** Contractor approval syncs back to studio. Test ends when wardrobe status = Approved (`APR`).

**Path:**

1. Contractor → **Procurement** → `/procurement`
2. Expand Master Bedroom → find oak wardrobe
3. Click **Approve**
4. Verify status badge changes

**Mock data:** Custom oak wardrobe.

**Visibility:** Studio procurement page shows updated `client_approval` after refresh.

**Others:** Also test Review (`RVW`) and Reject (`REJ`). Rejected items hidden by default filter.

---

### 4.18 Contractor — Send Message to Studio

**Name:** Contractor — Send Message to Studio

**Explanation:** Bidirectional contractor ↔ studio messaging. Test ends when studio sees message in contractor dialog.

**Path:**

1. Contractor → **Messages** → `/messages`
2. Send: `Delivery scheduled Thursday AM`
3. Browser A: Project → Contractors → James Fletcher → **Message**
4. Verify message appears in thread

**Mock data:** Message text above.

**Visibility:** Studio contractors tab only (not client portal).

**Others:** API: `POST /contractor_portal/messages/`. Studio replies from `ContractorMessageDialog`.

---

### 4.19 Contractor — Update Profile & Insurance

**Name:** Contractor — Update Profile & Insurance

**Explanation:** Self-service profile updates reflect in studio. Test ends when insurance badge turns green in studio.

**Path:**

1. Contractor → **Profile** → `/profile`
2. Update phone, emergency contact (`Jane Fletcher`, `+44 7700 900456`)
3. Set insurance expiry `2027-01-01`
4. Upload insurance PDF
5. Browser A: Contractors tab → open James profile drawer → verify green badge

**Mock data:** §3 contractor insurance.

**Visibility:** Studio contractor card badge updates (`expired` / `expiring_soon` / `valid`).

**Others:** API: `PATCH /contractor_portal/me/`.

---

### 4.20 Client Portal Login

**Name:** Client Portal Login

**Explanation:** Client auth and project scoping. Test ends when dashboard loads with Riverside hero.

**Path:**

1. Browser D: `http://localhost:3001/login`
2. Enter credentials from step 4.14
3. Confirm redirect to `/dashboard`
4. Verify project name, financial stats cards

**Mock data:** Client credentials from invite.

**Visibility:** No studio admin menus. Single project scope (first in list).

**Others:** API: `POST /client_portal/login/`. If login fails, check Network tab — password field must be sent (not email twice).

---

### 4.21 Client — Dashboard Financial Stats

**Name:** Client — Dashboard Financial Stats

**Explanation:** Dashboard aggregates invoice data. Test ends when Total Due reflects sent invoice £12,500.

**Path:**

1. Client → `/dashboard`
2. Check **Total Due** / **Total Paid** cards
3. Verify action items link to procurement

**Mock data:** Sent invoice £12,500, none paid yet.

**Visibility:** Must match studio invoice status. After studio marks Paid (step 4.25), Paid total updates here.

**Others:** API: `GET /client_portal/dashboard/?project_id=`.

---

### 4.22 Client — Approve Procurement

**Name:** Client — Approve Procurement

**Explanation:** Client approval independent of contractor approval. Test ends when client approves wardrobe and/or reviews sofa.

**Path:**

1. Client → **Procurement** → `/procurement`
2. Verify 2 items (wardrobe + sofa); worktop NOT visible
3. Approve wardrobe → **Approve**
4. Mark sofa → **Review**
5. Verify budget overview recalculates

**Mock data:** 2 client-visible items (wardrobe + sofa).

**Visibility:** Studio procurement shows `client_approval` status. Contractor portal unaffected.

**Others:** API: `PATCH /client_portal/procurements/{id}/`. Room totals: `GET /client_portal/room-totals/`.

---

### 4.23 Client — View Invoice

**Name:** Client — View Invoice

**Explanation:** Client finance visibility. Test ends when sent invoice detail shows £12,500 line items.

**Path:**

1. Client → **Finance** → `/finance`
2. Verify invoice listed (drafts hidden)
3. Click invoice number → `/finance/{id}`
4. Verify line items, totals, status badge, payment footer
5. Back button returns to list

**Mock data:** Sent invoice §3 (£12,500).

**Visibility:** No other clients' invoices (isolation test). Draft invoices never appear.

**Others:** Online payment not implemented — static payment info only.

---

### 4.24 Client — View & Download Documents

**Name:** Client — View & Download Documents

**Explanation:** Client document access via `client_access` flag. Test ends when both PDFs visible and downloadable.

**Path:**

1. Client → **Documents** → `/documents`
2. Verify `test-floorplan.pdf` + `mood-board-v1.pdf`
3. Open Concept Drawings folder → `/documents/folder/{id}`
4. Preview PDF, download file
5. Search `mood` — filters correctly

**Mock data:** 2 client-access files (`test-floorplan.pdf`, `mood-board-v1.pdf`).

**Visibility:** Contractor-only shared docs NOT visible unless also `client_access=true`.

**Others:** Messages nav item is stub (`href: #`) — skip.

---

### 4.25 Studio — Mark Invoice Paid (Sync Check)

**Name:** Studio — Mark Invoice Paid

**Explanation:** Validates finance status sync to client portal. Test ends when client dashboard Paid total updates.

**Path:**

1. Browser A: `/finance/invoices/{id}` → Mark **Paid**
2. Browser D: Refresh `/dashboard` and `/finance`
3. Verify Paid total increased; Due decreased

**Mock data:** Same £12,500 invoice.

**Visibility:** Client portal finance reflects studio change.

**Others:** API: `PATCH /finance/invoices/{id}/`.

---

### 4.26 Cross-Portal Status Sync

**Name:** Cross-Portal Status Sync

**Explanation:** Studio procurement changes propagate to both portals. Test ends when all three apps show `Delivered` for wardrobe.

**Path:**

1. Browser A: Project procurement → change wardrobe status to **Delivered**
2. Browser C: Refresh `/procurement` → verify Delivered
3. Browser D: Refresh `/procurement` → verify Delivered

**Mock data:** Oak wardrobe status change.

**Visibility:** All three apps must match after refresh.

**Others:** No real-time push — polling/refresh required.

---

### 4.27 Master Flow — Pass Criteria Checklist

**Name:** Master Flow — Pass Criteria Checklist

**Explanation:** Final verification that the full lifecycle passed. Test ends when all boxes are checked.

**Path:** Review each item below against steps 4.1–4.26.

**Mock data:** Riverside Penthouse anchor data (§3).

**Visibility:** Cross-portal checks confirmed in both portals.

**Others:** Run `python manage.py test client_portal contractor_portal` for automated backend coverage.

- [ ] Riverside Penthouse exists with Sarah Mitchell as client
- [ ] 3 tasks, 3 procurement items, sent invoice (£12,500), PO (£6,800) created
- [ ] Documents uploaded; `test-floorplan.pdf` (client+contractor), `mood-board-v1.pdf` (client only)
- [ ] James Fletcher on project with working login
- [ ] Contractor portal: docs, procurement approve, messages, profile work
- [ ] Client portal: dashboard, procurement, invoice, documents work
- [ ] No cross-client data leak
- [ ] Status sync across all three apps

---

## 5. Cross-Portal Visibility Matrix

| Data type | Studio control | Client portal sees | Contractor portal sees |
|-----------|---------------|-------------------|----------------------|
| Project overview | `/projects/{id}` | Dashboard hero only | Dashboard hero only |
| Tasks | `/projects/{id}/tasks` | ❌ No | ❌ No |
| Team chat | `/projects/{id}/team` | ❌ No | ❌ No |
| Project email (Gmail) | `/projects/{id}/messages` | ❌ No | ❌ No |
| Procurement | `client_access` flag per item | Items with `client_access=true` | Items explicitly shared via `share-procurement` |
| Documents | `client_access` flag + contractor share | `client_access=true` files | Explicitly shared files only |
| Invoices | Status = **Sent** or **Paid** | Sent/Paid invoices for client | ❌ No (finance pages exist but API 404) |
| Contractor messages | Contractors tab dialog | ❌ No | `/messages` thread |
| Insurance/profile | Contractors tab + contractor `/profile` | ❌ No | Self-edit; studio sees badge |
| PO / studio finance | `/finance` | ❌ No | ❌ No |
| QR access code | Project Settings QR | ❌ No | `/project/{token}` landing |

---

## 6. Remaining Features (Post-Master-Flow)

Tests below follow the same format, condensed. Run after §4 passes.

---

### 6.1 Auth & Onboarding

**Register new studio**

- **Explanation:** New user onboarding. Ends when OTP verified and onboarding wizard starts.
- **Path:** `/register` → new email → verify OTP at `/verify-otp` → `/onboarding`
- **Mock data:** `alpha.register@test.dev` / `TestPass1!`
- **Visibility:** N/A
- **Others:** Google OAuth at `/auth/google/callback` if configured.

**Onboarding wizard**

- **Explanation:** Studio setup. Ends at `/home/dashboard`.
- **Path:** `/onboarding` → Role → Studio name → Branding → Invite team (4 steps)
- **Mock data:** `Focus Test Studio`
- **Others:** API: `POST /user/studios/`, `POST /user/invite/`

**2FA (TOTP)**

- **Explanation:** Security hardening. Ends when login requires TOTP after password.
- **Path:** `/settings/user/security` → Enable 2FA → scan QR → `/verify-2fa` on next login
- **Others:** API: `/user/2fa/setup/`, `/user/verify-2fa/`

**Password reset**

- **Path:** `/reset-password` → email → new password works
- **Others:** API: `/user/forgot-password/`, `/user/reset-password/`

**Stripe billing gate**

- **Path:** `/settings/studio/billing` → checkout → `/billing/success`
- **Others:** Requires `STRIPE_*` env. API: `/billing/checkout/`, `/billing/webhook/`

---

### 6.2 Home & Personal Workspace

**Dashboard (My / Studio scope)**

- **Path:** `/home/dashboard` → toggle scope → verify KPIs, Daily Brief hero
- **Others:** API: `/user/dashboard/`, `/user/daily-brief/`

**AI Inbox**

- **Path:** `/ai/inbox` → Connect Gmail → Sync → categorize threads
- **Others:** Requires Gmail OAuth. Mock: `NEXT_PUBLIC_AI_USE_MOCK=true`

**Home Inbox (classic)**

- **Path:** `/home/inbox` → Gmail threads (non-AI view)

**My Tasks (cross-project)**

- **Path:** `/home/tasks` → drag task across columns → persists

**Time tracking**

- **Path:** `/home/time` → log 3.5h on Riverside task → week grid updates
- **Mock data:** 3.5h on "Prepare mood boards"
- **Others:** API: `/time_tracker/clock-in/`, `/time_tracker/timelogs/`

**Studio calendar**

- **Path:** `/calendar`, `/calendar/studio`, `/projects/{id}/calendar`

---

### 6.3 CRM (beyond master flow)

**Lead pipeline**

- **Path:** `/crm/pipeline` → add lead Tom Hartley → drag stages → convert to project
- **Mock data:** Tom Hartley, `Hartley Developments`, £95,000

**Proposals**

- **Path:** `/crm/proposals/new` → wizard → `/crm/proposals/{id}` → mark Sent
- **Mock data:** `Riverside Penthouse — Concept Phase`, £45,000

---

### 6.4 Library

**Products catalog**

- **Path:** `/library/products` → CRUD product → Add to project procurement
- **Mock data:** `Herringbone oak flooring`, SKU `FLR-OAK-HB-01`, £85/m²

**Materials**

- **Path:** `/library/materials` — **SKIP** (placeholder UI only)

---

### 6.5 Team & Permissions

**Team workload**

- **Path:** `/teams` → view member calendars, set pay rate

**Studio team invite**

- **Path:** `/settings/studio/team` → invite `newmember@test.dev` as Member

**Roles matrix**

- **Path:** `/settings/studio/roles` → disable `finance.view` for Member → verify sidebar hides Finance
- **Visibility:** Member direct URL `/finance` → PermissionGuard blocks

---

### 6.6 Reports

| Report | Path | Verify against |
|--------|------|----------------|
| Hub | `/reports` | 6 cards |
| Overview | `/reports/overview` | Invoice £12,500, time 3.5h |
| Projects | `/reports/projects` | Expand Riverside |
| Team | `/reports/team` | Hours / Utilisation / Timesheet tabs |
| Finance | `/reports/finance` | Invoice aging |
| Procurement | `/reports/procurement` | Wardrobe status |
| Revenue & P&L | `/reports/revenue` | Margin % |
| PDF export | Any report | Export button downloads file |

---

### 6.7 Design Studio

**2D design session**

- **Path:** `/design` → New session → chat + image generation
- **Others:** Requires OpenAI key. API: `/design/chat/`, `/design/generate/`

**3D generation (Meshy)**

- **Path:** Upload image → generate 3D → GLB viewer
- **Others:** API: `/design/generate-3d/`, `/design/meshy-status/`

---

### 6.8 AI Tools

| Feature | Path | Prerequisite |
|---------|------|--------------|
| Daily Brief | `/ai/daily-brief` | OpenAI or mock |
| AI Activity | `/ai/activity` | Prior AI actions |
| Reports AI chat | Reports pages | `/reports/chat/` |
| Procurement insights | Project procurement | Stuck quotes data |

---

### 6.9 Settings (full)

| Feature | Path |
|---------|------|
| User profile | `/settings/user/profile` |
| Security + 2FA | `/settings/user/security` |
| Notifications | `/settings/user/notifications` |
| Appearance (theme) | `/settings/user/appearance` |
| Time tracking prefs | `/settings/user/time-tracking` |
| Studio general | `/settings/studio/general` |
| Public profile | `/settings/studio/public-profile` |
| Billing (Stripe) | `/settings/studio/billing` |
| Finance settings | `/settings/studio/finance` |
| Templates | `/settings/studio/templates` |
| Integrations (Xero, Gmail, Notion) | `/settings/studio/integrations` |
| API & Webhooks (Zapier) | `/settings/studio/api` |
| Branding | `/settings/studio/branding` |
| Audit logs | `/settings/studio/audit-logs` — visual only |

---

### 6.10 Integrations (when configured)

**Xero**

- **Path:** `/settings/studio/integrations` → Connect Xero → `/oauth/xero/callback`
- **Others:** API: `/xero/`

**Gmail**

- **Path:** `/home/inbox` connect banner OR integrations page
- **Others:** API: `/gmail/`

**Notion task sync**

- **Path:** Integrations → Connect → `/oauth/notion/callback` → map database
- **Others:** Tasks page shows Notion sync hook

**Zapier / API**

- **Path:** `/settings/studio/api` → create `fp_live_…` key → test webhook
- **Others:** See `docs/ZAPIER.md`. API: `/integrations/v1/projects/create/`

---

### 6.11 Help, UX & Misc

| Feature | Path | Pass criteria |
|---------|------|---------------|
| Help Centre | `/help` | Search returns articles |
| Help article + feedback | `/help/{category}/{slug}` | Thumbs up/down works |
| Notifications | `/notifications` | @mention decreases unread |
| Command palette | Cmd+K | Navigate to Projects |
| Language switcher | Top bar | en-US ↔ de-DE |
| Changelog | `/changelog`, `/changelog/{id}` | Entries load |
| Pricing page | `/pricing` | Plans display |
| Product tour | First login | Tour completes |

---

### 6.12 Contractor Portal (additional)

| Feature | Path | Notes |
|---------|------|-------|
| Invalid access code | `/project/{token}` | Error toast, stay on page |
| Multi-project picker | `/select-project` | When contractor on 2+ projects |
| Project switcher | Sidebar dropdown | Switch without re-login |
| Procurement filters | `/procurement` | Search, status, delivery filters |
| Unshare test | Studio removes share | File disappears on refresh |
| Finance | `/finance` | **SKIP** — API not registered |

---

### 6.13 Client Portal (additional)

| Feature | Path | Notes |
|---------|------|-------|
| Invalid login | `/login` | Error toast |
| Procurement filters | `/procurement` | All filter combos |
| Invoice filters | `/finance` | Sent/Paid/Overdue |
| Cross-client isolation | DevTools API tamper | No other project data |
| Messages | Nav `href: #` | **SKIP** — not implemented |
| Multi-project | — | **SKIP** — uses `project[0]` only |
| Online payment | Invoice detail | **SKIP** — static info only |

---

## 7. API Quick Reference

### Studio → Portal onboarding

| Action | Method | Endpoint | Pass |
|--------|--------|----------|------|
| Add contractor | POST | `/contractor_portal/add/` | 200 + `access_code` |
| Generate client login | POST | `/client_portal/generate-client-login/` | 200 |
| Copy client credentials | POST | `/client_portal/copy-client-credentials/` | 200 + login URL |
| Share documents | POST | `/contractor_portal/bulk-share-documents/` | 200, `created` ≥ 1 |
| Share procurement | POST | `/contractor_portal/bulk-share-procurements/` | 200 |
| Remove shared doc | POST | `/contractor_portal/remove-shared-document/` | 200 |

### Contractor portal data

| Action | Method | Endpoint | Pass |
|--------|--------|----------|------|
| QR project info | GET | `/contractor_portal/project/{uuid}/` | 200 + project name |
| Access code auth | POST | `/contractor_portal/project/{uuid}/auth/` | 200 + JWT |
| Dashboard | GET | `/contractor_portal/dashboard/?project_id=&contractor_id=` | 200 |
| Root documents | GET | `/contractor_portal/documents/root_documents/?project_id=&contractor_id=` | Shared files only |
| Mark doc viewed | POST | `/contractor_portal/documents/{id}/mark_viewed/` | 200 |
| Procurement list | GET | `/contractor_portal/procurements/?project_id=&contractor_id=` | Shared items only |
| Approve item | PATCH | `/contractor_portal/procurements/{id}/` | 200 |
| Send message | POST | `/contractor_portal/messages/` | 201 |
| Profile update | PATCH | `/contractor_portal/me/` | 200 (contractor JWT) |

### Client portal data

| Action | Method | Endpoint | Pass |
|--------|--------|----------|------|
| Login | POST | `/client_portal/login/` | 200 + client + projects |
| Dashboard | GET | `/client_portal/dashboard/?project_id=` | 200 |
| Room totals | GET | `/client_portal/room-totals/?project_id=` | 200 |
| Procurements | GET | `/client_portal/procurements/?project_id=` | client_access items only |
| Approve item | PATCH | `/client_portal/procurements/{id}/` | 200 |
| Invoices | GET | `/client_portal/invoices/?project_id=` | inv_sent=true only |
| Documents | GET | `/client_portal/documents/root_documents/?project_id=` | client_access only |

### Other key endpoints

| Action | Method | Endpoint |
|--------|--------|----------|
| Team messages | POST | `/collaboration/messages/` |
| Create project (Zapier) | POST | `/integrations/v1/projects/create/` |
| Create invoice | POST | `/finance/invoices/` |
| Create procurement | POST | `/projects/procurements/` |

**Automated backend tests:**

```powershell
cd server
python manage.py test client_portal contractor_portal
```

---

## 8. Known Gaps & Skip List

| Area | Status | Action |
|------|--------|--------|
| Contractor finance/invoices | UI exists, API 404 | Skip |
| Client portal Messages | Nav stub (`href: #`) | Skip |
| Client multi-project picker | Not built | Single project only |
| Studio audit logs | Seeded UI, no live API | Visual check |
| Library materials | Placeholder | Skip CRUD |
| `/accept-invitation` page | Middleware only | Use settings team invite |
| AI without keys | Use mock mode | `NEXT_PUBLIC_AI_USE_MOCK=true` |
| Client Stripe payments | Marketing only | Skip |
| Gantt / project plan | Partial | Visual check at `/projects/{id}/plan` |
| Contractor dashboard StatsGrid | Component not wired | Stats API works; UI partial |

---

## 9. Common Failures & Fixes

| Symptom | Fix |
|---------|-----|
| No invite email | Set `RESEND_API_KEY` in `server/.env` |
| Contractor sees no docs | Verify `bulk-share-documents` 200; check `contractor_id` |
| Client sees no invoice | Mark invoice **Sent** (`inv_sent=true`) |
| Client sees no procurement | Enable `client_access` on items |
| Wrong portal project | Client portal uses first project — re-invite if needed |
| CORS errors | Add all localhost ports to `CORS_ALLOWED_ORIGINS` |
| Portal login 401 | Use credentials from copy dialog; check password field in Network tab |
| Team chat not syncing | Wait ~5s for polling; confirm both browsers on same project team page |

---

## 10. Quick URL Reference

| App | Login | Key routes |
|-----|-------|------------|
| Studio | `http://localhost:3000/login` | `/home/dashboard`, `/projects`, `/crm/contacts`, `/finance`, `/reports`, `/settings/user/profile` |
| Client portal | `http://localhost:3001/login` | `/dashboard`, `/procurement`, `/finance`, `/documents` |
| Contractor portal | `http://localhost:3002/login` | `/dashboard`, `/procurement`, `/documents`, `/messages`, `/profile` |
| QR landing | `http://localhost:3002/project/{token}` | From Studio → Project → Settings → QR code |

---

*Last updated: June 2026 · Apps: Studio :3000, Client :3001, Contractor :3002, API :8000*
