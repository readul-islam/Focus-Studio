"use client"

import { useEffect, useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { X } from "lucide-react"

function NACheckbox() {
  return (
    <div className="w-4 h-4 rounded-[6px] border border-border/60 bg-muted/20 flex items-center justify-center flex-shrink-0">
      <X className="w-2.5 h-2.5 text-muted-foreground/60" strokeWidth={3} />
    </div>
  )
}

export type ApiMatrix = Record<string, { admin: boolean; manager: boolean; member: boolean }>

type Resource = {
  key: string
  label: string
  desc: string
  viewOnly?: boolean   // only has .view — edit & delete show N/A
  editOnly?: boolean   // only has .edit — view & delete show N/A
  noDelete?: boolean   // has view + edit but no delete
  lockedFor?: string[] // role keys whose checkboxes are always read-only
}

const resources: Resource[] = [
  { key: "projects",  label: "Projects",  desc: "Project overview, phases, timelines" },
  { key: "tasks",     label: "Tasks",     desc: "Task creation and assignment" },
  { key: "finance",   label: "Finance",   desc: "Invoices, POs, expenses" },
  { key: "clients",   label: "Clients",   desc: "CRM contacts and client records" },
  { key: "library",   label: "Library",   desc: "Products, materials, specs" },
  { key: "team",      label: "Team",      desc: "Member management and roles" },
  { key: "documents", label: "Documents", desc: "Project files, folders and notes" },
  { key: "reports",   label: "Reports",   desc: "Studio analytics and exports", viewOnly: true },
  { key: "design",    label: "Design",    desc: "AI design workspace and image generation", noDelete: true },
  { key: "settings",  label: "Settings",  desc: "Studio-wide settings and configuration", editOnly: true, lockedFor: ["admin"] },
]

const ALL_ROLE_COLUMNS = [
  { key: "admin",   label: "Admin" },
  { key: "manager", label: "Manager" },
  { key: "member",  label: "Member" },
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
  const roleColumns = userRole === "admin" ? ALL_ROLE_COLUMNS : ALL_ROLE_COLUMNS.filter(c => c.key !== "admin")
  const [local, setLocal] = useState<ApiMatrix>(apiMatrix)

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
      {/* Header */}
      <div className={`grid border-b border-border/40 bg-muted/10 px-4 py-3.5 ${roleColumns.length === 3 ? "grid-cols-[1fr_repeat(3,_180px)]" : "grid-cols-[1fr_repeat(2,_180px)]"}`}>
        <div />
        {roleColumns.map(col => (
          <div key={col.key} className="text-center">
            <span className="text-xs font-bold text-foreground tracking-tight">{col.label}</span>
            <div className="flex justify-center gap-4 mt-2">
              <span className="text-[10px] font-semibold text-muted-foreground/80 w-8">View</span>
              <span className="text-[10px] font-semibold text-muted-foreground/80 w-8">Edit</span>
              <span className="text-[10px] font-semibold text-muted-foreground/80 w-8">Delete</span>
            </div>
          </div>
        ))}
      </div>

      {/* Rows */}
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
                {/* View */}
                <div className="w-8 flex justify-center">
                  {noView ? <NACheckbox /> : (
                    <Checkbox
                      checked={!!viewValue}
                      disabled={isLockedForRole || disabled}
                      onCheckedChange={checked => handleToggle(col.key, viewKey, !!checked)}
                      aria-label={`${col.label} view ${res.label}`}
                    />
                  )}
                </div>
                {/* Edit */}
                <div className="w-8 flex justify-center">
                  {noEdit ? <NACheckbox /> : (
                    <Checkbox
                      checked={!!editValue}
                      disabled={isLockedForRole || disabled}
                      onCheckedChange={checked => handleToggle(col.key, editKey, !!checked)}
                      aria-label={`${col.label} edit ${res.label}`}
                    />
                  )}
                </div>
                {/* Delete */}
                <div className="w-8 flex justify-center">
                  {noDelete ? <NACheckbox /> : (
                    <Checkbox
                      checked={!!deleteValue}
                      disabled={isLockedForRole || disabled}
                      onCheckedChange={checked => handleToggle(col.key, deleteKey, !!checked)}
                      aria-label={`${col.label} delete ${res.label}`}
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
