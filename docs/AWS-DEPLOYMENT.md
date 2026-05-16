# Focus-Studio / TechStyles — AWS Server Deployment Guide

End-to-end guide for deploying the **Django API** (`server/`) to AWS with a CI/CD pipeline. The Next.js client can stay on Vercel/Amplify; this document focuses on the backend.

---

## Table of contents

1. [Recommended architecture](#1-recommended-architecture)
2. [Why this stack (vs alternatives)](#2-why-this-stack-vs-alternatives)
3. [Target architecture diagram](#3-target-architecture-diagram)
4. [Prerequisites](#4-prerequisites)
5. [Pre-deployment code changes](#5-pre-deployment-code-changes)
6. [AWS infrastructure (one-time setup)](#6-aws-infrastructure-one-time-setup)
7. [Container image (Docker)](#7-container-image-docker)
8. [ECS Fargate service](#8-ecs-fargate-service)
9. [Secrets and environment variables](#9-secrets-and-environment-variables)
10. [Database migrations and static files](#10-database-migrations-and-static-files)
11. [CI/CD pipeline (GitHub Actions)](#11-cicd-pipeline-github-actions)
12. [Alternative: AWS CodePipeline](#12-alternative-aws-codepipeline)
13. [DNS, HTTPS, and Stripe webhooks](#13-dns-https-and-stripe-webhooks)
14. [Operations runbook](#14-operations-runbook)
15. [Cost ballpark](#15-cost-ballpark)
16. [Checklist](#16-checklist)

---

## 1. Recommended architecture

| Layer | AWS service | Role |
|--------|-------------|------|
| Compute | **Amazon ECS on Fargate** | Run Django + Gunicorn in containers (no EC2 patching) |
| Load balancing | **Application Load Balancer (ALB)** | HTTPS termination, health checks, routing |
| Database | **Amazon RDS PostgreSQL** | Production DB (replace SQLite) |
| Files | **Amazon S3** | Already used via `django-storages` (`eu-west-2`) |
| Secrets | **AWS Secrets Manager** | `SECRET_KEY`, Stripe, Xero, DB password |
| Images | **Amazon ECR** | Private Docker registry |
| CI/CD | **GitHub Actions** → ECR → ECS | Build, test, deploy on merge to `main` |
| Logs | **CloudWatch Logs** | Container and ALB logs |
| Optional cache | **ElastiCache Redis** | Sessions/celery later; not required for v1 |

**Region:** `eu-west-2` (London) — matches your existing S3 bucket and UK-focused product.

**API URL example:** `https://api.techstyles.ai` → ALB → ECS tasks on port `8000`.

---

## 2. Why this stack (vs alternatives)

| Option | Best for | Pros | Cons |
|--------|----------|------|------|
| **ECS Fargate + ALB + RDS** ✅ | Production SaaS (your case) | Scalable, no servers to SSH, fits Docker/Gunicorn, good with Stripe webhooks | More setup than Beanstalk |
| Elastic Beanstalk | Fast first deploy | Managed platform, less IaC | Less control, older mental model |
| App Runner | Simple container apps | Very easy | Limited networking/VPC control for RDS private subnets |
| EC2 + systemd | Legacy / full control | Cheapest at tiny scale | You manage OS, scaling, deploys |
| Lambda | Event-driven APIs | Pay per request | Poor fit for long-lived Django + websockets |

**Recommendation:** Use **ECS Fargate** for the API. Keep **S3** as-is. Add **RDS PostgreSQL** before first production deploy.

---

## 3. Target architecture diagram

```mermaid
flowchart TB
  subgraph users [Users]
    Browser[Browser / Next.js client]
  end

  subgraph aws [AWS eu-west-2]
    Route53[Route 53 api.techstyles.ai]
    ALB[Application Load Balancer HTTPS]
    ECS[ECS Fargate Service Django Gunicorn]
    RDS[(RDS PostgreSQL)]
    S3[(S3 techstyles bucket)]
    SM[Secrets Manager]
    ECR[ECR Docker images]
    CW[CloudWatch Logs]
  end

  subgraph external [External]
    Stripe[Stripe webhooks]
    Xero[Xero OAuth]
    Resend[Resend email]
  end

  Browser --> Route53 --> ALB --> ECS
  ECS --> RDS
  ECS --> S3
  ECS --> SM
  Stripe --> ALB
  ECS --> Xero
  ECS --> Resend
  GitHub[GitHub Actions] --> ECR --> ECS
  ECS --> CW
```

---

## 4. Prerequisites

### Accounts and tools

- AWS account with billing enabled
- [AWS CLI v2](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) configured (`aws configure`)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (build images locally)
- GitHub repo access (for Actions)
- Domain in Route 53 (or DNS provider) for `api.yourdomain.com`

### Local verification

From `server/`:

```bash
python -m venv .venv
# Windows PowerShell:
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
pip install gunicorn psycopg2-binary
python manage.py check
python manage.py migrate
```

---

## 5. Pre-deployment code changes

Do these **before** the first production deploy.

### 5.1 Add production dependencies

Add to `server/requirements.txt`:

```text
gunicorn>=22.0.0
psycopg2-binary>=2.9.9
```

### 5.2 PostgreSQL via environment variables

Update `server/techstyles/settings.py` so production uses Postgres when `DATABASE_URL` is set (keep SQLite for local dev):

```python
import dj_database_url  # add: pip install dj-database-url

DATABASES = {
    'default': dj_database_url.config(
        default=f'sqlite:///{BASE_DIR / "db.sqlite3"}',
        conn_max_age=600,
        ssl_require=not DEBUG,
    )
}
```

Or without extra package:

```python
if os.getenv('DATABASE_URL'):
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.getenv('DB_NAME'),
            'USER': os.getenv('DB_USER'),
            'PASSWORD': os.getenv('DB_PASSWORD'),
            'HOST': os.getenv('DB_HOST'),
            'PORT': os.getenv('DB_PORT', '5432'),
            'OPTIONS': {'sslmode': 'require'} if not DEBUG else {},
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
```

### 5.3 Security hardening (required)

| Item | Production value |
|------|------------------|
| `DEBUG` | `False` |
| `SECRET_KEY` | Long random string in Secrets Manager only |
| `ALLOWED_HOSTS` | `api.techstyles.ai,.elb.amazonaws.com` |
| `CORS_ALLOWED_ORIGINS` | `https://app.techstyles.ai` (your real frontend URL) |
| AWS keys | **IAM task role** for S3 — do not ship access keys in the image |
| OAuth redirect URIs | Update Xero/Gmail to `https://api.techstyles.ai/...` |

Remove hardcoded fallback secrets from `settings.py` before going live.

### 5.4 Health check endpoint

Add a lightweight view for ALB (e.g. `GET /health/` returning `200` and `{"status":"ok"}`). Register it in `urls.py` with no auth.

---

## 6. AWS infrastructure (one-time setup)

Replace `YOUR_ACCOUNT_ID`, `techstyles-prod`, and domain names with your values.

### 6.1 VPC and networking

Use the **default VPC** for a first deploy, or create:

- VPC `10.0.0.0/16`
- 2 public subnets (ALB) + 2 private subnets (ECS, RDS) across `eu-west-2a` / `eu-west-2b`
- NAT Gateway (if ECS tasks are in **private** subnets without public IPs)
- Security groups:
  - **ALB SG:** inbound `443` from `0.0.0.0/0`
  - **ECS SG:** inbound `8000` from ALB SG only
  - **RDS SG:** inbound `5432` from ECS SG only

### 6.2 RDS PostgreSQL

Console: **RDS → Create database**

| Setting | Value |
|---------|--------|
| Engine | PostgreSQL 16 |
| Template | Production (or Dev/Test for staging) |
| DB identifier | `techstyles-prod` |
| Instance | `db.t4g.micro` (staging) / `db.t4g.small`+ (prod) |
| Storage | 20 GB gp3, autoscaling on |
| VPC | Same as ECS |
| Public access | **No** |
| Credentials | Master user `techstyles_admin` — store password in Secrets Manager |

Note the endpoint: `techstyles-prod.xxxx.eu-west-2.rds.amazonaws.com`.

### 6.3 S3 (likely exists)

Confirm bucket `techstyles` in `eu-west-2`. For ECS, prefer an **IAM task role** with policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject", "s3:ListBucket"],
      "Resource": [
        "arn:aws:s3:::techstyles",
        "arn:aws:s3:::techstyles/*"
      ]
    }
  ]
}
```

### 6.4 ECR repository

```bash
aws ecr create-repository \
  --repository-name techstyles-api \
  --region eu-west-2 \
  --image-scanning-configuration scanOnPush=true
```

### 6.5 ACM certificate (HTTPS)

Request certificate in **eu-west-2** for `api.techstyles.ai` (DNS validation in Route 53).

> ALB certificates must be in the **same region** as the load balancer.

### 6.6 Application Load Balancer

1. Create ALB (internet-facing) in public subnets.
2. Listener **HTTPS:443** → target group (see below).
3. Optional: HTTP:80 → redirect to HTTPS.

**Target group:**

| Setting | Value |
|---------|--------|
| Target type | IP (for Fargate `awsvpc`) |
| Port | 8000 |
| Protocol | HTTP |
| Health check path | `/health/` |
| Healthy threshold | 2 |

### 6.7 ECS cluster

```bash
aws ecs create-cluster \
  --cluster-name techstyles-prod \
  --region eu-west-2
```

---

## 7. Container image (Docker)

Create `server/Dockerfile`:

```dockerfile
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn psycopg2-binary

COPY . .

RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

CMD ["gunicorn", "techstyles.wsgi:application", \
     "--bind", "0.0.0.0:8000", \
     "--workers", "3", \
     "--threads", "2", \
     "--timeout", "120", \
     "--access-logfile", "-", \
     "--error-logfile", "-"]
```

Create `server/.dockerignore`:

```gitignore
.venv
__pycache__
*.pyc
db.sqlite3
.env
.git
*.md
```

**Local test:**

```bash
cd server
docker build -t techstyles-api:local .
docker run --rm -p 8000:8000 --env-file .env techstyles-api:local
```

**Push to ECR:**

```bash
aws ecr get-login-password --region eu-west-2 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.eu-west-2.amazonaws.com

docker tag techstyles-api:local YOUR_ACCOUNT_ID.dkr.ecr.eu-west-2.amazonaws.com/techstyles-api:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.eu-west-2.amazonaws.com/techstyles-api:latest
```

---

## 8. ECS Fargate service

### 8.1 Task execution role

Attach AWS managed policy `AmazonECSTaskExecutionRolePolicy` plus permission to read Secrets Manager secrets used in the task definition.

### 8.2 Task role

Attach the S3 policy from [§6.3](#63-s3-likely-exists).

### 8.3 Task definition (outline)

Register a Fargate task (`awsvpc`, 0.5 vCPU / 1 GB RAM to start):

| Container | Value |
|-----------|--------|
| Image | `YOUR_ACCOUNT_ID.dkr.ecr.eu-west-2.amazonaws.com/techstyles-api:latest` |
| Port | 8000 |
| Logging | `awslogs` → `/ecs/techstyles-api` |
| Secrets | From Secrets Manager (see below) |
| Environment | Non-secret vars: `AWS_STORAGE_BUCKET_NAME`, `AWS_S3_REGION_NAME`, `DEBUG=False` |

**Do not** pass `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` if using task role; boto3 picks up credentials automatically.

### 8.4 Service

- Launch type: **FARGATE**
- Desired count: **2** (minimum for HA behind ALB)
- Subnets: private (recommended) or public with `assignPublicIp=ENABLED` for simplicity in staging
- Load balancer: attach to ALB target group
- Deployment: rolling update, circuit breaker enabled

### 8.5 One-off migration task

Run migrations without SSH:

```bash
aws ecs run-task \
  --cluster techstyles-prod \
  --task-definition techstyles-api-migrate \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
  --overrides '{"containerOverrides":[{"name":"api","command":["python","manage.py","migrate","--noinput"]}]}'
```

Create a task definition variant (same image) used only for `migrate` and `collectstatic`.

---

## 9. Secrets and environment variables

Store in **AWS Secrets Manager** as JSON `techstyles/prod/api`:

```json
{
  "SECRET_KEY": "...",
  "DATABASE_URL": "postgres://user:pass@host:5432/techstyles",
  "STRIPE_SECRET_KEY": "sk_live_...",
  "STRIPE_WEBHOOK_SECRET": "whsec_...",
  "STRIPE_PUBLISHABLE_KEY": "pk_live_...",
  "STRIPE_PRICE_STARTER": "price_...",
  "STRIPE_PRICE_PROFESSIONAL": "price_...",
  "STRIPE_PRICE_ENTERPRISE": "price_...",
  "RESEND_API_KEY": "re_...",
  "XERO_CLIENT_ID": "...",
  "XERO_CLIENT_SECRET": "...",
  "XERO_REDIRECT_URI": "https://api.techstyles.ai/xero/xero/callback/",
  "GMAIL_CLIENT_ID": "...",
  "GMAIL_CLIENT_SECRET": "...",
  "GMAIL_REDIRECT_URI": "https://api.techstyles.ai/gmail/callback",
  "OPENAI_API_KEY": "...",
  "FRONTEND_URL": "https://app.techstyles.ai",
  "CLIENT_PORTAL_URL": "https://clients.techstyles.ai",
  "CONTRACTOR_PORTAL_URL": "https://contractors.techstyles.ai"
}
```

Reference in ECS task definition `secrets` block (each key → `valueFrom` ARN).

**Plain environment variables** (non-secret):

```env
DEBUG=False
ALLOWED_HOSTS=api.techstyles.ai
CORS_ALLOWED_ORIGINS=https://app.techstyles.ai
AWS_STORAGE_BUCKET_NAME=techstyles
AWS_S3_REGION_NAME=eu-west-2
STRIPE_TRIAL_DAYS=14
```

---

## 10. Database migrations and static files

### Order on each release

1. Build and push new image to ECR.
2. Run **migration task** (`manage.py migrate --noinput`).
3. Run **collectstatic** (if not baked into image):  
   `python manage.py collectstatic --noinput`  
   (With S3 backends, this uploads to `s3://techstyles/static/`.)
4. Update ECS service to new task definition revision.
5. Wait for ALB health checks to pass.

### Stripe

- Dashboard → Webhooks → endpoint: `https://api.techstyles.ai/api/billing/webhook/` (confirm path in your `billing` URLs).
- Use **live** signing secret in Secrets Manager for production.

---

## 11. CI/CD pipeline (GitHub Actions)

Recommended flow: **push to `main`** → test → build Docker → push ECR → deploy ECS.

Create `.github/workflows/deploy-api.yml`:

```yaml
name: Deploy API to AWS

on:
  push:
    branches: [main]
    paths:
      - 'server/**'
      - '.github/workflows/deploy-api.yml'
  workflow_dispatch:

env:
  AWS_REGION: eu-west-2
  ECR_REPOSITORY: techstyles-api
  ECS_CLUSTER: techstyles-prod
  ECS_SERVICE: techstyles-api
  ECS_TASK_DEFINITION: techstyles-api
  CONTAINER_NAME: api

permissions:
  id-token: write
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: server

    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::YOUR_ACCOUNT_ID:role/github-actions-deploy
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build, tag, and push image
        id: build-image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          echo "image=$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG" >> $GITHUB_OUTPUT

      - name: Download task definition
        run: |
          aws ecs describe-task-definition --task-definition $ECS_TASK_DEFINITION \
            --query taskDefinition > task-definition.json

      - name: Render Amazon ECS task definition
        id: render
        uses: aws-actions/amazon-ecs-render-task-definition@v1
        with:
          task-definition: server/task-definition.json
          container-name: ${{ env.CONTAINER_NAME }}
          image: ${{ steps.build-image.outputs.image }}

      - name: Run database migrations
        run: |
          aws ecs run-task \
            --cluster $ECS_CLUSTER \
            --task-definition techstyles-api-migrate \
            --launch-type FARGATE \
            --network-configuration "awsvpcConfiguration={subnets=[${{ secrets.ECS_SUBNET }}],securityGroups=[${{ secrets.ECS_SECURITY_GROUP }}],assignPublicIp=ENABLED}"

      - name: Deploy to Amazon ECS
        uses: aws-actions/amazon-ecs-deploy-task-definition@v2
        with:
          task-definition: ${{ steps.render.outputs.task-definition }}
          service: ${{ env.ECS_SERVICE }}
          cluster: ${{ env.ECS_CLUSTER }}
          wait-for-service-stability: true
```

### GitHub → AWS authentication (OIDC)

1. IAM OIDC provider for `token.actions.githubusercontent.com`.
2. IAM role `github-actions-deploy` with trust policy limited to your repo `baselinq/Studio` (or your org/repo).
3. Policies: `AmazonECSTaskExecutionRolePolicy` scoped ECR push, `ecs:UpdateService`, `ecs:RunTask`, `iam:PassRole`.

Store `ECS_SUBNET` and `ECS_SECURITY_GROUP` as GitHub repository secrets.

### Branch strategy

| Branch | Environment | ECS cluster / service |
|--------|-------------|------------------------|
| `main` | Production | `techstyles-prod` |
| `develop` | Staging | `techstyles-staging` (smaller RDS + 1 task) |

---

## 12. Alternative: AWS CodePipeline

If you prefer everything inside AWS:

1. **CodeStar / CodeConnections** — link GitHub.
2. **CodePipeline** stages:
   - **Source:** GitHub `main`, path filter `server/**`
   - **Build:** CodeBuild project using `server/buildspec.yml`
   - **Deploy:** ECS blue/green via CodeDeploy (optional) or direct ECS deploy action

`server/buildspec.yml`:

```yaml
version: 0.2
phases:
  pre_build:
    commands:
      - echo Logging in to Amazon ECR...
      - aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com
  build:
    commands:
      - cd server
      - docker build -t $IMAGE_REPO_NAME:$IMAGE_TAG .
      - docker tag $IMAGE_REPO_NAME:$IMAGE_TAG $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/$IMAGE_REPO_NAME:$IMAGE_TAG
  post_build:
    commands:
      - docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/$IMAGE_REPO_NAME:$IMAGE_TAG
      - printf '[{"name":"api","imageUri":"%s"}]' $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/$IMAGE_REPO_NAME:$IMAGE_TAG > imagedefinitions.json
artifacts:
  files:
    - imagedefinitions.json
```

CodePipeline and GitHub Actions achieve the same outcome; **GitHub Actions is usually simpler** if the repo is already on GitHub.

---

## 13. DNS, HTTPS, and Stripe webhooks

1. **Route 53** — A/AAAA alias record: `api.techstyles.ai` → ALB DNS name.
2. **ACM** — certificate attached to HTTPS listener.
3. **Frontend** — set `NEXT_PUBLIC_API_URL=https://api.techstyles.ai` in Vercel/Amplify env.
4. **CORS** — `CORS_ALLOWED_ORIGINS` must include the exact frontend origin (no trailing slash).
5. **Stripe** — live webhook URL on production ALB; test with Stripe CLI against staging first:

```bash
stripe listen --forward-to https://api-staging.techstyles.ai/api/billing/webhook/
```

---

## 14. Operations runbook

### View logs

```bash
aws logs tail /ecs/techstyles-api --follow --region eu-west-2
```

### Roll back

1. ECS → Service → **Deployments** → roll back to previous task definition revision, or  
2. Re-run GitHub Actions on a known-good commit.

### Scale

- ECS service → update **desired count** (e.g. 2 → 4).
- RDS → increase instance class during maintenance window.

### Backups

- RDS automated backups (7–35 days).
- Optional: snapshot before major migrations.

### Monitoring alarms (CloudWatch)

- ALB `HTTPCode_Target_5XX_Count` > threshold
- ECS CPU/Memory > 80%
- RDS `FreeableMemory` / `CPUUtilization`
- Target group **UnHealthyHostCount** > 0

---

## 15. Cost ballpark

Approximate monthly (eu-west-2, light production):

| Service | Estimate |
|---------|----------|
| ECS Fargate (2 × 0.5 vCPU, 1 GB) | ~$35–50 |
| ALB | ~$20–25 |
| RDS `db.t4g.small` | ~$25–40 |
| NAT Gateway (if used) | ~$35+ |
| S3 + data transfer | varies |
| Secrets Manager | ~$1–2 |
| **Total (without NAT)** | **~$80–120/mo** |

Staging can run one Fargate task + `db.t4g.micro` for roughly half that.

---

## 16. Checklist

### Before first deploy

- [ ] PostgreSQL configured; SQLite not used in prod
- [ ] `DEBUG=False`, strong `SECRET_KEY`, tight `ALLOWED_HOSTS`
- [ ] No secrets in `settings.py` defaults or git
- [ ] `gunicorn` + `psycopg2-binary` in requirements
- [ ] `Dockerfile` and `/health/` endpoint
- [ ] S3 access via IAM task role (not static keys in env)
- [ ] RDS in private subnet; security groups locked down
- [ ] ACM cert + HTTPS on ALB
- [ ] All OAuth redirect URIs updated for production domain
- [ ] Stripe live webhook + secrets in Secrets Manager

### Pipeline

- [ ] ECR repository created
- [ ] ECS cluster, task definition, service linked to ALB
- [ ] GitHub OIDC role or CodePipeline connected
- [ ] Migration task runs before or during deploy
- [ ] CloudWatch alarms configured

### After deploy

- [ ] `curl https://api.techstyles.ai/health/` returns 200
- [ ] Login/JWT flow works from production frontend
- [ ] File upload hits S3
- [ ] Stripe test checkout + webhook delivery OK
- [ ] Xero/Gmail OAuth callbacks succeed

---

## Quick reference: environment variables

See `server/.env.example` plus production additions:

| Variable | Required prod | Notes |
|----------|---------------|--------|
| `SECRET_KEY` | Yes | Secrets Manager |
| `DEBUG` | Yes | `False` |
| `ALLOWED_HOSTS` | Yes | API hostname + ALB DNS |
| `DATABASE_URL` or `DB_*` | Yes | RDS PostgreSQL |
| `CORS_ALLOWED_ORIGINS` | Yes | Frontend HTTPS origin |
| `FRONTEND_URL` | Yes | Stripe redirects, emails |
| `AWS_STORAGE_BUCKET_NAME` | Yes | `techstyles` |
| `AWS_S3_REGION_NAME` | Yes | `eu-west-2` |
| `STRIPE_*` | Yes | Live keys in prod |
| `RESEND_API_KEY` | Recommended | Transactional email |
| `XERO_*` / `GMAIL_*` | If used | Production redirect URIs |
| `OPENAI_API_KEY` | If AI features on | |

---

## Related docs

- App setup: [README.md](../README.md)
- Stripe practices: [.agents/skills/stripe-best-practices/SKILL.md](../.agents/skills/stripe-best-practices/SKILL.md)

For infrastructure-as-code (repeatable environments), consider a follow-up: **Terraform** or **AWS CDK** modules mirroring this guide.
