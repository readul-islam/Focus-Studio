"use client"

import { useEffect, useMemo, useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { X } from "lucide-react"
import { useTranslations } from "next-intl"

function NACheckbox() {
  return (
    <div className="w-4 h-4 rounded-[6px] border border-border/60 bg-muted/20 flex items-center justify-center flex-shrink-0">
      <X className="w-2.5 h-2.5 text-muted-foreground/60" strokeWidth={3} />
    </div>
  )
}

export type ApiMatrix = Record<string, { admin: boolean; manager: boolean; member: boolean }>

type ResourceMeta = {
  key: string
  viewOnly?: boolean
  editOnly?: boolean
  noDelete?: boolean
  lockedFor?: string[]
}

const RESOURCE_META: ResourceMeta[] = [
  { key: "projects" },
  { key: "tasks" },
  { key: "finance" },
  { key: "clients" },
  { key: "library" },
  { key: "team" },
  { key: "documents" },
  { key: "reports", viewOnly: true },
  { key: "design", noDelete: true },
  { key: "settings", editOnly: true, lockedFor: ["admin"] },
]

const ALL_ROLE_COLUMNS = [
  { key: "admin", labelKey: "admin" as const },
  { key: "manager", labelKey: "manager" as const },
  { key: "member", labelKey: "member" as const },
]

export function PermissionsMatrix({
  matrix: apiMatrix,
  onToggle,
  disabled,
  userRole,
}: {
  matrix: ApiMatrix
  onToggle: (role: string, permission: string, enabled: boolean) => void
  disabled?: boolean
  userRole?: string
}) {
  const t = useTranslations("settingsRolesPage.matrix")
  const roleColumns = userRole === "admin" ? ALL_ROLE_COLUMNS : ALL_ROLE_COLUMNS.filter(c => c.key !== "admin")
  const [local, setLocal] = useState<ApiMatrix>(apiMatrix)

  const resources = useMemo(
    () =>
      RESOURCE_META.map((meta) => ({
        ...meta,
        label: t(`resources.${meta.key}.label` as "resources.projects.label"),
        desc: t(`resources.${meta.key}.desc` as "resources.projects.desc"),
      })),
    [t],
  )

  useEffect(() => {
    setLocal(apiMatrix)
  }, [apiMatrix])

  function handleToggle(role: string, permKey: string, checked: boolean) {
    setLocal(prev => ({
      ...prev,
      [permKey]: { ...prev[permKey], [role]: checked },
    }))
    onToggle(role, permKey, checked)
  }

  return (
    <div className="overflow-x-auto -mx-4 sm:-mx-5 scrollbar-thin scrollbar-thumb-rounded">
      <div className={`grid border-b border-border/40 bg-muted/10 px-4 py-3.5 ${roleColumns.length === 3 ? "grid-cols-[1fr_repeat(3,_180px)]" : "grid-cols-[1fr_repeat(2,_180px)]"}`}>
        <div />
        {roleColumns.map(col => (
          <div key={col.key} className="text-center">
            <span className="text-xs font-bold text-foreground tracking-tight">{t(`roles.${col.labelKey}`)}</span>
            <div className="flex justify-center gap-4 mt-2">
              <span className="text-[10px] font-semibold text-muted-foreground/80 w-8">{t("columns.view")}</span>
              <span className="text-[10px] font-semibold text-muted-foreground/80 w-8">{t("columns.edit")}</span>
              <span className="text-[10px] font-semibold text-muted-foreground/80 w-8">{t("columns.delete")}</span>
            </div>
          </div>
        ))}
      </div>

      {resources.map((res, i) => (
        <div
          key={res.key}
          className={`grid items-center px-4 py-3.5 border-b border-border/20 last:border-b-0 transition-colors duration-200 ${roleColumns.length === 3 ? "grid-cols-[1fr_repeat(3,_180px)]" : "grid-cols-[1fr_repeat(2,_180px)]"} ${i % 2 === 0 ? "bg-card/45" : "bg-muted/10"}`}
        >
          <div>
            <p className="text-sm font-bold text-foreground">{res.label}</p>
            <p className="text-xs text-muted-foreground/80 mt-0.5">{res.desc}</p>
          </div>
          {roleColumns.map(col => {
            const viewKey   = `${res.key}.view`
            const editKey   = `${res.key}.edit`
            const deleteKey = `${res.key}.delete`
            const viewValue   = local[viewKey]?.[col.key as keyof ApiMatrix[string]]   ?? false
            const editValue   = local[editKey]?.[col.key as keyof ApiMatrix[string]]   ?? false
            const deleteValue = local[deleteKey]?.[col.key as keyof ApiMatrix[string]] ?? false
            const isLockedForRole = res.lockedFor?.includes(col.key) ?? false

            const noView   = !!res.editOnly
            const noEdit   = !!res.viewOnly
            const noDelete = !!res.viewOnly || !!res.editOnly || !!res.noDelete

            return (
              <div key={col.key} className="flex justify-center gap-4">
                <div className="w-8 flex justify-center">
                  {noView ? <NACheckbox /> : (
                    <Checkbox
                      checked={!!viewValue}
                      disabled={isLockedForRole || disabled}
                      onCheckedChange={checked => handleToggle(col.key, viewKey, !!checked)}
                      aria-label={`${t(`roles.${col.labelKey}`)} ${t("columns.view")} ${res.label}`}
                    />
                  )}
                </div>
                <div className="w-8 flex justify-center">
                  {noEdit ? <NACheckbox /> : (
                    <Checkbox
                      checked={!!editValue}
                      disabled={isLockedForRole || disabled}
                      onCheckedChange={checked => handleToggle(col.key, editKey, !!checked)}
                      aria-label={`${t(`roles.${col.labelKey}`)} ${t("columns.edit")} ${res.label}`}
                    />
                  )}
                </div>
                <div className="w-8 flex justify-center">
                  {noDelete ? <NACheckbox /> : (
                    <Checkbox
                      checked={!!deleteValue}
                      disabled={isLockedForRole || disabled}
                      onCheckedChange={checked => handleToggle(col.key, deleteKey, !!checked)}
                      aria-label={`${t(`roles.${col.labelKey}`)} ${t("columns.delete")} ${res.label}`}
                    />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
