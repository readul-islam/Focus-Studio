import { HelpArticle } from '../types';

export const crmArticles: HelpArticle[] = [
  {
    slug: "crm-overview",
    title: "CRM Overview",
    description: "Understanding contacts, leads, pipeline, and proposals",
    category: "crm",
    readTime: 4,
    lastUpdated: "2026-02-27",
    content: `# CRM Overview

The Focuspilot CRM (Client Relationship Management) system helps you manage contacts, track leads, visualize your sales pipeline, and create proposals.

## What's in the CRM?

### Contacts

Your complete database of:

- Clients (current and past)
- Leads (potential clients)
- Suppliers
- Contractors
- Other professional contacts

### Leads

Potential projects in early stages:

- Initial inquiries
- Consultation requests
- Proposal stage prospects

### Pipeline

Visual Kanban board showing leads moving through your sales funnel:

- New Lead
- Consultation Scheduled
- Proposal Sent
- Negotiation
- Won / Lost

### Proposals

Create and send professional project proposals to convert leads into projects.

## Why Use the CRM?

- **Never lose track of a lead** — All inquiries captured in one place
- **Visualize your pipeline** — See deal flow at a glance
- **Forecast revenue** — Track potential project value
- **Convert faster** — Move leads systematically through your process
- **Maintain relationships** — Keep contact history organised

## CRM Workflow

Typical flow through the CRM:

1. **New inquiry comes in** → Create a **Contact** and **Lead**
2. **Initial consultation** → Move lead to "Consultation Scheduled" in **Pipeline**
3. **Create proposal** → Draft and send **Proposal**
4. **Negotiations** → Update lead status
5. **Won** → Convert lead to **Project**
6. **Lost** → Mark as lost, add notes for future

## Accessing the CRM

Click **CRM** in the sidebar to access:

- **Contacts** — Full contact database
- **Leads** — Active leads list
- **Pipeline** — Visual pipeline board
- **Proposals** — Proposal library

## Best Practices

- **Add every inquiry** — Create a lead for every potential project
- **Update pipeline regularly** — Keep status current
- **Document interactions** — Add notes to contacts after meetings
- **Follow up consistently** — Use reminders to stay on top of leads
- **Analyze conversion rate** — Review pipeline reports monthly

Your CRM is your business development engine — use it diligently.`,
    screenshots: ["crm/crm-dashboard.png"],
    related: ["contacts", "leads", "pipeline", "proposals"],
  },
  {
    slug: "contacts",
    title: "Contacts",
    description: "Adding, editing, and managing your contact database",
    category: "crm",
    readTime: 4,
    lastUpdated: "2026-02-27",
    content: `# Contacts

Your **Contacts** database stores all people and companies you interact with — clients, leads, suppliers, contractors, and professional connections.

## Viewing Contacts

Navigate to **CRM** → **Contacts** to see your full contact list.

### Contact Card

Each contact shows:

- **Name** and **Company**
- **Contact Type** (Client, Lead, Supplier, Contractor)
- **Email** and **Phone**
- **Tags** (e.g., "VIP", "Residential", "Past Client")
- **Last Interaction** date

## Adding a Contact

1. Click **+ New Contact**
2. Enter contact details:
   - **First and Last Name**
   - **Company** (optional)
   - **Contact Type**
   - **Email** and **Phone**
   - **Address**
   - **Notes**
3. Click **Save**

## Contact Types

Organize contacts by type:

- **Client** — Current or past clients
- **Lead** — Potential clients
- **Supplier** — Product suppliers
- **Contractor** — Subcontractors and trades
- **Other** — Professional connections

Filter by type to focus your list.

## Contact Details

Click any contact to view full details:

- **Profile Information** — All contact data
- **Projects** — Projects associated with this contact
- **Interactions** — History of emails, calls, meetings
- **Documents** — Files related to this contact
- **Notes** — Internal notes about the contact

## Adding Notes

Document conversations and interactions:

1. Open a contact
2. Go to **Notes** tab
3. Click **Add Note**
4. Write note (date, topic, key points)
5. Save

Notes create a relationship history.

## Tagging Contacts

Use tags for categorization:

- **VIP** — High-value clients
- **Residential** — Residential project focus
- **Commercial** — Commercial clients
- **Referral Source** — People who refer business
- **Newsletter** — Subscribed to your newsletter

Add tags to a contact, then filter by tag.

## Linking Contacts to Projects

When you create a project, select the client contact. This links:

- All project communications
- Invoices sent to the client
- Project history

View all projects for a contact in their profile.

## Contact Import

Bulk import contacts from CSV:

1. Go to **Contacts** page
2. Click **Import**
3. Upload CSV file (with columns: name, email, phone, etc.)
4. Map CSV columns to Focuspilot fields
5. Import

## Contact Export

Export your contact database:

1. Click **Export**
2. Choose format (CSV, Excel)
3. Select which contacts (all, filtered, selected)
4. Download

## Search and Filter

Find contacts quickly:

- **Search bar** — Search by name, company, email
- **Filter by type** — Clients, leads, suppliers, etc.
- **Filter by tags** — Show tagged contacts
- **Sort** — By name, last interaction, date added

## Duplicate Detection

Focuspilot detects potential duplicates:

- When adding a contact with similar name/email
- In the **Contacts** list (Duplicates filter)

Merge duplicates to keep database clean.

## Best Practices

- **Complete profiles** — Fill in all contact details
- **Add notes regularly** — Document every interaction
- **Tag strategically** — Use tags for segmentation
- **Clean up duplicates** — Merge or delete duplicate contacts quarterly
- **Link to projects** — Always associate contacts with relevant projects

Your contact database is your relationship asset — keep it organised and current.`,
    screenshots: ["crm/contacts-list.png", "crm/contact-detail.png"],
    related: ["crm-overview", "leads", "projects-overview"],
  },
  {
    slug: "leads",
    title: "Leads",
    description:
      "Managing potential projects — lead status and converting to projects",
    category: "crm",
    readTime: 4,
    lastUpdated: "2026-02-27",
    content: `# Leads

**Leads** are potential projects in early stages — inquiries, consultations, or prospects not yet converted to active projects.

## Viewing Leads

Navigate to **CRM** → **Leads** to see all active leads.

### Lead Card

Each lead shows:

- **Lead Name** (e.g., "Smith Residence Kitchen")
- **Contact** — Associated client contact
- **Status** — Current pipeline stage
- **Value** — Estimated project value
- **Probability** — Likelihood of conversion (%)
- **Last Activity** — Most recent interaction
- **Next Step** — Planned next action

## Creating a Lead

1. Click **+ New Lead**
2. Enter lead details:
   - **Lead Name** — Descriptive name
   - **Contact** — Select or create contact
   - **Project Type** (Residential, Commercial, etc.)
   - **Estimated Value** — Potential project budget
   - **Status** — Current stage (default: New Lead)
   - **Source** — How you got the lead (Referral, Website, etc.)
   - **Description** — Project scope or notes
3. Click **Save**

## Lead Status

Track where each lead is in your process:

- **New Lead** — Initial inquiry
- **Consultation Scheduled** — Meeting booked
- **Proposal Sent** — Proposal delivered
- **Negotiation** — Discussing terms
- **Won** — Lead converted to project
- **Lost** — Lead did not convert

Update status as the lead progresses.

## Lead Pipeline Stages

Customize your pipeline stages in **Settings** → **Studio** → **CRM Settings**.

Default stages work for most studios, but you can adjust to your process.

## Converting a Lead to Project

When a lead is won:

1. Open the lead
2. Click **Convert to Project**
3. Project is auto-created with:
   - Client from lead contact
   - Budget from lead value
   - Description from lead notes
4. Lead status changes to "Won"
5. Lead remains in CRM for historical tracking

## Marking a Lead as Lost

If a lead doesn't convert:

1. Open the lead
2. Click **Mark as Lost**
3. Select reason (optional):
   - Budget too high
   - Chose another designer
   - Project canceled
   - Timing not right
4. Add notes for future reference

Lost leads remain searchable for relationship continuity.

## Lead Sources

Track where leads come from:

- **Website** — Inquiry form
- **Referral** — Client referral
- **Social Media** — Instagram, Pinterest, etc.
- **Email** — Cold outreach
- **Event** — Trade show or networking
- **Other**

Analyze lead sources in reports to understand best marketing channels.

## Lead Activities

Log interactions with leads:

1. Open a lead
2. Go to **Activities** tab
3. Add activities:
   - **Call** — Phone conversation
   - **Email** — Email sent
   - **Meeting** — In-person or virtual meeting
   - **Note** — General update
4. Date and notes auto-save

Activity history shows relationship timeline.

## Next Steps and Reminders

Set follow-up reminders:

1. Open a lead
2. Click **Add Next Step**
3. Enter action (e.g., "Send proposal", "Follow-up call")
4. Set reminder date
5. Save

You'll receive notification when reminder is due.

## Lead Value and Probability

### Estimated Value

Enter the potential project budget. Used for revenue forecasting.

### Probability %

Estimate likelihood of conversion:

- **New Lead** — 10%
- **Consultation Scheduled** — 25%
- **Proposal Sent** — 50%
- **Negotiation** — 75%

Adjust based on your experience. Helps forecast weighted pipeline value.

## Best Practices

- **Create leads immediately** — Don't let inquiries slip through
- **Update status in real-time** — Keep pipeline current
- **Log all activities** — Document every interaction
- **Set next steps** — Always have a follow-up action
- **Review weekly** — Scan leads every Monday for follow-ups
- **Analyze lost leads** — Learn from leads that didn't convert

Leads are your future revenue — manage them carefully.`,
    screenshots: ["crm/leads-list.png", "crm/lead-detail.png"],
    related: [
      "crm-overview",
      "pipeline",
      "proposals",
      "creating-first-project",
    ],
  },
  {
    slug: "pipeline",
    title: "Pipeline",
    description: "Visual Kanban view of leads moving through your sales funnel",
    category: "crm",
    readTime: 3,
    lastUpdated: "2026-02-27",
    content: `# Pipeline

The **Pipeline** is a visual Kanban board showing all your leads and their progress through your sales funnel.

## Accessing Pipeline

Navigate to **CRM** → **Pipeline**.

## Pipeline View

Leads are organised into columns representing stages:

- **New Lead** — Just received
- **Consultation Scheduled** — Meeting booked
- **Proposal Sent** — Proposal delivered
- **Negotiation** — Discussing terms
- **Won** — Converted to project
- **Lost** — Did not convert

### Lead Cards

Each card shows:

- Lead name
- Contact name
- Estimated value
- Days in current stage

## Moving Leads Through Pipeline

### Drag and Drop

Simply drag a lead card from one column to another as it progresses.

Status updates automatically.

### Manual Update

Alternatively:

1. Click a lead card
2. Change **Status** dropdown
3. Save

Lead moves to the new column.

## Pipeline Metrics

Top of pipeline shows:

- **Total Pipeline Value** — Sum of all lead values
- **Weighted Pipeline** — Value × probability %
- **Conversion Rate** — % of leads that become projects
- **Average Deal Size** — Typical project value
- **Average Time to Close** — Days from lead to project

## Filtering Pipeline

Focus your view:

- **By Team Member** — Show leads assigned to specific person
- **By Source** — Leads from specific marketing channel
- **By Date Range** — Leads created in a time period
- **By Value** — Leads above/below certain budget

## Color Coding

Leads are colour-coded:

- **Green** — Recent activity, progressing
- **Yellow** — No activity in 7 days
- **Red** — Stale, no activity in 14+ days

This helps you identify leads needing attention.

## Pipeline Reports

Analyze your pipeline:

1. Click **Reports** (top right)
2. View:
   - Conversion rate trends
   - Time in each stage
   - Lead sources performance
   - Win/loss reasons

Use insights to optimise your sales process.

## Customizing Pipeline Stages

Adjust stages to match your process:

1. Go to **Settings** → **Studio** → **CRM Settings**
2. Edit **Pipeline Stages**
3. Add, remove, or rename stages
4. Set default probabilities per stage
5. Save

Pipeline updates to reflect your custom stages.

## Best Practices

- **Review daily** — Check pipeline each morning
- **Move leads promptly** — Update status as soon as stage changes
- **Focus on stale leads** — Follow up on yellow/red leads
- **Celebrate wins** — Move won leads to Won column, celebrate with team
- **Learn from losses** — Review lost leads to improve process

Your pipeline is your revenue forecast — keep it accurate and up to date.`,
    screenshots: ["crm/pipeline.png"],
    related: ["leads", "proposals", "crm-overview"],
  },
  {
    slug: "proposals",
    title: "Proposals",
    description: "Creating and sending professional project proposals",
    category: "crm",
    readTime: 5,
    lastUpdated: "2026-02-27",
    content: `# Proposals

Create professional project proposals to convert leads into signed projects.

## Accessing Proposals

Navigate to **CRM** → **Proposals** to see all proposals.

## Creating a Proposal

1. Click **+ New Proposal**
2. Select **Lead** or **Contact**
3. Fill in proposal details:
   - **Proposal Title**
   - **Valid Until Date** — Proposal expiration
   - **Project Description** — Scope overview
   - **Deliverables** — What you'll provide
4. Add **Line Items**:
   - Service description (e.g., "Concept Design Phase")
   - Price
5. Add **Terms & Conditions**
6. **Preview** the proposal
7. **Send to Client** or **Save as Draft**

## Proposal Sections

### Cover Page

- Your studio logo
- Proposal title
- Client name
- Date
- Valid until date

### Introduction

Personalized message to the client introducing the proposal.

### Scope of Work

Detailed description of what the project entails.

### Deliverables

Bulleted list of what the client will receive:

- Mood boards
- Floor plans
- 3D renderings
- Product specifications
- Installation coordination

### Pricing

Itemized breakdown:

- Design fees by phase
- Procurement markup (if applicable)
- Additional services
- Total investment

### Timeline

High-level project timeline showing phases and durations.

### Terms & Conditions

Payment terms, revision policy, cancellation terms, etc.

Use your studio's standard terms or customise per proposal.

### Signature Block

Digital signature field for client acceptance.

## Proposal Templates

Save time with templates:

1. Create a proposal
2. Click **Save as Template**
3. Name the template (e.g., "Residential Design Proposal")
4. Reuse for future proposals

Edit template content in **Settings** → **Studio** → **Templates**.

## Sending a Proposal

Once your proposal is ready:

1. Click **Send Proposal**
2. Proposal is emailed to client as a PDF attachment
3. Client can view, download, and digitally sign (if enabled)

### Proposal Email

The email includes:

- Your custom message
- PDF proposal attached
- Link to view proposal online (if client portal enabled)
- Digital signature link (if enabled)

## Proposal Status

Track proposal progress:

- **Draft** — Not yet sent
- **Sent** — Delivered to client
- **Viewed** — Client opened the proposal
- **Accepted** — Client signed
- **Declined** — Client rejected
- **Expired** — Past valid-until date

You receive notifications when client views or signs.

## Digital Signatures

Enable digital signatures for faster acceptance:

1. In proposal, toggle **Require Signature**
2. When sent, client receives signature link
3. Client signs electronically
4. You receive notification and signed copy

Signed proposals auto-attach to the contact and lead.

## Converting Accepted Proposals

When a client accepts:

1. Proposal status updates to **Accepted**
2. Lead status updates to **Won**
3. Click **Convert to Project**
4. Project is created with proposal details

## Proposal Analytics

View proposal performance:

- **Acceptance Rate** — % of proposals accepted
- **Average Time to Decision** — Days from send to signature
- **Proposal Value** — Total value of all proposals

Access in **Reports** → **CRM Reports**.

## Best Practices

- **Personalize every proposal** — Tailor to client's needs and style
- **Be clear on deliverables** — Avoid ambiguity in scope
- **Set expiration dates** — Create urgency with valid-until dates
- **Follow up** — If no response in 1 week, send gentle reminder
- **Use templates** — Save time with reusable templates
- **Track metrics** — Improve proposals based on acceptance rate

Proposals close deals — make them professional, clear, and compelling.`,
    screenshots: [
      "crm/proposals-list.png",
      "crm/proposal-editor.png",
      "crm/proposal-preview.png",
    ],
    related: ["leads", "pipeline", "creating-first-project"],
  },
];
