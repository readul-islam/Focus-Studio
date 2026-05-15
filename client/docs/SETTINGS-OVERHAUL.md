# TechStyles Settings Overhaul — Plan & Reference

**Created:** 2 April 2026  
**Branch to build on:** `fix/settings-overhaul` (to be created from `main`)  
**Status:** Planned — not yet built

---

## Problem Summary

1. Several fully-built settings pages are **commented out of the sidebar nav** and invisible to users — Team, Roles, Branding (studio logo), Templates (base phases/tasks), Security, Notifications, Appearance.
2. Gmail integration is incorrectly placed on the **User Profile** page. It should live on the **Inbox** page as a connection prompt.
3. The **Integrations** page has poor visual hierarchy — impossible to tell at a glance what is connected vs disconnected.
4. The **admin gate** for Studio settings is commented out — all users can see Studio settings when only admins should.
5. **Stripe** is shown as an integration but is fake (flips local state only). Should be hidden until wired.

---

## Proposed Settings Structure

### User Settings (visible to all users)

| Page | Route | Notes |
|------|-------|-------|
| Profile | `/settings/user/profile` | Name, photo, role — remove Gmail from here |
| Security | `/settings/user/security` | Re-enable in nav (page exists, is hidden) |
| Notifications | `/settings/user/notifications` | Re-enable in nav (page exists, is hidden) |
| Time Tracking | `/settings/user/time-tracking` | Personal time tracking prefs |

### Studio Settings (admin only)

| Page | Route | Notes |
|------|-------|-------|
| General | `/settings/studio/general` | Studio name, timezone, currency, auto-tracking toggle |
| Branding | `/settings/studio/branding` | Studio logo (primary + monochrome) — re-enable in nav |
| Finance | `/settings/studio/finance` | Tax, payment terms |
| Team | `/settings/studio/team` | Invite/manage team members — re-enable in nav |
| Roles & Permissions | `/settings/studio/roles` | Permissions matrix — re-enable in nav |
| Templates | `/settings/studio/templates` | Default project phases + tasks — re-enable in nav |
| Integrations | `/settings/studio/integrations` | Cleaned up (see below) |

---

## Specific Changes Required

### 1. Sidebar nav (`components/settings/sidebar.tsx`)
- Uncomment: Security, Notifications, Branding, Team, Roles, Templates
- Re-enable admin gate — Studio section should only show to admins (`isAdmin` check already exists, just commented out)

### 2. Gmail → move to Inbox (`app/inbox/page.tsx`)
- Remove `<GmailIntegration>` from `app/settings/user/profile/page.tsx`
- Add Gmail connect banner/card to the Inbox page — shows when `gmail_connected` is false
- Banner: "Connect your Gmail to see emails here" + Connect button → OAuth flow
- When connected: small "Gmail connected" indicator, no banner

### 3. Integrations page redesign (`app/settings/studio/integrations/page.tsx`)
**Connected card style:**
- Green left border (`border-l-4 border-green-500`)
- White background
- Prominent green filled badge: "● Connected"
- Disconnect button (outlined, red text)

**Disconnected card style:**
- Stone background (`bg-stone-50`)
- Muted text
- Prominent "Connect" button (filled, primary)

**Content:**
- Remove Stripe (fake — local state only, not wired)
- Keep Xero (real, wired to `user/integration-status/`)
- Remove Gmail (moving to Inbox)
- Add placeholder cards only for integrations that are actively being built

### 4. Admin gate
Uncomment the `isAdmin` check in sidebar so non-admins only see User settings.

---

## Pages That Exist But Are Currently Hidden

All of these are fully built — just need to be uncommented in the sidebar:

| Page | File | What it does |
|------|------|-------------|
| Branding | `app/settings/studio/branding/page.tsx` | Upload studio logo (primary + monochrome) |
| Team | `app/settings/studio/team/page.tsx` | Invite members, real API (`user/studio/members/`) wired |
| Roles | `app/settings/studio/roles/page.tsx` | Permissions matrix component |
| Templates | `app/settings/studio/templates/page.tsx` | Default project phases + tasks (drag to reorder) |
| Security | `app/settings/user/security/page.tsx` | Password change, 2FA |
| Notifications | `app/settings/user/notifications/page.tsx` | Email/in-app notification preferences |
| Appearance | `app/settings/user/appearance/page.tsx` | Theme/display settings |

---

## Backend Dependencies

None for this overhaul — all pages use existing APIs. No new backend work required.

---

## Out of Scope (this branch)

- API & Webhooks page (exists, hidden — leave hidden, not ready for users)
- Audit Logs page (exists, hidden — leave hidden, not ready)
- Appearance page (exists — decision: re-enable or leave hidden)

---

## Notes

- Auto-tracking toggle already added to `General` settings on branch `feat/auto-time-tracker` (2 Apr 2026) — merge or cherry-pick when that branch lands
- Studio logo (branding) is separate from the user profile photo — branding affects proposals/documents, profile photo is personal
