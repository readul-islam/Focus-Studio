import { HelpArticle } from '../types';

export const settingsStudioArticles: HelpArticle[] = [
  {
    slug: "general-settings",
    title: "General Settings",
    description: "Studio name, address, currency, and regional settings",
    category: "settings",
    readTime: 4,
    lastUpdated: "2026-02-27",
    content: `# General Settings

Studio General Settings control your company profile and default preferences.

## Accessing General Settings

Go to **Settings** → **Studio** → **General**.

## Company Information

### Studio Name

Your company or practise name. Displayed throughout Focuspilot and on invoices.

### Legal Name

Official registered business name (if different from studio name). Used on legal documents and invoices.

### Address

Primary business address:

- Street address
- City
- State/Province
- Postal/ZIP code
- Country

Appears on invoices and proposals.

### Contact Details

- **Phone** — Main studio phone number
- **Email** — Primary studio email
- **Website** — Your studio website URL

## Regional Settings

### Currency

Default currency for all financial transactions:

- GBP, USD, EUR, CAD, AUD, etc.
- All invoices and purchase orders use this currency (unless overridden per transaction)

Changing currency doesn't convert existing financial data.

### Tax/VAT Number

Your business tax ID or VAT registration number. Appears on invoices for tax compliance.

### Tax Rate

Default tax/VAT rate (percentage):

- Applied to invoices automatically
- Can be overridden per invoice line item

Set to your local sales tax or VAT rate.

## Date & Time

### Date Format

Choose how dates display:

- **DD/MM/YYYY** (e.g., 27/02/2026)
- **MM/DD/YYYY** (e.g., 02/27/2026)
- **YYYY-MM-DD** (e.g., 2026-02-27)

### Time Format

- **12-hour** (e.g., 2:30 PM)
- **24-hour** (e.g., 14:30)

### Fiscal Year Start

Set your fiscal year start month (default: January).

Affects financial year-to-date reports.

## Language

Select studio default language (currently English only, more languages coming soon).

## Saving Changes

Click **Save Changes** at the bottom to apply updates.

Changes affect all team members and new transactions.

## Best Practices

- **Use legal name for invoices** — Ensures tax compliance
- **Complete address** — Required for professional invoices
- **Set correct currency** — Changing later is complex
- **Update tax rate annually** — If your local rate changes

General settings establish your studio's identity in Focuspilot — set them up carefully at the start.`,
    screenshots: ["settings/general-settings.png"],
    related: ["setting-up-studio", "branding", "finance-settings"],
  },
  {
    slug: "branding",
    title: "Branding",
    description: "Logo, colours, and email signature customization",
    category: "settings",
    readTime: 3,
    lastUpdated: "2026-02-27",
    content: `# Branding

Customize Focuspilot with your studio's brand identity.

## Accessing Branding Settings

Go to **Settings** → **Studio** → **Branding**.

## Logo

Upload your studio logo:

1. Click **Upload Logo**
2. Select image file (PNG, SVG, or JPG)
3. Crop to desired size
4. Save

### Logo Requirements

- **Format:** PNG (with transparency) or SVG preferred
- **Size:** Recommended 200px × 60px
- **Max file size:** 2MB

### Where Your Logo Appears

- Sidebar navigation (top left)
- Invoices and proposals
- Email communications
- Client portal (if enabled)

### Removing Logo

Click **Remove Logo** to use text-only studio name.

## Brand Colors

Set your primary brand colour:

1. Click colour picker
2. Choose your brand colour
3. Save

### Where Brand Colors Apply

- Email templates
- Proposal headers
- Invoice accents
- Client portal theme

## Email Signature

Customize the signature for emails sent from Focuspilot:

- Invoice delivery emails
- Proposal emails
- System notifications to clients

### Setting Email Signature

1. Enter signature text (supports rich text)
2. Include:
   - Your name or studio name
   - Title
   - Contact details
   - Website link
3. Save

Example:
\`\`\`
Best regards,

[Your Studio Name]
[Your Title]
[Phone] | [Email] | [Website]
\`\`\`

## Invoice & Proposal Styling

### Header Style

Choose invoice/proposal header style:

- **Minimal** — Logo and text only
- **Brand Bar** — Colored bar with logo
- **Full Color** — Brand colour background

### Font Style

Select font pairing for documents:

- Modern (Sans-serif)
- Classic (Serif)
- Clean (Geometric sans)

## Best Practices

- **Use PNG with transparency** — Looks best on different backgrounds
- **Keep logo simple** — Small logos need to be legible
- **Brand consistently** — Use same colours across all materials
- **Professional signature** — Keep it concise and informative

Your branding makes Focuspilot feel like your studio — invest in setting it up well.`,
    screenshots: [
      "settings/branding-settings.png",
      "settings/logo-upload.png",
      "settings/brand-colours.png",
    ],
    related: ["general-settings", "templates", "creating-invoice"],
  },
  {
    slug: "finance-settings",
    title: "Finance Settings",
    description: "Tax rates, payment terms, and invoice defaults",
    category: "settings",
    readTime: 4,
    lastUpdated: "2026-02-27",
    content: `# Finance Settings

Configure default settings for invoices, purchase orders, and financial transactions.

## Accessing Finance Settings

Go to **Settings** → **Studio** → **Finance**.

## Invoice Settings

### Invoice Numbering

Set your invoice number format:

- **Prefix** — Text before number (e.g., "INV-", "TECH-")
- **Starting Number** — First invoice number (e.g., 1001)
- **Format** — Padding (e.g., 0001, 001, 1)

Example: \`INV-1001\`, \`INV-1002\`, etc.

Next invoice number auto-increments.

### Invoice Payment Terms

Default payment terms for new invoices:

- **Net 7** — Due in 7 days
- **Net 15** — Due in 15 days
- **Net 30** — Due in 30 days (most common)
- **Net 60** — Due in 60 days
- **Due on Receipt** — Immediate payment
- **Custom** — Set custom default

Can be overridden per invoice.

### Invoice Notes

Default notes appearing at bottom of invoices:

- Payment instructions (bank details, online payment link)
- Terms and conditions
- Thank you message

Enter your standard invoice notes here to save time.

## Purchase Order Settings

### PO Numbering

Similar to invoices:

- **Prefix** (e.g., "PO-")
- **Starting Number**
- **Format**

### PO Approval Workflow

Toggle **Require Approval** to enable PO approval:

- When enabled, team members create POs as drafts
- Admins/Owners must approve before PO can be sent
- Prevents unauthorized spending

Set approval threshold:

- **All POs** — Every PO requires approval
- **Above Amount** — Only POs above a certain value (e.g., £1000)

## Tax Settings

### Default Tax Rate

Studio-wide default tax/VAT rate (percentage).

Applied to invoices automatically (can be adjusted per line item).

### Tax Name

Display name for tax (e.g., "VAT", "Sales Tax", "GST").

### Tax Inclusive Pricing

Toggle whether prices are tax-inclusive or tax-exclusive:

- **Tax-Exclusive** (default) — Price + Tax = Total
- **Tax-Inclusive** — Price includes tax

Most design studios use tax-exclusive pricing.

## Payment Methods

Configure accepted payment methods:

- Bank Transfer
- Credit/Card
- Check/Cheque
- Online Payment (Stripe, PayPal, etc.)
- Other

Selected methods appear on payment recording dropdown.

## Late Payment Fees

Enable late payment fees:

1. Toggle **Charge Late Fees**
2. Set fee type:
   - **Percentage** — % of invoice amount per month
   - **Fixed** — Flat fee per month
3. Set grace period (days after due date before fee applies)

Late fees auto-calculate on overdue invoices.

## Currency Settings

Set default currency (configured in General Settings).

Enable **Multi-Currency** to allow different currencies per transaction:

- Each invoice/PO can use a different currency
- Reports show currency conversions (using live exchange rates)

## Best Practices

- **Set numbering early** — Changing later can cause gaps in invoice numbers
- **Use Net 30 terms** — Industry standard for most design work
- **Enable PO approval** — For spending accountability
- **Clear payment instructions** — Make it easy for clients to pay
- **Consistent tax rate** — Update if your local rate changes

Finance settings streamline your invoicing workflow — configure them thoughtfully.`,
    screenshots: [
      "settings/finance-settings.png",
      "settings/invoice-numbering.png",
    ],
    related: ["general-settings", "creating-invoice", "purchase-orders"],
  },
  {
    slug: "team-management",
    title: "Team Management",
    description: "Adding, removing members, and managing roles",
    category: "settings",
    readTime: 3,
    lastUpdated: "2026-02-27",
    content: `# Team Management

Manage your studio team from the Team Management settings page.

## Accessing Team Management

Go to **Settings** → **Studio** → **Team**.

## Team Overview

See all studio members:

- **Name** and **Email**
- **Role** (Owner, Admin, Member, Guest)
- **Status** (Active, Invited, Inactive)
- **Date Added**
- **Last Active**

## Inviting Team Members

See the **Inviting Your Team** article for detailed invitation steps.

Quick summary:

1. Click **Invite Member**
2. Enter email and select role
3. Send invitation

## Changing Roles

Update a team member's role:

1. Click **⋯** menu next to their name
2. Select **Change Role**
3. Choose new role (Owner, Admin, Member, Guest)
4. Confirm

Role change takes effect immediately.

See **Roles & Permissions** article for detailed role descriptions.

## Deactivating Members

Temporarily disable access without removing member:

1. Click **⋯** menu
2. Select **Deactivate**
3. Confirm

Deactivated members:

- Cannot log in
- Retain all historical data
- Can be reactivated anytime

Useful for team members on extended leave.

## Removing Members

Permanently remove a team member:

1. Click **⋯** menu
2. Select **Remove from Studio**
3. Confirm

Removed members:

- Lose all access immediately
- Historical data (tasks created, etc.) remains
- Cannot be undone (but can be re-invited)

## Pending Invitations

See invitations not yet accepted:

- Invitee email
- Date invited
- Role assigned

### Resend or Cancel

- **Resend** — Send invitation email again
- **Cancel** — Revoke invitation

## Viewing Member Activity

Click any team member to see:

- Projects they're on
- Tasks assigned to them
- Recent activity
- Login history

## Best Practices

- **Audit team quarterly** — Remove inactive members
- **Use appropriate roles** — Don't over-assign permissions
- **Deactivate, don't remove** — For temporary leave
- **Communicate changes** — Let team know if roles change

Team management keeps your studio secure and organised — review it regularly.`,
    screenshots: ["settings/team-management.png", "settings/change-role.png"],
    related: ["inviting-team", "roles-permissions", "team-overview"],
  },
  {
    slug: "integrations",
    title: "Integrations",
    description: "Connecting Xero, Gmail, and other tools",
    category: "settings",
    readTime: 5,
    lastUpdated: "2026-02-27",
    content: `# Integrations

Connect Focuspilot with other tools you use to sync data and automate workflows.

## Accessing Integrations

Go to **Settings** → **Studio** → **Integrations**.

## Available Integrations

### Xero

Accounting software integration:

- **Sync Invoices** — Invoices created in Focuspilot sync to Xero
- **Sync Contacts** — Contacts sync between systems
- **Sync Payments** — Payment status updates

#### Connecting Xero

1. Click **Connect Xero**
2. Log into your Xero account
3. Authorize Focuspilot
4. Select sync preferences:
   - One-way (Focuspilot → Xero) or two-way
   - What to sync (invoices, contacts, payments)
5. Save

Once connected, invoices automatically create in Xero.

#### Disconnecting Xero

Click **Disconnect** to revoke access. Historical synced data remains in Xero.

### Gmail

Email integration:

- **Read emails** — View client emails in Focuspilot Inbox
- **Send from Focuspilot** — Send emails from Focuspilot using your Gmail
- **Link emails to projects** — Associate emails with projects

#### Connecting Gmail

1. Click **Connect Gmail**
2. Log into your Google account
3. Authorize Focuspilot to access Gmail
4. Choose sync options:
   - Sync all email or specific labels
   - Auto-link emails to projects (by client email)
5. Save

Emails appear in your Focuspilot Inbox.

#### Disconnecting Gmail

Click **Disconnect** to revoke access.

### Google Calendar

Sync Focuspilot calendar with Google Calendar:

- **Two-way sync** — Events sync between systems
- **Team calendars** — Sync team member calendars

#### Connecting Google Calendar

1. Click **Connect Google Calendar**
2. Authorize access
3. Choose calendars to sync
4. Save

Focuspilot events appear in Google Calendar and vice versa.

### QuickBooks (Coming Soon)

Accounting integration similar to Xero.

### Slack (Coming Soon)

Team chat integration for notifications.


## API Access

For custom integrations:

1. Go to **Settings** → **Studio** → **API**
2. Click **Generate API Key**
3. Copy API key
4. Use in your custom integration

See API documentation at docs.focuspilot.io.

## Webhook Setup

Receive webhooks for Focuspilot events:

1. Go to **Integrations** → **Webhooks**
2. Click **Add Webhook**
3. Enter webhook URL
4. Select events to listen for:
   - Invoice created
   - Task completed
   - Project status changed
5. Save

Your webhook endpoint receives POST requests for selected events.

## Best Practices

- **Connect accounting software** — Eliminate double entry of invoices
- **Sync email** — Centralize client communication
- **Use the API** — Automate repetitive workflows with custom integrations
- **Secure API keys** — Don't share API keys publicly

Integrations extend Focuspilot into your existing workflow — use them to save time.`,
    screenshots: [
      "settings/integrations.png",
      "settings/xero-connect.png",
      "settings/gmail-connect.png",
    ],
    related: ["creating-invoice", "inbox", "calendar"],
  },
  {
    slug: "templates",
    title: "Templates",
    description: "Document and email templates",
    category: "settings",
    readTime: 4,
    lastUpdated: "2026-02-27",
    content: `# Templates

Create reusable templates for proposals, invoices, emails, and other documents.

## Accessing Templates

Go to **Settings** → **Studio** → **Templates**.

## Template Types

### Proposal Templates

Reusable proposal structures:

- Save time when creating similar proposals
- Include standard scope of work, deliverables, terms

#### Creating a Proposal Template

1. Go to **CRM** → **Proposals**
2. Create a proposal with your standard sections
3. Click **Save as Template**
4. Name the template (e.g., "Residential Design Proposal")

#### Using a Proposal Template

1. Create new proposal
2. Click **Use Template**
3. Select template
4. Proposal pre-fills with template content
5. Customize for the specific client

### Invoice Templates

Customize invoice layout and default content:

- Invoice header style
- Default line item descriptions
- Default notes/terms

Edit in **Settings** → **Studio** → **Branding** and **Finance**.

### Email Templates

Customize emails sent from Focuspilot:

#### Invoice Email Template

Email sent when delivering invoices to clients.

1. Go to **Settings** → **Studio** → **Templates** → **Invoice Email**
2. Edit subject line and body
3. Use variables:
   - \`{client_name}\` — Client name
   - \`{invoice_number}\` — Invoice number
   - \`{amount}\` — Invoice total
   - \`{due_date}\` — Payment due date
4. Save

Example:
\`\`\`
Subject: Invoice {invoice_number} from [Your Studio]

Hi {client_name},

Please find attached Invoice {invoice_number} for \${amount}, due on {due_date}.

Thank you for your business!

Best regards,
[Your Studio]
\`\`\`

#### Reminder Email Template

Email sent when following up on overdue invoices.

Supports same variables as invoice email.

#### Proposal Email Template

Email sent when delivering proposals.

Variables:

- \`{client_name}\`
- \`{proposal_title}\`
- \`{valid_until}\`

### Project Templates

Create project templates for recurring project types:

1. Set up a project with standard structure:
   - Phases
   - Task templates
   - Document folders
2. Go to **Project Settings** → **Save as Template**
3. Name template (e.g., "Residential Renovation Project")

#### Using Project Templates

1. Click **New Project**
2. Select **Use Template**
3. Choose template
4. Project structure pre-populates
5. Customize for specific client

## Task Templates

Create reusable task checklists:

1. Go to any project → **Tasks**
2. Create a set of tasks
3. Select tasks and click **Save as Template**
4. Name template (e.g., "Design Phase Checklist")

#### Using Task Templates

1. In any project, click **Add Tasks from Template**
2. Select template
3. Tasks are added to project

Great for recurring workflows (e.g., every project needs the same 15 tasks).

## Best Practices

- **Create templates for common work** — Proposals, projects, task lists
- **Use variables in email templates** — Personalize without manual editing
- **Update templates annually** — Refresh content and pricing
- **Share templates with team** — Ensure consistency across team

Templates save massive amounts of time — invest in building a good library.`,
    screenshots: [
      "settings/templates.png",
      "settings/email-template.png",
      "settings/proposal-template.png",
    ],
    related: ["proposals", "creating-invoice", "creating-first-project"],
  },
  {
    slug: "audit-logs",
    title: "Audit Logs",
    description: "Viewing activity history and changes",
    category: "settings",
    readTime: 3,
    lastUpdated: "2026-02-27",
    content: `# Audit Logs

Audit Logs provide a complete history of actions taken in your Focuspilot studio.

## Accessing Audit Logs

Go to **Settings** → **Studio** → **Audit Logs**.

Only **Owners and Admins** can access audit logs.

## What is Logged?

Audit logs track:

### User Actions

- **Logins** — Who logged in, when, from where
- **Logouts** — Session ends
- **Failed login attempts** — Potential security issues

### Data Changes

- **Projects** — Created, updated, deleted, archived
- **Tasks** — Created, assigned, completed, deleted
- **Invoices** — Created, sent, paid, deleted
- **Purchase Orders** — Created, approved, sent
- **Team members** — Invited, role changed, removed

### Settings Changes

- **Studio settings** — Any changes to studio configuration
- **Integrations** — Connected or disconnected
- **Templates** — Created or modified

### Financial Actions

- **Payments recorded** — Who recorded payment, amount
- **Invoices sent** — Who sent, to whom
- **POs approved** — Who approved spending

## Viewing Audit Logs

Logs appear in reverse chronological order (newest first):

- **Timestamp** — When action occurred
- **User** — Who performed the action
- **Action Type** — What happened (created, updated, deleted, etc.)
- **Target** — What was affected (project name, invoice number, etc.)
- **Details** — Additional context

Click any log entry to see full details.

## Filtering Audit Logs

Filter logs to find specific actions:

### By Date Range

- Today
- Last 7 days
- Last 30 days
- Custom date range

### By User

Show only actions by a specific team member.

### By Action Type

- User actions
- Data changes
- Settings changes
- Financial actions

### By Search

Search for specific items (e.g., search "Invoice #123" to see all actions related to that invoice).

## Exporting Audit Logs

Export logs for compliance or external review:

1. Apply desired filters
2. Click **Export**
3. Choose format (CSV, PDF)
4. Download

## Use Cases

### Security Monitoring

Review failed login attempts and unusual activity.

### Compliance

Maintain audit trail for financial or regulatory compliance.

### Dispute Resolution

See who made a change if there's confusion (e.g., "Who deleted this task?").

### Performance Review

Review team member activity for productivity assessments.

## Best Practices

- **Review monthly** — Check audit logs for unusual activity
- **Export for compliance** — If your industry requires audit trails
- **Monitor failed logins** — Could indicate security issue
- **Don't rely solely on logs** — Communicate changes to team directly

Audit logs provide accountability and transparency — use them to keep your studio secure.`,
    screenshots: ["settings/audit-logs.png", "settings/audit-detail.png"],
    related: ["security", "team-management", "general-settings"],
  },
];
