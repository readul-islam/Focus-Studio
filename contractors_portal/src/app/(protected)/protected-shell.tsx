'use client'

import Loader from '@/components/ui/loader'
import { PortalSupportWidget } from '@/components/support/portal-support-widget'
import useUser from '@/hooks/userUser'
import { useRouter } from 'next/navigation'
import { useEffect, type ReactNode } from 'react'

export function ProtectedShell({ children }: { children: ReactNode }) {
  const { user, project, isLoading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return
    if (!user) {
      router.replace('/login')
      return
    }
    if (!project) {
      router.replace('/select-project')
    }
  }, [isLoading, user, project, router])

  if (isLoading || !user || !project) {
    return <Loader />
  }

  return (
    <>
      {children}
      <PortalSupportWidget />
    </>
  )
}
