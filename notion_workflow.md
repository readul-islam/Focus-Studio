# Notion workflow — Focuspilot (পুরো প্রক্রিয়া)

এই ডকুমেন্টে **শুরু থেকে শেষ** Notion ইন্টিগ্রেশন বর্ণনা করা হয়েছে: Focuspilot থেকে Notion-এ প্রজেক্ট ও টাস্ক পাঠানো (**Outbound**), এবং Notion থেকে প্রজেক্ট আনা (**Inbound**) — দুটোই একসাথে চলে।

![Notion task database example — Task Name, Status, dates, Priority, Team](image.png)

*উদাহরণ: প্রতিটি Focuspilot টাস্ক Notion টেবিলে এক row — Task Name, description, Status, তারিখ, Priority, Assignee, Team ইত্যাদি*

---

## সংক্ষিপ্ত সারাংশ

| দিক | কী হয় |
|-----|--------|
| **Outbound (নতুন)** | FP-তে **প্রজেক্ট** তৈরি → Notion-এ **প্রজেক্ট পেজ** · প্রথম **টাস্ক** → সেই পেজে **Tasks ডাটাবেস** · আরও টাস্ক → নতুন **row** |
| **Inbound (আগে থেকে)** | একটি শেয়ার্ড Notion DB ম্যাপ → **Sync projects now** → row গুলো FP **Project** হয় |
| **একসাথে** | Inbound দিয়ে আসা প্রজেক্টে **আলাদা Notion পেজ বানানো হয় না** — বিদ্যমান row-ই প্রজেক্ট পেজ হিসেবে ব্যবহার |

---

## পূর্বশর্ত

1. [Notion Developers](https://www.notion.so/my-integrations) → Integration তৈরি → Redirect: `http://localhost:8000/notion/callback/`
2. `server/.env`: `NOTION_CLIENT_ID`, `NOTION_CLIENT_SECRET`, `NOTION_REDIRECT_URI`
3. Focuspilot: **Settings → Studio → Integrations → Connect Notion**
4. (ঐচ্ছিক) **Parent page for new projects** — Notion পেজ URL/ID যেখানে নতুন FP প্রজেক্টের চাইল্ড পেজ তৈরি হবে। খালি রাখলে অটো **「Focuspilot Projects」** হাব পেজ তৈরি/খোঁজা হয়।
5. Inbound-এর জন্য: Notion DB → **••• → Connect to → Focuspilot**

---

## Outbound ওয়ার্কফ্লো (Focuspilot → Notion)

```
Connect Notion (OAuth)
        │
        ▼
[ঐচ্ছিক] Parent page সেভ (Integrations settings)
        │
        ▼
Focuspilot-এ নতুন Project তৈরি
        │
        ├──► Notion: child page (প্রজেক্টের নাম)
        └──► DB: NotionProjectSync
        │
        ▼
সেই Project-এ প্রথম Task তৈরি
        │
        ├──► Notion: «Project — Tasks» database (কলাম: screenshot অনুযায়ী)
        └──► প্রথম row = টাস্ক
        │
        ▼
আরও Task → একই database-এ নতুন row
        │
        ▼
Task এডিট/আপডেট → Notion row আপডেট
Task ডিলিট → Notion row archive
```

### ধাপ ১ — প্রজেক্ট তৈরি

1. Focuspilot → **Projects** → নতুন প্রজেক্ট (বা wizard)
2. স্টুডিওতে Notion কানেক্ট থাকলে ব্যাকগ্রাউন্ডে:
   - `POST /v1/pages` — parent page-এর নিচে প্রজেক্ট পেজ
   - `NotionProjectSync` রেকর্ড সেভ
3. Notion-এ খুলে দেখুন: parent এর নিচে নতুন পেজ

**API (ডিবাগ):** `GET /notion/project-sync/?project_id={id}` → `notion_project_url`

### ধাপ ২ — প্রথম টাস্ক

1. প্রজেক্টে বা **Home → Tasks** থেকে **Add Task** → প্রজেক্ট সিলেক্ট
2. Phase, Status, তারিখ, Priority ইত্যাদি পূরণ → Save
3. Notion-এ:
   - প্রজেক্ট পেজের ভিতর **Tasks** ডাটাবেস তৈরি (প্রথমবার)
   - একটি row — ফিল্ড ম্যাপিং:

| Notion column | Focuspilot Task |
|---------------|-----------------|
| Task Name | `title` |
| description | `description` |
| Status | `status` (To-do → Not started, In progress, Done) |
| Start date / Due date | `start_date` / `end_date` |
| Priority | Low / Medium / High |
| Assignee | assignee নাম (rich text, MVP) |
| Team | Phase নাম (যদি থাকে) |

### ধাপ ৩ — আরও টাস্ক

একই প্রজেক্টে দ্বিতীয়, তৃতীয় টাস্ক → একই Notion database-এ নতুন row। আলাদা database বানানো হয় না।

### ধাপ ৪ — টাস্ক আপডেট

Task modal থেকে এডিট → Save → Notion row **PATCH** হয়।

---

## Inbound ওয়ার্কফ্লো (Notion → Focuspilot)

*(আগের মতো — পরিবর্তন নেই)*

1. Integrations → **Set up project sync** / **Browse databases**
2. Database + Name column + Status (optional) → Save
3. **Sync projects now**
4. Notion row → Focuspilot **Project** + `NotionProjectLink` + `NotionProjectSync` (একই page id — duplicate পেজ নয়)

বিস্তারিত: [testing.md](testing.md) — Phase 2।

---

## দুটো ফ্লো একসাথে কীভাবে মিলে

| উৎস | Notion-এ কী | Focuspilot-এ কী |
|------|------------|-----------------|
| FP-তে নতুন Project | নতুন child page | Project + phases (default seed) |
| Notion inbound row | বিদ্যমান row = project page | Project + link |
| FP-তে Task (লিংক থাকা project) | Tasks DB + rows | Task |

---

## সেটিংস UI

**Settings → Studio → Integrations → Notion → Settings (গিয়ার)**

- **Parent page** — নতুন প্রজেক্টের জায়গা
- **Browse databases** — Inbound
- **Set up project sync** / **Sync projects now** — Inbound

---

## সীমাবদ্ধতা (MVP)

- **Assignee** — Notion `people` নয়; নাম rich text হিসেবে
- **Attachments** — Notion-এ ফাইল আপলোড এখনো নয়
- **Subtasks** — Notion row-এ নয়
- Notion API ব্যর্থ হলে FP সেভ **ব্লক হয় না** — লগে warning

---

## লোকাল টেস্ট চেকলিস্ট (Outbound)

- [ ] Notion Connected
- [ ] Parent page সেভ (ঐচ্ছিক)
- [ ] নতুন FP Project → Notion-এ নতুন পেজ
- [ ] `GET notion/project-sync/?project_id=` → `synced: true`, URL
- [ ] প্রথম Task → Notion-এ Tasks table + ১ row
- [ ] দ্বিতীয় Task → ২য় row
- [ ] Task এডিট → Notion row আপডেট
- [ ] Inbound sync → duplicate পেজ নয়, `NotionProjectSync` একই page id

---

## API রেফারেন্স

| Method | URL | কাজ |
|--------|-----|-----|
| GET/PUT | `/notion/settings/` | Parent page id |
| GET | `/notion/project-sync/?project_id=` | প্রজেক্টের Notion URL |
| GET | `/notion/status/` | connected, mapping, parent_page_id |
| POST | `/notion/mapping/sync/` | Inbound project import |

*সর্বশেষ আপডেট: Outbound project + task sync*
