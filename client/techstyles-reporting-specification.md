# Focuspilot Reporting System Specification

## Executive Summary

This document specifies a comprehensive reporting system for interior design studios, with a core focus on **project-level profitability tracking by phase**. The system enables studios to:

1. Track profitability at project, phase, and staff level
2. Match time tracking against fee allocations and budgeted hours
3. Know exactly where they make and lose money
4. See real-time margin data without waiting for post-project analysis

---

## The Core Problem We're Solving

> "Designers underestimate hours by 20-30%, destroying profit margins. If you're spending 80 hours but billing for 60, you're subsidising your client's budget with your own time."

**Industry Benchmarks:**
- Gross Margin Target: 40-60%
- Net Margin Target: 20-30%
- Billable Hours Ratio: 75-85%
- Revenue per Employee: £150-225k annually

---

## Part 1: Project Profitability Reporting

### 1.1 Quick Margin Summary Box (Project Page Widget)

**Location:** Every project detail page, above the fold

**Purpose:** At-a-glance profitability without navigating to reports

**Display Fields:**
| Field | Description |
|-------|-------------|
| Fee Quoted | Total project fee |
| Cost to Date | Calculated from (hours × staff rates) + procurement costs |
| Current Margin | (Fee - Cost) ÷ Fee × 100 |
| Margin Status | On Track / At Risk / Over Budget (based on thresholds) |
| Hours Summary | X of Y budget used (Z%) |

**Status Thresholds:**
- **On Track:** Projected margin ≥ 30%
- **At Risk:** Projected margin 15-30%
- **Over Budget:** Projected margin < 15%

**Calculation Logic:**
```
Current Margin % = ((Fee Quoted - Cost to Date) / Fee Quoted) × 100
Projected Final Cost = Cost to Date + (Remaining Hours Budget × Blended Rate)
Projected Margin % = ((Fee Quoted - Projected Final Cost) / Fee Quoted) × 100
```

---

### 1.2 Phase-Level Profitability Table

**Location:** Project detail page, dedicated "Profitability" tab

**Purpose:** See exactly which phases are profitable and which are eating margin

**Table Columns:**
| Column | Description | Data Type |
|--------|-------------|-----------|
| Phase | RIBA stage name | Text |
| Fee Quoted | Allocated fee for this phase | Currency |
| Staff Assigned | Team members earmarked | Multi-select |
| Hours Budget | Fee ÷ blended staff rate | Number |
| Hours Actual | Sum of time entries | Number |
| Cost | Hours Actual × Staff Rate | Currency |
| Margin | (Fee - Cost) ÷ Fee × 100 | Percentage |
| Status | Not Started / In Progress / Complete | Status pill |

**Conditional Formatting:**
- Hours Actual > Hours Budget: Red text
- Margin > 30%: Green
- Margin 15-30%: Amber
- Margin < 15%: Red

---

### 1.3 RIBA/Interior Design Phases

UK studios typically use RIBA-aligned phases. Default phase structure:

| Phase | Typical Fee % | Description |
|-------|---------------|-------------|
| Stage 0: Strategic Definition | 5% | Brief & Feasibility |
| Stage 1: Preparation & Briefing | 10% | Site Survey & Analysis |
| Stage 2: Concept Design | 15% | Initial Concepts & Schemes |
| Stage 3: Spatial Coordination | 20% | Developed Design & Planning |
| Stage 4: Technical Design | 25% | Specifications & Drawings |
| Stage 5: Manufacturing & Construction | 15% | Procurement & Site Visits |
| Stage 6: Handover | 5% | Snagging & Completion |
| Stage 7: Use | 5% | Post-Occupancy & Aftercare |

**Note:** Studios should be able to customize phase names and default percentages.

---

### 1.4 Project Profitability Reports

#### 1.4.1 Project Overview Report
**Purpose:** High-level profitability across all projects

**Metrics:**
- Total Revenue vs Total Cost
- Gross Margin %
- Net Margin %
- Hours Budget vs Actual

**Filters:** Date Range, Project Status, Client, Project Type

**Visualizations:**
- Bar chart: Margin by project
- Trend line: Monthly profitability
- Table: Project list with margin column

---

#### 1.4.2 Project Detail Report
**Purpose:** Deep dive into single project profitability

**Metrics:**
- Phase-by-Phase Breakdown
- Staff Cost Allocation
- Procurement Margins
- Time Overruns (variance analysis)

**Filters:** Project (required), Phase, Date Range

**Visualizations:**
- Stacked bar: Cost breakdown by category
- Phase profitability table
- Timeline: Margin trend over project duration

---

#### 1.4.3 Phase Profitability Report
**Purpose:** Compare profitability across project phases (identify which stages typically lose money)

**Metrics:**
- Fee Quoted vs Cost to Deliver
- Hours Budgeted vs Actual
- Margin by Phase Type
- Phase Duration Analysis

**Filters:** Date Range, Project, Phase Type, Staff

**Visualizations:**
- Box plot: Margin distribution by phase type
- Table: Phase comparison with averages
- Trend: Phase profitability over time

---

#### 1.4.4 Staff Profitability Report
**Purpose:** Revenue and cost attribution by team member

**Metrics:**
- Billable Hours Ratio
- Revenue per Hour
- Cost per Hour
- Margin Contribution

**Filters:** Date Range, Staff Member, Project, Phase

**Visualizations:**
- Leaderboard: Staff ranked by margin contribution
- Utilization gauge per staff
- Table: Detailed staff metrics

---

## Part 2: Time vs Budget Reporting

### 2.1 The Profitability Data Flow

```
1. Fee Quoted → Phase gets allocated fee from project total
2. Staff Assigned → Team members earmarked with hourly cost rates
3. Hours Budgeted → Fee ÷ blended rate = hours available
4. Time Tracked → Actual hours logged against phase
5. Margin Calculated → Fee - (hours × rate) = profit
```

---

### 2.2 Staff Cost Rate Configuration (Required Setup)

Each team member needs two rates:

| Rate Type | Description | Used For |
|-----------|-------------|----------|
| **Cost Rate** | What they actually cost the studio per hour | Profitability calculations |
| **Charge Rate** | What you bill clients per hour | Invoice generation |

**Cost Rate Calculation:**
```
Cost Rate = (Annual Salary + Benefits + Allocated Overhead) ÷ Annual Billable Hours Target
```

**Example Team Setup:**
| Staff | Role | Cost Rate | Charge Rate |
|-------|------|-----------|-------------|
| Sarah (Principal) | Lead Design | £120/hr | £175/hr |
| Emma (Senior) | Technical | £85/hr | £125/hr |
| Lucy (Mid) | Design Support | £55/hr | £85/hr |
| James (Junior) | CAD/Admin | £35/hr | £55/hr |

---

### 2.3 Time Tracking Reports

#### 2.3.1 Time vs Budget Report
**Purpose:** Compare actual hours against budgeted hours

**Metrics:**
- Hours Budget
- Hours Actual
- Variance % ((Actual - Budget) / Budget × 100)
- Projected Final Hours (based on completion %)

**Filters:** Date Range, Project, Phase, Staff, Task Type

**Visualizations:**
- Progress bars: Budget consumed
- Table: Detailed time breakdown
- Alert badges for over-budget items

---

#### 2.3.2 Team Utilization Report
**Purpose:** Billable vs non-billable time analysis

**Metrics:**
- Billable Hours %
- Non-Billable Hours
- Capacity Available
- Target vs Actual (against 75-85% target)

**Filters:** Date Range, Staff Member, Department

**Visualizations:**
- Donut chart: Billable vs non-billable
- Weekly trend line
- Staff comparison table

---

#### 2.3.3 Task Analysis Report
**Purpose:** Time spent by activity type

**Metrics:**
- Design Time
- Client Communication Time
- Admin Time
- Procurement Time

**Filters:** Date Range, Project, Staff, Task Category

**Default Task Categories:**
- Design & Creative
- Client Meetings
- Internal Meetings
- Procurement & Sourcing
- Site Visits
- Administration
- Travel
- Training

---

## Part 3: Studio Health Reporting

### 3.1 Executive Dashboard (Landing View)

**Purpose:** Firm-wide snapshot for principals/owners

**KPI Cards Row:**
| KPI | Description |
|-----|-------------|
| Monthly Revenue | Current month total |
| Active Projects | Count with "new" indicator |
| Outstanding Invoices | Total with overdue count |
| Average Margin | Across all active projects |

**Additional Components:**
- Revenue trend chart (6-month rolling)
- Projects needing attention (over budget, overdue invoices)
- Pipeline value summary

---

### 3.2 Revenue Reports

#### Revenue Summary Report
**Metrics:**
- Monthly Revenue
- Revenue by Client
- Revenue by Project Type
- Forecast vs Actual

**Filters:** Date Range, Client, Project Type, Revenue Type

---

#### Cash Flow Report
**Metrics:**
- Invoiced Amount
- Received Amount
- Outstanding Amount
- Aged Debt (30/60/90 days)

**Filters:** Date Range, Client, Project

---

#### Pipeline & Forecasting Report
**Metrics:**
- Active Proposals Value
- Signed Contracts (not started)
- Revenue Runway
- Conversion Rate

**Filters:** Date Range, Probability %, Project Type

---

## Part 4: Procurement Intelligence

### 4.1 Supplier Performance Report
**Metrics:**
- On-Time Delivery %
- Average Lead Time
- Issue Resolution Time
- Total Spend

**Filters:** Date Range, Supplier, Category, Project

---

### 4.2 Markup Analysis Report
**Metrics:**
- Average Markup %
- Markup by Category
- Cost vs Client Price
- Margin Trends

**Filters:** Date Range, Category, Supplier, Project

**Industry Markup Benchmarks:**
| Category | Typical Markup |
|----------|----------------|
| Furniture (FF&E) | 30-40% |
| Contractors | 10-15% |
| Soft Furnishings | 35-50% |
| Accessories | 40-60% |

---

### 4.3 Item Status Report
**Metrics:**
- Items by Status
- Days in Status
- Overdue Items
- Value by Status

**Filters:** Project, Status, Supplier, Category

---

## Part 5: UI Specifications

### 5.1 Dual View Modes (Required for All Reports)

Every report MUST offer both views:

**Chart View:**
- Visual trends and patterns
- Comparison charts (bar, line, pie)
- Progress indicators and gauges
- Sparklines for inline trends
- Hover tooltips with detail

**List/Table View:**
- Sortable columns (click header to sort)
- Inline filtering
- Pagination for large datasets
- Drill-down links to detail pages
- Row selection for bulk actions

---

### 5.2 Global Filter System

**Date Range Presets:**
- This Week
- This Month
- This Quarter
- This Year
- Last 30 Days
- Last 90 Days
- Year to Date
- Custom Range (date picker)

**Entity Filters (Multi-select with search):**
- Projects
- Clients
- Staff Members
- Phases
- Suppliers
- Categories

**Status Filters:**
- Active / Completed / All
- On Track / At Risk / Over Budget
- Paid / Unpaid / Overdue
- Billable / Non-Billable

**Filter Persistence:**
- Filters should persist during session
- Option to save filter combinations as presets

---

### 5.3 Export & Share Options

| Format | Description |
|--------|-------------|
| CSV | Raw data for spreadsheets |
| Excel | Formatted with formulas preserved |
| PDF | Print-ready, branded reports |
| Email | Schedule automated report delivery |

**Scheduled Reports:**
- Daily / Weekly / Monthly options
- Select recipients
- Choose time of delivery

---

### 5.4 Navigation Structure

```
Financials/
├── Dashboard (Executive overview)
├── Project Reports
│   ├── All Projects Overview
│   └── Project Detail
├── Phase Profitability
├── Staff Profitability
├── Revenue
│   ├── Summary
│   └── By Client
└── Cash Flow

Time/
├── Time vs Budget
├── Utilization
├── Task Analysis
└── Capacity Planning

Procurement/
├── Item Status
├── Supplier Performance
├── Markup Analysis
└── Lead Times

Pipeline/
├── Active Proposals
├── Forecasting
├── Win/Loss Analysis
└── Client Retention
```

---

## Part 6: Data Requirements

### 6.1 Required Entities

**Staff Members:**
- Name
- Role
- Cost Rate (£/hr)
- Charge Rate (£/hr)
- Department
- Start Date
- Target Billable Hours %

**Projects:**
- Name
- Client
- Project Type
- Status
- Total Fee
- Start Date
- Target End Date
- Fee Structure (phases)

**Phases:**
- Name
- Allocated Fee
- Assigned Staff
- Status
- Hours Budget
- Hours Actual (calculated)

**Time Entries:**
- Staff Member
- Project
- Phase
- Task Category
- Duration
- Date
- Billable Y/N
- Notes

**Procurement Items:**
- Item Name
- Supplier
- Category
- Cost Price
- Client Price
- Markup %
- Status
- Project

---

### 6.2 Calculation Definitions

**Gross Margin:**
```
(Revenue - Direct Costs) / Revenue × 100
Direct Costs = Staff Time Cost + Procurement Cost
```

**Net Margin:**
```
(Revenue - All Costs) / Revenue × 100
All Costs = Direct Costs + Allocated Overhead
```

**Billable Ratio:**
```
Billable Hours / Total Hours Worked × 100
```

**Revenue per Employee:**
```
Total Revenue / Number of Employees
```

**Project Margin:**
```
(Fee Quoted - Total Cost) / Fee Quoted × 100
```

**Phase Margin:**
```
(Phase Fee - Phase Cost) / Phase Fee × 100
Phase Cost = Hours Actual × Staff Cost Rate
```

---

## Part 7: Competitive Differentiation

### What makes Focuspilot reporting best-in-class:

| Feature | Focuspilot | Studio Designer | Design Manager | Programma |
|---------|------------|-----------------|----------------|-----------|
| Phase-level profitability | ✅ | Limited | Limited | ❌ |
| Real-time margin on project page | ✅ | ❌ | ❌ | ❌ |
| Staff cost rate tracking | ✅ | ✅ | ✅ | Limited |
| RIBA stage native | ✅ | ❌ (US-focused) | ❌ | ❌ |
| Historical learning/benchmarks | ✅ | Limited | Limited | ❌ |
| Dual view (charts + tables) | ✅ | Charts only | Tables only | Mixed |
| UK/Xero integration | ✅ | QuickBooks | QuickBooks | Limited |

---

## Implementation Priority

### Phase 1: Foundation (Week 1-2)
1. Staff cost rate configuration
2. Project margin summary widget
3. Phase profitability table on project page

### Phase 2: Core Reports (Week 3-4)
4. Project overview report
5. Time vs budget report
6. Utilization report

### Phase 3: Advanced (Week 5-6)
7. Phase profitability cross-project analysis
8. Staff profitability report
9. Executive dashboard

### Phase 4: Intelligence (Week 7-8)
10. Historical benchmarks
11. Scheduled reports
12. Procurement markup analysis

---

## Summary

The goal is simple: **know your margins before you finish the project, not after.**

Every interior design studio should be able to answer these questions in under 30 seconds:
- What's the current margin on this project?
- Which phase is eating our profit?
- Who's the most profitable team member?
- Are we on track for our monthly revenue target?

This reporting system makes that possible.
