import { HelpArticle } from '../types';

export const projectsArticles: HelpArticle[] = [
  {
    slug: "projects-overview",
    title: "Projects Overview",
    description:
      "Understanding the project list, creating projects, and project status",
    category: "projects",
    readTime: 4,
    lastUpdated: "2026-02-27",
    content: `# Projects Overview

Projects are the heart of Focuspilot — each project represents a client engagement with all its tasks, documents, finances, and team collaboration.

## The Projects Page

Access **Projects** from the sidebar to see your full project list.

### Project List View

Each project card displays:

- **Project name** and client
- **Status** — Lead, Active, On Hold, or Completed
- **Progress** — Task completion percentage
- **Budget vs. Actual** — Financial overview
- **Team members** — Avatars of assigned team
- **Last activity** — When the project was last updated

### Filtering Projects

Use filters to narrow your view:

- **By Status** — Show only Active, Leads, etc.
- **By Client** — Filter to specific client
- **By Team Member** — Projects where specific people are assigned
- **By Date** — Projects starting or ending in a date range

### Sorting Projects

Sort by:

- **Last Updated** (default) — Most recently active first
- **Name** — Alphabetical
- **Start Date** — Newest projects first
- **Budget** — Highest budget first

## Creating a New Project

Click **+ New Project** to create a project:

1. **Enter basic details**
   - Project name
   - Client (select from CRM or create new)
   - Project type
   - Status

2. **Set dates and budget**
   - Start and end dates
   - Total budget
   - Billing type

3. **Assign team members**
   - Select from your studio team
   - Assign project roles

4. **Add description**
   - Project scope summary
   - Key deliverables

5. Click **Create Project**

You're taken to the new project dashboard.

## Project Statuses

### Lead

Potential project not yet confirmed. Use this for proposals in progress.

### Active

Project is underway. This is where most work happens.

### On Hold

Project paused temporarily. Tasks don't appear in active lists.

### Completed

Project finished. Historical data preserved but no longer in active view.

### Archived

Fully archived project. Hidden from standard lists (accessible via filters).

## Project Dashboard

Once in a project, you see:

- **Overview Cards** — Task count, budget status, team members
- **Recent Activity** — Latest updates
- **Quick Actions** — Add task, upload doc, create invoice
- **Navigation Tabs** — Tasks, Docs, Messages, Finance, etc.

## Project Navigation Tabs

Each project has these sections:

- **Overview** — Dashboard summary
- **Tasks** — Project tasks and to-dos
- **Docs** — Documents and notes
- **Messages** — Team communication
- **Finance** — Invoices and purchase orders
- **Procurement** — Product procurement tracking
- **Contractors** — Contractor management
- **Plan** — Project phases and timeline
- **Calendar** — Project-specific calendar
- **Settings** — Project configuration

## Favoriting Projects

Click the **star icon** to favourite frequently accessed projects. Favorites appear at the top of your project list.

## Archiving Projects

When a project ends:

1. Change status to **Completed**
2. Optionally **Archive** the project (Settings → Archive)

Archived projects are hidden from default views but remain searchable and accessible.

## Best Practices

- **Keep statuses updated** — Move projects through Lead → Active → Completed
- **Use descriptive names** — Include client name and project type
- **Regular reviews** — Weekly scan of all active projects
- **Archive old projects** — Keep your project list focused on current work

Projects keep your studio organised — treat them as your single source of truth for each client engagement.`,
    screenshots: [
      "projects/projects-list.png",
      "projects/project-dashboard.png",
    ],
    related: ["creating-first-project", "project-settings", "project-plan"],
  },
  {
    slug: "project-tasks",
    title: "Project Tasks",
    description:
      "Creating tasks, assigning team members, due dates, and status tracking",
    category: "projects",
    readTime: 5,
    lastUpdated: "2026-02-27",
    content: `# Project Tasks

Tasks are the actionable work items within a project. Use them to break down project deliverables and track progress.

## Viewing Project Tasks

Navigate to any project and click the **Tasks** tab.

### Task List View

Tasks appear in a list showing:

- **Task title** — What needs to be done
- **Assignee** — Who's responsible (avatar)
- **Due date** — When it's due
- **Status** — To Do, In Progress, or Completed
- **Priority** — High, Medium, Low

### Grouping Tasks

Group tasks by:

- **Status** — Grouped into To Do, In Progress, Completed columns (Kanban view)
- **Assignee** — Grouped by team member
- **Phase** — Grouped by project phase
- **Due Date** — Grouped by week/month

## Creating a Task

### Quick Create

1. Click **+ New Task**
2. Enter task title
3. Press Enter

The task is added with default settings.

### Full Task Form

For more control:

1. Click **+ New Task**
2. Fill in:
   - **Title** — Clear, action-oriented description
   - **Description** — Additional details or context
   - **Assignee** — Select a team member
   - **Due Date** — Set a deadline
   - **Priority** — High, Medium, or Low
   - **Phase** — Link to project phase (optional)
   - **Estimated Time** — How long it will take (optional)
3. Click **Create Task**

## Editing Tasks

Click any task to open its detail panel:

- Update title or description
- Change assignee
- Adjust due date
- Update status
- Add comments
- Attach files
- Log time (if time tracking enabled)

Changes save automatically.

## Task Status

### To Do

Task not yet started. Default status for new tasks.

### In Progress

Task actively being worked on. Assignee should update to this status when they start.

### Completed

Task finished. Completed tasks move to the bottom or are hidden (depending on view settings).

### Blocked

(Optional status) Task cannot proceed due to dependency or external issue.

## Task Priority

Set priority to indicate urgency:

- **High** — Red flag, urgent work
- **Medium** — Standard priority
- **Low** — Nice-to-have, not urgent

High-priority tasks appear at the top of lists and trigger earlier deadline reminders.

## Assigning Tasks

### To Team Members

Select any team member assigned to the project. They receive a notification and the task appears on their **My Tasks** page.

### To Multiple People

You can assign a task to multiple people if work is collaborative.

### Unassigned Tasks

Leave tasks unassigned if they're placeholders or not yet ready to be worked on.

## Task Dependencies

You can mark tasks as dependent on others:

1. Open task detail
2. Click **Add Dependency**
3. Select the task that must be completed first

Dependent tasks show a link icon and can't be completed until their dependency is done.

## Bulk Actions

Select multiple tasks (checkbox on left) to:

- Assign to same person
- Set same due date
- Change status in bulk
- Move to different phase
- Delete multiple tasks

## Subtasks

Break large tasks into smaller pieces:

1. Open a task
2. Click **Add Subtask**
3. Enter subtask title
4. Repeat for additional subtasks

Parent task completion percentage is calculated from subtask completion.

## Task Comments

Collaborate on tasks via comments:

1. Open task detail
2. Scroll to **Comments** section
3. Type your comment
4. **@mention** team members to notify them
5. Post comment

Comments create an activity trail for the task.

## Task Attachments

Attach relevant files:

1. Open task detail
2. Click **Attach File**
3. Upload from your device or link from project docs

Attachments appear in the task detail panel.

## Time Tracking

If enabled, you can track time on tasks:

1. Open task
2. Click **Start Timer**
3. Timer runs while you work
4. Click **Stop** when done

Time logs appear on reports and can be billed.

## Best Practices

- **Clear titles** — Use action verbs ("Design mood board", "Draft proposal")
- **Assign responsibly** — One primary owner per task
- **Set realistic due dates** — Factor in dependencies and team capacity
- **Update status in real-time** — Keep the task board current
- **Comment frequently** — Document decisions and progress
- **Break down large tasks** — If a task takes >8 hours, split it into subtasks

Tasks drive project execution — keep them organised and up to date.`,
    screenshots: [
      "projects/tasks-list.png",
      "projects/task-detail.png",
      "projects/kanban.png",
    ],
    related: ["my-tasks", "project-plan", "time-tracking"],
  },
  {
    slug: "project-docs",
    title: "Project Docs",
    description: "Notes, folders, file uploads, and document organization",
    category: "projects",
    readTime: 4,
    lastUpdated: "2026-02-27",
    content: `# Project Docs

The **Docs** section is your project's knowledge repository — store notes, files, contracts, drawings, and any project-related documentation.

## Accessing Project Docs

Go to any project and click the **Docs** tab.

## Document Types

### Notes

Rich-text notes for:

- Meeting minutes
- Design concepts
- Client feedback
- Project planning

### Files

Upload any file type:

- PDFs (contracts, drawings)
- Images (photos, mood boards)
- Spreadsheets (budgets, schedules)
- CAD files, presentations, etc.

### Folders

Organize docs into folders:

- Client Communications
- Contracts
- Drawings
- Mood Boards
- Specifications

## Creating a Note

1. Click **+ New Note**
2. Enter note title
3. Write content using the rich-text editor:
   - **Bold**, *italic*, formatting
   - Bullet and numbered lists
   - Headers (H1, H2, H3)
   - Links
   - Code blocks (if needed)
4. Changes save automatically

### Note Sharing

Notes can be:

- **Private** — Only you can see
- **Team** — All project team members can view/edit
- **Client** — Shared with client (via client portal, if enabled)

Set sharing via the note settings menu.

## Uploading Files

### Drag and Drop

Drag files from your desktop directly into the Docs area. They upload automatically.

### Manual Upload

1. Click **+ Upload File**
2. Select files from your device
3. Choose destination folder (optional)
4. Click **Upload**

### File Preview

Click any file to preview:

- **Images** — Full-size preview
- **PDFs** — In-browser PDF viewer
- **Documents** — Rendered preview (if supported)

Download files by clicking the **download icon**.

## Creating Folders

Organize docs with folders:

1. Click **+ New Folder**
2. Enter folder name
3. Optionally nest inside another folder
4. Click **Create**

Drag and drop docs between folders to reorganize.

## Search Documents

Use the search bar to find docs by:

- File name
- Note content
- Folder name
- Date uploaded

Results highlight matching text.

## File Versions

Focuspilot tracks file versions:

- Upload a file with the same name to create a new version
- Previous versions are preserved
- View version history by clicking a file → **Versions** tab

Roll back to a previous version if needed.

## Document Permissions

Control who can view or edit docs:

### Team Access

By default, all project team members can:

- View all docs
- Upload files
- Create notes

### Restricted Access

Mark specific docs as restricted:

1. Click doc settings (⋯ menu)
2. Select **Permissions**
3. Choose who can view/edit
4. Save

### Client Access

If client portal is enabled, you can share specific docs with clients.

## Linking Docs to Tasks

Attach documents to tasks:

1. Open a task
2. Click **Attach Document**
3. Select from existing project docs
4. The doc appears in task details

This creates context for task execution.

## External Integrations

### Google Drive

Link your Google Drive:

1. Go to **Settings** → **Integrations**
2. Connect Google Drive
3. Files in Drive can be linked into Focuspilot docs

### Dropbox

Similar integration available for Dropbox.

## Best Practices

- **Folder structure** — Set up a consistent folder system for all projects
- **Naming conventions** — Use clear, descriptive file names with dates
- **Version control** — Always upload new versions rather than deleting old files
- **Tag important docs** — Use favorites or labels for critical documents
- **Regular cleanup** — Archive outdated docs to keep things tidy

Your project docs are the project's memory — keep them organised and accessible.`,
    screenshots: [
      "projects/docs-list.png",
      "projects/note-editor.png",
      "projects/file-preview.png",
    ],
    related: ["project-messages", "project-tasks", "integrations"],
  },
  {
    slug: "project-messages",
    title: "Project Messages",
    description: "Internal project chat and team communication",
    category: "projects",
    readTime: 3,
    lastUpdated: "2026-02-27",
    content: `# Project Messages

Each project has its own **Messages** channel for team communication specific to that project.

## Accessing Messages

Go to any project and click the **Messages** tab.

## How Project Messages Work

### Team Chat

Project messages are a threaded chat for the project team:

- All team members assigned to the project can see messages
- Real-time updates (no page refresh needed)
- Notifications sent to team members

### Difference from Inbox

- **Inbox** = Studio-wide messages and notifications
- **Project Messages** = Project-specific team chat

## Sending a Message

1. Type your message in the input box
2. Press **Enter** to send

Messages appear instantly for all team members.

## Message Formatting

Use simple formatting:

- ****Bold**** renders as **Bold**
- ***Italic*** renders as *Italic*
- \`'Code'\` renders as \`Code\`
- Links auto-detect and become clickable

## @Mentions

Notify specific team members:

1. Type **@** followed by their name
2. Select from the dropdown
3. They receive a notification even if not actively viewing the project

Use mentions to get someone's attention on urgent items.

## Attachments

Attach files to messages:

1. Click the **paperclip icon**
2. Upload a file or link from project docs
3. The file appears inline in the message

Great for sharing images, PDFs, or quick docs.

## Replying to Messages

Hover over a message and click **Reply** to create a threaded response. Threads keep conversations organised.

## Message Reactions

React to messages with emojis:

- Hover over message
- Click **emoji icon**
- Choose emoji

Quick way to acknowledge without adding a full reply.

## Pinning Messages

Pin important messages:

1. Hover over message
2. Click **⋯** menu
3. Select **Pin Message**

Pinned messages appear at the top of the channel for easy reference.

## Message Search

Search project messages:

1. Click the **search icon** (top right)
2. Enter search terms
3. Results show matching messages with context

Search across all messages in the project.

## Editing and Deleting

### Edit Message

1. Hover over your message
2. Click **⋯** menu
3. Select **Edit**
4. Update text and save

Edited messages show an *(edited)* label.

### Delete Message

1. Hover over your message
2. Click **⋯** menu
3. Select **Delete**
4. Confirm deletion

Only you can delete your own messages (unless you're a project admin).

## Notifications

You're notified when:

- Someone @mentions you
- A new message is posted (if notifications enabled)
- Someone replies to your message

Control notification settings in **Settings** → **User** → **Notifications**.

## Message History

All project messages are preserved:

- Scroll up to view older messages
- Search to find specific past discussions
- Messages remain even if team members leave the project

## Best Practices

- **Use messages for quick comms** — Short updates, questions, clarifications
- **Use Docs for permanent info** — Meeting notes, decisions, specifications
- **@mention for urgency** — Get someone's attention immediately
- **Be concise** — Keep messages short and to the point
- **Use threads** — Reply to specific messages to keep conversations organised

Project messages keep your team aligned — use them for real-time collaboration.`,
    screenshots: ["projects/messages.png", "projects/message-thread.png"],
    related: ["inbox", "project-docs", "project-tasks"],
  },
  {
    slug: "project-finance",
    title: "Project Finance",
    description:
      "Project-specific invoices, purchase orders, and budget tracking",
    category: "projects",
    readTime: 5,
    lastUpdated: "2026-02-27",
    content: `# Project Finance

The **Finance** tab in each project shows all financial activity related to that project — invoices sent to clients and purchase orders for project expenses.

## Accessing Project Finance

Go to any project and click the **Finance** tab.

## What You See

### Financial Overview

Top cards show:

- **Total Budget** — Project budget amount
- **Invoiced** — Total billed to client
- **Paid** — Payments received
- **Expenses** — Total purchase orders issued
- **Profit Margin** — Revenue minus expenses

### Invoices Section

List of all invoices linked to this project:

- Invoice number and date
- Amount
- Status (Draft, Sent, Paid, Overdue)
- Client name

### Purchase Orders Section

List of all purchase orders for this project:

- PO number and date
- Supplier
- Amount
- Status (Draft, Sent, Approved, Received)

## Creating a Project Invoice

1. Click **+ New Invoice**
2. Client auto-populates from project
3. Add line items:
   - Description (e.g., "Design Fee - Phase 1")
   - Quantity
   - Unit price
   - Tax rate
4. Review totals
5. **Save as Draft** or **Send to Client**

### Invoice Line Items

You can add:

- **Custom line items** — Manual entry
- **From tasks** — Bill time tracked on tasks
- **From expenses** — Bill back purchase order costs (if marked as billable)

### Invoice Status

- **Draft** — Not yet sent, editable
- **Sent** — Emailed to client, awaiting payment
- **Paid** — Payment received
- **Overdue** — Past due date, payment not received

## Creating a Purchase Order

1. Click **+ New Purchase Order**
2. Select **Supplier** (or create new)
3. Add line items:
   - Product or service description
   - Quantity
   - Unit price
4. Mark as **Billable** if passing cost to client
5. **Save as Draft** or **Send to Supplier**

### PO Approval Workflow

If enabled in settings, POs require approval before sending:

1. Create PO as Draft
2. Submit for approval
3. Admin/Owner approves
4. PO sent to supplier

## Budget Tracking

The Finance overview compares:

- **Budgeted** — Total project budget
- **Actual** — Invoiced + expenses

If actual exceeds budget, cards show red warning.

### Budget Alerts

Set up budget alerts:

1. Go to **Project Settings** → **Finance**
2. Enable **Budget Alerts**
3. Set threshold (e.g., 80% of budget)
4. You'll receive notification when threshold is reached

## Profitability Tracking

See real-time profit margin:

**Profit = Invoiced - Expenses**

Helps you understand if project is financially healthy.

### Profitability Reports

For deeper analysis, go to **Reports** → **Profitability** to see project-by-project breakdown.

## Payment Tracking

When a client pays an invoice:

1. Open the invoice
2. Click **Record Payment**
3. Enter payment amount and date
4. Select payment method
5. Save

Invoice status updates to **Paid** (or **Partially Paid** if not full amount).

## Linking Invoices to Projects

If you create an invoice from the main **Finance** page (not within a project):

- You can link it to a project via the **Project** dropdown
- This associates the invoice with project financials

## Exporting Financial Data

Export project finance data:

1. Click **Export** (top right)
2. Choose format (CSV, PDF)
3. Select date range
4. Download

Useful for accounting or client reporting.

## Best Practices

- **Link all invoices to projects** — Ensures accurate profitability tracking
- **Mark billable expenses** — Pass through costs to client where appropriate
- **Track payments promptly** — Update invoice status when paid
- **Review budget weekly** — Stay on top of project financial health
- **Use PO approval** — Prevent unauthorized spending on projects

Project finance visibility keeps projects profitable — monitor it regularly.`,
    screenshots: [
      "projects/finance-overview.png",
      "projects/invoice.png",
      "projects/purchase-order.png",
    ],
    related: ["creating-invoice", "purchase-orders", "profitability-reports"],
  },
  {
    slug: "project-procurement",
    title: "Project Procurement",
    description:
      "Managing procurement items, tracking costs, and coordinating deliveries",
    category: "projects",
    readTime: 4,
    lastUpdated: "2026-02-27",
    content: `# Project Procurement

The **Procurement** tab helps you manage product sourcing, ordering, and delivery for your projects.

## Accessing Procurement

Go to any project and click the **Procurement** tab.

## What is Procurement?

Procurement tracks items you need to source and purchase for a project:

- Furniture
- Lighting
- Materials
- Fixtures
- Accessories

It's your procurement shopping list and order tracker.

## Adding Procurement Items

### From Library

1. Click **+ Add from Library**
2. Search your product library
3. Select product(s)
4. Enter quantity needed
5. Click **Add**

Product details (cost, supplier, lead time) import automatically.

### Manual Entry

1. Click **+ New Item**
2. Enter:
   - Product name
   - Supplier
   - Quantity
   - Unit cost
   - Lead time
   - Notes
3. Click **Save**

### Via AI Clipper

Use the AI Clipper Chrome extension to add products:

1. Browse a product page online
2. Click the Focuspilot extension
3. Clip the product
4. Select "Add to Project Procurement"
5. Choose the project

Product appears in procurement list instantly.

## Procurement Item Details

Each item shows:

- **Product name and image**
- **Quantity** needed
- **Unit cost** and total cost
- **Supplier** name and contact
- **Lead time** (days/weeks to delivery)
- **Status** (Pending, Ordered, In Transit, Delivered)
- **Notes** (custom details)

## Item Status

Track procurement progress:

### Pending

Item identified, not yet ordered.

### Ordered

Order placed with supplier. Enter order number and date.

### In Transit

Item shipped, en route. Enter tracking number.

### Delivered

Item received on site.

### On Hold

Item procurement paused (client decision pending, budget issue, etc.).

## Creating Purchase Orders from Procurement

Convert procurement items into purchase orders:

1. Select items (checkbox)
2. Click **Create PO**
3. Items auto-populate PO line items
4. Review and send PO

This links procurement to financial tracking.

## Tracking Costs

Procurement shows cost totals:

- **Total Procurement Cost** — Sum of all items
- **Ordered** — Cost of items already ordered
- **Pending** — Cost of items not yet ordered

Compare to project budget to ensure you're on track.

## Delivery Coordination

### Delivery Dates

Set expected delivery dates for each item. These appear on the project calendar.

### Delivery Notes

Add notes for:

- Shipping address
- Delivery contact
- Installation requirements
- Special instructions

### Delivery Checklist

When items arrive:

1. Update status to **Delivered**
2. Verify quantity and condition
3. Upload photos (if damage or issue)
4. Mark as **Complete**

## Supplier Management

Procurement tracks suppliers:

- View all items by supplier
- See supplier contact details
- Track supplier performance (on-time delivery rate)

## Filtering and Sorting

Filter procurement items:

- **By Status** — Show only Pending, Ordered, etc.
- **By Supplier** — View items from specific supplier
- **By Room** (if using room tagging)

Sort by:

- **Status**
- **Lead Time** (soonest needed first)
- **Cost** (highest first)

## Exporting Procurement Lists

Export for sharing:

1. Click **Export**
2. Choose format (CSV, PDF)
3. Share with client or contractor

Useful for client approval or installation coordination.

## Best Practices

- **Add items early** — Don't wait to document procurement needs
- **Update status regularly** — Keep delivery tracking current
- **Set realistic lead times** — Factor in supplier delays
- **Communicate with team** — Note any delivery issues in project messages
- **Link to POs** — Always create POs for ordered items

Procurement keeps your projects on schedule and on budget — stay organised.`,
    screenshots: [
      "projects/procurement-list.png",
      "projects/procurement-item.png",
    ],
    related: ["library-overview", "ai-clipper-overview", "purchase-orders"],
  },
  {
    slug: "project-contractors",
    title: "Project Contractors",
    description: "Adding and managing contractors working on your project",
    category: "projects",
    readTime: 3,
    lastUpdated: "2026-02-27",
    content: `# Project Contractors

The **Contractors** tab helps you manage subcontractors, trades, and external vendors working on your project.

## Accessing Contractors

Go to any project and click the **Contractors** tab.

## What is a Contractor?

Contractors are external professionals or companies providing services for your project:

- General contractors
- Electricians
- Plumbers
- Painters
- Installers
- Specialty trades

## Adding a Contractor

1. Click **+ Add Contractor**
2. Enter contractor details:
   - **Name** — Company or individual name
   - **Contact** — Email and phone
   - **Trade** — Type of work (Electrical, Plumbing, etc.)
   - **Scope** — What they're doing on this project
   - **Contract Amount** — Total cost for their work
   - **Start and End Dates** — When they're working
3. Click **Save**

The contractor appears in your project contractor list.

## Contractor Details

Each contractor shows:

- **Name and trade**
- **Contact information**
- **Scope of work**
- **Contract amount**
- **Project dates**
- **Status** (Pending, Active, Completed)

## Contractor Status

### Pending

Contractor identified but not yet confirmed or onboarded.

### Active

Contractor currently working on project.

### Completed

Contractor's work finished.

### On Hold

Work paused temporarily.

## Managing Contractor Documents

Attach contractor-specific documents:

1. Open a contractor
2. Go to **Documents** tab
3. Upload:
   - Contracts
   - Insurance certificates
   - Licenses
   - Invoices
   - Warranty information

Documents stay organised per contractor.

## Contractor Communication

### Messages

Send messages to contractors:

1. Open contractor detail
2. Click **Send Message**
3. Message via email or internal system (if they have portal access)

### Notes

Add internal notes about the contractor:

- Performance feedback
- Site access details
- Special instructions

Notes are visible to your team, not the contractor.

## Linking Contractors to Tasks

Assign tasks to contractors:

1. Create a task
2. Set assignee as **Contractor**
3. Select which contractor

Task appears on contractor's list (if they have portal access).

## Contractor Payments

Track payments to contractors:

1. Open contractor
2. Go to **Payments** tab
3. Record payments as they're made
4. See payment history

Payments can link to purchase orders in project finance.

## Contractor Calendar

Contractor dates appear on project calendar:

- Start and end dates
- Availability
- Key milestones

Helps coordinate scheduling with other trades.

## Removing a Contractor

If a contractor is no longer on the project:

1. Open contractor detail
2. Click **Remove from Project**
3. Confirm

Historical data is preserved but contractor no longer shows in active list.

## Best Practices

- **Document everything** — Upload contracts and insurance before work starts
- **Track payments** — Record all payments to contractors
- **Update status** — Keep contractor status current
- **Communicate proactively** — Use messages for site coordination
- **Review performance** — Add notes on quality and timeliness

Contractors are critical to project delivery — manage them carefully.`,
    screenshots: [
      "projects/contractors-list.png",
      "projects/contractor-detail.png",
    ],
    related: ["project-tasks", "project-calendar", "purchase-orders"],
  },
  {
    slug: "project-plan",
    title: "Project Plan",
    description: "Project phases, milestones, and timeline visualization",
    category: "projects",
    readTime: 5,
    lastUpdated: "2026-02-27",
    content: `# Project Plan

The **Plan** tab gives you a high-level timeline view of your project — phases, milestones, and key dates.

## Accessing Project Plan

Go to any project and click the **Plan** tab.

## What is the Project Plan?

The project plan is a visual timeline showing:

- **Phases** — Major stages of work
- **Milestones** — Key deliverables or checkpoints
- **Timeline** — When each phase starts and ends

Think of it as your project's roadmap.

## Creating Project Phases

### What is a Phase?

A phase is a distinct stage of work, such as:

- Concept Development
- Schematic Design
- Design Development
- Procurement
- Installation

### Adding a Phase

1. Click **+ New Phase**
2. Enter phase details:
   - **Phase Name**
   - **Start Date**
   - **End Date**
   - **Description**
3. Click **Save**

The phase appears on the timeline.

## Ordering Phases

Phases appear in sequence on the timeline. To reorder:

1. Drag and drop phases
2. Timeline updates automatically

## Adding Milestones

### What is a Milestone?

A milestone is a key deliverable or checkpoint within a phase:

- "Mood board presentation"
- "Drawings approved"
- "Products ordered"
- "Installation complete"

Milestones have a specific due date (not a date range like phases).

### Creating a Milestone

1. Open a phase
2. Click **+ Add Milestone**
3. Enter:
   - **Milestone Name**
   - **Due Date**
   - **Description**
4. Click **Save**

Milestones appear on the timeline within their phase.

## Timeline View

The project plan shows a **Gantt-style timeline**:

- **Horizontal bars** represent phases
- **Diamonds** represent milestones
- **Today marker** shows current date

### Zooming

Adjust timeline zoom:

- **Week view** — See a few weeks
- **Month view** — See several months
- **Quarter view** — See whole project at once

## Linking Tasks to Phases

You can link tasks to phases:

1. Create or edit a task
2. Select **Phase** from dropdown
3. Task is now associated with that phase

Phase completion percentage is calculated from its tasks.

## Phase Progress

Each phase shows progress:

- **% Complete** — Based on completed tasks in the phase
- **On Track** — Green if progressing as planned
- **At Risk** — Yellow if behind schedule
- **Delayed** — Red if past end date and not complete

## Milestone Tracking

Milestones can be marked as:

- **Pending** — Not yet reached
- **Complete** — Delivered on time
- **Missed** — Passed due date without completion

Track milestone completion to identify project delays.

## Dependencies

You can set phase dependencies:

1. Open a phase
2. Click **Add Dependency**
3. Select which phase must complete first

Dependent phases visually connect on the timeline.

## Exporting the Plan

Share the project plan:

1. Click **Export**
2. Choose format (PDF timeline, CSV data)
3. Download

Great for client presentations or stakeholder updates.

## Updating the Plan

As the project evolves:

- **Adjust phase dates** — Drag phase bars on timeline
- **Add new phases** — If scope changes
- **Mark milestones complete** — Check them off as you go
- **Add notes** — Document why dates shifted

The plan should be a living document.

## Best Practices

- **Start with phases** — Define high-level phases before diving into tasks
- **Be realistic with dates** — Build in buffer time
- **Update regularly** — Review plan weekly, adjust as needed
- **Use milestones for accountability** — Clear deliverables keep team focused
- **Communicate changes** — If timeline shifts, notify stakeholders

The project plan keeps everyone aligned on the roadmap — maintain it diligently.`,
    screenshots: [
      "projects/project-plan.png",
      "projects/timeline.png",
      "projects/milestones.png",
    ],
    related: ["project-tasks", "project-calendar", "creating-first-project"],
  },
  {
    slug: "project-calendar",
    title: "Project Calendar",
    description:
      "Project-specific calendar showing deadlines, events, and milestones",
    category: "projects",
    readTime: 3,
    lastUpdated: "2026-02-27",
    content: `# Project Calendar

Each project has its own **Calendar** showing project-specific deadlines, events, and milestones.

## Accessing Project Calendar

Go to any project and click the **Calendar** tab.

## What Appears on Project Calendar?

### Task Due Dates

All tasks with due dates appear on the calendar, colour-coded by priority.

### Milestones

Project plan milestones appear as diamonds or special markers.

### Contractor Dates

If contractors are added to the project, their start/end dates show on the calendar.

### Procurement Deliveries

Expected delivery dates for procurement items.

### Custom Events

You can add project-specific events:

- Client meetings
- Site visits
- Presentations

## Creating Calendar Events

1. Click any date on the calendar
2. Enter event details:
   - **Title**
   - **Start and end time**
   - **Description**
   - **Attendees** (team members)
3. Click **Save**

Event appears on both project calendar and studio calendar.

## Filtering Calendar

Focus your view:

- **Tasks only**
- **Milestones only**
- **Events only**
- **Contractors**
- **Deliveries**
- **All** (default)

Toggle filters to declutter the view.

## Calendar Views

Switch between:

- **Month view** — See the whole month
- **Week view** — Detailed weekly view
- **Day view** — Hour-by-hour schedule
- **Agenda view** — List of upcoming items

## Syncing with External Calendars

You can sync the project calendar with Google Calendar or Outlook:

1. Click **Calendar Settings** (gear icon)
2. Enable **Sync with External Calendar**
3. Choose Google Calendar or Outlook
4. Authorize access

Project events now appear in your personal calendar.

## Best Practices

- **Review weekly** — Check upcoming deadlines each Monday
- **Add all key dates** — Don't rely on memory for important dates
- **Invite team members** — Add attendees to meetings so they're notified
- **Color-code** — Use task priorities to visually identify urgent items

The project calendar ensures nothing falls through the cracks.`,
    screenshots: ["projects/project-calendar.png"],
    related: ["calendar", "project-plan", "project-tasks"],
  },
  {
    slug: "project-settings",
    title: "Project Settings",
    description: "Configuring project details, client, status, and preferences",
    category: "projects",
    readTime: 4,
    lastUpdated: "2026-02-27",
    content: `# Project Settings

The **Settings** tab lets you configure project details, permissions, and preferences.

## Accessing Project Settings

Go to any project and click the **Settings** tab.

## General Settings

### Project Information

Edit basic project details:

- **Project Name**
- **Client** (change if needed)
- **Project Type**
- **Status** (Lead, Active, On Hold, Completed)
- **Description**

### Dates and Budget

Update:

- **Start Date**
- **Target End Date**
- **Actual End Date** (when completed)
- **Total Budget**
- **Billing Type** (Fixed fee, hourly, cost-plus)

## Team Management

### Adding Team Members

1. Click **Add Team Member**
2. Select from studio team
3. Assign project role (Project Manager, Designer, etc.)
4. Set permissions (view, edit, admin)
5. Save

### Removing Team Members

1. Click **⋯** next to team member
2. Select **Remove from Project**
3. Confirm

Removed members lose access to project but their historical work remains.

## Permissions

Control project access:

### Project-Level Roles

- **Project Admin** — Full control over project
- **Project Member** — Can view and edit tasks, docs
- **Project Viewer** — Read-only access

### Custom Permissions

Fine-tune access:

- Can view finance data
- Can create invoices
- Can invite contractors
- Can delete tasks

## Notification Preferences

Configure what notifications team members receive:

- Task assignments
- New messages
- Document uploads
- Invoice status changes

Set per team member or project-wide.

## Client Portal (Optional)

If client portal is enabled:

1. Toggle **Enable Client Portal**
2. Select what client can see:
   - Tasks
   - Documents
   - Invoices
   - Messages
3. Send client portal invite

Client receives login credentials to view project progress.

## Budget Alerts

Enable budget warnings:

1. Toggle **Budget Alerts**
2. Set threshold (e.g., 80% of budget)
3. Choose who receives alerts

Alerts notify when project spending approaches budget.

## Archiving Projects

When a project ends:

1. Change status to **Completed**
2. Optionally click **Archive Project**
3. Confirm

Archived projects are hidden from active lists but remain searchable.

## Deleting Projects

⚠️ **Warning:** Deletion is permanent.

Only Owners can delete projects:

1. Scroll to bottom of Settings
2. Click **Delete Project**
3. Type project name to confirm
4. Click **Permanently Delete**

All project data is erased and cannot be recovered.

## Best Practices

- **Keep info updated** — Regularly review and update project details
- **Minimal permissions** — Give team members only the access they need
- **Use budget alerts** — Get warned before overspending
- **Archive completed projects** — Keep active project list focused

Project settings are your control panel — configure them thoughtfully.`,
    screenshots: [
      "projects/project-settings.png",
      "projects/team-management.png",
    ],
    related: ["projects-overview", "team-overview", "finance-settings"],
  },
];
