# Focuspilot Production Improvements

## Navigation & Labeling

- [x] Rename "Documents" → "Files" across all project tabs
- [x] Abbreviate in Finance list Type column: "Purchase Order" → "PO", "Invoice" → "Inv"

## Calendar Page

- [x] Add "+ Add Event" button to calendar page header (currently missing)

## Projects List Page

- [x] Remove Board/Table toggle - keep Board view only
- [x] Move "+ Add Project" button to same row as Active/Completed filters
- [x] Remove search field (redundant with global search ⌘K)

## Tab Structure

- [x] Contractors sub-tabs (Overview/Procurement/RFIs) should match page-level tab styling, not appear as a separate secondary row
- [ ] Review: Consider underline tabs for nested navigation instead of filled tabs - cleaner hierarchy (flag for review)

## Messages Tab (Project Level)

- [x] Remove sub-tab filter bar in Messages (All/Mentions/System/Emails/AI Notes)
- [x] Add inline type badges to each message instead (e.g., "Email", "System", "AI Note")

## List Views & Tables

- [x] Implement thin scrollbar styling on all scrollable tables/lists
- [x] Reduce column padding - too much whitespace causing unnecessary horizontal scroll
- [x] Adjust column widths: narrower for Number/Type/Status/Date, wider for Supplier/Client/Description
- [x] Add "select all" checkbox to table headers (row checkboxes exist but no header checkbox)

## Empty States

- [x] Update empty state copy to be warmer:
  - [x] "No messages found" → "Nothing here yet"
  - [x] "No attachments" → "No files attached"
  - [x] "Select a conversation to view details" → "Select a message to see more"
- [ ] Optional: Add subtle illustrations to empty states (lower priority)

## Date & Time Formatting

- [x] Standardise date format to UK style throughout (e.g., "15 Jan" or "15/01/2026")
- [x] Standardise time/duration display - currently mixing "2h 0m" with "01:00:00"
  - Durations: "2h 30m"
  - Running timers: "01:23:45"
- [ ] Verify currency symbols are pulling correctly per project (saw both £ and R)

## Consistency Checks

- [ ] Audit "+ Add" button placement across all pages - should be consistent position
- [ ] Review all empty states for consistent tone

## Reporting System

> Reference: `/docs/techstyles-reporting-specification.md`

### Phase 1: Foundation
- [ ] Add Staff Cost Rate configuration to Team settings (Cost Rate £/hr and Charge Rate £/hr per staff member)
- [ ] Add Project Margin Summary widget to project detail page (Fee Quoted, Cost to Date, Current Margin %, Status)
- [ ] Add Phase Profitability table to project detail page (Phase, Fee, Staff Assigned, Hours Budget, Hours Actual, Cost, Margin, Status)

### Phase 2: Reports
- [ ] Create Financials reporting section (Dashboard, Project Reports, Phase Profitability, Staff Profitability, Revenue, Cash Flow)
- [ ] Implement dual view mode for all reports (Chart view and Table view toggle)
- [x] Add global filter system (Date range presets, Entity filters, Status filters, Month toggle)
