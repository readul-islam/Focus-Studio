# Focus-Studio — EC2 Deployment Guide (Step by Step)

Complete walkthrough for deploying the **Django API** (`server/`) on **AWS EC2** (Free Tier friendly). Use this for startup/MVP; migrate to ECS later using [AWS-DEPLOYMENT.md](./AWS-DEPLOYMENT.md).

**Stack on one server:** Ubuntu 24.04 → Nginx → Gunicorn → Django → S3 (files) → SQLite or RDS (database).

---

## Table of contents

1. [Overview](#1-overview)
2. [Prerequisites](#2-prerequisites)
3. [Step 1 — Launch EC2 instance](#step-1--launch-ec2-instance)
4. [Step 2 — Security group (firewall)](#step-2--security-group-firewall)
5. [Step 3 — Storage](#step-3--storage)
6. [Step 4 — Launch and save key pair](#step-4--launch-and-save-key-pair)
7. [Step 5 — SSH into the server](#step-5--ssh-into-the-server)
8. [Step 6 — Install system packages](#step-6--install-system-packages)
9. [Step 7 — Clone the repository](#step-7--clone-the-repository)
10. [Step 8 — Python virtualenv and dependencies](#step-8--python-virtualenv-and-dependencies)
11. [Step 9 — Production `.env` on the server](#step-9--production-env-on-the-server)
12. [Step 10 — Django migrate and static files](#step-10--django-migrate-and-static-files)
13. [Step 11 — Gunicorn (systemd service)](#step-11--gunicorn-systemd-service)
14. [Step 12 — Nginx reverse proxy](#step-12--nginx-reverse-proxy)
15. [Step 13 — Test with public IP (before HTTPS)](#step-13--test-with-public-ip-before-https)
16. [Step 14 — Fix `DisallowedHost` (ALLOWED_HOSTS)](#step-14--fix-disallowedhost-allowed_hosts)
17. [Step 15 — HTTPS and domain (focuspilot.io)](#step-15--https-and-domain-focuspilotio)
18. [Step 16 — Connect the Next.js frontend](#step-16--connect-the-nextjs-frontend)
19. [Step 17 — Auto-deploy from GitHub on push](#step-17--auto-deploy-from-github-on-push)
20. [Step 18 — Optional: RDS PostgreSQL](#step-18--optional-rds-postgresql)
21. [Troubleshooting](#troubleshooting)
22. [Useful commands](#useful-commands)
23. [Migration to ECS later](#migration-to-ecs-later)
24. [Checklist](#checklist)

---

## 1. Overview

```text
Browser / Next.js (Vercel)
        │
        ▼
   Nginx :80 / :443  (EC2)
        │
        ▼
   Gunicorn :8000  (Django API)
        │
        ├── SQLite (MVP) or RDS PostgreSQL
        └── AWS S3 (media/static via django-storages)
```

| Item | Value |
|------|--------|
| App path on server | `/var/www/focus-studio` |
| Django project | `/var/www/focus-studio/server` |
| API domain (recommended) | `api.focuspilot.io` |
| Region (S3 bucket) | `eu-west-2` (London) — prefer same region for EC2/RDS |

---

## 2. Prerequisites

- AWS account (Free Tier eligible)
- GitHub repo with this monorepo
- Domain **focuspilot.io** (optional for first test; IP works for Phase 13)
- Local machine: Windows PowerShell, Git, SSH client
- All secrets in `server/.env` locally (never commit `.env`)

---

## Step 1 — Launch EC2 instance

1. AWS Console → **EC2** → **Launch instance**
2. **Name:** `focus-studio-api` (or any name)
3. **AMI:** **Ubuntu Server 24.04 LTS (HVM), SSD** — **Free tier eligible**
   - Do **not** pick Ubuntu Pro, Deep Learning, or SQL Server images
4. **Architecture:** 64-bit (x86)
5. **Instance type:** **t3.micro** — Free tier eligible
6. **Region:** Prefer **Europe (London) `eu-west-2`** (same as S3 bucket `techstyles`)

---

## Step 2 — Security group (firewall)

Under **Firewall (security groups)** → **Create security group**:

| Rule | Enable | Source |
|------|--------|--------|
| SSH (22) | Yes | **My IP** (not 0.0.0.0/0) |
| HTTP (80) | Yes | Anywhere `0.0.0.0/0` |
| HTTPS (443) | Yes | Anywhere `0.0.0.0/0` |

SSH from **My IP** only reduces brute-force attacks.

---

## Step 3 — Storage

**Configure storage:**

- **1 volume:** **16 GiB**, type **gp3** (root)
- Do **not** add EFS, FSx, or extra volumes for MVP
- Ignore the yellow “instance store” info message on t3.micro

---

## Step 4 — Launch and save key pair

1. **Key pair:** Create new → download `.pem` (e.g. `focus-studio.pem`)
2. Store it safely — you cannot download it again
3. Click **Launch instance**
4. Wait until **Instance state** = **Running**, **Status checks** = **2/2 passed**
5. Copy **Public IPv4 address** (example: `54.221.130.250`)

**Optional (recommended):** EC2 → **Elastic IPs** → Allocate → Associate with this instance so the IP does not change on stop/start.

---

## Step 5 — SSH into the server

### Windows (PowerShell)

Fix key permissions (once):

```powershell
icacls "C:\path\to\focus-studio.pem" /inheritance:r
icacls "C:\path\to\focus-studio.pem" /grant:r "$($env:USERNAME):(R)"
```

Connect:

```powershell
ssh -i "C:\path\to\focus-studio.pem" ubuntu@YOUR_PUBLIC_IP
```

Replace `YOUR_PUBLIC_IP` with your EC2 address. User is always **`ubuntu`** on Ubuntu AMIs.

---

## Step 6 — Install system packages

On the EC2 server:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3 python3-venv python3-pip nginx git certbot python3-certbot-nginx
```

Create application directory:

```bash
sudo mkdir -p /var/www/focus-studio
sudo chown ubuntu:ubuntu /var/www/focus-studio
```

---

## Step 7 — Clone the repository

### Option A — Git + deploy key (recommended for GitHub auto-deploy)

```bash
ssh-keygen -t ed25519 -f ~/.ssh/github_deploy -N ""
cat ~/.ssh/github_deploy.pub
```

1. Copy the public key
2. GitHub → your repo → **Settings** → **Deploy keys** → **Add deploy key**
3. Paste key, title `ec2-prod`, read access is enough

Configure SSH:

```bash
nano ~/.ssh/config
```

```text
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/github_deploy
  IdentitiesOnly yes
```

```bash
chmod 600 ~/.ssh/config ~/.ssh/github_deploy
ssh -T git@github.com
```

Clone:

```bash
cd /var/www/focus-studio
git clone git@github.com:YOUR_ORG/Focus-Studio.git .
```

### Option B — Copy from your PC (no Git on server yet)

On Windows:

```powershell
scp -i "C:\path\to\focus-studio.pem" -r "C:\Users\Pro Coder\Documents\Focus-Studio" ubuntu@YOUR_PUBLIC_IP:/var/www/focus-studio-tmp
```

On server, move `server/` and needed files into `/var/www/focus-studio`.

---

## Step 8 — Python virtualenv and dependencies

```bash
cd /var/www/focus-studio/server
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt gunicorn psycopg2-binary
```

---

## Step 9 — Production `.env` on the server

Create env file **on the server only** (never commit):

```bash
nano /var/www/focus-studio/server/.env
```

Copy from local `server/.env` and adjust for production.

**Minimum for IP testing (before domain):**

```env
SECRET_KEY=your-long-random-secret
DEBUG=True
ALLOWED_HOSTS=YOUR_PUBLIC_IP,127.0.0.1,localhost

FRONTEND_URL=http://localhost:3000
CLIENT_PORTAL_URL=http://localhost:3001
CONTRACTOR_PORTAL_URL=http://localhost:3002
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://your-frontend.vercel.app

# AWS S3, Stripe, Xero, Gmail, OpenAI, Resend, email — copy from local .env
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_STORAGE_BUCKET_NAME=techstyles
AWS_S3_REGION_NAME=eu-west-2
```

**After domain + HTTPS:**

```env
DEBUG=False
ALLOWED_HOSTS=api.focuspilot.io,YOUR_PUBLIC_IP,127.0.0.1,localhost
FRONTEND_URL=https://app.focuspilot.io
CORS_ALLOWED_ORIGINS=https://app.focuspilot.io
XERO_REDIRECT_URI=https://api.focuspilot.io/xero/xero/callback/
GMAIL_REDIRECT_URI=https://api.focuspilot.io/gmail/callback
```

See `server/.env.example` for all variable names.

---

## Step 10 — Django migrate and static files

```bash
cd /var/www/focus-studio/server
source .venv/bin/activate
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser
```

Quick manual test:

```bash
gunicorn techstyles.wsgi:application --bind 127.0.0.1:8000
```

Press `Ctrl+C` when no errors.

---

## Step 11 — Gunicorn (systemd service)

```bash
sudo nano /etc/systemd/system/focus-api.service
```

```ini
[Unit]
Description=Focus Studio Django API
After=network.target

[Service]
User=ubuntu
Group=ubuntu
WorkingDirectory=/var/www/focus-studio/server
Environment="PATH=/var/www/focus-studio/server/.venv/bin"
ExecStart=/var/www/focus-studio/server/.venv/bin/gunicorn techstyles.wsgi:application --bind 127.0.0.1:8000 --workers 2 --timeout 120
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable:

```bash
sudo systemctl daemon-reload
sudo systemctl enable focus-api
sudo systemctl start focus-api
sudo systemctl status focus-api
```

---

## Step 12 — Nginx reverse proxy

```bash
sudo nano /etc/nginx/sites-available/focus-api
```

**Before domain (IP only):**

```nginx
server {
    listen 80;
    server_name YOUR_PUBLIC_IP;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**With domain (IP + subdomain):**

```nginx
server {
    listen 80;
    server_name YOUR_PUBLIC_IP api.focuspilot.io;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/focus-api /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

---

## Step 13 — Test with public IP (before HTTPS)

Open in browser:

```text
http://YOUR_PUBLIC_IP/admin/
```

Expected: Django admin **login** page.

If you see yellow Django debug page with **DisallowedHost** → go to [Step 14](#step-14--fix-disallowedhost-allowed_hosts).

---

## Step 14 — Fix `DisallowedHost` (ALLOWED_HOSTS)

Error example:

```text
Invalid HTTP_HOST header: '54.221.130.250'. You may need to add '54.221.130.250' to ALLOWED_HOSTS.
```

**Fix:**

```bash
nano /var/www/focus-studio/server/.env
```

Set (use your real IP):

```env
ALLOWED_HOSTS=54.221.130.250,127.0.0.1,localhost
```

Restart:

```bash
sudo systemctl restart focus-api
```

Reload `http://YOUR_PUBLIC_IP/admin/`.

---

## Step 15 — HTTPS and domain (focuspilot.io)

### 15.1 DNS

At your domain registrar (or Route 53), add:

| Type | Name | Value |
|------|------|--------|
| A | `api` | EC2 **public IP** (or Elastic IP) |

Result: `api.focuspilot.io` → your server.

Wait 5–30 minutes for DNS propagation.

### 15.2 Update Nginx `server_name`

```bash
sudo nano /etc/nginx/sites-available/focus-api
```

```nginx
server_name YOUR_PUBLIC_IP api.focuspilot.io;
```

```bash
sudo nginx -t && sudo systemctl reload nginx
```

### 15.3 Update `.env`

```bash
nano /var/www/focus-studio/server/.env
```

```env
DEBUG=False
ALLOWED_HOSTS=api.focuspilot.io,YOUR_PUBLIC_IP,127.0.0.1,localhost
FRONTEND_URL=https://app.focuspilot.io
CORS_ALLOWED_ORIGINS=https://app.focuspilot.io
XERO_REDIRECT_URI=https://api.focuspilot.io/xero/xero/callback/
GMAIL_REDIRECT_URI=https://api.focuspilot.io/gmail/callback
```

```bash
sudo systemctl restart focus-api
```

### 15.4 SSL certificate (Let’s Encrypt)

```bash
sudo certbot --nginx -d api.focuspilot.io
```

Follow prompts (email, agree, redirect HTTP → HTTPS).

Test:

```text
https://api.focuspilot.io/admin/
```

### 15.5 Stripe / OAuth webhooks

Update dashboard URLs to use `https://api.focuspilot.io/...` (billing webhook, Xero, Gmail redirect URIs).

---

## Step 16 — Connect the Next.js frontend

Deploy the Next.js app to Vercel using the full walkthrough: **[VERCEL-DEPLOYMENT.md](./VERCEL-DEPLOYMENT.md)**.

Quick reference — set on Vercel (or local `client/.env.local`):

```env
NEXT_PUBLIC_API_URL=https://api.focuspilot.io
NEXT_PUBLIC_APP_URL=https://app.focuspilot.io
```

Then production deploy from `client/`:

```bash
cd client
vercel deploy --prod --yes
```

Ensure `CORS_ALLOWED_ORIGINS` on the server includes your exact frontend URL (no trailing slash).

---

## Step 17 — Auto-deploy from GitHub on push

The repo includes:

- `scripts/ec2-deploy.sh` — pull, install, migrate, collectstatic, restart
- `.github/workflows/deploy-ec2.yml` — runs on push to `main` when `server/**` changes

### 17.1 One-time: ensure repo is cloned on EC2

See [Step 7](#step-7--clone-the-repository). App must live at `/var/www/focus-studio`.

```bash
chmod +x /var/www/focus-studio/scripts/ec2-deploy.sh
```

### 17.2 GitHub Actions secrets

Repo → **Settings** → **Secrets and variables** → **Actions**:

| Secret | Example |
|--------|---------|
| `EC2_HOST` | `54.221.130.250` or `api.focuspilot.io` |
| `EC2_USER` | `ubuntu` |
| `EC2_SSH_KEY` | Full contents of `.pem` file |
| `EC2_APP_DIR` | (optional) `/var/www/focus-studio` |

### 17.3 Push workflow to GitHub

```bash
git add scripts/ec2-deploy.sh .github/workflows/deploy-ec2.yml docs/EC2-DEPLOYMENT.md
git commit -m "Add EC2 deployment docs and GitHub Actions workflow"
git push origin main
```

### 17.4 What happens on each push

```text
git push main (server/ changed)
    → GitHub Actions SSH to EC2
    → git fetch && git reset --hard origin/main
    → ./scripts/ec2-deploy.sh
    → systemctl restart focus-api
```

### 17.5 Manual deploy (without waiting for Actions)

```bash
cd /var/www/focus-studio
git pull origin main
./scripts/ec2-deploy.sh
```

**Note:** `.env` on the server is **not** overwritten by `git pull` (`.env` is gitignored).

---

## Step 18 — Optional: RDS PostgreSQL

SQLite works for quick tests; use RDS for production.

1. **RDS** → Create database → PostgreSQL 16, `db.t3.micro`, same region as EC2
2. **Public access:** No
3. Security group: allow port **5432** from EC2 security group only
4. Add to `server/.env`:

```env
DB_NAME=techstyles
DB_USER=admin
DB_PASSWORD=your-rds-password
DB_HOST=your-instance.xxxx.eu-west-2.rds.amazonaws.com
DB_PORT=5432
```

5. Update `server/techstyles/settings.py` to use PostgreSQL when `DB_HOST` is set (see [AWS-DEPLOYMENT.md](./AWS-DEPLOYMENT.md#52-postgresql-via-environment-variables))
6. `python manage.py migrate` on server

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| **DisallowedHost** | Add IP/domain to `ALLOWED_HOSTS` in server `.env`, restart `focus-api` |
| **502 Bad Gateway** | `sudo systemctl status focus-api` — Gunicorn not running |
| **Connection refused SSH** | Security group: SSH from **My IP**; instance running |
| **Static files 404** | Run `collectstatic`; check S3 credentials in `.env` |
| **CORS errors from frontend** | Match `CORS_ALLOWED_ORIGINS` exactly to frontend URL |
| **Certbot fails** | DNS `api` A record must point to this server first |
| **GitHub deploy fails** | Check Actions logs; verify `EC2_SSH_KEY`, deploy key on repo |

---

## Useful commands

```bash
# API status and logs
sudo systemctl status focus-api
sudo journalctl -u focus-api -f

# Restart after .env change
sudo systemctl restart focus-api

# Nginx
sudo nginx -t
sudo systemctl reload nginx
sudo tail -f /var/log/nginx/error.log

# Django shell on server
cd /var/www/focus-studio/server && source .venv/bin/activate && python manage.py shell
```

---

## Migration to ECS later

When you outgrow one EC2 box:

1. Add `Dockerfile` (see [AWS-DEPLOYMENT.md](./AWS-DEPLOYMENT.md))
2. Move to **ECS Fargate + ALB + RDS**
3. Keep the same Django app and `.env` variable names

Estimated cost: EC2 MVP **~$0–15/mo** (Free Tier) vs ECS production **~$95–130/mo**.

---

## Checklist

### EC2 launch
- [ ] Ubuntu 24.04 LTS, t3.micro
- [ ] Security group: SSH (My IP), HTTP, HTTPS
- [ ] 16 GiB gp3 root volume
- [ ] Key pair downloaded

### Server setup
- [ ] SSH works
- [ ] nginx, python3, git installed
- [ ] Repo at `/var/www/focus-studio`
- [ ] `.venv` + `pip install -r requirements.txt gunicorn`
- [ ] `server/.env` created on server (not in git)
- [ ] `migrate`, `collectstatic`, `createsuperuser`

### Services
- [ ] `focus-api` systemd service running
- [ ] Nginx proxies to `127.0.0.1:8000`
- [ ] `http://IP/admin/` works
- [ ] `ALLOWED_HOSTS` includes public IP

### Domain (when ready)
- [ ] DNS A record `api` → EC2 IP
- [ ] Certbot HTTPS on `api.focuspilot.io`
- [ ] `DEBUG=False` in production
- [ ] Stripe / Xero / Gmail URLs updated

### Frontend & CI
- [ ] `NEXT_PUBLIC_API_URL` points to API
- [ ] GitHub deploy secrets set
- [ ] Push to `main` triggers deploy workflow

---

## Related files in this repo

| File | Purpose |
|------|---------|
| `server/.env.example` | Template for all env vars |
| `scripts/ec2-deploy.sh` | Server-side deploy script |
| `.github/workflows/deploy-ec2.yml` | Auto-deploy on push |
| `docs/AWS-DEPLOYMENT.md` | Future ECS/Fargate guide |
| `docs/VERCEL-DEPLOYMENT.md` | Next.js frontend on Vercel |

---

*Last updated: May 2026 — Focus-Studio / TechStyles EC2 deployment.*
