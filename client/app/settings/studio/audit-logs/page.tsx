"use client"

import { useMemo, useState } from "react"
import { PermissionGuard } from "@/components/PermissionGuard"
import { Section } from "@/components/settings/section"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/chip"
import useFetch from "@/hooks/useFetch"
import { Loader2 } from "lucide-react"
import { useTranslations } from 'next-intl'

type Severity = "low" | "medium" | "high"

type Log = {
  id: string
  actor: string
  action: string
  target: string
  severity: Severity
  date: string
}

function AuditLogsPageContent() {
  const t = useTranslations('settingsAuditLogsPage')
  const { data, isLoading, isError } = useFetch<{ results: Log[] }>('user/studio/audit-logs/')
  const [query, setQuery] = useState("")
  const [severity, setSeverity] = useState<"all" | Severity>("all")

  const logs = data?.results ?? []

  const filtered = useMemo(() => {
    return logs.filter(
      (l) =>
        (severity === "all" || l.severity === severity) &&
        [l.actor, l.action, l.target].join(" ").toLowerCase().includes(query.toLowerCase()),
    )
  }, [logs, query, severity])

  const severityLabel = (value: Severity) => {
    if (value === 'low') return t('severityLow')
    if (value === 'medium') return t('severityMedium')
    return t('severityHigh')
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-base font-semibold text-gray-900">{t('title')}</h1>
        <p className="text-sm text-gray-600">{t('description')}</p>
      </div>

      <Section title={t('activityTitle')} description={t('activityDescription')}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Input
            placeholder={t('searchPlaceholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="sm:w-[320px]"
          />
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{t('severity')}</span>
            <Select defaultValue="all" onValueChange={(v: "all" | Severity) => setSeverity(v)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('severityAll')}</SelectItem>
                <SelectItem value="low">{t('severityLow')}</SelectItem>
                <SelectItem value="medium">{t('severityMedium')}</SelectItem>
                <SelectItem value="high">{t('severityHigh')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4 rounded-xl scrollbar scrollbar-thin border border-gray-200 overflow-hidden bg-white">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-gray-500">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('table.actor')}</TableHead>
                  <TableHead>{t('table.action')}</TableHead>
                  <TableHead>{t('table.target')}</TableHead>
                  <TableHead>{t('table.severity')}</TableHead>
                  <TableHead>{t('table.date')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">{l.actor}</TableCell>
                    <TableCell>{l.action}</TableCell>
                    <TableCell>{l.target}</TableCell>
                    <TableCell>
                      <StatusBadge status={l.severity} label={severityLabel(l.severity)} />
                    </TableCell>
                    <TableCell>{l.date}</TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-sm text-gray-500">
                      {isError ? t('loadFailed') : t('noResults')}
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          )}
        </div>
      </Section>
    </div>
  )
}

export default function AuditLogsPage() {
  return (
    <PermissionGuard permission="settings.edit" redirectTo="/settings/user/profile">
      <AuditLogsPageContent />
    </PermissionGuard>
  )
}
