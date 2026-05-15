import { HelpArticle } from '../types';

export const teamArticles: HelpArticle[] = [
  {
    slug: "team-overview",
    title: "Team Overview",
    description: "Managing your studio team",
    category: "team",
    readTime: 4,
    lastUpdated: "2026-02-27",
    content: `# Team Overview

The Team page shows all members of your studio and allows you to manage roles, permissions, and workload.

## Viewing Your Team

Click **Team** in the sidebar to see all studio members.

### Team List

Each team member card shows:

- **Name** and **Avatar**
- **Role** — Owner, Admin, Member, or Guest
- **Email**
- **Active Projects** — Number of projects they're on
- **Tasks** — Pending task count
- **Last Active** — When they last logged in

## Team Roles

Focuspilot has four permission levels:

### Owner

- Full access to everything
- Can manage billing and studio settings
- Can delete studio
- Can manage all team members

### Admin

- Almost full access
- Can create projects and manage team
- Can view all financial data
- Cannot access billing or delete studio

### Member

- Standard access
- Can view and work on assigned projects
- Cannot access studio settings or finances (unless project-specific)

### Guest

- Limited access
- Can only view projects they're invited to
- Cannot create projects or access library
- Ideal for contractors or external collaborators

## Adding Team Members

See the **Inviting Your Team** article for detailed steps.

## Team Workload View

Switch to **Workload View** to see:

- Task distribution across team
- Team member capacity
- Overloaded team members (red highlight)
- Available capacity

Use this to balance work fairly.

## Team Calendar

View **Team Calendar** to see:

- All team member schedules
- Time-off and availability
- Project assignments

## Removing Team Members

To remove someone:

1. Click **⋯** menu next to their name
2. Select **Remove from Studio**
3. Confirm

Their access is revoked, but historical data (tasks they created, etc.) remains.

## Best Practices

- **Assign minimal permissions** — Give team members only what they need
- **Review team quarterly** — Remove inactive members
- **Balance workload** — Monitor task distribution
- **Communicate roles clearly** — Ensure everyone knows their access level

Your team is your studio's engine — manage it thoughtfully.`,
    screenshots: ["team/team-list.png", "team/team-workload.png"],
    related: ["inviting-team", "roles-permissions", "team-management"],
  },
  {
    slug: "inviting-members",
    title: "Inviting Members",
    description: "How to invite and onboard new team members",
    category: "team",
    readTime: 3,
    lastUpdated: "2026-02-27",
    content: `# Inviting Members

Add team members to your Focuspilot studio so they can collaborate on projects.

## How to Invite

1. Go to **Team** page
2. Click **+ Invite Member**
3. Enter their **email address**
4. Select their **role** (Owner, Admin, Member, Guest)
5. Add a personal message (optional)
6. Click **Send Invitation**

They receive an email invitation with a link to create their account.

## Invitation Email

The invitee receives an email with:

- Your studio name
- Your personal message
- **Create Account** button
- Expiration date (invitations expire in 7 days)

## What Happens Next

1. Recipient clicks **Create Account**
2. They set their password
3. They're logged into your studio
4. You receive a notification that they joined

## Assigning to Projects

After they join:

1. Go to any project
2. Click **Settings** → **Team Management**
3. Add the new member to relevant projects

Or assign them to projects as you create tasks.

## Resending Invitations

If they didn't receive or lost the invitation:

1. Go to **Team** page
2. Find the pending invite (shows "Invited" status)
3. Click **Resend Invitation**

## Canceling Invitations

To cancel a pending invitation:

1. Go to **Team** page
2. Find the pending invite
3. Click **Cancel Invitation**

## Best Practices

- **Send personal messages** — Help new members feel welcome
- **Assign to projects immediately** — Get them productive fast
- **Set up a call** — Walk through Focuspilot if they're new
- **Share help centre** — Point them to this help centre for onboarding

Onboarding new team members well sets them up for success.`,
    screenshots: ["team/invite-member.png", "team/invitation-email.png"],
    related: ["team-overview", "roles-permissions", "inviting-team"],
  },
  {
    slug: "roles-permissions",
    title: "Roles & Permissions",
    description: "Understanding what each role can do",
    category: "team",
    readTime: 4,
    lastUpdated: "2026-02-27",
    content: `# Roles & Permissions

Focuspilot has four permission levels controlling what team members can access and do.

## Owner

**Full access to everything.**

### What Owners Can Do

- Access all projects, finances, and settings
- Manage studio settings and branding
- Invite and remove team members (including other Owners)
- Access billing and subscription
- Delete the studio
- View all reports and financial data

### When to Use

Assign Owner role to:

- Studio founders
- Managing partners
- Anyone who needs full control

You can have multiple Owners.

## Admin

**Almost full access, but cannot manage billing or delete studio.**

### What Admins Can Do

- Create and manage all projects
- View all financial data
- Invite team members (except cannot remove Owners)
- Manage integrations
- Access all reports
- Configure studio settings (except billing)

### What Admins Cannot Do

- Access billing or subscription settings
- Delete the studio
- Remove Owners

### When to Use

Assign Admin role to:

- Studio managers
- Senior designers who manage projects
- Anyone who needs operational control without financial risk

## Member

**Standard access for team members working on assigned projects.**

### What Members Can Do

- View and work on projects they're assigned to
- Create and complete tasks
- Upload documents
- Add products to library
- Use AI Clipper
- View their own tasks and calendar

### What Members Cannot Do

- Access studio settings
- View financial data (unless project-specific and granted)
- Invite team members
- Create projects (unless granted permission)
- Access projects they're not assigned to

### When to Use

Assign Member role to:

- Designers
- Project coordinators
- Most team members

## Guest

**Limited access to specific projects only.**

### What Guests Can Do

- View specific projects they're invited to
- Comment on tasks
- View shared documents
- Receive project notifications

### What Guests Cannot Do

- Create projects
- Access library
- View studio-wide data
- Invite team members
- Access any projects they're not explicitly invited to

### When to Use

Assign Guest role to:

- Contractors
- Freelancers
- External consultants
- Client representatives (if giving client access)

## Changing Roles

Owners and Admins can change team member roles:

1. Go to **Team** page
2. Click **⋯** next to member name
3. Select **Change Role**
4. Choose new role
5. Save

Role change takes effect immediately.

## Project-Level Permissions

Within a project, you can also set project-specific permissions:

1. Go to project → **Settings** → **Team**
2. For each team member, set:
   - **Can view finance** — See project invoices and POs
   - **Can edit finance** — Create invoices and POs
   - **Project Admin** — Full control over this project

Project permissions layer on top of studio-wide roles.

## Best Practices

- **Default to Member role** — Most team members don't need Admin access
- **Limit Owners** — Only assign Owner to those who truly need full control
- **Use Guest for externals** — Keep contractors and freelancers limited
- **Review permissions quarterly** — Ensure roles still match responsibilities

Proper permission management keeps your studio secure and organised.`,
    screenshots: ["team/roles-chart.png", "team/change-role.png"],
    related: ["team-overview", "inviting-team", "team-management"],
  },
];
