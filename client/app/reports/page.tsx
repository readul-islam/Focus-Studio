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
import { useTranslations } from 'next-intl'

function ReportsPageContent() {
  const t = useTranslations('reportsPage');
  const reportCategories = [
    {
      id: "overview",
      title: t('overview.title'),
      description: t('overview.description'),
      icon: LayoutDashboard,
      href: "/reports/overview",
      color: "bg-emerald-50 text-emerald-700",
      subReports: [
        { name: t('overview.sub1Name'), description: t('overview.sub1Description') },
        { name: t('overview.sub2Name'), description: t('overview.sub2Description') },
        { name: t('overview.sub3Name'), description: t('overview.sub3Description') },
      ],
    },
    {
      id: "projects",
      title: t('projects.title'),
      description: t('projects.description'),
      icon: FolderOpen,
      href: "/reports/projects",
      color: "bg-amber-100 text-amber-700",
      subReports: [
        { name: t('projects.sub1Name'), description: t('projects.sub1Description') },
        { name: t('projects.sub2Name'), description: t('projects.sub2Description') },
        { name: t('projects.sub3Name'), description: t('projects.sub3Description') },
      ],
    },
    {
      id: "team",
      title: t('team.title'),
      description: t('team.description'),
      icon: Users,
      href: "/reports/team",
      color: "bg-emerald-50 text-olive-600",
      subReports: [
        { name: t('team.sub1Name'), description: t('team.sub1Description') },
        { name: t('team.sub2Name'), description: t('team.sub2Description') },
        { name: t('team.sub3Name'), description: t('team.sub3Description') },
      ],
    },
    {
      id: "finance",
      title: t('finance.title'),
      description: t('finance.description'),
      icon: CreditCard,
      href: "/reports/finance",
      color: "bg-orange-50 text-terracotta-600",
      subReports: [
        { name: t('finance.sub1Name'), description: t('finance.sub1Description') },
        { name: t('finance.sub2Name'), description: t('finance.sub2Description') },
        { name: t('finance.sub3Name'), description: t('finance.sub3Description') },
      ],
    },
    {
      id: "procurement",
      title: t('procurement.title'),
      description: t('procurement.description'),
      icon: Package,
      href: "/reports/procurement",
      color: "bg-amber-100 text-amber-700",
      subReports: [
        { name: t('procurement.sub1Name'), description: t('procurement.sub1Description') },
        { name: t('procurement.sub2Name'), description: t('procurement.sub2Description') },
        { name: t('procurement.sub3Name'), description: t('procurement.sub3Description') },
      ],
    },
    {
      id: "revenue",
      title: t('revenue.title'),
      description: t('revenue.description'),
      icon: TrendingUp,
      href: "/reports/revenue",
      color: "bg-greige-100 text-greige-500",
      subReports: [
        { name: t('revenue.sub1Name'), description: t('revenue.sub1Description') },
        { name: t('revenue.sub2Name'), description: t('revenue.sub2Description') },
        { name: t('revenue.sub3Name'), description: t('revenue.sub3Description') },
      ],
    },
  ];

  return (
    <main  className="flex flex-col h-[calc(100svh-3.5rem)] min-h-0 bg-stone-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto w-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1 min-h-0 space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{t('title')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('subtitle')}</p>
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
