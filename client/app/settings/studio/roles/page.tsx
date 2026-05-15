'use client'

import { PermissionGuard } from "@/components/PermissionGuard"
import { Section } from "@/components/settings/section"
import { PermissionsMatrix, ApiMatrix } from "@/components/settings/permissions-matrix"
import useFetch from "@/hooks/useFetch"
import usePatch from "@/hooks/usePatch"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { usePermissions } from "@/hooks/usePermissions"

const ROLES_URL = "/user/studio/roles/"

function RolesPageContent() {
  const queryClient = useQueryClient()
  const { userRole } = usePermissions()
  const { data: matrix, isLoading } = useFetch(ROLES_URL)
  const { mutate: saveRoles, isPending } = usePatch({
    onSuccess: () => {
      toast.success("Permissions updated.")
      // Invalidate the matrix so the UI reflects the new values
      queryClient.invalidateQueries({ queryKey: [ROLES_URL] })
      // Invalidate user/self/ so capability tokens are re-fetched for all hooks
      queryClient.invalidateQueries({ queryKey: ['user/self/'] })
    },
    onError: () => toast.error("Failed to save permissions."),
  })

  const handleToggle = (role: string, permission: string, enabled: boolean) => {
    saveRoles({ url: ROLES_URL, data: [{ role, permission, enabled }] })
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-base font-semibold text-gray-900">Roles & permissions</h1>
        <p className="text-sm text-gray-600">Define what each role can view and edit across the workspace.</p>
      </div>

      <Section title="Permissions matrix" description="Customise access for each role.">
        {isLoading && <div className="py-6 text-sm text-gray-500">Loading permissions…</div>}
        {!isLoading && matrix && (
          <PermissionsMatrix
            matrix={matrix as ApiMatrix}
            onToggle={handleToggle}
            disabled={isPending}
            userRole={userRole}
          />
        )}
      </Section>
    </div>
  )
}

export default function RolesPage() {
  return (
    <PermissionGuard permission="settings.edit" redirectTo="/settings/user/profile">
      <RolesPageContent />
    </PermissionGuard>
  )
}
