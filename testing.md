# Focuspilot — টেস্টিং গাইড

এই ডকুমেন্টে Phase 1 থেকে শুরু করে ধাপে ধাপে লোকালি কীভাবে টেস্ট করবেন, তা বাংলায় লেখা আছে।

---

## Phase 1: Inbox (AI Inbox)

### এই ফিচার কী করে?

**Inbox** হলো স্টুডিওর ইমেইল এক জায়গায় দেখার জায়গা। Gmail OAuth দিয়ে কানেক্ট করলে:

1. আপনার Gmail থেকে ইমেইল **সার্ভারে সিঙ্ক** হয় (স্টুডিও অনুযায়ী সেভ হয়)
2. বাম পাশে **থ্রেড লিস্ট** (বিষয়, প্রেরক, সময়)
3. ডান পাশে **পুরো কনভারসেশন** ও **রিপ্লাই**
4. AI Inbox (`/ai/inbox`) এ ক্যাটাগরি, সামারি, সাজেস্টেড অ্যাকশন ইত্যাদি থাকতে পারে
5. ইমেইল **প্রজেক্টের সাথে লিংক** করা যায়

**গুরুত্বপূর্ণ:** Gmail কানেকশন **ব্যবহারকারী প্রতি** (প্রতি অ্যাকাউন্ট), স্টুডিও প্রতি নয়।  
অর্থাৎ **Readul** নিজের Gmail কানেক্ট করলে তার ইনবক্সে মূলত **যে মেইলে তার ইমেইল sender/recipient** সেগুলো দেখা যায়।  
**Akash** আলাদা ইউজার — তার নিজের Gmail কানেক্ট না করলে Inbox খালি বা এরর দেখাবে; একই স্টুডিওতে থাকলেও Readul-এর সব মেইল Akash দেখবে না (শুধু যেখানে Akash-এর ইমেইল জড়িত)।

---

### টেস্ট ইউজার

| ভূমিকা | নাম (উদাহরণ) | কী টেস্ট করবেন |
|--------|----------------|-----------------|
| **Studio Owner (Admin)** | Readul | Gmail কানেক্ট, ইনবক্স দেখা, রিপ্লাই, প্রজেক্টে লিংক, ইন্টিগ্রেশন সেটিংস |
| **টিম মেম্বার** | Akash | লগইন, নিজের Gmail কানেক্ট (আলাদা), নিজের ইনবক্স; Owner-এর মেইল শেয়ার নয় |

> প্রোডাকশন/লোকাল ডাটাবেসে ইমেইল ঠিকমতো মিলিয়ে নিন (যেমন `readul@...`, `akash@...`)।

---

### লোকালি চালানোর আগে (প্রয়োজনীয়)

#### ১. সার্ভার (Backend)

```powershell
cd server
.\.venv\Scripts\Activate.ps1
python manage.py migrate
python manage.py runserver
```

- API: **http://localhost:8000**
- টার্মিনালে `GET /user/self/` ইত্যাদি **200** দেখলে ঠিক আছে

#### ২. ক্লায়েন্ট (Frontend)

```powershell
cd client
pnpm install
pnpm dev
```

- অ্যাপ: **http://localhost:3000**

#### ৩. `.env` (সার্ভার — `server/.env`)

Gmail/Inbox এর জন্য অন্তত এগুলো চাই:

```env
FRONTEND_URL=http://localhost:3000
GMAIL_CLIENT_ID=আপনার-google-client-id
GMAIL_CLIENT_SECRET=আপনার-google-secret
GMAIL_REDIRECT_URI=http://localhost:8000/gmail/callback/
GMAIL_SCOPES=https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/calendar
```

#### ৪. Google Cloud Console (Gmail OAuth)

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → OAuth 2.0 Client
2. **Authorized redirect URI:** `http://localhost:8000/gmail/callback/`
3. Gmail API + Calendar API চালু
4. টেস্ট মোডে থাকলে **Test users** তালিকায় Readul ও Akash-এর Gmail ঠিকানা যোগ করুন
5. `403 access blocked` এলে → OAuth consent screen → Test users

#### ৫. ক্লায়েন্ট `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

### অ্যাকাউন্ট ও স্টুডিও সেটআপ

1. **Readul** দিয়ে রেজিস্টার / লগইন → **Onboarding** শেষ করে **Studio** তৈরি
2. প্ল্যান সিলেক্ট (Beta / Professional) — Phase 1 Inbox এর জন্য Beta যথেষ্ট
3. **Settings → Studio → Team** থেকে **Akash** কে ইনভাইট (ইমেইল দিয়ে)
4. **Akash** ইনভাইট লিংক দিয়ে জয়েন → একই স্টুডিওতে থাকবে

---

## Owner (Readul) — Inbox টেস্ট ধাপ

### ধাপ ১: Gmail কানেক্ট

1. লগইন: http://localhost:3000/login  
2. যান: **Settings → Studio → Integrations**  
   অথবা সরাসরি: http://localhost:3000/settings/studio/integrations  
3. **Gmail** কার্ডে **Connect with Gmail** → Google পপআপ → অনুমতি দিন  
4. সফল হলে কার্ডে সবুজ **Connected** ব্যাজ দেখা উচিত (রিলোড ছাড়াই)  
5. একই পেজে **Google Calendar** আলাদা কানেক্ট (ইচ্ছা করলে)

**বিকল্প:** Inbox-এ গিয়েও কানেক্ট ব্যানার থেকে **Connect** বাটন আছে।

### ধাপ ২: Inbox খোলা

সাইডবার: **Inbox** → URL:

- **প্রধান (AI Inbox):** http://localhost:3000/ai/inbox  
- **হোম ইনবক্স (সাধারণ ভিউ):** http://localhost:3000/home/inbox  

Phase 1 এ **`/ai/inbox`** দিয়ে টেস্ট করুন (সাইডবার যেটা খোলে)।

### ধাপ ৩: মেইল সিঙ্ক

পেজ লোড হলে ব্যাকগ্রাউন্ডে `POST /gmail/fetch/` চলে — Gmail থেকে নতুন মেইল টেনে আনে।

- বাম প্যানেলে **Recent / thread list** আসা উচিত  
- লোডিং স্পিনার, তারপর প্রেরক, বিষয়, স্নিপেট  
- কিছু না এলে: Gmail-এ সত্যিই ইনবক্সে মেইল আছে কিনা দেখুন; আবার পেজ রিফ্রেশ বা Integrations থেকে আবার কানেক্ট

**Network ট্যাব (ব্রাউজার F12):**

| রিকোয়েস্ট | প্রত্যাশিত |
|------------|-------------|
| `GET user/integration-status/` | `gmail_connected: true` |
| `POST gmail/fetch/` | `fetched` ≥ 0 (নতুন মেইল থাকলে) |
| `GET gmail/threads/` | থ্রেড অ্যারে (খালি বা ডেটা) |

### ধাপ ৪: থ্রেড খোলা ও রিপ্লাই

1. বাম থেকে একটি **থ্রেড** ক্লিক করুন  
2. ডানে মেসেজ থ্রেড দেখা যাবে  
3. **Reply** লিখে পাঠান → `POST gmail/send/` সফল হলে থ্রেডে আপনার মেসেজ যোগ হবে

### ধাপ ৫: প্রজেক্টে লিংক (যদি UI থাকে)

1. থ্রেড সিলেক্ট করে **Add to project** / ফোল্ডার আইকন  
2. প্রজেক্ট বেছে নিন → `POST gmail/threads/link/`  
3. সফল টোস্ট: ইমেইল প্রজেক্টের সাথে যুক্ত

### ধাপ ৬: Owner হিসেবে কী দেখবেন

- শুধু **Readul-এর Gmail অ্যাকাউন্ট** দিয়ে সিঙ্ক হওয়া থ্রেড  
- ফিল্টার যেখানে আছে: All, Emails, Mentions ইত্যাদি (`/ai/inbox`)  
- Integrations-এ Gmail **Connected** থাকা অবস্থায় Inbox কাজ করা

---

## টিম মেম্বার (Akash) — টেস্ট ধাপ

### ধাপ ১: লগইন

1. Akash অ্যাকাউন্টে লগইন (ইনভাইট গ্রহণের পর)  
2. একই স্টুডিও সিলেক্ট/অ্যাক্সেস আছে কিনি নিশ্চিত করুন

### ধাপ ২: Gmail (আলাদা)

1. **Settings → Integrations** → নিজের Gmail কানেক্ট  
2. Readul কানেক্ট করেছে — এটা Akash-এর জায়গায় **অটো কাজ করে না**

### ধাপ ৩: Inbox

1. **Inbox** (`/ai/inbox`) খুলুন  
2. **Akash-এর ইমেইল** যেসব থ্রেডে আছে শুধু সেগুলো (বা নিজের সিঙ্ক করা মেইল)  
3. Gmail কানেক্ট না করলে: *Connect your Gmail* ব্যানার বা API এরর `User has no gmail connected`

### ধাপ ৪: পারমিশন (যদি সীমা থাকে)

- কিছু সেটিংস শুধু **admin / settings.edit** — Akash-এ রোল অনুযায়ী Integrations পেজ নাও খুলতে পারে  
- Inbox দেখার জন্য সাধারণত লগইন + Gmail কানেক্টই মুখ্য

---

## দ্রুত চেকলিস্ট (Phase 1 — Inbox)

### Readul (Owner)

- [ ] লোকাল সার্ভার + ক্লায়েন্ট চালু  
- [ ] Gmail OAuth `.env` সেট  
- [ ] Integrations → Gmail **Connected**  
- [ ] `/ai/inbox` → থ্রেড লিস্ট দেখা  
- [ ] একটি থ্রেড খোলা + বডি লোড  
- [ ] রিপ্লাই পাঠানো (ঐচ্ছিক)  
- [ ] প্রজেক্টে লিংক (ঐচ্ছিক)

### Akash (Member)

- [ ] একই স্টুডিওতে জয়েন  
- [ ] নিজের Gmail কানেক্ট  
- [ ] `/ai/inbox` → নিজের থ্রেড (Readul-এর সব মেইল নয়)  
- [ ] Gmail ছাড়া Inbox → কানেক্ট ব্যানার/মেসেজ

---

## সাধারণ সমস্যা ও সমাধান

| সমস্যা | সম্ভাব্য কারণ | কী করবেন |
|--------|----------------|----------|
| `Broken pipe` টার্মিনালে | ব্রাউজার রিকোয়েস্ট বাতিল | সাধারণত উপেক্ষা; পেজ রিফ্রেশ, আবার চেষ্টা |
| Gmail **Connected** দেরিতে | OAuth পপআপ বন্ধ হয়ে যাওয়া | Integrations-এ আবার Connect; ৯০০ms পর স্ট্যাটাস চেক হয় |
| Inbox খালি | নতুন অ্যাকাউন্ট / fetch হয়নি | পেজ রিলোড; Network-এ `gmail/fetch/` দেখুন |
| `403` Google | Test user নয় | Cloud Console → Test users-এ ইমেইল যোগ |
| Akash Readul-এর মেইল দেখছে না | ডিজাইন অনুযায়ী | Akash-কে নিজের Gmail কানেক্ট করতে হবে; শেয়ার্ড ইনবক্স নয় |
| `User has no gmail connected` | কানেক্ট নেই | Integrations বা Inbox ব্যানার থেকে Connect |

---

## Phase 2: Notion (ইন্টিগ্রেশন + প্রজেক্ট সিঙ্ক)

### এই ফিচার কী করে? (সংক্ষেপে)

**Notion** Focuspilot-এ **স্টুডিও প্রতি** (একটা workspace) কানেক্ট হয়। বর্তমানে দুটো কাজ আছে:

| স্তর | কী হয় | কী হয় না |
|------|--------|-----------|
| **Light** | Settings থেকে Notion **ডাটাবেস ব্রাউজ**, ID কপি, Notion-এ খোলা | — |
| **Medium (Project sync)** | Notion ডাটাবেসের **প্রতিটি row** → Focuspilot-এ **একটি Project** তৈরি/আপডেট | Focuspilot **Task** সরাসরি Notion থেকে আসে না |

**গুরুত্বপূর্ণ বোঝা:**

- Notion-এ আপনি **Tasks Tracker** বা **Projects** ডাটাবেস রাখতে পারেন — Focuspilot সেই টেবিলের **প্রতিটি লাইন**কে **Project** হিসেবে দেখে।
- Focuspilot-এর ভিতরের **Task** (টাস্ক বোর্ড, ফেজ, অ্যাসাইনি) আলাদা — সেগুলো **এখনো Notion-এর সাথে দ্বিমুখী সিঙ্ক হয় না** (ভবিষ্যতে “Heavy” প্ল্যান ছিল)।
- সিঙ্ক দিক: **Notion → Focuspilot** (একমুখী)। Notion-এ row এডিট করলে পরের **Sync projects now**-এ Focuspilot আপডেট হয়; Focuspilot থেকে Notion row এডিট হয় না।

**কানেকশন স্কোপ:** Gmail-এর মতো **স্টুডিও** — Owner (Readul) কানেক্ট করলে পুরো স্টুডিওতে Notion টোকেন থাকে; Akash একই স্টুডিওতে থাকলে (পারমিশন থাকলে) একই ম্যাপিং ও সিঙ্ক ব্যবহার করতে পারে।

---

### পুরো ওয়ার্কফ্লো (Notion + লোকাল লাইভ ডেটা)

নিচের ফ্লো **লোকাল** (`localhost:3000` + `localhost:8000`) এ **আসল Notion workspace** দিয়ে চালান।

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ধাপ ০: Notion Developers + server/.env সেট                              │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  ধাপ ১: Focuspilot → Settings → Integrations → Connect Notion (OAuth)   │
│          → টোকেন স্টুডিওতে সেভ (NotionToken)                              │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  ধাপ ২: Notion অ্যাপে → প্রতিটি ডাটাবেস → ••• → Connect to → Focuspilot │
│          (শেয়ার না করলে Browse databases খালি)                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
        ┌───────────────────┐           ┌───────────────────────────┐
        │ Light: Browse DB   │           │ Medium: Project sync map   │
        │ Search, Copy ID,   │           │ Database + Name col +      │
        │ Open in Notion     │           │ Status col (optional)      │
        └───────────────────┘           └─────────────┬─────────────┘
                                                      ▼
                                        ┌───────────────────────────┐
                                        │ Sync projects now          │
                                        │ POST notion/mapping/sync/  │
                                        └─────────────┬─────────────┘
                                                      ▼
                                        ┌───────────────────────────┐
                                        │ Focuspilot → Projects      │
                                        │ নতুন row = নতুন Project    │
                                        │ পুরনো row = name/status    │
                                        │ আপডেট (NotionProjectLink)   │
                                        └───────────────────────────┘
```

#### ধাপ ০ — Notion Integration তৈরি (একবার)

1. যান: https://www.notion.so/my-integrations  
2. **New integration** / **Public integration** (Connection) তৈরি করুন — নাম যেমন `Focuspilot Local`  
3. **Redirect URI** যোগ করুন:
   - `http://localhost:8000/notion/callback/`
   - (প্রোডে) `https://api.focuspilot.io/notion/callback/`
4. **Client ID** ও **Client secret** কপি করুন

`server/.env`:

```env
FRONTEND_URL=http://localhost:3000
NOTION_CLIENT_ID=আপনার-notion-client-id
NOTION_CLIENT_SECRET=আপনার-notion-secret
NOTION_REDIRECT_URI=http://localhost:8000/notion/callback/
NOTION_API_VERSION=2022-06-28
```

সার্ভার **রিস্টার্ট** করুন (`python manage.py runserver`)।

#### ধাপ ১ — Focuspilot-এ কানেক্ট (লাইভ OAuth)

1. লগইন: http://localhost:3000/login (**Readul** — Studio Owner)  
2. যান: http://localhost:3000/settings/studio/integrations  
3. **Notion** কার্ড → **Connect Notion** → **Continue** → পপআপে Notion-এ **Allow access**  
4. সফল হলে কার্ডে **Connected** + সেটিংস (গিয়ার) খুলবে  
5. OAuth শেষে URL: `http://localhost:3000/oauth/notion/callback?status=success`

**লাইভ ডেটা চেক (Network F12):**

| রিকোয়েস্ট | প্রত্যাশিত |
|------------|-------------|
| `GET notion/connect/` | `{ "auth_url": "https://api.notion.com/v1/oauth/authorize?..." }` |
| ব্রাউজার → `GET /notion/callback/?code=...` | রিডাইরেক্ট success |
| `GET user/integration-status/` | `notion_connected: true` |
| `GET notion/status/` | `connected: true`, `workspace_name` |

#### ধাপ ২ — Notion-এ ডাটাবেস শেয়ার (অবশ্যই)

Focuspilot শুধু **যে ডাটাবেস Integration-এর সাথে Connect** সেগুলো দেখে।

1. Notion ওয়েব/ডেস্কটপে আপনার **Tasks Tracker** (বা Projects টেবিল) খুলুন  
2. উপরে **•••** (মেনু) → **Connections** / **Connect to**  
3. তালিকায় **Focuspilot Local** (আপনার integration নাম) সিলেক্ট → **Confirm**  
4. অন্য ডাটাবেস লাগলে একইভাবে প্রতিটিতে Connect করুন

**টেস্ট ডেটা (Notion-এ লাইভ row):**

| Task name (Title) | Status (উদাহরণ) | Focuspilot-এ প্রত্যাশা |
|-------------------|------------------|-------------------------|
| `Kitchen Reno — Smith` | In progress | Project **Active** (`AC`) |
| `Bathroom Fit-out` | Done | Project **Completed** (`COM`) |
| `Archive Old Lead` | Archived | Project **Archived** (`ARC`) |

> কলামের নাম আপনার Notion-এ যা আছে (যেমন `Task name`, `Status`) — ম্যাপিংয়ে সেটাই বেছে নেবেন।

#### ধাপ ৩ — Light: ডাটাবেস ব্রাউজ (লাইভ লিস্ট)

1. Integrations → Notion → **Settings** (গিয়ার) → **Browse databases**  
2. সার্চ বক্সে `Tasks` লিখুন — শেয়ার করা DB দেখা উচিত  
3. **Copy** — Database ID ক্লিপবোর্ডে (Zapier/API-তে লাগতে পারে)  
4. **Open in Notion** — একই DB Notion-এ খুলবে  
5. লাইনে **Sync** — সরাসরি Project sync ম্যাপিং ডায়ালগ খুলে

**API (লোকাল, লগইন কুকি সহ ব্রাউজার সেশন বা JWT):**

```http
GET http://localhost:8000/notion/databases/?q=Tasks
```

খালি `[]` এলে → ধাপ ২ (Connect to) আবার করুন।

#### ধাপ ৪ — Medium: প্রজেক্ট সিঙ্ক ম্যাপিং

1. Notion settings → **Set up project sync** (বা Browse → **Sync**)  
2. **Database:** `Tasks Tracker` (বা আপনার টেবিল)  
3. **Name field:** Notion-এর **Title** কলাম (যেমন `Task name`)  
4. **Status field (optional):** `Status` — থাকলে স্ট্যাটাস ম্যাপ হয়  
5. **Save**

**স্ট্যাটাস ম্যাপিং (সার্ভার লজিক):**

| Notion Status (উদাহরণ) | Focuspilot `project_status` |
|-------------------------|-----------------------------|
| Done, Complete, Completed, Won | **Completed** (`COM`) |
| Archive, Archived, Cancelled | **Archived** (`ARC`) |
| In progress, অন্য যেকোনো | **Active** (`AC`) |

**API:**

```http
PUT http://localhost:8000/notion/mapping/
Content-Type: application/json

{
  "database_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "database_title": "Tasks Tracker",
  "title_property": "Task name",
  "status_property": "Status",
  "is_enabled": true
}
```

#### ধাপ ৫ — লাইভ সিঙ্ক → Projects পেজে ডেটা

1. Notion settings → **Sync projects now**  
2. টোস্ট: `Sync done: X created, Y updated, Z unchanged`  
3. যান: http://localhost:3000/projects  
4. Notion-এর প্রতিটি row-এর নামে **Project** দেখা উচিত  
5. Notion-এ একটি row-এর **নাম বা Status** বদলান → আবার **Sync projects now** → Focuspilot-এ **আপডেট** হবে

**API:**

```http
POST http://localhost:8000/notion/mapping/sync/
```

উদাহরণ রেসপন্স (লাইভ):

```json
{
  "created": 2,
  "updated": 1,
  "skipped": 0,
  "total_pages": 3,
  "last_synced_at": "2026-05-22T12:00:00+00:00"
}
```

**ডাটাবেসে কী সেভ হয় (লোকাল PostgreSQL):**

| টেবিল | কী |
|--------|-----|
| `notion_notiontoken` | স্টুডিওর access_token, workspace_name |
| `notion_notionprojectmapping` | কোন DB, কোন কলাম, last_synced_at |
| `notion_notionprojectlink` | `notion_page_id` ↔ `projects_project.id` |
| `projects_project` | `project_name`, `project_status`, `project_description` (= Notion URL) |

#### ধাপ ৬ — “টাস্ক” ম্যানেজমেন্ট বোঝা (Notion vs Focuspilot)

| কাজ করতে চান | কোথায় করবেন (বর্তমান প্রোডাক্ট) |
|--------------|-----------------------------------|
| প্রজেক্ট লিস্ট / স্ট্যাটাস ট্র্যাক | **Notion ডাটাবেস** → সিঙ্ক → **Focuspilot Projects** |
| টাস্ক, সাবটাস্ক, ফেজ, ডেডলাইন | **Focuspilot** প্রজেক্টের ভিতর (Task board) — Notion থেকে **আসে না** |
| টিম চ্যাট | প্রজেক্ট → **Team** ট্যাব |
| ক্লায়েন্ট ইমেইল | প্রজেক্ট → **Email** / Inbox লিংক (Phase 1) |
| নতুন ক্লায়েন্ট CRM | Focuspilot CRM বা Zapier webhook (আলাদা ইন্টিগ্রেশন) |

**প্র্যাকটিস ওয়ার্কফ্লো (রিকমেন্ডেড):**

1. Notion = **হাই-লেভেল জব/প্রজেক্ট ট্র্যাকার** (এক row = এক প্রজেক্ট)  
2. Focuspilot = **ডেলিভারি** — সেই প্রজেক্ট খুলে ফেজ, টাস্ক, টিম, ফাইন্যান্স  
3. সপ্তাহে একবার বা প্রজেক্ট মিটিংয়ের আগে **Sync projects now**  
4. নতুন Notion row যোগ → সিঙ্ক → Focuspilot-এ নতুন Project → ভিতরে টাস্ক বানান

#### ধাপ ৭ — Disconnect (পরিষ্কার টেস্ট)

1. Notion → **Disconnect**  
2. `notion_connected: false`, ম্যাপিং মুছে যায় (টোকেন ডিলিট)  
3. আগে তৈরি **Projects** থেকে যায় (লিংক টেবিল ক্লিয়ার; প্রজেক্ট ডিলিট হয় না)

---

### লোকালি চালানোর আগে (Phase 2)

Phase 1-এর মতোই সার্ভার + ক্লায়েন্ট চালু থাকতে হবে। অতিরিক্ত শুধু Notion `.env` (উপরে)।

```powershell
# টার্মিনাল ১
cd server
.\.venv\Scripts\Activate.ps1
python manage.py migrate
python manage.py runserver

# টার্মিনাল ২
cd client
pnpm dev
```

---

### টেস্ট ইউজার (Phase 2)

| ভূমিকা | কে | কী টেস্ট করবেন |
|--------|-----|----------------|
| **Owner** | Readul | Notion OAuth, DB শেয়ার, ম্যাপিং, সিঙ্ক, Projects ভেরিফাই |
| **Member** | Akash | একই স্টুডিও; Integrations দেখা/সিঙ্ক (রোল অনুযায়ী); Owner-এর ম্যাপিং শেয়ার |

---

## Owner (Readul) — Notion টেস্ট ধাপ

### ধাপ ১: কানেক্ট + স্ট্যাটাস

- [ ] `NOTION_*` `.env` সেট + সার্ভার রিস্টার্ট  
- [ ] Integrations → **Connect Notion** → Connected  
- [ ] `GET notion/status/` → workspace_name আসে  

### ধাপ ২: Notion-এ DB কানেক্ট

- [ ] Tasks Tracker (বা টেস্ট DB) → **Connect to** → Focuspilot integration  
- [ ] Browse databases → টেবিল দেখা যায়  

### ধাপ ৩: ম্যাপিং

- [ ] Set up project sync → DB + Task name + Status  
- [ ] Save → “Project sync configured” টোস্ট  

### ধাপ ৪: প্রথম সিঙ্ক (লাইভ)

- [ ] Sync projects now → `created` ≥ 1 (নতুন row থাকলে)  
- [ ] `/projects` → নামগুলো Notion-এর মতো  

### ধাপ ৫: আপডেট লুপ

- [ ] Notion-এ একটি প্রজেক্টের নাম বদলান → আবার সিঙ্ক → `updated` ≥ 1  
- [ ] Focuspilot-এ নাম আপডেট হয়েছে  

### ধাপ ৬ (ঐচ্ছিক): Status

- [ ] Notion Status → Done → সিঙ্ক → Project **Completed**  
- [ ] In progress → **Active**  

---

## টিম মেম্বার (Akash) — Notion টেস্ট

1. একই স্টুডিওতে লগইন  
2. **Settings → Integrations** খোলা যায় কিনা (`settings.edit` / admin নয় হলে নাও খুলতে পারে)  
3. Owner যদি আগে কানেক্ট করে থাকে → Notion **Connected** দেখা; নিজে Disconnect না করলে Owner-এর টোকেন থাকে  
4. Owner **Sync** করলে Akash **Projects**-এ একই নতুন প্রজেক্ট দেখবে (স্টুডিও ডেটা)  
5. Akash নিজে Browse/Sync চালাতে পারলে → একই ফলাফল  

---

## দ্রুত চেকলিস্ট (Phase 2 — Notion)

### Readul (Owner)

- [ ] Notion integration + redirect URI লোকাল  
- [ ] Connect Notion সফল  
- [ ] Notion DB → Connect to integration  
- [ ] Browse → DB লিস্ট + Copy ID  
- [ ] Project sync mapping সেভ  
- [ ] Sync → Projects লাইভ ডেটা  
- [ ] Notion এডিট → পুনরায় সিঙ্ক → আপডেট  

### Akash (Member)

- [ ] স্টুডিও একই  
- [ ] Projects-এ সিঙ্ক করা প্রজেক্ট দেখা  
- [ ] (ঐচ্ছিক) নিজে Integrations অ্যাক্সেস  

---

## Phase 2 — সাধারণ সমস্যা

| সমস্যা | কারণ | সমাধান |
|--------|------|--------|
| Browse databases খালি | DB integration-এ Connect হয়নি | Notion → ••• → Connect to → Focuspilot |
| `Notion OAuth is not configured` | `.env` খালি | `NOTION_CLIENT_ID/SECRET` + রিস্টার্ট |
| `503` / connect error | Redirect URI মিলছে না | Notion dev → `http://localhost:8000/notion/callback/` |
| Sync: `No database mapped` | ম্যাপিং সেভ হয়নি | Set up project sync → Save |
| `created: 0` কিন্তু row আছে | Title কলাম ভুল | ম্যাপিংয়ে সঠিক **Name field** |
| সব row `skipped` | আগেই সিঙ্ক হয়েছে, কিছু বদলায়নি | Notion-এ নাম/status বদলে আবার সিঙ্ক |
| Production vs local ভিন্ন | টোকেন আলাদা | লোকালে আলাদা Connect; প্রোড DB শেয়ার নয় |
| Focuspilot Task Notion-এ যায় না | ডিজাইন | শুধু **Project** সিঙ্ক; টাস্ক Focuspilot-এ ম্যানুয়াল |

---

## API রেফারেন্স (লোকাল ডিবাগ)

| মেথড | URL | কাজ |
|--------|-----|-----|
| GET | `/notion/connect/` | OAuth URL |
| GET | `/notion/callback/` | OAuth callback (ব্রাউজার) |
| POST | `/notion/disconnect/` | কাটা |
| GET | `/notion/status/` | workspace + mapping |
| GET | `/notion/databases/?q=` | DB লিস্ট (লাইভ Notion API) |
| GET | `/notion/databases/{id}/schema/` | Title/Status কলাম |
| GET/PUT | `/notion/mapping/` | ম্যাপিং পড়া/সেভ |
| POST | `/notion/mapping/sync/` | **লাইভ সিঙ্ক** |
| GET | `/user/integration-status/` | `notion_connected` |

---

## Phase 2b: Notion Outbound (প্রজেক্ট পেজ + টাস্ক টেবিল)

Focuspilot → Notion: নতুন **Project** = Notion পেজ; **Task** = সেই প্রজেক্টের Tasks database-এ row। বিস্তারিত: [notion_workflow.md](notion_workflow.md)

### ধাপ ১ — Parent page (ঐচ্ছিক)

1. Integrations → Notion → Settings
2. **Parent page for new projects** — Notion পেজ URL বা ID পেস্ট → **Save parent page**
3. খালি রাখলে অটো `Focuspilot Projects` হাব পেজ

### ধাপ ২ — Outbound প্রজেক্ট

1. Focuspilot-এ **নতুন Project** তৈরি (Notion inbound থেকে নয়)
2. Notion-এ parent এর নিচে নতুন পেজ দেখুন
3. API: `GET http://localhost:8000/notion/project-sync/?project_id={id}` → `synced: true`, `notion_project_url`

### ধাপ ৩ — Outbound টাস্ক

1. সেই প্রজেক্টে **Add Task** (phase সিলেক্ট — ডিফল্ট ফেজ অটো সিড হয়)
2. Save → Notion-এ **Tasks** table + ১ম row
3. আরেকটি টাস্ক → ২য় row
4. টাস্ক এডিট → Notion row আপডেট

### চেকলিস্ট (Outbound)

- [ ] `PUT notion/settings/` parent page (ঐচ্ছিক)
- [ ] নতুন FP project → Notion child page
- [ ] প্রথম task → Tasks DB + row (screenshot-এর মতো কলাম)
- [ ] দ্বিতীয় task → ২য় row
- [ ] Inbound sync করা project → duplicate Notion page **নয়**

### API

| Method | URL |
|--------|-----|
| GET/PUT | `/notion/settings/` |
| GET | `/notion/project-sync/?project_id=` |

---

## পরবর্তী ফেজ (খসড়া)

| Phase | বিষয় |
|-------|--------|
| Phase 1 | Inbox (Gmail) — উপরে |
| Phase 2 | Notion Inbound (ব্রাউজ + প্রজেক্ট সিঙ্ক) |
| Phase 2b | **Notion Outbound** (প্রজেক্ট পেজ + টাস্ক rows) — উপরে |
| Phase 3 | Calendar + Daily Brief |
| Phase 4 | Billing / Plan / Product Tour |
| Phase 5 | Xero + Zapier E2E |
| Phase 6 | Projects + CRM + Notion পূর্ণ E2E |

---

## সংক্ষিপ্ত URL রেফারেন্স

| পেজ | URL |
|------|-----|
| লগইন | http://localhost:3000/login |
| AI Inbox | http://localhost:3000/ai/inbox |
| Home Inbox | http://localhost:3000/home/inbox |
| Integrations | http://localhost:3000/settings/studio/integrations |
| Projects | http://localhost:3000/projects |
| Notion OAuth callback (ফ্রন্ট) | http://localhost:3000/oauth/notion/callback |
| API (লোকাল) | http://localhost:8000 |
| Notion integrations | https://www.notion.so/my-integrations |
| এক প্রজেক্ট — পূর্ণ পাইপলাইন (Studio + Contractor + Client) | [oneProjectfullworkflow.md](oneProjectfullworkflow.md) |

---

*সর্বশেষ আপডেট: Phase 1–2 + Phase 2b (Notion outbound, বাংলা)*
