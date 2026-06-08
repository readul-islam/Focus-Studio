export type HelpArticle = {
  slug: string;
  title: string;
  description: string;
  category: string;
  readTime: number;
  content: string;
  related?: string[];
};

export type HelpCategory = {
  slug: string;
  name: string;
  description: string;
  icon: 'rocket-outline' | 'home-outline' | 'folder-outline' | 'people-outline' | 'wallet-outline' | 'phone-portrait-outline' | 'settings-outline';
};

export const HELP_CATEGORIES: HelpCategory[] = [
  {
    slug: 'getting-started',
    name: 'Getting started',
    description: 'Set up your studio and first project',
    icon: 'rocket-outline',
  },
  {
    slug: 'projects',
    name: 'Projects',
    description: 'Tasks, team chat, procurement, and files',
    icon: 'folder-outline',
  },
  {
    slug: 'crm',
    name: 'CRM',
    description: 'Contacts, leads, and pipeline',
    icon: 'people-outline',
  },
  {
    slug: 'finance',
    name: 'Finance',
    description: 'Invoices, expenses, and approvals',
    icon: 'wallet-outline',
  },
  {
    slug: 'mobile',
    name: 'Mobile app',
    description: 'Using Focuspilot on your phone',
    icon: 'phone-portrait-outline',
  },
  {
    slug: 'settings',
    name: 'Account & security',
    description: 'Profile, 2FA, integrations, notifications',
    icon: 'settings-outline',
  },
];

export const HELP_ARTICLES: HelpArticle[] = [
  {
    slug: 'welcome',
    title: 'Welcome to Focuspilot',
    description: 'What Focuspilot does and who it is for',
    category: 'getting-started',
    readTime: 3,
    content: `Focuspilot is the operating system for interior design studios — projects, CRM, finance, procurement, and team collaboration in one workspace.

## Built for design studios

Unlike generic project tools, Focuspilot understands FF&E procurement, client approvals, Xero sync, and studio workflows from first brief to final invoice.

## Core areas

- **Projects** — phases, tasks, team chat, procurement, finance, and files
- **CRM** — contacts, leads, and pipeline
- **Finance** — invoices and purchase orders
- **Inbox** — Gmail-linked project email (when connected)
- **Reports** — revenue, time, and procurement insights

## Mobile + web

Use the mobile app for tasks, updates, and approvals on the go. Open the web app for advanced setup, PDFs, and studio administration.`,
    related: ['first-project', 'mobile-overview'],
  },
  {
    slug: 'first-project',
    title: 'Create your first project',
    description: 'Start a project and invite your team',
    category: 'getting-started',
    readTime: 4,
    content: `## From the mobile app

1. Open **Projects** and tap **+**
2. Enter the project name, type, client, and dates
3. Save — the project hub opens with overview, tasks, and more

## From a won lead

When a CRM lead reaches **Won**, tap **Create project** on the lead detail screen to convert it automatically.

## Next steps

- Add tasks from the **Tasks** tab or project hub
- Upload a banner photo from the project header
- Connect Gmail in **Account → Integrations** to sync email`,
    related: ['project-hub', 'pipeline'],
  },
  {
    slug: 'project-hub',
    title: 'Project hub overview',
    description: 'Navigate overview, tasks, team, procurement, finance, and files',
    category: 'projects',
    readTime: 3,
    content: `Each project has a hub with tabs aligned to the web app:

## Tabs

- **Overview** — progress, budget, procurement summary, phases, activity
- **Tasks** — project-scoped task list
- **Email** — Gmail threads linked to the project
- **Team** — assignees and real-time team chat
- **Procurement** — FF&E items, status, and PO links
- **Finance** — project invoices and expenses
- **Files** — documents and uploads

Pull down on any tab to refresh. Team chat syncs with the web app every few seconds.`,
    related: ['team-chat', 'procurement-mobile'],
  },
  {
    slug: 'team-chat',
    title: 'Project team chat',
    description: 'Message your team in real time',
    category: 'projects',
    readTime: 2,
    content: `Open a project → **Team** tab.

## Sending messages

Type in the composer at the bottom and tap send. Messages appear for all studio members on web and mobile.

## Presence

See who is currently viewing the project at the top of the tab.

## Attachments & mentions

File attachments and @mentions are available on the web app. Messages sent from mobile are fully synced.`,
    related: ['project-hub'],
  },
  {
    slug: 'procurement-mobile',
    title: 'Procurement on mobile',
    description: 'Track items, approvals, and POs',
    category: 'projects',
    readTime: 3,
    content: `The **Procurement** tab shows all FF&E items for a project.

## Filters

Use **Needs action**, **Ordered**, and **Delivered** to focus your list. Search by product or supplier name.

## Purchase orders

Tap an item linked to a PO to open the purchase order detail. Create and edit procurement lines on the web app.`,
    related: ['project-hub', 'finance-mobile'],
  },
  {
    slug: 'contacts',
    title: 'Managing contacts',
    description: 'Clients, suppliers, and contractors',
    category: 'crm',
    readTime: 3,
    content: `Open **CRM → Contacts** from the workspace menu.

## Contact types

Filter by **Clients**, **Suppliers**, or **Contractors**. Tap **+** to add a new contact.

## Editing

View contact details on mobile. Full editing, notes, and history are on the web CRM.`,
    related: ['pipeline'],
  },
  {
    slug: 'pipeline',
    title: 'Sales pipeline',
    description: 'Track leads through your funnel',
    category: 'crm',
    readTime: 4,
    content: `**CRM → Pipeline** shows all active leads with value and stage.

## Stages

New → Qualified → Proposal → Negotiation → Won / Lost

## Moving leads

Open a lead and tap a stage chip to advance it. The API may require extra fields for some stages — add them on web if prompted.

## Won leads

When a lead is **Won**, tap **Create project** to spin up a project from the lead data.`,
    related: ['contacts', 'first-project'],
  },
  {
    slug: 'finance-mobile',
    title: 'Finance on mobile',
    description: 'Invoices, expenses, and approvals',
    category: 'finance',
    readTime: 4,
    content: `## Studio finance

**Finance** in the workspace menu lists all invoices and purchase orders. Filter by type and status.

## Drafts

Create draft invoices or expenses with **+**. Edit line items, client, and dates on mobile.

## Approvals

On invoice or PO detail, use **Send to client**, **Approve**, or **Mark paid** without opening the web app.

## Project finance

Each project hub has a **Finance** tab scoped to that project, with budget KPIs at the top.`,
    related: ['procurement-mobile'],
  },
  {
    slug: 'mobile-overview',
    title: 'Using the mobile app',
    description: 'Navigation, offline cache, and device setup',
    category: 'mobile',
    readTime: 3,
    content: `## Navigation

- **Home** — daily brief and quick actions
- **Menu (☰)** — workspace tools: Search, CRM, Finance, Reports, Time
- **Account** tab — profile, security, integrations

## Physical device testing

Set \`EXPO_PUBLIC_API_URL\` to your Mac's LAN IP (not localhost). Django must listen on \`0.0.0.0:8000\` with your IP in \`ALLOWED_HOSTS\`.

## Offline

Read-heavy screens cache data for up to 7 days. Pull to refresh when back online.

## Push notifications

Enable in **Account → Notification preferences**. Requires a physical device and EAS dev build for full push support in Expo Go limitations.`,
    related: ['integrations', 'two-factor'],
  },
  {
    slug: 'integrations',
    title: 'Connecting integrations',
    description: 'Gmail, calendar, Xero, and more',
    category: 'settings',
    readTime: 3,
    content: `OAuth integrations are completed in the Studio web app.

## On mobile

1. Open **Account → Integrations**
2. Tap **Open integrations in browser**
3. Connect Gmail, Calendar, or Xero on web
4. Return to the app and pull to refresh

## Gmail + Inbox

After Gmail is connected, **Inbox** and project **Email** tabs sync threads automatically.`,
    related: ['mobile-overview'],
  },
  {
    slug: 'two-factor',
    title: 'Two-factor authentication',
    description: 'Secure your account with an authenticator app',
    category: 'settings',
    readTime: 3,
    content: `## Enable 2FA

1. Open **Account → Security**
2. Tap **Set up two-factor authentication**
3. Add the account to your authenticator app (Google Authenticator, 1Password, etc.)
4. Enter the 6-digit code to confirm
5. **Save your backup codes** in a secure place

## Signing in

When 2FA is enabled, login asks for your authenticator code after your password.

## Backup codes

Each backup code works once. Regenerate or disable 2FA from Security settings.`,
    related: ['mobile-overview'],
  },
  {
    slug: 'notifications',
    title: 'Notification preferences',
    description: 'Email and push alerts',
    category: 'settings',
    readTime: 2,
    content: `## In-app notifications

The bell icon shows assignments, mentions, and project updates. Open **Notifications** from Home or Account.

## Email preferences

**Account → Notification preferences** controls project updates, comments, reminders, and product news emails.

## Push notifications

Toggle **Mobile alerts** on the same screen. If permission is denied, open iOS/Android system settings to allow notifications for Focuspilot.`,
    related: ['mobile-overview'],
  },
];

export function getCategory(slug: string): HelpCategory | undefined {
  return HELP_CATEGORIES.find(category => category.slug === slug);
}

export function getArticlesByCategory(categorySlug: string): HelpArticle[] {
  return HELP_ARTICLES.filter(article => article.category === categorySlug);
}

export function getArticle(categorySlug: string, articleSlug: string): HelpArticle | undefined {
  return HELP_ARTICLES.find(article => article.category === categorySlug && article.slug === articleSlug);
}

export function findArticleBySlug(articleSlug: string): HelpArticle | undefined {
  return HELP_ARTICLES.find(article => article.slug === articleSlug);
}

export function searchHelpArticles(query: string): HelpArticle[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  return HELP_ARTICLES.filter(article => {
    const haystack = `${article.title} ${article.description} ${article.content}`.toLowerCase();
    return haystack.includes(q);
  }).slice(0, 12);
}

export function getPopularArticles(): HelpArticle[] {
  return [
    getArticle('getting-started', 'welcome'),
    getArticle('mobile', 'mobile-overview'),
    getArticle('projects', 'project-hub'),
    getArticle('finance', 'finance-mobile'),
    getArticle('settings', 'two-factor'),
    getArticle('crm', 'pipeline'),
  ].filter((article): article is HelpArticle => Boolean(article));
}

export function articlePath(category: string, slug: string): string {
  return `/help/${category}/${slug}`;
}
