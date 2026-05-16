# Focus-Studio — Vercel Frontend Deployment Guide (Step by Step)

Complete walkthrough for deploying the **Next.js client** (`client/`) to **Vercel**. Pair this with [EC2-DEPLOYMENT.md](./EC2-DEPLOYMENT.md) (API on EC2) or [AWS-DEPLOYMENT.md](./AWS-DEPLOYMENT.md) (API on ECS).

**Stack:** Next.js 14 (App Router) → Vercel Edge / Serverless → Django API (EC2 or ECS).

---

## Table of contents

1. [Overview](#1-overview)
2. [Prerequisites](#2-prerequisites)
3. [Step 1 — Install the Vercel CLI](#step-1--install-the-vercel-cli)
4. [Step 2 — Log in to Vercel](#step-2--log-in-to-vercel)
5. [Step 3 — Prepare local environment](#step-3--prepare-local-environment)
6. [Step 4 — Link the project](#step-4--link-the-project)
7. [Step 5 — Set production environment variables](#step-5--set-production-environment-variables)
8. [Step 6 — Deploy (preview)](#step-6--deploy-preview)
9. [Step 7 — Deploy to production](#step-7--deploy-to-production)
10. [Step 8 — Connect the Django API (CORS & URLs)](#step-8--connect-the-django-api-cors--urls)
11. [Step 9 — Custom domain (optional)](#step-9--custom-domain-optional)
12. [Step 10 — Auto-deploy from GitHub (optional)](#step-10--auto-deploy-from-github-optional)
13. [Troubleshooting](#troubleshooting)
14. [Useful commands](#useful-commands)
15. [Checklist](#checklist)

---

## 1. Overview

```text
Browser
   │
   ▼
Vercel (Next.js client)     ←  this guide
   │
   ▼
Django API (EC2 / ECS)      ←  EC2-DEPLOYMENT.md or AWS-DEPLOYMENT.md
   │
   ├── PostgreSQL / SQLite
   └── AWS S3 (media)
```

| Item | Value |
|------|--------|
| App directory | `client/` (monorepo subfolder) |
| Framework | Next.js 14 — detected automatically by Vercel |
| Build command | `next build` (runs `scripts/generate-version.js` via `prebuild` in `package.json`) |
| Root for CLI | Always run `vercel` commands from `client/`, not the repo root |

---

## 2. Prerequisites

- [Vercel account](https://vercel.com/signup) (free Hobby tier is enough to start)
- Node.js 18+ locally (for CLI and local builds)
- Git repo cloned locally
- **Backend API URL** ready (e.g. `https://api.focuspilot.io` after [EC2 Step 15](./EC2-DEPLOYMENT.md#step-15--https-and-domain-focuspilotio))
- Do **not** commit `client/.env.local` — it is for local dev only

---

## Step 1 — Install the Vercel CLI

From any terminal:

```bash
npm install -g vercel
```

Verify:

```bash
vercel --version
```

Expected: `Vercel CLI 54.x.x` (or newer).

---

## Step 2 — Log in to Vercel

```bash
vercel login
```

1. The CLI prints a URL like `https://vercel.com/oauth/device?user_code=XXXX-XXXX`
2. Open it in your browser and approve the device
3. Confirm success:

```bash
vercel whoami
```

Example output:

```text
> Logged in as your-username
> Active team: your-username's projects
```

If `vercel whoami` shows **Not authorized**, run `vercel login` again in the **same** terminal you use for deploys.

---

## Step 3 — Prepare local environment

### 3.1 Local dev file (not deployed)

Create or edit `client/.env.local` for **local** development only:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
API_URL=http://127.0.0.1:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_AI_USE_MOCK=true
```

Vercel does **not** read `.env.local` from your machine unless you push vars via the dashboard or `vercel env add`.

### 3.2 Test build locally (recommended)

```bash
cd client
npm install
npm run build
```

Fix any build errors before deploying. The Vercel build uses the same `npm run build` → `next build` pipeline.

---

## Step 4 — Link the project

All Vercel commands must run from the **`client/`** directory:

```bash
cd client
vercel link
```

Interactive prompts:

| Prompt | Recommended choice |
|--------|-------------------|
| Set up and deploy? | **Y** |
| Which scope? | Your team or personal account |
| Link to existing project? | **N** (first time) or **Y** (if project already exists on Vercel) |
| Project name | e.g. `focus-studio` or `client` |
| Directory | `.` (current folder — `client/`) |

Non-interactive link (CI or scripting):

```bash
cd client
vercel link --yes --scope your-team-slug
```

This creates `client/.vercel/project.json`:

```json
{
  "projectId": "prj_...",
  "orgId": "team_...",
  "projectName": "client"
}
```

**Commit `client/.vercel/project.json`** if your team shares the same Vercel project. Do **not** commit tokens.

### 4.1 Wrong team / stale link

If deploy fails with:

```text
Error: Could not retrieve Project Settings. To link your Project, remove the `.vercel` directory and deploy again.
```

The `.vercel` folder may point to another team’s project (e.g. an old `techstyles-v5` link).

Fix:

```bash
cd client
rm -rf .vercel          # PowerShell: Remove-Item -Recurse -Force .vercel
vercel link --yes --scope your-team-slug
```

Then deploy again ([Step 7](#step-7--deploy-to-production)).

---

## Step 5 — Set production environment variables

List current vars:

```bash
cd client
vercel env ls
```

### 5.1 Required variables

| Variable | Production example | Purpose |
|----------|---------------------|---------|
| `NEXT_PUBLIC_API_URL` | `https://api.focuspilot.io` | Browser + client-side API calls |
| `NEXT_PUBLIC_APP_URL` | `https://app.focuspilot.io` | Absolute links, OAuth redirects, emails |
| `API_URL` | `https://api.focuspilot.io` | Next.js **server** proxy to Django (optional if same as public URL) |

### 5.2 Optional variables

| Variable | Example | Purpose |
|----------|---------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Task attachment storage (if used) |
| `NEXT_PUBLIC_AI_USE_MOCK` | `false` | Set `true` only for demos without OpenAI |
| `NEXT_PUBLIC_USERBACK_TOKEN` | `...` | Userback feedback widget |

### 5.3 Add each variable (CLI)

For each variable, run:

```bash
cd client
vercel env add NEXT_PUBLIC_API_URL production
```

Paste the value when prompted (e.g. `https://api.focuspilot.io`).

Repeat for **Production**. Optionally add the same keys for **Preview** and **Development** with staging URLs.

Add from stdin (scripting):

```bash
echo "https://api.focuspilot.io" | vercel env add NEXT_PUBLIC_API_URL production
```

Pull env vars to a local file (for debugging — **do not commit**):

```bash
vercel env pull .env.vercel.local
```

### 5.4 Dashboard alternative

1. [vercel.com](https://vercel.com) → your team → **client** project  
2. **Settings** → **Environment Variables**  
3. Add each key for **Production** (and Preview if needed)  
4. Redeploy after changes ([Step 7](#step-7--deploy-to-production))

> **Important:** `NEXT_PUBLIC_*` vars are embedded at **build time**. After changing them, you must **redeploy** for the live site to pick them up.

---

## Step 6 — Deploy (preview)

Preview deployments use a unique URL and are safe for testing:

```bash
cd client
vercel
```

Or explicitly:

```bash
vercel deploy
```

- CLI uploads `client/` and runs `vercel build` on Vercel  
- Output includes a preview URL, e.g. `https://client-abc123-your-team.vercel.app`  
- Uses **Preview** environment variables (if set)

Test login and API calls against your staging or production API.

---

## Step 7 — Deploy to production

```bash
cd client
vercel deploy --prod --yes
```

| Flag | Meaning |
|------|---------|
| `--prod` | Promote to **Production** alias |
| `--yes` | Skip interactive confirmations |

On success you will see:

```text
▲ Production  https://client-xxxxx-your-team.vercel.app
▲ Aliased     https://client-your-alias.vercel.app
```

Open the **Aliased** URL in a browser and verify:

- [ ] Login page loads  
- [ ] API requests go to your backend (Network tab → requests to `NEXT_PUBLIC_API_URL`, not `localhost`)  
- [ ] No CORS errors in the console  

Inspect a deployment:

```bash
vercel inspect https://client-your-alias.vercel.app
```

---

## Step 8 — Connect the Django API (CORS & URLs)

The frontend on Vercel must be allowed by the Django API.

### 8.1 Server `server/.env` (on EC2 or ECS)

```env
FRONTEND_URL=https://client-your-alias.vercel.app
# or your custom domain: https://app.focuspilot.io

CORS_ALLOWED_ORIGINS=https://client-your-alias.vercel.app,http://localhost:3000
```

Rules:

- Use the **exact** frontend origin (scheme + host, no trailing slash)  
- Include every Vercel URL you use (production alias + preview URLs if testing against prod API)  
- Restart Gunicorn after editing: `sudo systemctl restart focus-api`

See [EC2 Step 16](./EC2-DEPLOYMENT.md#step-16--connect-the-nextjs-frontend) for the full backend checklist.

### 8.2 OAuth and Stripe redirect URLs

Update third-party dashboards to use production URLs:

| Service | URL pattern |
|---------|-------------|
| Xero | `https://api.focuspilot.io/xero/xero/callback/` |
| Gmail | `https://api.focuspilot.io/gmail/callback` |
| Stripe webhooks | `https://api.focuspilot.io/billing/webhook/` (path per your routes) |

Frontend OAuth callback pages live under `client/app/oauth/` — ensure `NEXT_PUBLIC_APP_URL` matches the domain users visit.

### 8.3 Content Security Policy

`client/next.config.mjs` builds `connect-src` from `NEXT_PUBLIC_API_URL`. After changing the API URL in Vercel env, redeploy so CSP allows your API origin.

---

## Step 9 — Custom domain (optional)

### 9.1 Add domain in Vercel

1. Project → **Settings** → **Domains**  
2. Add e.g. `app.focuspilot.io`  
3. Follow DNS instructions (CNAME to `cname.vercel-dns.com` or Vercel nameservers)

### 9.2 Update environment variables

```bash
vercel env add NEXT_PUBLIC_APP_URL production
# value: https://app.focuspilot.io
```

Redeploy:

```bash
vercel deploy --prod --yes
```

### 9.3 Update Django

```env
FRONTEND_URL=https://app.focuspilot.io
CORS_ALLOWED_ORIGINS=https://app.focuspilot.io,http://localhost:3000
```

---

## Step 10 — Auto-deploy from GitHub (optional)

Instead of manual `vercel deploy`, connect the Git repo in the Vercel dashboard:

1. **Add New Project** → Import Git repository  
2. **Root Directory:** `client`  
3. **Framework Preset:** Next.js  
4. **Build Command:** `npm run build` (default)  
5. **Install Command:** `npm install`  
6. Add environment variables under **Settings → Environment Variables**  
7. Every push to `main` deploys **Production**; other branches get **Preview** URLs  

For monorepos, set **Root Directory** to `client` so Vercel does not build the Django `server/` folder.

CLI equivalent to connect Git (if not already linked):

```bash
vercel git connect
```

---

## Troubleshooting

### `Error: Not authorized` / `vercel whoami` fails

- Run `vercel login` in the same terminal session  
- Ensure no expired `VERCEL_TOKEN` in the environment overrides CLI auth  

### `Could not retrieve Project Settings`

- Wrong team in `client/.vercel/project.json`  
- Fix: remove `.vercel`, run `vercel link --yes --scope your-team-slug`, redeploy  

### API calls go to `localhost:8000` in production

- `NEXT_PUBLIC_API_URL` not set on Vercel, or set only for Preview  
- Add for **Production**, then `vercel deploy --prod --yes`  

### CORS errors in browser

- Add the exact Vercel URL to `CORS_ALLOWED_ORIGINS` on the server  
- Restart `focus-api` after changing `server/.env`  

### Build fails on Vercel but works locally

- Check Node version: Vercel may use Node 20+; optional `engines` in `package.json`  
- Optional dependency `canvas` may warn on Linux — usually non-fatal  
- Run `npm run build` locally with the same env vars (`vercel env pull` then build)  

### `postFormData` / import warnings during build

- Warnings about missing exports may appear; the build can still succeed if `typescript.ignoreBuildErrors` is enabled in `next.config.mjs`  
- Fix underlying imports before relying on production stability  

### Mixed package managers

- Repo has `package-lock.json`; Vercel may use `yarn` if `yarn.lock` exists  
- Prefer one lockfile in `client/` to avoid dependency drift  

---

## Useful commands

| Command | Description |
|---------|-------------|
| `vercel whoami` | Show logged-in user and active team |
| `vercel teams ls` | List teams |
| `vercel link` | Link `client/` to a Vercel project |
| `vercel env ls` | List environment variables |
| `vercel env add NAME production` | Add a production env var |
| `vercel env pull .env.vercel.local` | Download env vars locally |
| `vercel` | Preview deployment |
| `vercel deploy --prod --yes` | Production deployment |
| `vercel inspect URL` | Deployment logs and status |
| `vercel logs URL` | Runtime logs |
| `vercel domains ls` | List domains |

---

## Checklist

### One-time setup
- [ ] Vercel CLI installed (`vercel --version`)
- [ ] Logged in (`vercel whoami`)
- [ ] `cd client` && `vercel link` (correct team)
- [ ] `npm run build` succeeds locally

### Environment
- [ ] `NEXT_PUBLIC_API_URL` set for **Production**
- [ ] `NEXT_PUBLIC_APP_URL` set for **Production**
- [ ] Optional: Preview env vars for staging API

### Deploy
- [ ] `vercel deploy --prod --yes` completed
- [ ] Production URL opens and login works
- [ ] Network tab shows API host (not localhost)

### Backend alignment
- [ ] `CORS_ALLOWED_ORIGINS` includes Vercel / custom domain
- [ ] `FRONTEND_URL` updated on Django server
- [ ] OAuth / Stripe URLs use production API domain
- [ ] Gunicorn restarted after server `.env` changes

### Optional
- [ ] Custom domain added in Vercel
- [ ] GitHub integration for automatic deploys on push

---

## Related files in this repo

| File | Purpose |
|------|---------|
| `client/package.json` | Build scripts (`build`, `predev`) |
| `client/next.config.mjs` | Next.js config, CSP, image domains |
| `client/.env.local` | Local dev only (not deployed) |
| `client/.vercel/project.json` | Vercel project link (safe to commit) |
| `docs/EC2-DEPLOYMENT.md` | Deploy Django API on EC2 |
| `docs/AWS-DEPLOYMENT.md` | Deploy Django API on ECS/Fargate |
| `server/.env.example` | Backend env template (CORS, URLs) |

---

*Last updated: May 2026 — Focus-Studio / TechStyles Vercel frontend deployment.*
