# Contractor Portal — Testing Guide

Step-by-step manual testing for **Share documents (real API)** and **Insurance / profiles**.

| App | URL |
|-----|-----|
| Studio (client) | https://app.focuspilot.io |
| Contractor portal | https://contractors.focuspilot.io |
| API | Your `NEXT_PUBLIC_API_URL` (e.g. production API host) |

---

## Prerequisites

1. **Studio account** with at least one active project.
2. **At least one contractor** on that project (Project → Contractors → Add contractor).
3. **Project documents**: upload 2+ files under Project → Docs (include one file inside a folder to test nested listing).
4. **Contractor login**: after adding a contractor, use **Generate credentials** (or the invite email) so the contractor can sign in at the contractor portal.
5. Browser devtools → **Network** tab open to confirm API calls (optional but recommended).

---

## Part 1 — Share documents (real API)

### What was built

- Studio lists shareable files: `GET /contractor_portal/project/{project_id}/shareable-documents/`
- Bulk share: `POST /contractor_portal/bulk-share-documents/` with `{ contractor_id, document_ids, project_id }`
- Remove share: `POST /contractor_portal/remove-shared-document/` with `{ contractor_id, document_id }`
- Contractor sees shared docs in portal under **Documents**

### 1.1 Share from Contractors page

1. Open **Projects** → select a project → **Contractors**.
2. On a contractor card, open the **⋮** menu → **Share files** (or equivalent).
3. In the dialog, confirm files load (not empty if docs exist).
4. Search for a file name — list should filter.
5. Select one or more files → **Share**.
6. **Expect**
   - Success toast (e.g. “Shared N files with …”).
   - Network: `POST …/bulk-share-documents/` → **200**, body includes `created`.
7. Re-open the dialog — already-shared files should not appear (or show as already shared).

### 1.2 Share from Project Docs

1. Go to **Project → Docs**.
2. Select file(s) → share with contractor (if your UI exposes contractor share from docs).
3. **Expect** same `bulk-share-documents` call and contractor sees files after refresh.

### 1.3 Contractor portal — view shared documents

1. Log in at https://contractors.focuspilot.io as the contractor.
2. Select the project → **Documents**.
3. **Expect**
   - Shared files/folders appear.
   - Opening a shared file works (download/view).
4. Network (contractor session): `GET …/contractor_portal/documents/root_documents/?project_id=…&contractor_id=…`

### 1.4 Remove a shared document (studio)

1. Back in studio → **Contractors** → expand contractor → shared documents list.
2. Remove/unshare one document.
3. **Expect**
   - `POST …/remove-shared-document/` → **200**
   - Document disappears from contractor portal after refresh.
4. If it was the **only** share for that document, `contractor_access` on the document should clear (backend).

### 1.5 Negative checks

| Action | Expect |
|--------|--------|
| Share a document from **another** project (wrong `project_id`) | **404** / error toast |
| Share without selecting files | Button disabled / no request |
| Unauthenticated studio request | **401** |

### 1.6 Automated API tests (optional)

From repo `server/` with Django env active:

```bash
python manage.py test contractor_portal.tests.ShareDocumentTests
```

---

## Part 2 — Insurance / profiles

### What was built

| Who | UI | API |
|-----|-----|-----|
| Studio | Contractor card + **Profile** drawer | `GET/PATCH /contractor_portal/contractor/{id}/` |
| Studio | Regenerate access code | `POST …/regenerate-code/` |
| Studio | Remove from project | `POST …/remove-from-project/` body `{ project_id }` |
| Contractor | **Profile** page | `GET/PATCH /contractor_portal/me/` (contractor JWT) |

Profile fields: trade, insurance expiry, insurance document, trade certificate, emergency contact, notes (+ name, email, phone, company on Client).

### 2.1 Studio — open profile drawer

1. **Projects → Contractors** → on a contractor card, open **Profile** (or click contractor name).
2. **Expect**
   - Drawer loads (spinner then form).
   - `GET …/contractor/{id}/` → **200** with trade, access code, insurance fields.

### 2.2 Studio — edit and save profile

1. Set **Trade**, **Insurance expiry** (e.g. 60 days from today).
2. Add **Emergency contact** name/phone and **Notes**.
3. Click **Save changes**.
4. **Expect**
   - `PATCH …/contractor/{id}/` → **200**
   - Toast “Profile saved”.
5. Close and reopen drawer — values persist.

### 2.3 Studio — upload insurance / trade cert

1. In drawer → **Upload** insurance document (PDF or image).
2. Optionally upload **Trade certificate**.
3. Save.
4. **Expect**
   - `PATCH` with `multipart/form-data` (files + fields).
   - Filenames shown on reopen.
5. On contractor **card**, insurance badge should update:
   - No expiry → “Not uploaded” / grey
   - Expiry &lt; 30 days → expiring / amber
   - Past expiry → expired / red
   - Valid → green

### 2.4 Studio — regenerate access code

1. In drawer → **Access code** section → **Regenerate**.
2. Confirm dialog if shown.
3. **Expect**
   - `POST …/regenerate-code/` → **200**, `{ access_code: "XXXX-NN" }`
   - New code displayed; copy works.
4. Contractor can use new code for QR/project access flows that require it.

### 2.5 Studio — remove from project

1. Drawer → **Danger zone** → **Remove from project** → confirm.
2. **Expect**
   - `POST …/remove-from-project/` with `{ project_id }` → **200**
   - Contractor disappears from project list (contact remains in studio CRM).
3. Contractor logging in should **not** see this project in project picker.

### 2.6 Contractor portal — self-service profile

1. Log in at https://contractors.focuspilot.io.
2. Go to **Profile** (nav).
3. **Expect**
   - `GET …/contractor_portal/me/` → **200**
   - Form prefilled with name, email, trade, insurance, etc.
4. Change **Trade** and **Company** → **Save changes**.
5. **Expect**
   - `PATCH …/me/` → **200**
6. In studio, reopen profile drawer — same values visible.

### 2.7 Contractor — upload documents on profile

1. On contractor **Profile** → upload insurance doc and/or trade cert → Save.
2. **Expect** multipart `PATCH …/me/`.
3. Studio drawer shows uploaded file names after refresh.

### 2.8 Negative checks

| Action | Expect |
|--------|--------|
| `GET /me/` without contractor JWT | **401** |
| Studio opens profile for contractor in **another** studio | **404** |
| Remove from project without `project_id` | **400** |

### 2.9 Automated API tests (optional)

```bash
python manage.py test contractor_portal.tests.ContractorProfileTests
```

Covers: profile PATCH (Client + ContractorProfile), regenerate code, remove from project, contractor `me/` GET/PATCH.

---

## Quick API reference

### Share documents

```http
GET  /contractor_portal/project/{project_id}/shareable-documents/
POST /contractor_portal/bulk-share-documents/
     { "contractor_id": 1, "document_ids": [10, 11], "project_id": 5 }
POST /contractor_portal/remove-shared-document/
     { "contractor_id": 1, "document_id": 10 }
```

### Insurance / profiles

```http
GET   /contractor_portal/contractor/{id}/          # Studio auth
PATCH /contractor_portal/contractor/{id}/          # Studio auth (+ multipart for files)
POST  /contractor_portal/contractor/{id}/regenerate-code/
POST  /contractor_portal/contractor/{id}/remove-from-project/
      { "project_id": 5 }
GET   /contractor_portal/me/                        # Contractor JWT
PATCH /contractor_portal/me/                        # Contractor JWT
```

---

## Deploy checklist (after code changes)

1. **API (Django)** — deploy `server` so new endpoints and serializer `update()` are live.
2. **Studio** — deploy `client` to Vercel (`app.focuspilot.io`).
3. **Contractor portal** — deploy `contractors_portal` (`contractors.focuspilot.io`).
4. Smoke-test Part 1 and Part 2 on production with one test contractor.

---

## Troubleshooting

| Symptom | Check |
|---------|--------|
| Share dialog empty | Docs exist on project; API `shareable-documents` returns files; studio user has project access |
| Profile save does not persist trade/insurance | API deployed with `ContractorProfileSerializer.update()`; PATCH returns 200 |
| Contractor profile 401 | `localStorage.access` set; token includes `contractor_id` claim (login via contractor portal, not studio) |
| Insurance badge always “Not uploaded” | Set `insurance_expiry` on profile; list API returns `insurance_warning` on project contractors endpoint |
| Files not visible in contractor portal | `bulk-share-documents` succeeded; correct `project_id`; contractor linked via `ContractorProject` |

---

*Last updated: Insurance/profiles + share documents end-to-end wiring.*
