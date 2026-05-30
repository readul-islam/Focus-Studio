'use client'

import { PermissionGuard } from "@/components/PermissionGuard"
import { Section } from "@/components/settings/section"
import { PermissionsMatrix, ApiMatrix } from "@/components/settings/permissions-matrix"
import useFetch from "@/hooks/useFetch"
import usePatch from "@/hooks/usePatch"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { usePermissions } from "@/hooks/usePermissions"
import { useTranslations } from 'next-intl'

const ROLES_URL = "/user/studio/roles/"

function RolesPageContent() {
  const t = useTranslations('settingsRolesPage')
  const queryClient = useQueryClient()
  const { userRole } = usePermissions()
  const { data: matrix, isLoading } = useFetch(ROLES_URL)
  const { mutate: saveRoles, isPending } = usePatch({
    onSuccess: () => {
      toast.success(t('toasts.updated'))
      queryClient.invalidateQueries({ queryKey: [ROLES_URL] })
      queryClient.invalidateQueries({ queryKey: ['user/self/'] })
    },
    onError: () => toast.error(t('toasts.saveFailed')),
  })

  const handleToggle = (role: string, permission: string, enabled: boolean) => {
    saveRoles({ url: ROLES_URL, data: [{ role, permission, enabled }] })
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-base font-bold text-foreground tracking-tight">{t('title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('description')}</p>
      </div>

      <Section title={t('matrixTitle')} description={t('matrixDescription')}>
        {isLoading && <div className="py-6 text-sm text-gray-500">{t('loadingPermissions')}</div>}
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
