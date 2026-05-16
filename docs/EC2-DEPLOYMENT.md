# Focus-Studio — EC2 Deployment Guide (Step by Step)

Complete walkthrough for deploying the **Django API** (`server/`) on **AWS EC2** (Free Tier friendly). Use this for startup/MVP; migrate to ECS later using [AWS-DEPLOYMENT.md](./AWS-DEPLOYMENT.md).

**Live example (Focuspilot):**

| Item | Value |
|------|--------|
| API base URL | `https://api.focuspilot.io` |
| EC2 IP | `54.221.130.250` |
| Frontend | `https://focuspilot.io` (Vercel) |
| Admin | `https://api.focuspilot.io/admin/` |
| API docs | `https://api.focuspilot.io/swagger/` |

---

## Table of contents

1. [Overview](#1-overview)
2. [Prerequisites](#2-prerequisites)
3. [Steps 1–4 — Launch EC2](#steps-14--launch-ec2)
4. [Steps 5–8 — Server setup & code](#steps-58--server-setup--code)
5. [Steps 9–12 — Env, Django, Gunicorn, Nginx](#steps-912--env-django-gunicorn-nginx)
6. [Steps 13–14 — Test IP & DisallowedHost](#steps-1314--test-ip--disallowedhost)
7. [Step 15 — DNS, HTTPS, production `.env`](#step-15--dns-https-production-env)
8. [Step 16 — Frontend (Vercel)](#step-16--frontend-vercel)
9. [Step 17 — GitHub auto-deploy](#step-17--github-auto-deploy)
10. [Step 18 — Optional RDS](#step-18--optional-rds)
11. [API endpoints reference](#api-endpoints-reference)
12. [Troubleshooting](#troubleshooting)
13. [Command cheat sheet](#command-cheat-sheet)
14. [Checklist](#checklist)

---

## 1. Overview

```text
https://focuspilot.io (Vercel / Next.js)
        │
        ▼  HTTPS only (no http:// IP from HTTPS pages)
https://api.focuspilot.io (Nginx :443 → Gunicorn :8000 → Django)
        │
        ├── SQLite (MVP) or RDS PostgreSQL
        └── AWS S3 (media/static)
```

| Item | Path / value |
|------|----------------|
| App root | `/var/www/focus-studio` |
| Django | `/var/www/focus-studio/server` |
| Systemd service | `focus-api` |
| Nginx site | `/etc/nginx/sites-available/focus-api` |
| Env file | `/var/www/focus-studio/server/.env` |

---

## 2. Prerequisites

- AWS account (Free Tier)
- GitHub repo
- Domain **focuspilot.io** (DNS at registrar or Vercel)
- `server/.env` filled locally — **never commit**
- PEM key for SSH

---

## Steps 1–4 — Launch EC2

### Step 1 — Instance

| Setting | Value |
|---------|--------|
| AMI | **Ubuntu Server 24.04 LTS** (Free tier) |
| Type | **t3.micro** |
| Region | **`eu-west-2`** (match S3 bucket) |

### Step 2 — Security group

| Port | Source |
|------|--------|
| 22 SSH | **My IP** only |
| 80 HTTP | `0.0.0.0/0` |
| 443 HTTPS | `0.0.0.0/0` |

### Step 3 — Storage

- **16 GiB gp3** root volume — no extra disks

### Step 4 — Launch

- Create/download **`.pem`** key
- Note **Public IPv4** (e.g. `54.221.130.250`)
- Optional: **Elastic IP** so IP never changes

---

## Steps 5–8 — Server setup & code

### Step 5 — SSH (Windows)

```powershell
icacls "C:\path\to\key.pem" /inheritance:r
icacls "C:\path\to\key.pem" /grant:r "$($env:USERNAME):(R)"
ssh -i "C:\path\to\key.pem" ubuntu@54.221.130.250
```

### Step 6 — Packages

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3 python3-venv python3-pip nginx git certbot python3-certbot-nginx
sudo mkdir -p /var/www/focus-studio
sudo chown ubuntu:ubuntu /var/www/focus-studio
```

### Step 7 — Clone (Git deploy key)

```bash
ssh-keygen -t ed25519 -f ~/.ssh/github_deploy -N ""
cat ~/.ssh/github_deploy.pub   # → GitHub repo → Settings → Deploy keys
```

`~/.ssh/config`:

```text
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/github_deploy
  IdentitiesOnly yes
```

```bash
cd /var/www/focus-studio
git clone git@github.com:YOUR_ORG/Focus-Studio.git .
```

### Step 8 — Python

```bash
cd /var/www/focus-studio/server
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt gunicorn psycopg2-binary
```

---

## Steps 9–12 — Env, Django, Gunicorn, Nginx

### Step 9 — `.env` on server

```bash
nano /var/www/focus-studio/server/.env
```

See [Production `.env` template](#production-env-template) below.

### Step 10 — Django

```bash
cd /var/www/focus-studio/server
source .venv/bin/activate
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser
```

### Step 11 — systemd (`focus-api`)

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

```bash
sudo systemctl daemon-reload
sudo systemctl enable focus-api
sudo systemctl start focus-api
sudo systemctl status focus-api
```

### Step 12 — Nginx

```bash
sudo nano /etc/nginx/sites-available/focus-api
```

```nginx
server {
    listen 80;
    server_name 54.221.130.250 api.focuspilot.io;

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

```bash
sudo ln -sf /etc/nginx/sites-available/focus-api /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

---

## Steps 13–14 — Test IP & DisallowedHost

**Test:** `http://54.221.130.250/admin/` → Django admin login.

**DisallowedHost fix:**

```env
ALLOWED_HOSTS=54.221.130.250,api.focuspilot.io,127.0.0.1,localhost
```

```bash
sudo systemctl restart focus-api
```

---

## Step 15 — DNS, HTTPS, production `.env`

### 15.1 DNS (Vercel or registrar)

| Type | Name | Value |
|------|------|--------|
| A | `api` | `54.221.130.250` |

→ `api.focuspilot.io` points to EC2.

### 15.2 Certbot (HTTPS)

**First time:**

```bash
sudo certbot --nginx -d api.focuspilot.io
```

**Certificate already exists** (prompt: *Certificate not yet due for renewal*):

- Choose **`1`** — **Attempt to reinstall** (rewires Nginx to existing cert)
- Do **not** pick `2` unless renewing a broken cert

```bash
sudo nginx -t
sudo systemctl reload nginx
```

**Verify:**

```bash
curl -I https://api.focuspilot.io/swagger/
```

Browser: `https://api.focuspilot.io/admin/`

### 15.3 Production `.env` template

```bash
nano /var/www/focus-studio/server/.env
```

```env
SECRET_KEY=<50+ char random string>
DEBUG=False

ALLOWED_HOSTS=api.focuspilot.io,54.221.130.250,127.0.0.1,localhost

FRONTEND_URL=https://focuspilot.io
CLIENT_PORTAL_URL=https://clients.focuspilot.io
CONTRACTOR_PORTAL_URL=https://contractors.focuspilot.io

# Frontend origins ONLY — do NOT list https://api.focuspilot.io here
CORS_ALLOWED_ORIGINS=https://focuspilot.io,https://www.focuspilot.io,https://clients.focuspilot.io,https://contractors.focuspilot.io,http://localhost:3000

# JWT cookies shared across api.* and www (required for login/register)
AUTH_COOKIE_DOMAIN=.focuspilot.io

XERO_REDIRECT_URI=https://api.focuspilot.io/xero/xero/callback/
GMAIL_REDIRECT_URI=https://api.focuspilot.io/gmail/callback

# ... AWS S3, Stripe, OpenAI, Resend, email — from server/.env.example
```

```bash
sudo systemctl restart focus-api
```

**Test CORS preflight (from your PC):**

```powershell
curl -X OPTIONS "https://api.focuspilot.io/user/register/" -H "Origin: https://focuspilot.io" -H "Access-Control-Request-Method: POST" -v
```

Expect **200** and `access-control-allow-origin: https://focuspilot.io`.

### 15.4 OAuth / Stripe

Update dashboards to `https://api.focuspilot.io/...` URLs.

---

## Step 16 — Frontend (Vercel)

**Vercel env (production):**

```env
NEXT_PUBLIC_API_URL=https://api.focuspilot.io
NEXT_PUBLIC_APP_URL=https://focuspilot.io
```

Redeploy after changing env vars.

**Rules:**

- Frontend **HTTPS** → API **HTTPS** (`https://api.focuspilot.io`)
- Never use `http://54.221.130.250` from `https://focuspilot.io` (mixed content blocked)

---

## Step 17 — GitHub auto-deploy

Files: `scripts/ec2-deploy.sh`, `.github/workflows/deploy-ec2.yml`

**GitHub secrets:** `EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY`, optional `EC2_APP_DIR`

**Manual deploy on server:**

```bash
cd /var/www/focus-studio
git pull origin main
./scripts/ec2-deploy.sh
```

`.env` is **not** overwritten by `git pull`.

---

## Step 18 — Optional RDS

PostgreSQL `db.t3.micro`, same region, SG allows 5432 from EC2 only. See [AWS-DEPLOYMENT.md](./AWS-DEPLOYMENT.md).

---

## API endpoints reference

**Base URL (use in frontend):**

```text
https://api.focuspilot.io
```

| Purpose | URL |
|---------|-----|
| Login | `POST /user/login/` |
| Register | `POST /user/register/` |
| Refresh token | `POST /user/refresh/` |
| Logout | `POST /user/logout/` |
| Current user | `GET /user/self/` |
| Swagger UI | `GET /swagger/` |
| OpenAPI schema | `GET /schema/` |
| Django admin | `GET /admin/` (staff only) |
| Projects | `/projects/` |
| Billing / Stripe | `/billing/` |

`/admin/` is **not** the API — it is the Django staff UI.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|--------|-----|
| **DisallowedHost** | IP/domain missing | Add to `ALLOWED_HOSTS`, restart `focus-api` |
| **blocked:mixed-content** | HTTPS site → HTTP API | Use `https://api.focuspilot.io` in Vercel |
| **CORS error** | Wrong/missing origin | Fix `CORS_ALLOWED_ORIGINS` (no API URL in list) |
| **OPTIONS 404** | Nginx/SSL not routing to Django | `server_name api.focuspilot.io`; certbot option **1** |
| **Login OK but session lost** | Wrong cookie domain | `AUTH_COOKIE_DOMAIN=.focuspilot.io`, `DEBUG=False` |
| **502 Bad Gateway** | Gunicorn down | `sudo systemctl status focus-api` |
| **Provisional headers** | Request blocked before network | Mixed content or CORS — fix URL/HTTPS |

---

## Command cheat sheet

### SSH & files

```bash
# Connect
ssh -i ~/key.pem ubuntu@54.221.130.250

# Edit env
nano /var/www/focus-studio/server/.env

# Edit Nginx
sudo nano /etc/nginx/sites-available/focus-api
```

### API service (most used)

```bash
# Status
sudo systemctl status focus-api

# Restart (after .env or code change)
sudo systemctl restart focus-api

# Live logs
sudo journalctl -u focus-api -f

# Last 100 log lines
sudo journalctl -u focus-api -n 100 --no-pager
```

### Nginx & SSL

```bash
# Test config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Nginx error log
sudo tail -f /var/log/nginx/error.log

# HTTPS headers check
curl -I https://api.focuspilot.io/admin/

# Certbot (first install)
sudo certbot --nginx -d api.focuspilot.io

# Certbot (cert exists — pick 1 reinstall)
sudo certbot --nginx -d api.focuspilot.io

# Renew all certs (cron usually handles this)
sudo certbot renew --dry-run
```

### Django (on server)

```bash
cd /var/www/focus-studio/server
source .venv/bin/activate

python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser
python manage.py check
python manage.py shell
```

### Deploy & Git

```bash
cd /var/www/focus-studio
git pull origin main
chmod +x scripts/ec2-deploy.sh
./scripts/ec2-deploy.sh
```

### CORS / connectivity tests (run from your PC)

```powershell
# Preflight (should return 200)
curl -X OPTIONS "https://api.focuspilot.io/user/register/" -H "Origin: https://focuspilot.io" -H "Access-Control-Request-Method: POST" -v

# API up
curl -I https://api.focuspilot.io/swagger/
```

```bash
# Same tests on Linux/Mac
curl -X OPTIONS "https://api.focuspilot.io/user/register/" \
  -H "Origin: https://focuspilot.io" \
  -H "Access-Control-Request-Method: POST" -i
```

### Disk, memory, processes

```bash
df -h
free -h
ps aux | grep gunicorn
```

### Open firewall port (only if you change SG)

Security groups are edited in **AWS Console → EC2 → Security Groups**, not on the server.

---

## Checklist

### EC2
- [ ] Ubuntu 24.04, t3.micro, eu-west-2
- [ ] SG: SSH (My IP), 80, 443
- [ ] PEM saved; Elastic IP (optional)

### Server
- [ ] Repo at `/var/www/focus-studio`
- [ ] `focus-api` running
- [ ] Nginx → Gunicorn :8000

### Production
- [ ] DNS `api` → EC2 IP
- [ ] `https://api.focuspilot.io/swagger/` works
- [ ] `DEBUG=False`, strong `SECRET_KEY`
- [ ] `AUTH_COOKIE_DOMAIN=.focuspilot.io`
- [ ] `CORS_ALLOWED_ORIGINS` = frontend URLs only
- [ ] Vercel `NEXT_PUBLIC_API_URL=https://api.focuspilot.io`
- [ ] Register/login works from `https://focuspilot.io`

### CI
- [ ] GitHub Actions secrets set
- [ ] `git push` deploys via `ec2-deploy.sh`

---

## Related files

| File | Purpose |
|------|---------|
| `server/.env.example` | Env template |
| `scripts/ec2-deploy.sh` | Post-pull deploy |
| `.github/workflows/deploy-ec2.yml` | Auto-deploy |
| `docs/AWS-DEPLOYMENT.md` | Future ECS migration |

---

*Last updated: May 2026 — production: api.focuspilot.io on EC2.*
