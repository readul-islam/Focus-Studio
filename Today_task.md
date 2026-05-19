# Today — staff engineer backlog

**Workflow:** Build **one task** → test → mark done → ask what's next.

---

## Today's order (integrations first)

| # | Task | Est. | Status |
|---|------|------|--------|
| **1** | Emit `client.created` + `invoice.created` webhooks | 1h | ✅ Done |
| **2** | Landing: Zapier (+ Notion) → Available on focuspilot.io/integrations | 30m | ☐ |
| **3** | Zapier API: `GET/POST /integrations/v1/clients/` | 2h | ☐ |
| **4** | Webhook UI: pick event types per endpoint | 1h | ☐ |
| **5** | Notion **Light**: Browse databases in Settings | 2h | ☐ |

**Defer (not today):** Official Zapier marketplace app · Notion Medium/Heavy sync · Contractor V2 · Help Centre · Stripe

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
