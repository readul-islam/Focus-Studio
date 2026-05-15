import { HelpArticle } from '../types';

export const financeArticles: HelpArticle[] = [
  {
    slug: 'finance-overview',
    title: 'Finance Overview',
    description: 'Understanding invoices, purchase orders, and financial tracking',
    category: 'finance',
    readTime: 4,
    lastUpdated: '2026-02-27',
    content: `# Finance Overview

Techstyles Finance helps you manage invoicing, track expenses, and monitor studio profitability.

## Finance Features

### Invoices

Create and send professional invoices to clients:

- Itemized line items
- Tax/VAT calculations
- PDF generation
- Email delivery
- Payment tracking

### Purchase Orders

Manage procurement spending:

- Create POs for suppliers
- Approval workflows (optional)
- Track PO status
- Link to projects

### Financial Reports

Analyze studio finances:

- Revenue by project
- Outstanding invoices
- Expense tracking
- Profitability margins

## Accessing Finance

Click **Finance** in the sidebar to access:

- **Invoices** — All client invoices
- **Purchase Orders** — All procurement orders

## Finance Dashboard

Top-level metrics:

- **Total Invoiced** (This Month)
- **Outstanding** — Unpaid invoice total
- **Total Expenses** — Purchase orders issued
- **Net Revenue** — Invoiced minus expenses

## Project-Level Finance

Each project also has a Finance tab showing:

- Project-specific invoices
- Project-specific purchase orders
- Project budget vs. actual
- Profitability

## Integrations

Connect accounting software:

- **Xero** — Sync invoices and expenses
- **QuickBooks** — (Coming soon)

Go to **Settings** → **Integrations** to connect.

## Best Practices

- **Invoice promptly** — Bill clients as work completes
- **Track payments** — Update invoice status when paid
- **Use POs for all spending** — Document every expense
- **Review financials weekly** — Stay on top of cash flow
- **Link to projects** — Always associate invoices and POs with projects

Finance visibility keeps your studio profitable — monitor it closely.`,
    screenshots: ['finance/finance-dashboard.png'],
    related: ['creating-invoice', 'purchase-orders', 'project-finance'],
  },
  {
    slug: 'creating-invoice',
    title: 'Creating an Invoice',
    description: 'Step-by-step guide to creating and sending invoices',
    category: 'finance',
    readTime: 5,
    lastUpdated: '2026-02-27',
    content: `# Creating an Invoice

Invoices are how you bill clients for your work. Techstyles generates professional, branded invoices with full tracking.

## Creating an Invoice

### From Finance Page

1. Go to **Finance** → **Invoices**
2. Click **+ New Invoice**

### From Project Finance

1. Go to a project → **Finance** tab
2. Click **+ New Invoice**
3. Client auto-populates from project

## Invoice Details

### Client Information

- **Client** — Select from contacts (auto-filled if from project)
- **Billing Address** — Client's address
- **Email** — Where invoice will be sent

### Invoice Settings

- **Invoice Number** — Auto-generated, can customise
- **Invoice Date** — Date of issue
- **Due Date** — Payment deadline (auto-calculated from payment terms)
- **Currency** — Default is studio currency
- **Tax Rate** — VAT or sales tax % (from settings)

### Payment Terms

Select payment terms:

- **Net 7** — Due in 7 days
- **Net 15** — Due in 15 days
- **Net 30** — Due in 30 days (standard)
- **Due on Receipt** — Immediate payment
- **Custom** — Set custom due date

Due date auto-calculates based on terms.

## Adding Line Items

Each invoice line item includes:

- **Description** — What you're billing for (e.g., "Design Fee - Concept Phase")
- **Quantity** — Number of units
- **Unit Price** — Price per unit
- **Tax** — Apply tax rate (toggle per line item)
- **Total** — Auto-calculated (Quantity × Unit Price + Tax)

### Quick Add Line Items

- Click **+ Add Line Item**
- Enter details
- Repeat for multiple items

### Import from Time Tracking

If you track time on tasks:

1. Click **Import from Time**
2. Select date range
3. Time entries convert to line items (hours × hourly rate)

### Import from Expenses

Bill back project expenses:

1. Click **Import from Expenses**
2. Select purchase orders marked as "Billable"
3. PO line items import to invoice

## Invoice Totals

Invoice automatically calculates:

- **Subtotal** — Sum of line items before tax
- **Tax** — Tax amount
- **Total** — Final amount due

## Invoice Notes

Add notes at the bottom:

- Payment instructions (bank details, online payment link)
- Terms and conditions
- Thank you message

Use default notes from **Settings** → **Studio** → **Finance** or customise per invoice.

## Previewing Invoice

Click **Preview** to see the PDF invoice as the client will see it.

Includes:

- Your studio logo and branding
- Client and studio details
- Line items table
- Totals and tax breakdown
- Payment terms and notes

## Saving as Draft

If not ready to send:

1. Click **Save as Draft**
2. Invoice saved but not sent
3. Edit anytime before sending

## Sending the Invoice

When ready:

1. Click **Send Invoice**
2. Email is sent to client with:
   - PDF invoice attached
   - Payment link (if online payment enabled)
   - Personalized message
3. Invoice status changes to **Sent**

### Email Customization

Before sending, you can customise:

- Email subject line
- Email message body

Use the default template or personalize.

## Invoice Status

- **Draft** — Not yet sent
- **Sent** — Emailed to client, awaiting payment
- **Viewed** — Client opened the invoice (if tracking enabled)
- **Partially Paid** — Partial payment received
- **Paid** — Fully paid
- **Overdue** — Past due date, not paid

Status updates automatically (or manually when recording payments).

## Recording Payments

When client pays:

1. Open the invoice
2. Click **Record Payment**
3. Enter:
   - **Payment Amount**
   - **Payment Date**
   - **Payment Method** (Bank transfer, credit card, check, etc.)
   - **Reference** (Transaction ID or check number)
4. Click **Save**

Invoice status updates to **Paid** (or **Partially Paid** if not full amount).

## Sending Reminders

For overdue invoices:

1. Open the invoice
2. Click **Send Reminder**
3. Automated reminder email sent to client

Configure reminder email template in **Settings** → **Studio** → **Templates**.

## Best Practices

- **Itemize clearly** — Break down charges for client transparency
- **Include payment details** — Make it easy for clients to pay
- **Send promptly** — Invoice as soon as work is complete
- **Follow up on overdue** — Send reminders for unpaid invoices
- **Link to projects** — Always associate invoices with projects

Invoicing is your revenue lifeline — keep it professional and timely.`,
    screenshots: ['finance/invoice-editor.png', 'finance/invoice-preview.png', 'finance/invoice-send.png'],
    related: ['sending-invoice', 'project-finance', 'finance-overview'],
  },
  {
    slug: 'sending-invoice',
    title: 'Sending an Invoice',
    description: 'Email delivery, PDF generation, and payment tracking',
    category: 'finance',
    readTime: 3,
    lastUpdated: '2026-02-27',
    content: `# Sending an Invoice

Once your invoice is ready, send it to your client via email with a professional PDF attachment.

## How to Send

1. Open the invoice (or create new invoice)
2. Click **Send Invoice** button
3. Review email details:
   - **To:** Client email (pre-filled)
   - **Subject:** Invoice number and studio name
   - **Message:** Personalized message
4. Click **Send**

Invoice is emailed immediately.

## What the Client Receives

### Email

The client receives an email containing:

- Your personalized message
- Invoice summary (number, amount, due date)
- PDF invoice attachment
- Payment link (if online payment enabled)
- "View Invoice Online" link (if client portal enabled)

### PDF Invoice

The attached PDF includes:

- Your studio logo and branding
- Invoice number and date
- Client billing details
- Itemized line items
- Tax breakdown
- Total amount due
- Payment terms and instructions

## Email Customization

Before sending, customise the email:

- **Subject line** — Default: "Invoice #123 from YourStudio"
- **Message body** — Personalize with project context

Example message:
> Hi [Client Name],
>
> Thank you for working with us on your kitchen project. Attached is Invoice #123 for the design phase, due on [Date].
>
> Please let us know if you have any questions!
>
> Best regards,
> [Your Studio]

## Invoice Tracking

Once sent, Techstyles tracks:

- **Sent Date** — When invoice was emailed
- **Viewed** — If/when client opened the invoice (email tracking)
- **Payment Status** — Paid, partially paid, or overdue

View tracking details in the invoice record.

## Resending an Invoice

If client didn't receive or lost the invoice:

1. Open the invoice
2. Click **Resend**
3. Confirm recipient email
4. Click **Send**

New email sent with same invoice.

## Online Payment Links

If you've enabled online payment (Stripe, PayPal, etc.):

- Payment link included in email
- Client clicks link and pays instantly
- Payment syncs to Techstyles automatically
- Invoice status updates to **Paid**

Enable online payments in **Settings** → **Studio** → **Integrations**.

## Invoice Reminders

For unpaid invoices past due date:

1. Techstyles auto-flags as **Overdue**
2. You can manually send reminders:
   - Open invoice
   - Click **Send Reminder**
   - Reminder email sent

Configure reminder frequency in **Settings** → **Studio** → **Finance**.

## Viewing Sent Invoices

All sent invoices appear in **Finance** → **Invoices** with:

- Invoice number
- Client
- Amount
- Status (Sent, Paid, Overdue)
- Due date

Click any invoice to view details or resend.

## Best Practices

- **Personalize emails** — Add project context to email message
- **Include payment instructions** — Make it easy to pay
- **Send on time** — Invoice promptly after work completes
- **Follow up** — Check in if no payment 3 days before due date
- **Thank clients** — Send a thank-you note when payment received

Professional invoicing strengthens client relationships — make every invoice count.`,
    screenshots: ['finance/send-invoice.png', 'finance/invoice-email.png'],
    related: ['creating-invoice', 'finance-overview', 'integrations'],
  },
  {
    slug: 'purchase-orders',
    title: 'Purchase Orders',
    description: 'Creating, approving, and tracking procurement spending',
    category: 'finance',
    readTime: 5,
    lastUpdated: '2026-02-27',
    content: `# Purchase Orders

Purchase Orders (POs) help you document and track spending with suppliers and contractors.

## What is a Purchase Order?

A PO is a formal document sent to a supplier authorizing them to:

- Supply specific products or services
- At agreed-upon prices
- With defined delivery terms

POs create a record of committed spending before payment.

## Creating a Purchase Order

### From Finance Page

1. Go to **Finance** → **Purchase Orders**
2. Click **+ New PO**

### From Project Finance

1. Go to a project → **Finance** tab
2. Click **+ New Purchase Order**
3. PO is auto-linked to project

### From Procurement

1. Go to project → **Procurement** tab
2. Select items
3. Click **Create PO**
4. Items become PO line items

## PO Details

### Supplier Information

- **Supplier** — Select from contacts or create new
- **Supplier Address**
- **Supplier Email**

### PO Settings

- **PO Number** — Auto-generated, customizable
- **PO Date** — Date of issue
- **Delivery Date** — Expected delivery
- **Project** — Link to project (if applicable)
- **Currency** — Default is studio currency

### Payment Terms

- Net 30, Net 60, etc.
- Due on delivery
- Custom terms

## Adding Line Items

Each PO line item:

- **Description** — Product or service
- **Quantity**
- **Unit Price**
- **Total** — Auto-calculated
- **Billable** — Toggle if you'll bill this back to client

## PO Totals

Automatically calculates:

- **Subtotal** — Sum of line items
- **Tax** (if applicable)
- **Total** — Final PO amount

## Saving as Draft

If not ready to send:

1. Click **Save as Draft**
2. Edit anytime before sending

## Sending the PO

When ready:

1. Click **Send PO**
2. Email sent to supplier with PDF PO attached
3. PO status changes to **Sent**

## PO Approval Workflow

If enabled in **Settings** → **Studio** → **Finance**:

1. User creates PO as **Draft**
2. User submits for **Approval**
3. Admin/Owner reviews and **Approves** or **Rejects**
4. If approved, PO can be sent to supplier

This prevents unauthorized spending.

## PO Status

- **Draft** — Not yet sent
- **Pending Approval** — Awaiting approval
- **Approved** — Approved, ready to send
- **Sent** — Sent to supplier
- **Received** — Goods/services delivered
- **Completed** — PO closed

## Receiving Goods

When goods arrive:

1. Open the PO
2. Click **Mark as Received**
3. Optionally upload delivery receipt or photos
4. PO status updates to **Received**

## Linking POs to Invoices

If a PO line item is marked **Billable**:

1. Create an invoice for the client
2. Click **Import from Expenses**
3. Select the PO line items
4. Items import to invoice

This allows you to pass through costs to the client.

## PO Reports

View spending reports:

- **Total POs Issued** — This month, quarter, year
- **By Supplier** — Spending per supplier
- **By Project** — Spending per project
- **Pending POs** — Awaiting delivery or completion

Access in **Reports** → **Cost Reports**.

## Best Practices

- **Use POs for all spending** — Even small purchases
- **Get supplier confirmation** — Ensure supplier received PO
- **Track delivery** — Update status when goods arrive
- **Mark billable items** — If passing costs to client
- **Enable approval workflow** — For spending accountability

POs keep spending organised and transparent — use them consistently.`,
    screenshots: ['finance/purchase-order-editor.png', 'finance/po-preview.png', 'finance/po-list.png'],
    related: ['project-finance', 'project-procurement', 'finance-overview'],
  },
  {
    slug: 'project-finance-tracking',
    title: 'Project Finance Tracking',
    description: 'Linking invoices to projects and tracking profitability',
    category: 'finance',
    readTime: 4,
    lastUpdated: '2026-02-27',
    content: `# Project Finance Tracking

Every invoice and purchase order can be linked to a project, enabling project-level financial tracking and profitability analysis.

## Why Link Finances to Projects?

- **Profitability visibility** — See if each project is profitable
- **Budget tracking** — Compare actual spending to budget
- **Client billing** — Bill back project expenses
- **Financial reporting** — Analyze project-level finances

## Linking Invoices to Projects

### When Creating Invoice

1. Create a new invoice
2. In the **Project** dropdown, select the project
3. Invoice is now associated with that project

### For Existing Invoices

1. Open the invoice
2. Edit **Project** field
3. Select project
4. Save

Invoice now appears in project's Finance tab.

## Linking Purchase Orders to Projects

### When Creating PO

1. Create a new PO
2. Select **Project** from dropdown
3. PO is linked to project

### From Project Procurement

POs created from project procurement are auto-linked.

## Viewing Project Finances

Go to any project → **Finance** tab to see:

### Financial Overview

- **Total Budget** — Project budget
- **Invoiced** — Total billed to client
- **Paid** — Payments received
- **Expenses** — Total POs issued
- **Profit** — Invoiced - Expenses
- **Margin** — Profit as % of invoiced amount

### Project Invoices

List of all invoices for this project.

### Project Purchase Orders

List of all POs for this project.

## Budget vs. Actual

The Finance overview compares:

- **Budgeted** — Total project budget
- **Actual** — Invoiced + Expenses

If actual exceeds budget, you see a red alert.

## Budget Alerts

Enable alerts in **Project Settings** → **Finance**:

1. Toggle **Budget Alerts**
2. Set threshold (e.g., 80% of budget)
3. Receive notification when spending reaches threshold

## Profitability Tracking

See real-time project profitability:

**Profit = Total Invoiced - Total Expenses**

**Margin % = (Profit / Total Invoiced) × 100**

A healthy margin is typically 30-50% for design projects.

### Profitability by Phase

If you track expenses and invoices by project phase, you can see:

- Which phases are most profitable
- Where cost overruns occur
- Opportunities to optimise pricing

## Billable Expenses

Mark PO line items as **Billable** to pass costs to client:

1. Create PO
2. Toggle **Billable** on line items
3. When invoicing client, import billable expenses
4. Client pays for products + markup (if applicable)

## Financial Reports

Analyze project finances across all projects:

1. Go to **Reports** → **Profitability**
2. See:
   - Profitability by project
   - Margin trends
   - Revenue vs. expenses over time

Identify which project types are most profitable.

## Best Practices

- **Link every invoice and PO** — Always associate with a project
- **Review project finances weekly** — Stay on top of budget
- **Set budget alerts** — Get warned before overspending
- **Track billable expenses** — Ensure client pays for project costs
- **Analyze margins** — Learn from profitable and unprofitable projects

Project financial tracking is essential for studio profitability — monitor it diligently.`,
    screenshots: ['finance/project-finance-overview.png', 'finance/budget-tracking.png'],
    related: ['project-finance', 'creating-invoice', 'purchase-orders', 'profitability-reports'],
  },
];
