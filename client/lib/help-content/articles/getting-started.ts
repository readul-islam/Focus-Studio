import { HelpArticle } from '../types';

export const gettingStartedArticles: HelpArticle[] = [
  {
    slug: "welcome-to-focuspilot",
    title: "Welcome to Focuspilot",
    description:
      "An introduction to the Focuspilot platform and who it's designed for",
    category: "getting-started",
    readTime: 3,
    lastUpdated: "2026-02-27",
    content: `# Welcome to Focuspilot

Focuspilot is a comprehensive project management platform built specifically for interior designers, architects, and creative studios.

## What is Focuspilot?

Focuspilot brings together everything you need to run your creative practise in one place:

- **Project Management** — Tasks, timelines, phases, and milestones
- **Client Relationship Management** — Contacts, leads, pipeline, and proposals
- **Financial Management** — Invoices, purchase orders, and profitability tracking
- **Product Library** — Your curated collection of products and materials
- **Team Collaboration** — Messages, shared calendars, and task assignments
- **AI-Powered Tools** — Smart product clipping, daily briefs, and intelligent automation

## Who is Focuspilot for?

Focuspilot is designed for:

- Interior design studios managing multiple residential or commercial projects
- Architects coordinating procurement and contractor relationships
- Design-build firms tracking costs, timelines, and profitability
- Creative agencies handling client projects from concept to completion

## Key Benefits

**Everything in one place** — Stop juggling spreadsheets, email threads, and disconnected tools. Focuspilot centralizes your projects, finances, and team communication.

**Built for design** — Unlike generic project management tools, Focuspilot understands the unique workflows of design professionals — from product sourcing to contractor coordination.

**AI-powered efficiency** — Let Focuspilot handle repetitive tasks like extracting product information, generating daily briefs, and tracking project updates.

**Scalable for growth** — Whether you're a solo designer or a 50-person studio, Focuspilot grows with your practise.

## Getting Started

Ready to dive in? Here's where to start:

1. **Set up your Studio** — Configure your company details, branding, and preferences
2. **Invite your team** — Add team members and assign appropriate roles
3. **Create your first Project** — Set up a project with tasks, phases, and deliverables
4. **Explore the Library** — Start building your product and material library
5. **Install AI Clipper** — Download the Chrome extension to clip products from any website

## Need Help?

Browse articles by category in this help centre, or reach out to support@focuspilot.io if you need assistance.

Welcome to Focuspilot — let's build something great together.`,
    screenshots: ["getting-started/welcome.png"],
    related: ["setting-up-studio", "creating-first-project", "inviting-team"],
  },
  {
    slug: "setting-up-studio",
    title: "Setting Up Your Studio",
    description:
      "Configure your studio name, logo, branding, and company details",
    category: "getting-started",
    readTime: 5,
    lastUpdated: "2026-02-27",
    content: `# Setting Up Your Studio

Your Studio settings control your company profile, branding, and default preferences across Focuspilot.

## Accessing Studio Settings

Navigate to **Settings** (bottom left of sidebar) → **Studio** to access all studio configuration options.

## General Settings

### Company Information

Set your basic company details:

- **Studio Name** — Your company or practise name
- **Legal Name** — Official registered business name (used on invoices)
- **Address** — Primary business address
- **Phone & Email** — Main contact details
- **Website** — Your studio website URL
- **Tax/VAT Number** — For invoice compliance

### Currency & Regional Settings

- **Default Currency** — Sets currency for all financial transactions (GBP, USD, EUR, etc.)
- **Tax Rate** — Your default VAT or sales tax rate
- **Date Format** — Choose your preferred date display format
- **Timezone** — Ensures correct timestamp display for your team

## Branding

Make Focuspilot feel like your own with custom branding:

### Logo Upload

Upload your studio logo in PNG or SVG format. Your logo appears:
- In the sidebar navigation
- On invoices and proposals
- In email communications

**Recommended size:** 200px × 60px for best display

### Brand Colors

Set your primary brand colour to customise:
- Email templates
- Proposal headers
- Invoice styling

### Email Signature

Configure your default email signature for:
- Proposal emails
- Invoice delivery
- System notifications to clients

## Finance Settings

Configure default finance preferences:

- **Payment Terms** — Default net payment period (e.g., Net 30)
- **Invoice Prefix** — Customize invoice numbering (e.g., INV-, TECH-)
- **Purchase Order Prefix** — PO numbering format
- **Default Notes** — Standard terms and conditions text

## Next Steps

Once your studio is configured:

1. **Invite your team** — Add team members with appropriate roles
2. **Set up integrations** — Connect Xero, Gmail, or other tools
3. **Create document templates** — Customize proposal and invoice templates

Your studio settings create a professional foundation for all your projects and client interactions.`,
    screenshots: [
      "getting-started/studio-settings.png",
      "getting-started/branding.png",
    ],
    related: ["general-settings", "branding", "finance-settings"],
  },
  {
    slug: "inviting-team",
    title: "Inviting Your Team",
    description: "Add team members, assign roles, and manage permissions",
    category: "getting-started",
    readTime: 4,
    lastUpdated: "2026-02-27",
    content: `# Inviting Your Team

Focuspilot supports collaborative workflows for your entire studio. Add team members and assign them appropriate access levels.

## How to Invite Team Members

### From the Team Page

1. Navigate to **Team** in the main sidebar
2. Click **Invite Member** button
3. Enter their **email address**
4. Select their **role**
5. Add a personal message (optional)
6. Click **Send Invitation**

The team member will receive an email invitation with instructions to create their account and join your studio.

### From Studio Settings

You can also invite members via **Settings** → **Studio** → **Team Management**.

## Understanding Roles

Focuspilot has four permission levels:

### Owner

**Full access** — Can manage everything including:
- Studio settings and billing
- All projects and finances
- Team member management
- Deleting projects or data

There can be multiple Owners in a studio.

### Admin

**Almost full access** — Can:
- Create and manage projects
- View all financial data
- Invite team members (but not remove Owners)
- Manage integrations

Admins cannot access billing or delete the studio.

### Member

**Standard access** — Can:
- View and work on assigned projects
- Create tasks and add notes
- Upload documents
- View library products

Members cannot access studio settings or financial data unless specifically assigned to project finance.

### Guest

**Limited access** — Can only:
- View specific projects they're invited to
- Comment on tasks
- View shared documents

Guests cannot create projects or access the library. Ideal for contractors or external collaborators.

## Managing Team Members

### Editing Roles

Owners and Admins can change team member roles:

1. Go to **Team** page
2. Click **•••** menu next to member name
3. Select **Edit Role**
4. Choose new role and save

### Removing Team Members

To remove someone from your studio:

1. Go to **Team** page
2. Click **•••** menu next to member name
3. Select **Remove from Studio**
4. Confirm removal

Note: Removing a team member does not delete their task assignments or historical data — it simply revokes their access.

## Best Practices

- **Assign minimal permissions** — Give team members only the access they need
- **Use Guest role for contractors** — Keep external collaborators limited to specific projects
- **Regular audits** — Review team list quarterly and remove inactive members
- **Onboarding** — Send new members a welcome message with key resources

## Next Steps

After inviting your team:

1. **Assign team members to projects** — Add them to relevant project teams
2. **Set up task assignments** — Delegate work appropriately
3. **Configure notifications** — Ensure team members get important updates

Your team is the heart of your studio — make sure everyone has the right access to collaborate effectively.`,
    screenshots: [
      "getting-started/invite-team.png",
      "getting-started/roles.png",
    ],
    related: ["team-overview", "roles-permissions", "team-management"],
  },
  {
    slug: "creating-first-project",
    title: "Creating Your First Project",
    description: "Step-by-step guide to setting up a project in Focuspilot",
    category: "getting-started",
    readTime: 6,
    lastUpdated: "2026-02-27",
    content: `# Creating Your First Project

Projects are the core of Focuspilot. Each project contains tasks, documents, finances, and all the information for a client engagement.

## Step 1: Navigate to Projects

Click **Projects** in the main sidebar, then click the **New Project** button (top right).

## Step 2: Enter Project Details

### Basic Information

- **Project Name** — A clear, descriptive name (e.g., "Johnson Residence Kitchen Renovation")
- **Client** — Select from your CRM contacts, or create a new client
- **Project Type** — Residential, Commercial, Hospitality, etc.
- **Status** — Lead, Active, On Hold, or Completed

### Project Dates

- **Start Date** — When the project begins
- **Target End Date** — Expected completion date
- **Actual End Date** — Filled in when project completes

### Financial Details

- **Budget** — Total project budget
- **Currency** — Default is your studio currency, can be overridden
- **Billing Type** — Fixed fee, hourly, cost-plus, etc.

### Description

Add a project summary or scope overview. This helps team members understand the project at a glance.

## Step 3: Assign Team Members

Add team members who will work on this project:

1. Click **Add Team Member**
2. Select from your studio team
3. Assign their role on this project (Project Manager, Designer, etc.)

You can add or remove team members at any time.

## Step 4: Set Up Project Structure

### Create Phases

Break your project into phases:

- **Concept Development**
- **Schematic Design**
- **Design Development**
- **Procurement**
- **Installation**

Phases help you track progress and milestones.

### Add Initial Tasks

Create a few starter tasks:

1. Go to the **Tasks** tab
2. Click **New Task**
3. Enter task name, assignee, and due date
4. Organize tasks by phase or priority

## Step 5: Configure Project Settings

Click the **Settings** tab to configure:

- **Project permissions** — Who can view or edit
- **Notification preferences** — What updates team members receive
- **Custom fields** — Add project-specific data fields

## Your Project Dashboard

Once created, your project dashboard shows:

- **Tasks Overview** — Pending, in-progress, and completed tasks
- **Recent Activity** — Latest updates and changes
- **Financial Summary** — Budget vs. actual spending
- **Team Members** — Who's working on the project
- **Quick Actions** — Create tasks, upload docs, add contractors

## What You Can Do in a Project

### Tasks

Create, assign, and track work items with due dates, priorities, and status updates.

### Docs

Upload files, create folders, write notes, and organise project documentation.

### Messages

Internal team chat for project-specific communication.

### Finance

Create project-specific invoices and purchase orders, track project profitability.

### Procurement

Manage product procurement items, track costs, and coordinate deliveries.

### Contractors

Add contractors working on the project, track their scope and contact details.

### Plan

Visualize project phases and milestones on a timeline.

### Calendar

View project-related events, deadlines, and team schedules.

## Best Practices

- **Start simple** — Don't over-structure initially; add detail as you go
- **Use templates** — Create project templates for recurring project types
- **Regular updates** — Keep task statuses and timelines current
- **Document everything** — Upload contracts, drawings, and client communications

## Next Steps

With your first project set up:

1. **Add more tasks** — Break down project deliverables
2. **Upload documents** — Add contracts, mood boards, drawings
3. **Start tracking time** — Log hours worked on tasks
4. **Create your first invoice** — Bill your client for project work

You're now ready to manage your project end-to-end in Focuspilot.`,
    screenshots: [
      "getting-started/new-project.png",
      "getting-started/project-details.png",
      "getting-started/project-dashboard.png",
    ],
    related: ["projects-overview", "project-tasks", "project-plan"],
  },
  {
    slug: "navigating-sidebar",
    title: "Navigating the Sidebar",
    description: "Complete guide to every item in the Focuspilot navigation",
    category: "getting-started",
    readTime: 4,
    lastUpdated: "2026-02-27",
    content: `# Navigating the Sidebar

The Focuspilot sidebar is your command centre for accessing every feature in the platform.

## Top Section: Home

### Dashboard

Your personal overview showing:
- Key performance indicators (KPIs)
- Today's tasks and appointments
- Recent activity across projects
- AI-generated daily brief

### Inbox

Centralized message hub:
- Internal team messages
- System notifications
- Gmail integration (if connected)
- Unread message count badge

### My Tasks

Your personal task list:
- Tasks assigned to you across all projects
- Filterable by status, due date, and priority
- Quick task creation

### Calendar

Studio-wide calendar:
- Project deadlines and milestones
- Team member availability
- Integrated time tracking

## Core Features

### Projects

Access all your active projects:
- List view of all projects
- Filter by status, client, or team member
- Create new projects
- Each project has its own sub-navigation for tasks, docs, finance, etc.

### CRM

Client relationship management:
- **Contacts** — Your full contact database
- **Leads** — Potential projects in early stages
- **Pipeline** — Kanban view of your sales funnel
- **Proposals** — Create and send project proposals

### Finance

Financial management hub:
- **Invoices** — Create, send, and track invoices
- **Purchase Orders** — Manage procurement spending
- View all financial data across projects

### Library

Your product and material database:
- **Products** — Curated product library
- **Materials** — Material specifications and samples
- AI Clipper integration for adding products

### AI

AI-powered tools:
- **Daily Brief** — AI-generated project updates
- **Activity** — Review AI actions and suggestions
- **Inbox** — AI-processed messages and notifications

### Team

Manage your studio team:
- View all team members
- See member availability and workload
- Manage roles and permissions

### Reports

Analytics and insights:
- **Cost Reports** — Project spending breakdown
- **Productivity** — Team and project productivity metrics
- **Profitability** — Margin and revenue analysis
- **Utilisation** — Resource allocation tracking

## Bottom Section: Settings & Help

### Help

Access this help centre (you're here now!)
- Searchable knowledge base
- Guides organised by category

### Settings

Configure your preferences:
- **User Settings** — Personal profile, appearance, notifications, security
- **Studio Settings** — Company details, branding, team, integrations, billing

## Navigation Tips

- **Keyboard shortcuts** — Press \`⌘K\` (Mac) or \`Ctrl+K\` (Windows) to open quick search
- **Breadcrumbs** — Use the breadcrumb trail at top to navigate back
- **Recent items** — Access recently viewed projects quickly
- **Favorites** — Star frequently used projects to pin them to the top

## Collapsible Sidebar

Click the collapse icon to minimize the sidebar for more screen space. Hover to expand it temporarily.

## Search

Use the global search (top right) to find:
- Projects by name or client
- Tasks by title or assignee
- Products in your library
- Contacts and leads
- Documents and files

You now know your way around Focuspilot — explore confidently!`,
    screenshots: ["getting-started/sidebar.png"],
    related: ["dashboard-overview", "inbox", "my-tasks"],
  },
];
