# Focuspilot — Work Plan

> Living task list. Update as items ship.

---

## Completed

### Foundation (17 May)

- [x] Google Sign-In / Sign-Up — Django API (`/user/google/login/`, `/user/google/callback/`)
- [x] Landing auth UI wired (`GoogleAuthButton`, `/auth/google/callback`)
- [x] Studio app session handoff (`/auth/google/callback` with retry + onboarding redirect)
- [x] Resources: **Templates** + **AI Playbook**
- [x] Sitemap updated (resources + template detail URLs)
- [x] Google Cloud OAuth client + scopes (openid, email, profile)

### Production auth & landing (18 May — done by you)

- [x] **Priority 1 — Google auth in production**
  - Production `.env` on `api.focuspilot.io` (Gmail OAuth, redirect URIs, `AUTH_COOKIE_DOMAIN`, CORS)
  - `python manage.py migrate users` on production
  - API restarted; Google Cloud redirect URIs verified
  - Live sign-up / sign-in flow tested
- [x] **Priority 2 — Landing deploy + fixes**
  - Latest landing deployed (`vercel --prod`)
  - `manifest.json` / `grain.png` issues addressed
  - Smoke-tested: `/resources/templates`, `/resources/ai-playbook`, `/platform/ai`

### Marketing — AI platform page (19 May)

- [x] **`/platform/ai`** rebuilt with `MarketingPageHero`, feature grid, how-it-works, AI Playbook strip, signup CTA

---

## Next up

### Priority 1 — Studio app Google button (≈ 30 min)

- [ ] Add **Sign in with Google** on `app.focuspilot.io/login` (reuse `client/lib/google-auth.ts`)
- [ ] Same flow as landing → API → `/auth/google/callback` on client

---

### Priority 2 — Product roadmap (pick one focus block)

From [README.md](README.md) — **May 2026** goals:

#### Option A — Contractor Portal V2 (high priority)

- [ ] `POST /contractor_portal/add/` — create contractor + 6-char code + Resend invite
- [ ] Wire **Add Contractor** dialog in client to real API
- [ ] QR code per project → `contractors.focuspilot.io/project/{token}`

#### Option B — Reports rebuild (`feature/reports-redesign`)

- [ ] Hub: 6 report cards only (remove old standalone pages)
- [ ] `ReportBreadcrumb.tsx` + shared KPI cards
- [ ] Start with **Overview** report page

#### Option C — Settings overhaul

- [ ] Unhide: Branding, Team, Roles, Templates, Security, Notifications
- [ ] Admin gate on studio settings
- [ ] Move Gmail connect banner to `/app/inbox/`

**Suggestion:** Client Google button (Priority 1) → then **Option A** if auth feels solid.

---

## Reference — production URLs

| App | Production |
|-----|------------|
| API | `https://api.focuspilot.io` |
| Landing | `https://focuspilot.io` |
| Studio | `https://app.focuspilot.io` |

**Do not commit:** `.env`, `GMAIL_CLIENT_SECRET`, or any API keys.

---

## Notes / blockers

```
Blockers:


Decisions needed:


```

---

### May polish (done)

- [x] Reports PDF export on all 6 report pages
- [x] Help Centre feedback + screenshots
- [x] 2FA enablement (TOTP + `/verify-2fa`)

---

*Last updated: Wednesday, 20 May 2026*
