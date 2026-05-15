# Reports World-Class Rebuild — Task List

> **Branch:** `feature/reports-redesign` (off `main`)
> **NEVER touch `v5` or `main`**
> **Design MUST match production** — use existing tailwind tokens, colours, sidebar, fonts

## Design System Rules
- Colours: `ink`, `sage`, `clay`, `ochre`, `terracotta`, `borderSoft`, `neutral-*` — NO hardcoded hex
- Cards: `bg-white border-borderSoft rounded-xl shadow-sm`
- Text: `text-ink` (headings), `text-ink-muted` (secondary), `text-neutral-*` for subtle
- Filter bar: `bg-neutral-100 rounded-lg p-1` toggle style (matches production ScopeToggle)
- Charts: Recharts, sage green `#748971` primary, ochre `#c4a882` secondary
- Tables: `divide-y divide-borderSoft`, hover `hover:bg-muted/10`
- Buttons: shadcn `<Button>`, no custom styles
- All pages use shared `ReportFilterBar`, `KpiCard`, `useReportFilters`

## Architecture
- **6 report pages total:** Overview, Projects, Team, Finance, Procurement, Revenue & P&L
- **Kill:** `/reports/productivity`, `/reports/sales`, `/reports/cost`, `/reports/profitability`, `/reports/utilisation` (standalone)
- **Utilisation folds INTO Team** as a tab/section
- Hub page (`/reports`) links to the 6 pages only

---

## Phase 1: Infrastructure + Cleanup

- [ ] Delete dummy-data pages: `productivity/`, `sales/`, `cost/`, `profitability/`
- [ ] Delete standalone `utilisation/` page (content moves to Team)
- [ ] Update hub page (`/reports/page.tsx`) — only 6 cards, remove dead links
- [ ] Add breadcrumb component (`components/reports/ReportBreadcrumb.tsx`)
- [ ] Add breadcrumbs to every report sub-page
- [ ] Upgrade `KpiCard` — add `prevValue` prop for period comparison (arrow + % change)
- [ ] Add PDF export button component (`components/reports/ExportPDF.tsx`) — uses browser print with `@media print` styles
- [ ] Ensure every page has consistent: header (title + description), filter bar, content area

## Phase 2: Overview Page

- [ ] KPI cards with period comparison arrows (this month vs last month %)
- [ ] Studio P&L summary strip (revenue - costs = net, margin %)
- [ ] Hours logged trend — 12-week sparkline or area chart (not just 1 bar chart)
- [ ] Top 5 projects by budget burn (% consumed, RAG colour coding)
- [ ] Top 5 overdue invoices (project, amount, days overdue)
- [ ] Team capacity heatmap or mini utilisation bars (who's overloaded, who's idle)
- [ ] Recent activity feed (last 10 time entries from API)

## Phase 3: Projects Page

- [ ] Keep existing: expandable project → phases → timelogs drill-down
- [ ] Keep existing: budget burn bars (hours + fees)
- [ ] Add: project health RAG status (hours burn % × fee burn % → green/amber/red badge)
- [ ] Add: fee vs cost profitability column (revenue from invoices - staff cost = margin)
- [ ] Add: filter by over/under budget, date range
- [ ] Ensure phase chart (actual vs budget) still works with project selector
- [ ] Sortable columns on the table

## Phase 4: Team Page (unified with Utilisation)

- [ ] Tab 1: **Hours** — current UserReport (hours per person, filters, CSV export)
- [ ] Tab 2: **Utilisation** — move utilisation content here (logged ÷ capacity per person, 80% target line, RAG bars, team average)
- [ ] Tab 3: **Timesheet** — week-by-week grid view (person × week = hours, with row/column totals)
- [ ] Drill-down: click person → `/reports/team/[id]` with project breakdown + time entries
- [ ] All tabs share the same filter bar + date range
- [ ] CSV export works from any tab
- [ ] PDF export for timesheet view

## Phase 5: Finance Page

- [ ] NO invoice list by default — only charts and analysis
- [ ] Revenue waterfall: invoiced → collected → outstanding → overdue (stacked/waterfall chart)
- [ ] Cash flow forecast: bar chart of expected payments based on invoice due dates
- [ ] Invoice aging: keep the bars + add sortable table underneath (project, amount, days overdue)
- [ ] PO spend by supplier (horizontal bars or table)
- [ ] Revenue by project (keep existing)
- [ ] Search function: type project/client name → shows related invoices + POs (this is the ONLY time invoice detail appears)
- [ ] Filter by: date range, project, status, amount range

## Phase 6: Procurement Page

- [ ] KPI strip: total items, total spend, budget vs actual delta, delivery completion %
- [ ] Interactive table: project → room → item hierarchy (expandable rows)
- [ ] Budget vs actual per project (comparison bars)
- [ ] Delivery pipeline visual: Ordered → Shipped → In Transit → Delivered (funnel or status bars)
- [ ] Supplier spend breakdown (top suppliers by spend)
- [ ] Overdue items highlight (should have arrived but hasn't)
- [ ] Filter by: project, room, supplier, status, date range
- [ ] NOTE: if `/reports/procurement-summary/` endpoint doesn't exist yet, show clean empty state with message

## Phase 7: Revenue & P&L Page

- [ ] Monthly P&L statement layout (Revenue → Direct Costs → Gross Margin → Net)
- [ ] 12-month trend: composed chart with revenue bars, cost bars, margin % line (keep existing, refine)
- [ ] Per-project profitability table: revenue - staff cost - PO cost = margin (keep existing, add sort)
- [ ] Cost breakdown: staff vs procurement pie/donut chart
- [ ] Margin trend sparklines per project
- [ ] Period comparison on KPIs (this year vs last year if data exists)

## Phase 8: Polish

- [ ] Consistent loading skeletons on every page
- [ ] Empty states with helpful copy ("No invoices in this period — try a wider date range")
- [ ] Print-ready `@media print` styles (hide sidebar, nav, filters — show data only)
- [ ] Test all pages with dev server running
- [ ] Final commit + push to `feature/reports-redesign`

---

## API Endpoints Used (all existing)
| Endpoint | Used By |
|----------|---------|
| `/reports/total-project-time/` | Overview, Projects |
| `/reports/project-phase-time/{id}/` | Projects (phase drill-down) |
| `/reports/users-time-report/?start_date=&end_date=` | Overview, Team, Utilisation |
| `/reports/user-time-report/{id}/?start_date=&end_date=` | Team drill-down |
| `/finance/studio-finance/` | Overview, Finance, Revenue & P&L |
| `/reports/procurement-summary/` | Procurement (may not be deployed) |

## Shared Components
| Component | Location |
|-----------|----------|
| `KpiCard` | `components/reports/KpiCard.tsx` |
| `ReportFilterBar` | `components/reports/ReportFilterBar.tsx` |
| `useReportFilters` | `hooks/useReportFilters.ts` |
| `ProjectPhases` | `components/reports/ProjectPhases.tsx` |
| `UserReport` | `components/reports/UserReport.tsx` |
| `ReportBreadcrumb` | `components/reports/ReportBreadcrumb.tsx` (NEW) |
| `ExportPDF` | `components/reports/ExportPDF.tsx` (NEW) |
