import { HelpArticle } from '../types';

export const settingsUserArticles: HelpArticle[] = [
  {
    slug: "profile-settings",
    title: "Profile Settings",
    description: "Managing your name, email, avatar, and personal details",
    category: "settings",
    readTime: 3,
    lastUpdated: "2026-02-27",
    content: `# Profile Settings

Your profile settings control your personal information displayed throughout Focuspilot.

## Accessing Profile Settings

Go to **Settings** → **User** → **Profile**.

## Profile Information

### Name

- **First Name** and **Last Name**
- Displayed on tasks, messages, team lists

Update your name if it changes.

### Email Address

Your login email. To change:

1. Enter new email
2. Click **Update Email**
3. Verify new email via confirmation link sent to your inbox
4. Log in with new email going forward

### Avatar

Upload a profile photo:

1. Click **Upload Avatar**
2. Select image (JPG or PNG, max 5MB)
3. Crop to square if needed
4. Save

Your avatar appears throughout the app (tasks, messages, team lists).

If no avatar, Focuspilot shows your initials in a colored circle.

### Job Title

Your role (e.g., "Lead Designer", "Project Manager").

Displayed on team pages and project assignments.

### Phone Number

Optional contact number. Visible to your team.

### Bio

Short description about yourself (optional). Useful in larger teams.

## Notification Email

Choose where notifications are sent:

- Use your primary email
- Add an alternate notification email

Useful if you want notifications separate from your login email.

## Time Zone

Set your local time zone:

- Ensures correct timestamp display
- Calendar events show in your local time

Auto-detected on signup, but you can change it.

## Language

Select your preferred language (if multiple languages supported).

Currently English only, more languages coming soon.

## Saving Changes

Click **Save Changes** at the bottom to apply updates.

## Best Practices

- **Use a professional photo** — Helps team recognise you
- **Keep email current** — Ensure you receive notifications
- **Add job title** — Helps team understand your role

Your profile is your digital identity in Focuspilot — keep it current.`,
    screenshots: [
      "settings/profile-settings.png",
      "settings/avatar-upload.png",
    ],
    related: ["appearance", "notifications", "security"],
  },
  {
    slug: "appearance",
    title: "Appearance",
    description: "Dark/light mode and visual preferences",
    category: "settings",
    readTime: 2,
    lastUpdated: "2026-02-27",
    content: `# Appearance

Customize how Focuspilot looks to suit your preferences.

## Accessing Appearance Settings

Go to **Settings** → **User** → **Appearance**.

## Theme

Choose your visual theme:

### Light Mode

Default theme with light backgrounds. Best for bright environments.

### Dark Mode

Dark backgrounds with light text. Easier on eyes in low-light conditions.

### Auto (System)

Automatically switches between light and dark based on your operating system settings.

Select your preference and the theme updates immediately.

## Sidebar

### Collapsed by Default

Toggle whether the sidebar starts collapsed (minimized) or expanded.

If enabled, sidebar shows only icons. Hover to expand temporarily.

Useful for maximizing screen space.

### Pinned Items

Choose which navigation items stay pinned to the top of the sidebar:

- Dashboard
- Inbox
- My Tasks
- Specific projects

Pin frequently accessed items for quick access.

## Dashboard Preferences

Customize your dashboard:

### Visible Widgets

Toggle which widgets appear on your dashboard:

- Daily Brief
- KPIs
- My Tasks
- Recent Activity
- Upcoming Calendar
- Quick Actions

Show only what's useful to you.

### Default Dashboard View

Choose what you see first when opening Focuspilot:

- Dashboard (default)
- Inbox
- My Tasks
- Last viewed page

## Density

Choose interface density:

### Comfortable (Default)

Standard spacing and sizing. Best for most users.

### Compact

Tighter spacing, more content on screen. For users who want maximum density.

### Spacious

More padding and larger elements. Easier on eyes, good for large screens.

## Font Size

Adjust text size:

- **Small** — More content on screen
- **Medium** (default) — Standard readability
- **Large** — Easier reading for accessibility

## Saving Changes

Appearance changes apply immediately (no save button needed).

## Best Practices

- **Try dark mode** — Many users find it less fatiguing
- **Use compact density** — If you have a small screen
- **Customize dashboard** — Remove widgets you don't use

Make Focuspilot feel like home — customise it to your liking.`,
    screenshots: ["settings/appearance-settings.png", "settings/dark-mode.png"],
    related: ["profile-settings", "notifications", "dashboard-overview"],
  },
  {
    slug: "notifications",
    title: "Notifications",
    description: "Control what notifications you receive",
    category: "settings",
    readTime: 3,
    lastUpdated: "2026-02-27",
    content: `# Notifications

Control when and how Focuspilot notifies you about updates.

## Accessing Notification Settings

Go to **Settings** → **User** → **Notifications**.

## Notification Channels

Choose how you receive notifications:

### Email Notifications

Receive notifications via email.

Toggle on/off for:

- Task assignments
- Messages and mentions
- Project updates
- Invoice status changes
- Daily brief delivery

### In-App Notifications

Badge and popup notifications within Focuspilot.

Always enabled (can't disable). Shows unread count in sidebar.

### Desktop Push Notifications

Browser notifications even when Focuspilot isn't open.

Enable in your browser when prompted.

### Mobile Push Notifications

Notifications on Focuspilot mobile app (when available).

## Notification Types

Choose what you're notified about:

### Tasks

- **Task assigned to you** — Someone assigns you a task
- **Task due soon** — 24 hours before task due date
- **Task overdue** — When your task passes due date
- **Task completed** — When a task you created is completed
- **Task comment** — Someone comments on your task

### Projects

- **Added to project** — You're added to a project team
- **Project status change** — Project status updates (Active, On Hold, etc.)
- **Budget alert** — Project approaches or exceeds budget

### Messages

- **Direct message** — Someone sends you a message
- **@Mention** — Someone mentions you with @
- **Project message** — New message in project you're on (optional)

### Finance

- **Invoice sent** — Invoice emailed to client
- **Payment received** — Client pays an invoice
- **Purchase order approved** — PO you created is approved

### AI & Automation

- **Daily brief** — Morning delivery of AI daily brief
- **AI suggestions** — AI recommends actions

## Notification Frequency

Control how often you receive digest emails:

### Real-Time

Immediate email for each notification. Good if you want to stay instantly informed.

### Digest

Batched notifications:

- **Hourly** — Summary every hour
- **Daily** — One email per day (morning)
- **Weekly** — Weekly summary (Monday mornings)

Reduces email volume.

### Do Not Disturb

Pause all notifications during specific hours:

1. Enable **Quiet Hours**
2. Set start and end time (e.g., 6 PM - 8 AM)
3. No notifications during these hours (except critical alerts)

Useful for work-life balance.

## Managing Notification Volume

If you're getting too many notifications:

- **Switch to digest mode** — Batch emails instead of real-time
- **Disable project messages** — Only get notified for @mentions
- **Turn off task comments** — Only notified for assignments, not every comment
- **Use quiet hours** — Silence evenings and weekends

## Testing Notifications

Send yourself a test notification:

1. Scroll to bottom of Notifications settings
2. Click **Send Test Notification**
3. Check your email and in-app inbox

Confirms notifications are working.

## Best Practices

- **Start with defaults** — Adjust based on volume
- **Use @mentions** — Only notify specific people when needed
- **Enable daily brief** — Great summary each morning
- **Set quiet hours** — Protect personal time

Notifications keep you informed — configure them to support your workflow, not overwhelm you.`,
    screenshots: [
      "settings/notifications-settings.png",
      "settings/quiet-hours.png",
    ],
    related: ["inbox", "my-tasks", "ai-daily-brief"],
  },
  {
    slug: "security",
    title: "Security",
    description: "Password changes, 2FA, and account security",
    category: "settings",
    readTime: 3,
    lastUpdated: "2026-02-27",
    content: `# Security

Manage your account security and login settings.

## Accessing Security Settings

Go to **Settings** → **User** → **Security**.

## Password

### Changing Your Password

1. Enter **Current Password**
2. Enter **New Password**
3. Confirm new password
4. Click **Update Password**

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one number
- At least one special character (e.g., !, @, #)

Use a strong, unique password.

### Forgot Password?

If you forgot your password:

1. Log out
2. Click **Forgot Password** on login page
3. Enter your email
4. Check email for reset link
5. Create new password

## Two-Factor Authentication (2FA)

Add an extra layer of security to your account.

### Enabling 2FA

1. Click **Enable 2FA**
2. Scan QR code with authenticator app (Google Authenticator, Authy, 1Password, etc.)
3. Enter 6-digit code from app
4. Save backup codes (important!)
5. 2FA is enabled

From now on, you'll enter a 6-digit code after your password when logging in.

### Backup Codes

When enabling 2FA, you receive backup codes:

- Save them securely (password manager, printed copy)
- Use if you lose access to your authenticator app
- Each code works once

### Disabling 2FA

If you need to disable:

1. Click **Disable 2FA**
2. Enter authenticator code or backup code
3. Confirm

Only disable if absolutely necessary.

## Active Sessions

See all devices where you're logged into Focuspilot:

- **Device Type** (Desktop, Mobile, Tablet)
- **Browser**
- **Location** (approximate)
- **Last Active**

### Revoking Sessions

If you see an unfamiliar session:

1. Click **Revoke** next to the session
2. That device is immediately logged out

Useful if you forgot to log out on a shared computer.

### Log Out All Devices

Click **Log Out Everywhere** to sign out of all devices except the current one.

Useful if your account may be compromised.

## Login History

View recent login attempts:

- Successful logins (date, time, location, device)
- Failed login attempts

If you see suspicious activity, change your password immediately.

## Account Recovery

### Recovery Email

Set a recovery email (different from your login email):

- Used to recover account if you lose access to primary email
- Receives security alerts

## Best Practices

- **Use a strong password** — Unique to Focuspilot, not reused
- **Enable 2FA** — Significantly increases account security
- **Save backup codes** — Store securely in case you lose your authenticator
- **Review sessions** — Check active sessions monthly
- **Log out on shared devices** — Always log out on public computers

Security protects your studio's data — take it seriously.`,
    screenshots: [
      "settings/security-settings.png",
      "settings/2fa-setup.png",
      "settings/active-sessions.png",
    ],
    related: ["profile-settings", "notifications"],
  },
  {
    slug: "time-tracking-settings",
    title: "Time Tracking",
    description: "Configuring time tracking preferences",
    category: "settings",
    readTime: 3,
    lastUpdated: "2026-02-27",
    content: `# Time Tracking

Configure how you track time on tasks and projects.

## Accessing Time Tracking Settings

Go to **Settings** → **User** → **Time Tracking**.

## Enable Time Tracking

Toggle **Time Tracking** on to start tracking time on tasks.

When enabled:

- Tasks show **Start Timer** button
- You can log hours manually
- Time appears on reports

## Time Tracking Method

Choose how you track time:

### Timer

Click **Start Timer** on a task, work on it, then click **Stop**.

Time is automatically logged.

### Manual Entry

Enter hours worked manually:

1. Open a task
2. Click **Log Time**
3. Enter hours and date
4. Save

Useful if you forgot to start a timer.

### Both

Use timer when you remember, manual entry when you forget.

## Billable vs. Non-Billable

Mark time entries as:

- **Billable** — Client work that generates revenue
- **Non-Billable** — Internal work, admin, meetings

Set default per task or per entry.

## Hourly Rate

Set your personal hourly rate:

- Used to calculate value of time tracked
- Appears on reports (visible to Admins/Owners)
- Can be overridden per project

## Reminder Prompts

Enable reminders to log time:

### End of Day Reminder

Notification at end of workday prompting:

- "Did you forget to log time today?"
- Review tasks and log hours

Set reminder time (e.g., 5 PM).

### Idle Timer Detection

If timer runs for extended period without activity:

- Popup asks if you're still working
- Prevents accidentally leaving timer running overnight

## Time Rounding

Round time entries to nearest:

- **No Rounding** — Exact time logged
- **15 minutes** — Rounds to nearest quarter hour
- **30 minutes** — Rounds to nearest half hour
- **1 hour** — Rounds to nearest hour

Industry standard is 15-minute increments.

## Weekly Time Goal

Set a weekly hours goal (e.g., 40 hours):

- Progress bar shows hours logged vs. goal
- Helps ensure you're tracking consistently

## Time Reports

Your time tracking data appears on:

- **Productivity Reports** — Your hours logged
- **Project Reports** — Time spent per project
- **Time Tracking Report** — Detailed time logs

## Best Practices

- **Track consistently** — Log time daily, not in batches
- **Use billable tags** — Mark client work as billable
- **Set reminders** — Enable end-of-day prompts
- **Review weekly** — Check your time logs each Friday

Time tracking provides visibility into where your hours go — use it to optimise your workload.`,
    screenshots: [
      "settings/time-tracking-settings.png",
      "settings/time-tracking-timer.png",
    ],
    related: ["my-tasks", "productivity-reports", "calendar"],
  },
];
