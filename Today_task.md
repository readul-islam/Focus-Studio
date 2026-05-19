# Today — staff engineer backlog

**Workflow:** Build **one task** → test → mark done → ask what's next.

---

## Today's order (integrations first)

| # | Task | Est. | Status |
|---|------|------|--------|
| **1** | Emit `client.created` + `invoice.created` webhooks | 1h | ✅ Done |
| **2** | Landing: Zapier (+ Notion) → Available on focuspilot.io/integrations | 30m | ✅ Done |
| **3** | Zapier API: `GET/POST /integrations/v1/clients/` | 2h | ✅ Done |
| **4** | Webhook UI: pick event types per endpoint | 1h | ✅ Done |
| **5** | Notion **Light**: Browse databases in Settings | 2h | ✅ Done |

**Defer:** Official Zapier marketplace app · Notion two-way sync · Contractor V2 · Help Centre · Stripe

### Notion Medium — project sync ✅

| Step | Action |
|------|--------|
| 1 | Integrations → **Set up project sync** (or Browse → **Sync** on Tasks Tracker) |
| 2 | Pick database, **Task name** as title, **Status** optional → **Save** |
| 3 | **Sync projects now** → check **Projects** in app |
| 4 | Edit a row in Notion → sync again → project name/status updates |

---

## Task 5 — Test guide (Notion databases)

1. **Settings → Studio → Integrations** → Notion must show **Connected**
2. Click **Browse databases**
3. Search for a database name you shared in Notion
4. **Copy** database ID or **Open in Notion** (external link)
5. If empty: in Notion → database → **•••** → **Connect to** → **Focuspilot**

---

## Task 4 — Test guide (webhook event types)

1. **Settings → Studio → API & webhooks**
2. When adding a webhook, uncheck **All events** → select only **New client**
3. **Add webhook** → create a **project** → Zap should **not** run
4. Create a **client** → Zap **should** run
5. Click **Events** on an existing webhook → change selection → **Save**

---

## Task 3 — Test guide (clients API)

**Prereq:** API key (`fp_live_…`) from Settings → API & webhooks.

### curl

```bash
# List
curl -s -H "Authorization: Bearer fp_live_YOUR_KEY" http://localhost:8000/integrations/v1/clients/

# Create
curl -s -X POST -H "Authorization: Bearer fp_live_YOUR_KEY" -H "Content-Type: application/json" \
  -d "{\"name\":\"Zap Test\",\"company_name\":\"Zap Co\",\"email\":\"zap@test.com\"}" \
  http://localhost:8000/integrations/v1/clients/create/
```

### Zapier

1. Action → **Webhooks by Zapier → POST**
2. URL: `https://api.focuspilot.io/integrations/v1/clients/create/`
3. JSON body with `name`, `company_name`, `email`
4. Header: `Authorization: Bearer fp_live_...`
5. Check **CRM → Contacts** in Focuspilot; Zap may also get `client.created` webhook

---

## Task 2 — Test guide (landing integrations)

1. Local: `cd landing && pnpm dev` → open http://localhost:3005/integrations (or your marketing port)
2. Confirm **Zapier** and **Notion** appear under **Available integrations** with green **Available** badge
3. Confirm **Coming soon** no longer lists Zapier (Slack, Sage, FreeAgent still there)
4. Production: deploy landing → https://focuspilot.io/integrations

---

## Task 1 — Test guide (`client.created` / `invoice.created`)

**Prereq:** Zap On with **Webhooks → Catch Hook** URL saved in Focuspilot → API & webhooks.

### A — New client

1. Focuspilot → **CRM → Contacts** → add a new **Client**
2. Zapier → Zap **Task history** → new run, `type` = `client.created`
3. Payload includes `data.id`, `data.company_name`, `data.email`

### B — New invoice

1. Focuspilot → **Finance** → create an **Invoice** (or procurement → create invoice)
2. Zapier → new run, `type` = `invoice.created`
3. Payload includes `data.id`, `data.total_amount`, `data.project_id`

### Filter in Zapier (optional)

- Only clients: Filter `type` Exactly matches `client.created`
- Only invoices: `invoice.created`

---

## Notion (pick later)

- **Light:** Browse Notion databases (list only)
- **Medium:** Map database → auto-create/update projects
- **Heavy:** Two-way sync

## Broader product (later)

Contractor Portal V2 · Help Centre · Reports · Stripe · QuickBooks fix · AI proposals
