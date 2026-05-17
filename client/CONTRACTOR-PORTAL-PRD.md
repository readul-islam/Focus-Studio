# Contractor Portal V2 — PRD
**Branch:** `feature/contractor-portal-v2` (frontend + backend)  
**Date:** 2026-03-08  
**Status:** Approved for development

---

## Background & Problem

Focuspilot has a separate contractor portal at `contractor.focuspilot.io` and a Contractors tab inside each project. Both exist but are incomplete and disconnected:

- **Add Contractor** is mock-only — vanishes on refresh, not saved to DB
- **Share Drawings/Documents** is mock-only — nothing hits the backend
- **Contractor portal** (what contractor sees) only has 3 pages: Dashboard, Procurement, Documents
- **No insurance/cert capture** anywhere
- **No QR code** for site access
- **No contractor profile** (trade, company, emergency contact)
- **Contractors must be added directly to the DB** — no UI flow

---

## Goals

1. Full end-to-end contractor management from the studio side
2. Contractors can scan a QR code on site and access everything shared with them
3. Studio controls exactly what each contractor sees
4. Insurance and certification tracking per contractor
5. Simple, clean UX — contractors are builders, not tech people

---

## Architecture Decision: QR + Access Code

- **One permanent QR code per project** — generated at project creation, never changes
- QR encodes: `contractor.focuspilot.io/project/{project_token}`
- Landing page asks for **personal access code** (6-char, e.g. `JFLT-01`)
- Each contractor gets their own code — sent via email when added
- Code is permanent unless revoked
- No full account needed — just code → see their stuff

This replaces the email/password login flow for field use. Studio users still log in normally to manage.

---

## Phase 1 — Fix the Broken Basics (Days 1–2)

### 1.1 Backend: Add Contractor API (MISSING)

**Endpoint:** `POST /contractor_portal/add/`

**Payload:**
```json
{
  "project_id": 3,
  "name": "James",
  "surname": "Fletcher",
  "company_name": "Fletcher & Sons Builders",
  "email": "james@fletcherbuilders.co.uk",
  "phone": "+44 7700 900123",
  "trade": "Builder"
}
```

**Logic:**
1. Create `crm_client` with `contact_type='CN'`
2. Create `contractor_portal_contractorproject` linking to project
3. Auto-generate 6-char access code (e.g. `JFLT-01`), store on client record
4. Set password = access_code (for existing login flow compatibility)
5. Send invite email via Resend with access code + portal URL
6. Return contractor object

**Django model change:** Add `access_code` and `trade` fields to `crm_client` (or a separate `ContractorProfile` model).

---

### 1.2 Backend: Share Documents API (CURRENTLY MOCK)

**Endpoint already exists:** `POST /contractor_portal/share-document/`  
**Problem:** Frontend calls mock function instead of this endpoint.

**Fix:** Wire `ShareFilesDialog.tsx` to use `usePost` hook calling `contractor_portal/share-document/` — same pattern as `SelectContractorDialog` (which IS wired correctly for procurement).

---

### 1.3 Frontend: Wire Add Contractor Dialog to Real API

Replace `addContractorToProject()` mock call in `contractors/page.tsx` with `usePost` to `contractor_portal/add/`.

Fields in dialog:
- Name (required)
- Surname
- Company name
- Email (required)
- Phone
- Trade (dropdown: Builder, Electrician, Plumber, Joiner, Plasterer, Decorator, Other)

On success: refetch contractors list, show toast with access code.

---

### 1.4 Frontend: Wire Share Drawings to Real API

`ShareFilesDialog.tsx` — replace `shareFilesWithContractor()` mock with `usePost` to `contractor_portal/share-document/`.

---

## Phase 2 — QR Code System (Days 2–3)

### 2.1 Backend: Project Access Token

Add `access_token` (UUID) to `projects_project` model — generated once at project creation, never changes.

**New endpoint:** `GET /contractor_portal/project/{access_token}/` — public, no auth required.

Returns:
```json
{
  "project_name": "The Belgravia Residence",
  "studio_name": "Focuspilot Studio",
  "studio_logo": "...",
  "requires_code": true
}
```

**Authenticate with code:** `POST /contractor_portal/project/{access_token}/auth/`
```json
{ "access_code": "JFLT-01" }
```
Returns JWT scoped to that contractor + project.

---

### 2.2 Frontend (Contractor Portal): QR Landing Page

New route: `/project/{access_token}`

**Flow:**
1. Contractor scans QR → lands on project landing page
2. Shows project name, studio logo
3. Prompt: "Enter your access code"
4. Enter code → authenticated → redirected to their dashboard (same 3 tabs)
5. Session stored in localStorage — stays logged in on their phone

---

### 2.3 Frontend (Studio): QR Code Display

In project **Settings tab** → new "Contractor Access" section:
- Show QR code (use `qrcode.react` npm package)
- Show the URL it encodes
- "Download QR" button (PNG)
- "Copy Link" button
- Note: "Print this and display on site. Any contractor can scan to access their project files."

---

## Phase 3 — Contractor Profiles & Insurance (Days 3–4)

### 3.1 Backend: Contractor Profile Fields

Extend `crm_client` or add `ContractorProfile` model:
- `trade` (CharField)
- `company_registration` (CharField, optional)
- `insurance_expiry` (DateField, optional)
- `insurance_document` (FileField, optional)
- `trade_cert` (FileField, optional)
- `emergency_contact_name` (CharField, optional)
- `emergency_contact_phone` (CharField, optional)
- `notes` (TextField, optional)

**Endpoints:**
- `GET /contractor_portal/contractor/{id}/profile/`
- `PATCH /contractor_portal/contractor/{id}/profile/`

---

### 3.2 Frontend: Contractor Card Redesign (Studio Side)

Current contractor card shows name + "0 items · 0 drawings" + Share buttons. Replace with:

```
┌─────────────────────────────────────────────┐
│ 🏗 James Fletcher — Fletcher & Sons          │
│ Builder · james@fletcherbuilders.co.uk       │
│                                              │
│ [●] Insurance: Expires 2026-12-01  ⚠️        │
│ Shared: 4 items · 2 drawings                 │
│ Last access: 2 days ago                      │
│                                              │
│ [Share Items] [Share Drawings] [Profile] [⋮] │
└─────────────────────────────────────────────┘
```

Insurance badge: 🟢 valid / 🟡 expires < 30 days / 🔴 expired / ⚪ not uploaded

---

### 3.3 Frontend: Contractor Profile Drawer/Modal

Click "Profile" on card → side drawer opens:
- Edit name, company, phone, trade
- Upload insurance doc (PDF/image)
- Set insurance expiry date
- Upload trade cert
- Emergency contact fields
- Notes
- Access code display + "Regenerate" button
- "Remove from project" button

---

## Phase 4 — Contractor Portal UX Polish (Days 4–5)

### 4.1 Sidebar Fix
Labels currently get cut off ("Dashb", "Procu", "Docum"). Fix CSS — sidebar should be 200px min or use icon-only collapsed mode properly.

### 4.2 Procurement View Improvements
Currently shows empty table with: Product, Dimension, Delivery, Qty/Unit, Unit, Total, Status.

Improvements:
- Add product image thumbnail
- Add room name column
- Status badges with colour (ordered=blue, delivered=green, pending=amber)
- ETA display when available
- Remove "Total" column (contractors don't need to see prices — make this a toggle in studio settings per project)

### 4.3 Documents View
Currently just a search bar. Add:
- File type icon (PDF, DWG, image)
- File name + upload date
- "Viewed" / "Not viewed" indicator
- Download button

### 4.4 Dashboard
Currently shows project hero + "Action Items: Requested to View".

Improve:
- Show count of unread items (new procurement items, new documents)
- Show project address + key contact (designer name + phone)
- Recent activity feed (item delivered, document added)

---

## Phase 5 — Visibility Controls (Day 5)

### 5.1 Per-Item Visibility Toggle (Studio Side)

In the procurement list (project procurement tab), add a column: **"Shared with contractors"** — toggle per row.

When toggled on, all contractors on the project can see it.
When toggled off, hidden from contractor portal (even if previously shared with specific contractor).

Studio can also share selectively (existing flow — share with specific contractor).

**Priority:**
1. Selective sharing (existing, fix the mock) — Phase 1
2. "Share all" toggle per item — Phase 5

---

## Out of Scope (Not in This Sprint)
- Contractor messaging / chat
- Contractor uploading documents back to studio
- Multi-project contractors (one login, many projects)
- Payment/invoice sharing with contractors
- Mobile app

---

## Tech Stack
- **Frontend:** Next.js 14, TypeScript, Tailwind (existing stack)
- **Contractor Portal:** Vite + React (existing, at `contractor.focuspilot.io`)
- **Backend:** Django + DRF (existing)
- **QR:** `qrcode.react` (frontend) — no third-party service needed
- **Email:** Resend (already integrated in backend)
- **File storage:** Existing documents model + storage

---

## Task Breakdown

### Backend Tasks
| # | Task | Phase | Est |
|---|------|-------|-----|
| B1 | Add `access_code`, `trade` to crm_client + migration | 1 | 1h |
| B2 | `POST /contractor_portal/add/` endpoint | 1 | 2h |
| B3 | Wire `share-document/` endpoint (already exists, confirm working) | 1 | 0.5h |
| B4 | Add `access_token` to projects_project + migration | 2 | 0.5h |
| B5 | `GET /contractor_portal/project/{token}/` public endpoint | 2 | 1h |
| B6 | `POST /contractor_portal/project/{token}/auth/` code auth | 2 | 2h |
| B7 | ContractorProfile fields + CRUD endpoints | 3 | 2h |
| B8 | Insurance expiry warning (flag in API response) | 3 | 0.5h |

### Frontend (Studio — techStyleFrontEnd-prod) Tasks
| # | Task | Phase | Est |
|---|------|-------|-----|
| F1 | Wire Add Contractor dialog to `contractor_portal/add/` | 1 | 1h |
| F2 | Wire ShareFilesDialog to `contractor_portal/share-document/` | 1 | 1h |
| F3 | QR code display in project Settings tab | 2 | 1h |
| F4 | Contractor card redesign (insurance badge, last access, shared count) | 3 | 2h |
| F5 | Contractor profile drawer | 3 | 2h |
| F6 | Procurement visibility toggle (share all) | 5 | 2h |

### Frontend (Contractor Portal — techStyle-contractorsPortal) Tasks
| # | Task | Phase | Est |
|---|------|-------|-----|
| C1 | QR landing page `/project/{token}` + access code entry | 2 | 2h |
| C2 | Token-based JWT auth flow | 2 | 2h |
| C3 | Sidebar CSS fix (labels truncated) | 4 | 0.5h |
| C4 | Procurement: add image, room, colour badges, remove price | 4 | 2h |
| C5 | Documents: file type icons, download, viewed status | 4 | 1h |
| C6 | Dashboard: unread count, project address, contact details | 4 | 1h |

---

## Priority Order for Today
1. B1 + B2 + F1 — Add contractor works end-to-end ✅
2. B3 + F2 — Share drawings works end-to-end ✅
3. B4 + B5 + B6 + F3 + C1 + C2 — QR code system ✅
4. B7 + F4 + F5 — Contractor profiles + insurance ✅
5. C3–C6 — Portal polish ✅
