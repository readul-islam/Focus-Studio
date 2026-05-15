import { HelpArticle } from '../types';

export const reportsArticles: HelpArticle[] = [
  {
    slug: 'reports-overview',
    title: 'Reports Overview',
    description: 'Understanding all available report types',
    category: 'reports',
    readTime: 4,
    lastUpdated: '2026-02-27',
    content: `# Reports Overview

Techstyles Reports provide insights into studio performance, project health, and team productivity.

## Available Reports

### Cost Reports

Track project spending and expenses:

- Cost by project
- Cost by category (labor, materials, etc.)
- Budget vs. actual spending
- Purchase order summaries

### Productivity Reports

Measure team and project output:

- Tasks completed over time
- Team member productivity
- Project velocity
- Time tracking summaries

### Profitability Reports

Analyze financial performance:

- Revenue vs. expenses
- Profit margins by project
- Client profitability
- Project ROI

### Utilisation Reports

See how team capacity is allocated:

- Team member utilisation % (billable hours / available hours)
- Project allocation
- Available capacity
- Resource planning

## Accessing Reports

Click **Reports** in the sidebar to access all reports.

## Report Filters

All reports support filtering:

- **Date Range** — This week, this month, this quarter, custom range
- **Projects** — Specific projects or all projects
- **Team Members** — Specific people or entire team
- **Status** — Active, completed, or all projects

Apply filters to focus your analysis.

## Exporting Reports

Export any report:

1. Configure filters
2. Click **Export** (top right)
3. Choose format (CSV, Excel, PDF)
4. Download

Share reports with stakeholders or import into other tools.

## Scheduled Reports

Set up automated report delivery:

1. Configure a report with your desired filters
2. Click **Schedule Report**
3. Choose frequency (daily, weekly, monthly)
4. Enter recipient emails
5. Save

Reports automatically email to recipients on schedule.

## Report Dashboards

Create custom dashboards combining multiple reports:

1. Go to **Reports** → **Dashboards**
2. Click **New Dashboard**
3. Add report widgets
4. Arrange layout
5. Save and name your dashboard

Use dashboards for executive summaries or weekly team reviews.

## Best Practices

- **Review reports weekly** — Stay on top of studio metrics
- **Share with team** — Keep everyone informed
- **Track trends** — Look at month-over-month changes
- **Act on insights** — Use data to improve processes

Reports turn your data into actionable insights — use them regularly.`,
    screenshots: ['reports/reports-dashboard.png'],
    related: ['cost-reports', 'productivity-reports', 'profitability-reports', 'utilisation-reports'],
  },
  {
    slug: 'cost-reports',
    title: 'Cost Reports',
    description: 'Understanding cost breakdowns and project spending',
    category: 'reports',
    readTime: 4,
    lastUpdated: '2026-02-27',
    content: `# Cost Reports

Cost Reports help you track spending across projects and identify where money is going.

## What Cost Reports Show

- **Total Spending** — Studio-wide expense totals
- **Spending by Project** — Cost breakdown per project
- **Spending by Category** — Labor, materials, contractors, etc.
- **Budget vs. Actual** — Are you over or under budget?
- **Purchase Order Summary** — All POs issued

## Accessing Cost Reports

Go to **Reports** → **Cost** in the sidebar.

## Cost Report Views

### Summary View

Top-level metrics:

- **Total Spent** (selected period)
- **Average Project Cost**
- **Highest Spending Project**
- **Budget Utilization** — % of total budgets spent

### Project Breakdown

Table showing each project:

- Project name
- Budget
- Actual spending
- Variance (over/under budget)
- Budget utilization %

Projects over budget highlight in red.

### Category Breakdown

Pie chart and table showing spending by category:

- Labor (time-based costs)
- Materials (product procurement)
- Contractors (subcontractor costs)
- Other expenses

Understand where most money goes.

### Trend Over Time

Line chart showing spending trends:

- Weekly or monthly spending totals
- Compare current period to previous periods
- Identify seasonal patterns

## Filtering Cost Reports

Filter by:

- **Date Range** — This month, last quarter, YTD, custom
- **Projects** — All projects, specific projects, project status
- **Categories** — Filter to specific expense types

## Budget Alerts

Cost reports highlight:

- **Projects over budget** (red)
- **Projects approaching budget** (yellow, >80%)
- **Projects under budget** (green)

## Drilling Down

Click any project in the report to see:

- Detailed expense list
- All purchase orders for that project
- Expense timeline
- Cost by phase (if project uses phases)

## Exporting Cost Reports

Export options:

- **CSV** — Data table for Excel analysis
- **PDF** — Formatted report for sharing
- **Excel** — Native Excel format with charts

## Best Practices

- **Review monthly** — Check cost reports at month-end
- **Compare to budget** — Ensure projects stay on track
- **Identify overruns early** — Address budget issues proactively
- **Analyze trends** — Learn from past projects to estimate future costs

Cost reports keep your studio financially healthy — monitor them closely.`,
    screenshots: ['reports/cost-report.png', 'reports/cost-by-project.png', 'reports/cost-trends.png'],
    related: ['reports-overview', 'profitability-reports', 'project-finance'],
  },
  {
    slug: 'productivity-reports',
    title: 'Productivity Reports',
    description: 'Team and project productivity tracking',
    category: 'reports',
    readTime: 4,
    lastUpdated: '2026-02-27',
    content: `# Productivity Reports

Productivity Reports measure team output and project progress.

## What Productivity Reports Show

- **Tasks Completed** — Total tasks done
- **Completion Rate** — % of tasks completed on time
- **Team Member Productivity** — Output per person
- **Project Velocity** — How fast projects progress
- **Time Tracking** — Hours logged by team

## Accessing Productivity Reports

Go to **Reports** → **Productivity** in the sidebar.

## Productivity Metrics

### Tasks Completed

Total tasks completed in the selected period:

- By day, week, or month
- By team member
- By project

Track output volume.

### On-Time Completion Rate

% of tasks completed by their due date:

- Studio-wide rate
- Per team member
- Per project

Indicates deadline adherence.

### Average Task Completion Time

How long tasks take from creation to completion:

- Overall average
- By project
- By task priority

Helps estimate future timelines.

### Team Member Productivity

Individual output metrics:

- Tasks completed
- Hours logged
- Projects contributed to
- On-time completion rate

Compare team member performance.

## Project Velocity

Tracks project progress speed:

- Tasks completed per week
- Project phase completion time
- Overall project completion time

See which projects are moving fast vs. slow.

## Time Tracking Reports

If time tracking is enabled:

- **Hours Logged** — Total time tracked
- **Billable vs. Non-Billable** — Breakdown of time types
- **Hours by Project** — Where time is spent
- **Hours by Team Member** — Individual time logs

Useful for billing and resource planning.

## Productivity Trends

Visualize trends over time:

- Task completion trends (increasing or decreasing output)
- Seasonal productivity patterns
- Team growth impact on productivity

## Filtering Productivity Reports

Filter by:

- **Date Range**
- **Team Members**
- **Projects**
- **Task Status**

## Individual Team Member Reports

Click any team member to see:

- Their tasks completed
- On-time completion rate
- Time logged
- Projects they're working on

## Best Practices

- **Set benchmarks** — Establish normal productivity levels
- **Don't micromanage** — Use data to support, not punish
- **Identify blockers** — Low productivity may indicate project issues
- **Celebrate wins** — Recognize high-performing team members

Productivity reports help optimise your team — use them to support and improve.`,
    screenshots: ['reports/productivity-report.png', 'reports/team-productivity.png'],
    related: ['reports-overview', 'utilisation-reports', 'my-tasks'],
  },
  {
    slug: 'profitability-reports',
    title: 'Profitability Reports',
    description: 'Analyzing margins and revenue',
    category: 'reports',
    readTime: 4,
    lastUpdated: '2026-02-27',
    content: `# Profitability Reports

Profitability Reports show which projects and clients are most profitable.

## What Profitability Reports Show

- **Revenue** — Total invoiced to clients
- **Expenses** — Total spending (POs, costs)
- **Profit** — Revenue minus expenses
- **Profit Margin %** — Profit as % of revenue

## Accessing Profitability Reports

Go to **Reports** → **Profitability** in the sidebar.

## Profitability Metrics

### Studio-Wide Profitability

Top-level metrics:

- **Total Revenue** (selected period)
- **Total Expenses**
- **Net Profit**
- **Average Profit Margin %**

### Profitability by Project

Table showing each project:

- Project name
- Revenue (total invoiced)
- Expenses (total costs)
- Profit (revenue - expenses)
- Margin % ((profit / revenue) × 100)

Sort by margin % to see most/least profitable projects.

### Profitability by Client

Group projects by client:

- Client name
- Total revenue from client
- Total expenses
- Profit and margin

Identify your most profitable client relationships.

### Profitability Over Time

Line chart showing:

- Monthly revenue vs. expenses
- Profit trends
- Margin % trends

See if profitability is improving or declining.

## What's a Good Margin?

Design industry benchmarks:

- **30-40%** — Healthy margin for service-based design
- **20-30%** — Acceptable, room for improvement
- **<20%** — Low margin, review pricing or costs
- **50%+** — Excellent margin

Your targets may vary based on business model.

## Analyzing Unprofitable Projects

For projects with low or negative margins:

- **High expenses?** — Review procurement and contractor costs
- **Low pricing?** — Consider raising rates
- **Scope creep?** — Track additional work not billed
- **Inefficiencies?** — Identify time wasters

Learn from unprofitable projects to improve future pricing.

## Filtering Profitability Reports

Filter by:

- **Date Range**
- **Project Type** (Residential, Commercial, etc.)
- **Project Status** (Active, completed)
- **Client**

Compare profitability across segments.

## Drilling Down

Click any project to see:

- Detailed revenue breakdown (invoices)
- Detailed expense breakdown (POs)
- Timeline of finances
- Profit margin by project phase

## Forecasting Profitability

Use historical margin data to forecast:

- Expected profit for in-progress projects
- Revenue needed to hit profit targets
- Pricing for new project proposals

## Best Practices

- **Review quarterly** — Analyze profitability every quarter
- **Set margin targets** — Aim for specific margin % goals
- **Adjust pricing** — Raise rates if margins are consistently low
- **Control costs** — Look for ways to reduce expenses without sacrificing quality
- **Bill for everything** — Ensure all costs are passed to client or factored into pricing

Profitability is the ultimate measure of business health — track it obsessively.`,
    screenshots: ['reports/profitability-report.png', 'reports/profitability-by-project.png'],
    related: ['reports-overview', 'cost-reports', 'project-finance'],
  },
  {
    slug: 'utilisation-reports',
    title: 'Utilisation Reports',
    description: 'Resource utilisation and capacity planning',
    category: 'reports',
    readTime: 4,
    lastUpdated: '2026-02-27',
    content: `# Utilisation Reports

Utilisation Reports show how team capacity is allocated and identify available bandwidth.

## What Utilisation Reports Show

- **Team Member Utilisation %** — % of time allocated to work
- **Project Allocation** — How time is distributed across projects
- **Available Capacity** — Who has bandwidth for new work
- **Billable vs. Non-Billable Time**

## Accessing Utilisation Reports

Go to **Reports** → **Utilisation** in the sidebar.

## Understanding Utilisation %

### Formula

**Utilisation % = (Allocated Hours / Available Hours) × 100**

- **Available Hours** — Total work hours in the period (typically 40 hours/week)
- **Allocated Hours** — Hours assigned to tasks, projects, or logged

### Example

If a team member has 40 available hours in a week and is allocated 30 hours of work:

**Utilisation = (30 / 40) × 100 = 75%**

### Target Utilisation

- **70-85%** — Healthy utilisation (allows for meetings, admin, slack)
- **85-100%** — Fully utilized, at capacity
- **>100%** — Over-allocated, risk of burnout
- **<70%** — Under-utilized, capacity available

## Utilisation by Team Member

See each team member's:

- **Utilisation %**
- **Allocated Hours** (this week, this month)
- **Available Capacity** (remaining hours)
- **Projects Assigned To**

Color-coded:

- **Green** — Healthy utilisation (70-85%)
- **Yellow** — High utilisation (85-100%)
- **Red** — Over-allocated (>100%)

## Project Allocation

See which projects are consuming the most capacity:

- **Project Name**
- **Team Members Assigned**
- **Total Hours Allocated**
- **% of Studio Capacity**

Identify resource-heavy projects.

## Available Capacity

Shows who has bandwidth for new work:

- Team members with <70% utilisation
- Available hours this week/month
- Skills and roles

Use this when assigning new projects or tasks.

## Billable vs. Non-Billable Time

If time tracking is enabled:

- **Billable Hours** — Client work that generates revenue
- **Non-Billable Hours** — Internal work, admin, meetings
- **Billable Utilisation %** — Billable hours / Available hours

High billable utilisation means more revenue-generating work.

## Forecasting Capacity

Use utilisation reports to plan:

- **Can we take on a new project?** — Check available capacity
- **Do we need to hire?** — If team consistently over-allocated
- **Can we balance workload?** — Redistribute tasks from over-allocated to under-utilized members

## Filtering Utilisation Reports

Filter by:

- **Date Range** — This week, this month, next quarter
- **Team Members** — Specific people or entire team
- **Project** — See allocation for specific project

## Best Practices

- **Monitor weekly** — Check utilisation at the start of each week
- **Aim for 70-85%** — Don't over-allocate team members
- **Balance workload** — Redistribute tasks if someone is over-allocated
- **Plan ahead** — Use forecasting to anticipate capacity needs
- **Track billable time** — Maximize billable utilisation for profitability

Utilisation reports ensure your team is productive but not burned out — use them to plan capacity.`,
    screenshots: ['reports/utilisation-report.png', 'reports/capacity-planning.png'],
    related: ['reports-overview', 'productivity-reports', 'team-overview'],
  },
];
