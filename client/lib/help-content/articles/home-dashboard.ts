import { HelpArticle } from '../types';

export const homeDashboardArticles: HelpArticle[] = [
  {
    slug: "dashboard-overview",
    title: "Dashboard Overview",
    description:
      "Understanding your Focuspilot dashboard — KPIs, daily brief, and what everything means",
    category: "home-dashboard",
    readTime: 5,
    lastUpdated: "2026-02-27",
    content: `# Dashboard Overview

Your Focuspilot dashboard is the first thing you see each day — a personalized overview of your studio's health and your personal workload.

## What's on the Dashboard?

### Daily Brief (AI-Generated)

At the top, you'll find your **AI-generated daily brief** — a smart summary that includes:

- **Today's priorities** — Most urgent tasks and deadlines
- **Project updates** — Recent changes across your projects
- **Upcoming milestones** — What's due this week
- **Action items** — Tasks requiring your attention

The AI scans your projects, calendar, and team activity to create this brief automatically each morning.

### Key Performance Indicators (KPIs)

Quick metrics for studio performance:

- **Active Projects** — Number of projects currently in progress
- **Overdue Tasks** — Tasks past their due date (yours and team-wide)
- **Outstanding Invoices** — Unpaid invoice total
- **This Month's Revenue** — Invoiced amount for current month
- **Team Utilisation** — Percentage of team capacity allocated

Click any KPI card to drill into detailed reports.

### My Tasks Summary

A snapshot of tasks assigned to you:

- Tasks due today
- Tasks due this week
- Overdue tasks

Click **View All** to see your complete task list.

### Recent Activity Feed

A chronological stream of updates:

- Tasks completed by team members
- New project messages
- Invoice status changes
- Documents uploaded
- Contractor updates

Stay in the loop without checking each project individually.

### Upcoming Calendar Events

Your next 5 calendar items:

- Project deadlines
- Team meetings
- Client presentations
- Milestone dates

Click any event to view full details or navigate to the calendar.

### Quick Actions

Shortcut buttons for common tasks:

- **New Project** — Create a project
- **New Invoice** — Generate an invoice
- **Add Task** — Quick task creation
- **Clip Product** — Open AI Clipper

## Customizing Your Dashboard

### Widget Visibility

You can show/hide dashboard widgets:

1. Click the **⚙️ icon** (top right of dashboard)
2. Toggle widgets on or off
3. Changes save automatically

### KPI Preferences

Choose which KPIs display:

- Navigate to **Settings** → **User** → **Appearance**
- Scroll to **Dashboard Preferences**
- Select your preferred KPIs

## Dashboard Refresh

The dashboard refreshes:

- **Automatically** every 5 minutes
- **On page load** when you navigate to Dashboard
- **Manually** by clicking the refresh icon

## Best Practices

- **Start your day here** — Review your daily brief before diving into work
- **Check overdue tasks** — Address red flags immediately
- **Monitor KPIs** — Track trends over time, not just daily numbers
- **Act on recent activity** — Respond to team updates quickly

## Mobile Dashboard

On mobile devices, the dashboard adapts to show:

- Daily brief (collapsible)
- Critical KPIs only
- Your tasks
- Quick actions

The full dashboard experience is optimised for desktop/tablet use.

Your dashboard is your mission control — use it to stay on top of your studio every day.`,
    screenshots: [
      "home-dashboard/dashboard.png",
      "home-dashboard/daily-brief.png",
    ],
    related: ["ai-daily-brief", "my-tasks", "inbox"],
  },
  {
    slug: "inbox",
    title: "Inbox",
    description: "Messages, notifications, and Gmail integration",
    category: "home-dashboard",
    readTime: 4,
    lastUpdated: "2026-02-27",
    content: `# Inbox

Your Focuspilot Inbox consolidates all communication in one place — team messages, system notifications, and Gmail integration.

## What Appears in Your Inbox?

### Internal Messages

Messages from your team members:

- Direct messages
- Project messages (when you're mentioned with @)
- Task comments and updates
- System announcements

### System Notifications

Automated alerts for:

- Tasks assigned to you
- Upcoming deadlines (24 hours before due)
- Invoice payment received
- Project status changes
- Team member mentions

### Gmail Integration (Optional)

If you've connected Gmail, your inbox also shows:

- Client emails
- Threaded conversations
- Unread email count

All in one unified interface.

## Reading Messages

Click any message to view:

- Full message content
- Sender and timestamp
- Related project or context
- Reply thread

### Message Actions

For each message:

- **Reply** — Send a response
- **Mark as Read/Unread** — Toggle read status
- **Archive** — Remove from main inbox (still searchable)
- **Delete** — Permanently remove

## Sending Messages

### To Team Members

1. Click **New Message** button
2. Select recipient(s)
3. Add subject and message
4. Attach files if needed
5. Click **Send**

### Within Projects

You can also send messages from within a project:

1. Go to the project **Messages** tab
2. Type your message
3. All project team members are notified

## Filtering Your Inbox

Use filters to focus:

- **Unread Only** — Show only unread messages
- **Direct Messages** — Personal messages to you
- **Mentions** — Where you were @mentioned
- **System Notifications** — Automated alerts only

## Gmail Integration Setup

To connect your Gmail:

1. Go to **Settings** → **Studio** → **Integrations**
2. Click **Connect Gmail**
3. Authorize Focuspilot to access your email
4. Choose which emails sync (optional filters)

Once connected, you can:

- Read and reply to client emails in Focuspilot
- Automatically link emails to projects
- Search across email and internal messages

### Privacy & Security

Focuspilot only accesses emails you explicitly connect. Your email data is encrypted and never shared.

## Notification Preferences

Control what notifications you receive:

1. Go to **Settings** → **User** → **Notifications**
2. Toggle notification types:
   - Email notifications
   - In-app badges
   - Desktop push notifications
3. Set quiet hours (optional)

## Search

Use the search bar (top of inbox) to find:

- Message content
- Sender name
- Date range
- Attached files

## Keyboard Shortcuts

Speed up your inbox workflow:

- **R** — Reply to selected message
- **E** — Archive message
- **Delete** — Delete message
- **↑/↓** — Navigate between messages

## Best Practices

- **Inbox Zero** — Archive read messages to keep inbox clean
- **Use @mentions** — Get someone's attention in project messages
- **Link emails to projects** — Associate client emails with relevant projects
- **Set up filters** — Reduce noise by filtering system notifications

Your inbox keeps you connected — check it regularly to stay responsive to your team and clients.`,
    screenshots: ["home-dashboard/inbox.png", "home-dashboard/message.png"],
    related: ["project-messages", "integrations", "notifications"],
  },
  {
    slug: "my-tasks",
    title: "My Tasks",
    description: "Your personal task list — filters, status, and quick actions",
    category: "home-dashboard",
    readTime: 4,
    lastUpdated: "2026-02-27",
    content: `# My Tasks

**My Tasks** is your personal command centre for all work assigned to you across every project.

## Viewing Your Tasks

Access **My Tasks** from the sidebar to see all tasks where you're the assignee.

### Task List View

Each task card shows:

- **Task title** — What needs to be done
- **Project name** — Which project it belongs to
- **Due date** — When it's due (colour-coded: red = overdue, yellow = due soon, green = future)
- **Status** — To Do, In Progress, or Completed
- **Priority** — High, Medium, or Low (if set)

## Filtering Tasks

Use filters to focus your view:

### By Status

- **To Do** — Tasks not started
- **In Progress** — Tasks you're actively working on
- **Completed** — Finished tasks (hidden by default)

### By Due Date

- **Overdue** — Past their due date
- **Today** — Due today
- **This Week** — Due within 7 days
- **This Month** — Due within 30 days
- **No Due Date** — Tasks without deadlines

### By Priority

- **High Priority** — Urgent tasks
- **Medium Priority** — Standard tasks
- **Low Priority** — Nice-to-have tasks

### By Project

Filter to show tasks from specific projects only.

## Sorting Tasks

Sort your task list by:

- **Due Date** (default) — Soonest due first
- **Priority** — High priority at the top
- **Project** — Grouped by project
- **Date Created** — Newest tasks first

## Updating Task Status

### Mark as Complete

Click the **checkbox** next to a task to mark it complete. The task moves to your Completed list.

### Change Status

Click a task to open details, then update status:

- **To Do** → **In Progress** when you start working
- **In Progress** → **Completed** when finished

### Edit Task

Click any task to:

- Update the title or description
- Change the due date
- Adjust priority
- Add comments
- Attach files

## Creating New Tasks

### Quick Add

1. Click **+ New Task** (top right)
2. Enter task title
3. Select project
4. Set due date (optional)
5. Assign priority (optional)
6. Save

The task is immediately added to your list.

### From Projects

You can also create tasks from within a project's Tasks tab — then assign them to yourself or team members.

## Task Notifications

You receive notifications when:

- A task is assigned to you
- Due date is approaching (24 hours before)
- Someone comments on your task
- Task details change

Configure notification preferences in **Settings** → **User** → **Notifications**.

## Time Tracking

If time tracking is enabled:

1. Open a task
2. Click **Start Timer**
3. Timer runs while you work
4. Click **Stop Timer** when done

Tracked time appears on reports and can be billed to clients.

## Bulk Actions

Select multiple tasks (checkbox on left) to:

- Mark all as complete
- Change status in bulk
- Assign to different project

## Mobile Tasks

On mobile, **My Tasks** displays in a simplified view optimised for quick status updates and completing tasks on the go.

## Best Practices

- **Review daily** — Start each day by reviewing My Tasks
- **Update status in real-time** — Keep your task list current
- **Use priorities** — Flag high-priority work for focus
- **Clear completed tasks** — Archive finished tasks weekly for a clean view
- **Break down large tasks** — Split big tasks into smaller, actionable items

Your task list is your personal workflow engine — keep it organised and up to date.`,
    screenshots: [
      "home-dashboard/my-tasks.png",
      "home-dashboard/task-detail.png",
    ],
    related: ["project-tasks", "time-tracking", "notifications"],
  },
  {
    slug: "calendar",
    title: "Calendar",
    description: "Studio calendar, project events, and time tracking",
    category: "home-dashboard",
    readTime: 5,
    lastUpdated: "2026-02-27",
    content: `# Calendar

The Focuspilot Calendar gives you a unified view of deadlines, milestones, events, and team schedules.

## Calendar Views

### Studio Calendar

The default view shows:

- All project deadlines
- Team member events
- Studio-wide milestones
- Time-off and availability

Access this via **Calendar** in the main sidebar.

### Project Calendar

Each project has its own calendar showing:

- Project-specific tasks and deadlines
- Phase milestones
- Contractor schedules
- Project meetings

Access from any project's **Calendar** tab.

## What Appears on the Calendar?

### Task Due Dates

All tasks with due dates appear on the calendar. Color-coded by:

- **Red** — High priority tasks
- **Blue** — Standard tasks
- **Green** — Low priority tasks

### Project Milestones

Key project dates:

- Phase completions
- Client presentations
- Final delivery dates

### Team Availability

If team members mark time-off, it appears on the studio calendar so you can plan around absences.

### Custom Events

Create standalone calendar events for:

- Team meetings
- Client appointments
- Studio events
- External deadlines

## Creating Events

### Quick Create

1. Click any date on the calendar
2. Enter event title
3. Set start/end time
4. Add description (optional)
5. Invite team members (optional)
6. Save

### From Task

When you create a task with a due date, it automatically appears on the calendar.

## Editing Events

Click any calendar event to:

- Change date/time
- Update title or description
- Add or remove attendees
- Link to a project
- Delete the event

## Calendar Filters

Focus your view by filtering:

- **My Events Only** — Show only your tasks and events
- **By Project** — Filter to specific project(s)
- **By Team Member** — See a specific person's schedule
- **Event Type** — Tasks, milestones, meetings, or all

## View Modes

Switch between calendar views:

### Month View (Default)

See the entire month at a glance. Best for high-level planning.

### Week View

Detailed week view with hourly slots. Best for day-to-day scheduling.

### Day View

Hour-by-hour breakdown of a single day. Best for detailed time management.

### Agenda View

List format showing upcoming events chronologically. Best for quick scanning.

## Time Tracking from Calendar

If time tracking is enabled:

1. Click a task on the calendar
2. Click **Start Timer**
3. Work on the task
4. Timer automatically logs hours

Time entries appear on time tracking reports.

## Syncing External Calendars

You can sync Focuspilot with external calendars:

### Google Calendar Sync

1. Go to **Settings** → **User** → **Integrations**
2. Click **Connect Google Calendar**
3. Authorize access
4. Choose sync direction (one-way or two-way)

Once synced, Focuspilot events appear in Google Calendar and vice versa.

### Outlook/iCal Sync

Export your Focuspilot calendar as an iCal feed:

1. Go to **Calendar Settings** (gear icon)
2. Click **Export Calendar**
3. Copy the iCal URL
4. Add to Outlook or Apple Calendar

## Notifications

Receive reminders for:

- Events starting soon (15 minutes before)
- Tasks due today (morning notification)
- Upcoming deadlines (24 hours before)

Configure in **Settings** → **User** → **Notifications**.

## Best Practices

- **Weekly planning** — Review your week every Monday
- **Block focus time** — Add calendar blocks for deep work
- **Mark time-off** — Always log vacations so team can plan
- **Link events to projects** — Keep project context clear
- **Use recurring events** — Set up repeating team meetings

Your calendar keeps your studio synchronized — use it to plan, coordinate, and never miss a deadline.`,
    screenshots: [
      "home-dashboard/calendar.png",
      "home-dashboard/calendar-event.png",
    ],
    related: ["project-calendar", "time-tracking", "integrations"],
  },
];
