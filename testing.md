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

## পরবর্তী ফেজ (খসড়া)

| Phase | বিষয় |
|-------|--------|
| Phase 2 | Calendar + Daily Brief |
| Phase 3 | Integrations (Notion, Xero) |
| Phase 4 | Billing / Plan / Product Tour |
| Phase 5 | Projects + CRM ইনবক্স লিংক E2E |

---

## সংক্ষিপ্ত URL রেফারেন্স

| পেজ | URL |
|------|-----|
| লগইন | http://localhost:3000/login |
| AI Inbox | http://localhost:3000/ai/inbox |
| Home Inbox | http://localhost:3000/home/inbox |
| Integrations | http://localhost:3000/settings/studio/integrations |
| API (লোকাল) | http://localhost:8000 |

---

*সর্বশেষ আপডেট: Phase 1 — Inbox (Readul + Akash, লোকাল টেস্ট)*
