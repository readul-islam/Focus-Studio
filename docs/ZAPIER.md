# Zapier integration guide (Focuspilot)

Connect Focuspilot Studio to Zapier using **API keys** (Zapier → Focuspilot) and **webhooks** (Focuspilot → Zapier).

There is no official Zapier app listing yet — use **Webhooks by Zapier** and **Webhooks & REST API** (custom request).

---

## Part 1 — Create a Zapier account

1. Go to [https://zapier.com/sign-up](https://zapier.com/sign-up).
2. Sign up with email or Google.
3. Confirm your email if prompted.
4. On the free plan you can build Zaps and test them (limits apply on runs/month).

You do **not** need Zapier’s developer platform or CLI for this integration.

---

## Part 2 — Set up Focuspilot

### 2.1 Log into Focuspilot

- Local: [http://localhost:3000](http://localhost:3000)
- Production: [https://app.focuspilot.io](https://app.focuspilot.io)

You need a user with **Settings → edit** permission (studio admin).

### 2.2 Create an API key

1. **Settings → Studio → API & webhooks**
2. Click **Create API key**
3. Copy the full key immediately (`fp_live_…`) — it is shown only once.

### 2.3 API base URL

| Environment | Base URL |
|-------------|----------|
| Local | `http://localhost:8000` |
| Production | `https://api.focuspilot.io` |

REST prefix for automation:

```text
{BASE_URL}/integrations/v1/
```

Example: `https://api.focuspilot.io/integrations/v1/projects/`

### 2.4 Authentication header

Every API request:

```http
Authorization: Bearer fp_live_YOUR_KEY_HERE
Content-Type: application/json
```

---

## Part 3 — Test A: Zapier receives events from Focuspilot (webhook)

Use this when something happens in Focuspilot (e.g. new project) and Zapier should run.

### Step 1 — Create a Catch Hook in Zapier

1. [https://zapier.com/app/zaps](https://zapier.com/app/zaps) → **Create Zap**
2. **Trigger** → search **Webhooks by Zapier** → **Catch Hook**
3. Click **Continue** → copy the **Custom Webhook URL** (looks like `https://hooks.zapier.com/hooks/catch/...`)

### Step 2 — Add webhook in Focuspilot

1. **Settings → Studio → API & webhooks**
2. Paste the Zapier URL into **Endpoint URL**
3. Click **Add webhook**
4. Click **Copy** next to **Secret** (optional, for verifying signatures later)
5. Click **Test** — Zapier should receive a `ping` event

In Zapier, click **Test trigger** — you should see the test payload.

### Step 3 — Turn on the Zap (optional for test)

Add a simple **Action** (e.g. **Formatter → Text** or **Gmail → Send Email**) so the Zap can be turned **On**.

### Step 4 — Trigger a real event

Today Focuspilot sends **`project.created`** when:

- A project is created in the app, or
- A project is created via the API (`POST /integrations/v1/projects/create/`)

**Test:** Create a new project in Focuspilot → check Zapier **Task history** for the hook run.

### Webhook payload shape

```json
{
  "id": "random-id",
  "type": "project.created",
  "created_at": "2026-05-19T12:00:00+00:00",
  "data": {
    "id": 42,
    "project_name": "My Project"
  }
}
```

Headers:

| Header | Description |
|--------|-------------|
| `X-Focuspilot-Event` | Event type, e.g. `project.created` |
| `X-Focuspilot-Signature` | `sha256=<hmac>` of the raw JSON body using your webhook secret |

**Filter in Zapier:** use `type` equals `project.created` if you only care about new projects.

---

## Part 4 — Test B: Zapier creates a project in Focuspilot (REST API)

Use this when an external trigger (form, CRM, another app) should create a project in Focuspilot.

### Step 1 — Create the Zap

1. **Create Zap**
2. **Trigger** — pick anything for testing, e.g. **Webhooks by Zapier → Catch Hook** (manual test) or **Schedule → Every Day**
3. **Action** → **Webhooks by Zapier** → **POST** (or **Custom Request**)

### Step 2 — Configure POST

| Field | Value |
|-------|--------|
| **URL** | `https://api.focuspilot.io/integrations/v1/projects/create/` (or `http://localhost:8000/integrations/v1/projects/create/` locally) |
| **Payload type** | JSON |
| **Data** | `project_name` = your project title (required) |
| | `project_status` = `AC` (optional, default active) |

**Headers** (add in “Show advanced” or Custom Request):

```http
Authorization: Bearer fp_live_YOUR_KEY_HERE
Content-Type: application/json
```

**Body example (JSON):**

```json
{
  "project_name": "Project from Zapier",
  "project_status": "AC"
}
```

### Step 3 — Test

1. **Test action** in Zapier
2. Open Focuspilot → **Projects** — the new project should appear
3. If you have a webhook configured, Zapier may also receive a second `project.created` event from that create

### List projects (GET)

For a “search” or “pick project” step in Zapier:

| Field | Value |
|-------|--------|
| **Method** | GET |
| **URL** | `{BASE_URL}/integrations/v1/projects/` |
| **Header** | `Authorization: Bearer fp_live_...` |

Response: array of up to 100 recent projects with `id`, `project_name`, `project_status`, `created_at`.

---

## Part 4b — Zapier creates or lists clients (REST API)

### Create client (POST)

| Field | Value |
|-------|--------|
| **URL** | `{BASE_URL}/integrations/v1/clients/create/` |
| **Body** | `name` and/or `company_name` (at least one required) |
| | `email`, `phone`, `surname` (optional) |
| | `contact_type` = `CL` (client), `SP` (supplier), or `CN` (contractor) — default `CL` |

```json
{
  "name": "Alex",
  "company_name": "Alex Interiors",
  "email": "alex@example.com",
  "contact_type": "CL"
}
```

Triggers `client.created` webhook if configured.

### List clients (GET)

| Field | Value |
|-------|--------|
| **URL** | `{BASE_URL}/integrations/v1/clients/` |
| **Query** | `contact_type=CL` (optional filter) |

Response: up to 100 clients with `id`, `name`, `company_name`, `email`, `contact_type`, `created_at`.

---

## Part 5 — Example Zaps

### New Focuspilot project → Slack message

1. Trigger: **Webhooks by Zapier → Catch Hook** (URL saved in Focuspilot webhooks)
2. Filter: `type` = `project.created`
3. Action: **Slack → Send Channel Message** with `data.project_name`

### Typeform response → Focuspilot project

1. Trigger: **Typeform → New Entry**
2. Action: **Webhooks → POST** to `/integrations/v1/projects/create/` with `project_name` from the form field

### Daily backup list → Google Sheets

1. Trigger: **Schedule → Every day**
2. Action: **Webhooks → GET** `/integrations/v1/projects/`
3. Action: **Google Sheets → Create Spreadsheet Row** (map JSON fields)

---

## Part 6 — Troubleshooting

| Problem | Fix |
|---------|-----|
| `401` / Invalid API key | Key revoked or wrong — create a new key; header must be `Bearer fp_live_...` |
| `503` on Notion (unrelated) | Notion uses separate OAuth — see Notion section in README |
| Webhook never fires | Zap must be **On**; webhook **Test** works but real events need `project.created` |
| Zapier test works, real project doesn’t | Confirm webhook URL is still in Focuspilot; check studio is the same account |
| Local Zapier + local API | Use [ngrok](https://ngrok.com) to expose `localhost:8000` or test on production API |
| CORS errors | Zapier calls the **API** directly — CORS does not apply; use API URL, not the Next.js app URL |

### Verify API key with curl

```bash
curl -s -H "Authorization: Bearer fp_live_YOUR_KEY" \
  http://localhost:8000/integrations/v1/projects/
```

### Verify webhook from Focuspilot UI

**Settings → Studio → API & webhooks** → **Test** on your endpoint.

---

## Supported events (webhooks)

| Event | When it fires today |
|-------|---------------------|
| `project.created` | Yes — new project in app or via API |
| `client.created` | Defined; not emitted yet |
| `invoice.created` | Defined; not emitted yet |

Subscribe to `*` (default) to receive all events as they are added.

---

## Production checklist

- [ ] API key created in production studio (not local)
- [ ] Zap uses `https://api.focuspilot.io/integrations/v1/...`
- [ ] Webhook URL points to Zapier **Catch Hook** (HTTPS)
- [ ] Zap is **On** after testing
- [ ] Store `fp_live_` keys only in Zapier’s secure fields, never in public Zaps

---

## Related

- **Notion:** [README — Notion OAuth](../README.md) (Settings → Integrations → Notion)
- **In-app:** Settings → Studio → **Integrations** | **API & webhooks**
