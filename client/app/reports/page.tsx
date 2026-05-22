"use client"

import { PermissionGuard } from '@/components/PermissionGuard'
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  FolderOpen,
  Users,
  CreditCard,
  Package,
  TrendingUp,
  LayoutDashboard,
} from "lucide-react"

const reportCategories = [
  {
    id: "overview",
    title: "Overview",
    description: "Studio-wide KPIs: hours, costs, active projects and outstanding invoices at a glance",
    icon: LayoutDashboard,
    href: "/reports/overview",
    color: "bg-emerald-50 text-emerald-700",
    subReports: [
      { name: "Hours This Month", description: "Total logged hours" },
      { name: "Studio Cost", description: "Staff cost this period" },
      { name: "Outstanding Invoices", description: "Unpaid invoice total" },
    ],
  },
  {
    id: "projects",
    title: "Projects",
    description: "Track hours, budget burn and fee spend per project and phase",
    icon: FolderOpen,
    href: "/reports/projects",
    color: "bg-amber-100 text-amber-700",
    subReports: [
      { name: "By Project", description: "Hours and cost per project" },
      { name: "Budget Burn", description: "Hours vs. budgeted hours" },
      { name: "Phase Breakdown", description: "Drill into phases and timelogs" },
    ],
  },
  {
    id: "team",
    title: "Team",
    description: "Hours logged per team member by period — payroll-ready with one-click export",
    icon: Users,
    href: "/reports/team",
    color: "bg-emerald-50 text-olive-600",
    subReports: [
      { name: "By Staff Member", description: "Hours and cost per person" },
      { name: "Period Quick-Select", description: "This week, last month, custom" },
      { name: "Export to CSV", description: "Payroll-ready export" },
    ],
  },
  {
    id: "finance",
    title: "Finance",
    description: "All invoices and purchase orders — status, amounts, Xero sync and outstanding balances",
    icon: CreditCard,
    href: "/reports/finance",
    color: "bg-orange-50 text-terracotta-600",
    subReports: [
      { name: "Invoices", description: "Raised, paid and outstanding" },
      { name: "Purchase Orders", description: "Supplier spend and status" },
      { name: "Studio Net Position", description: "Revenue vs. costs" },
    ],
  },
  {
    id: "procurement",
    title: "Procurement",
    description: "Purchase orders, supplier spend and payment tracking across all projects",
    icon: Package,
    href: "/reports/procurement",
    color: "bg-amber-100 text-amber-700",
    subReports: [
      { name: "Purchase Orders", description: "All POs with status and amounts" },
      { name: "Monthly Spend", description: "PO spend trend by month" },
      { name: "Supplier Breakdown", description: "Spend by supplier" },
    ],
  },
  {
    id: "revenue",
    title: "Revenue & P&L",
    description: "Income, costs and net position by period — calculated from invoices, POs and staff costs",
    icon: TrendingUp,
    href: "/reports/revenue",
    color: "bg-greige-100 text-greige-500",
    subReports: [
      { name: "Revenue", description: "Invoiced income by period" },
      { name: "Costs", description: "PO spend and staff costs" },
      { name: "Net Position", description: "Profit margin overview" },
    ],
  },
]

function ReportsPageContent() {
  return (
    <main  className="flex flex-col h-[calc(100svh-3.5rem)] min-h-0 bg-stone-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto w-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1 min-h-0 space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500 mt-1">All reports are live data from your studio</p>
        </div>

        <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {reportCategories.map((category) => (
              <Link key={category.id} href={category.href}>
                <Card className="h-full cursor-pointer border-gray-200 bg-white transition-all hover:border-gray-300 hover:shadow-sm group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className={`w-10 h-10 rounded-lg ${category.color} flex items-center justify-center`}>
                        <category.icon className="w-5 h-5" />
                      </div>
                    </div>
                    <CardTitle className="text-base font-medium text-gray-900 group-hover:text-gray-700 transition-colors">
                      {category.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-500">{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-1.5">
                      {category.subReports.map((sub, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-gray-500">
                          <div className="w-1 h-1 rounded-full bg-ink-muted/40" />
                          <span>{sub.name}</span>
                          <span className="text-gray-400">— {sub.description}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

export default function ReportsPage() {
  return (
    <PermissionGuard permission="reports.view">
      <ReportsPageContent />
    </PermissionGuard>
  )
}
