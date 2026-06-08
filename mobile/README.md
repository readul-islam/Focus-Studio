# Focuspilot Mobile

Cross-platform studio app (Expo SDK 54 + React Native) for Focuspilot users on iOS and Android.

## Prerequisites

- Node.js 20+
- pnpm 10+
- Django API on port 8000
- **Simulator:** Xcode (macOS) or Android Studio
- **Physical device:** [Expo Go](https://expo.dev/go) (SDK 54) or an EAS preview build

## Quick start

```bash
# From repo root
pnpm install

# Mobile deps (isolated — do not use workspace mode here)
cd mobile && pnpm install --ignore-workspace

cp .env.example .env
# Edit .env — see "Physical device" below if using a real phone
```

**Terminal 1 — API**

```bash
pnpm --filter @focuspilot/server run dev
# Listens on 0.0.0.0:8000 (all interfaces)
```

**Terminal 2 — Metro**

```bash
cd mobile && pnpm dev
# Or one-shot iOS Simulator:
pnpm ios          # from repo root
```

| Service | URL |
|---------|-----|
| Django API | http://localhost:8000 |
| Studio (web) | http://localhost:3000 |
| Metro | http://localhost:8081 |

Web apps only (no mobile): `pnpm dev` from repo root.

---

## Physical device (iPhone on same Wi-Fi)

`localhost` on the phone points at the phone itself — not your Mac. Use your Mac's LAN IP.

### 1. Find your Mac IP

```bash
ipconfig getifaddr en0
# e.g. 192.168.31.210
```

### 2. `mobile/.env`

```env
EXPO_PUBLIC_API_URL=http://192.168.31.210:8000
EXPO_PUBLIC_WEB_URL=http://192.168.31.210:3000
```

### 3. `server/.env`

```env
ALLOWED_HOSTS=127.0.0.1,localhost,192.168.31.210
```

### 4. Restart everything

```bash
# Restart Django after .env change
pnpm --filter @focuspilot/server run dev

# Restart Expo with a clean cache after mobile/.env change
cd mobile && pnpm dev -- --clear
```

Scan the QR code in Expo Go. Phone and Mac must be on the **same Wi-Fi** (not guest network).

### Troubleshooting

| Symptom | Fix |
|---------|-----|
| Login hangs / network error | Check API URL has `http://` prefix; verify IP with `curl http://<IP>:8000/api/` |
| Django `DisallowedHost` | Add Mac IP to `ALLOWED_HOSTS` |
| Expo Go won't connect | Same Wi-Fi; firewall allows port 8000; try `--clear` |
| Integrations won't open | Set `EXPO_PUBLIC_WEB_URL` to Mac IP + port 3000 |
| Push notifications | Not available in Expo Go — use EAS preview build |

---

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `EXPO_PUBLIC_API_URL` | Yes | Django API base URL |
| `EXPO_PUBLIC_WEB_URL` | Device / EAS | Studio web URL for OAuth & integrations |
| `EAS_PROJECT_ID` | EAS only | Set by `eas init` |
| `EXPO_OWNER` | EAS only | Expo account slug |

---

## Architecture

| Path | Purpose |
|------|---------|
| `mobile/app/` | Expo Router screens |
| `mobile/lib/` | API, config, domain helpers |
| `packages/shared/` | Shared TypeScript types |
| `packages/api-client/` | Axios client + JWT refresh |

Mobile sends `X-Client-Platform: mobile` so Django returns JWT in the JSON body (not httpOnly cookies).

---

## Features (v0.1)

### Core
- Login + 2FA verification
- Workspace menu (Home, Tasks, Projects, Inbox, Calendar, Search, CRM, Finance, Reports, Time)
- Offline cache (7-day React Query persistence) + offline banner
- Global search (tasks, projects, contacts, finance)

### Project hub
- Overview, Tasks, Email, **Team chat**, Procurement, **Finance**, Files
- Banner upload, phase timeline, budget KPIs

### CRM
- Contacts (clients, suppliers, contractors)
- **Pipeline** — leads, stages, create project from won leads

### Finance
- Studio + project-scoped invoices & POs
- Draft edit, **approve**, send invoice, status updates

### Account
- Profile, **Security (2FA setup on device)**, notifications (push + email)
- Integrations (Gmail, Xero — OAuth via web)
- **Help center** + AI support chat

### Reports
- Overview, Projects, Team, **Finance**, Procurement

---

## Production builds (EAS)

Push notifications and full native features require a **preview** or **production** build — not Expo Go.

### One-time setup

1. [Expo account](https://expo.dev/signup)
2. From `mobile/`:

   ```bash
   pnpm install --ignore-workspace --no-frozen-lockfile
   pnpm eas:init
   ```

   Links the project and writes `extra.eas.projectId` in `app.json`.

3. [Expo dashboard](https://expo.dev) → Project → **Environment variables**

   Create **preview** and **production** environments with:

   | Variable | Preview example | Production example |
   |----------|-----------------|-------------------|
   | `EXPO_PUBLIC_API_URL` | `https://staging-api.focuspilot.io` | `https://api.focuspilot.io` |
   | `EXPO_PUBLIC_WEB_URL` | `https://staging.focuspilot.io` | `https://app.focuspilot.io` |

4. Credentials (first build prompts interactively):
   - **iOS:** Apple Developer, bundle `io.focuspilot.app`
   - **Android:** package `io.focuspilot.app`

5. Set `eas.json` → `submit.production.ios.appleTeamId` before store submit.

### Build commands

From `mobile/`:

```bash
# Internal testing — install APK (Android) or ad hoc / TestFlight internal (iOS)
pnpm eas:build:preview

# Per platform
pnpm eas:build:preview:ios
pnpm eas:build:preview:android

# iOS Simulator artifact (no provisioning)
eas build --profile preview-simulator --platform ios

# App Store / Play Store
pnpm eas:build:production
```

### After preview build

1. Download the artifact from [expo.dev](https://expo.dev) → Builds
2. **iOS:** Install via TestFlight or Apple Configurator (ad hoc)
3. **Android:** Install the APK directly
4. Sign in with your studio account — API URL is baked in from EAS env vars
5. Enable push: **Account → Notifications → Mobile alerts**

### Store submit

```bash
pnpm eas:submit:ios
pnpm eas:submit:android
```

### Monorepo notes

- EAS uploads the git repo; `mobile` depends on `file:../packages/*`
- `eas-build-pre-install.sh` verifies shared packages before install
- Root `.easignore` excludes `client/`, `server/`, etc.
- `eas-build-pre-install` runs `pnpm install --ignore-workspace --no-frozen-lockfile` (installCommand was removed from eas.json in EAS CLI 16+)

---

## Development tips

```bash
# API + Metro only (no web apps)
pnpm dev:mobile

# Typecheck
cd mobile && pnpm exec tsc --noEmit

# Never run `expo install` from monorepo root — breaks mobile node_modules
```

Cache clears on sign-out. Gmail threads and live timers are not cached offline.
