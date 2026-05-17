'use client'

import Loader from '@/components/ui/loader'
import useUser from '@/hooks/userUser'
import { useRouter } from 'next/navigation'
import { useEffect, type ReactNode } from 'react'

export function ProtectedShell({ children }: { children: ReactNode }) {
  const { user } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.replace('/login')
    }
  }, [user, router])

  if (!user) {
    return <Loader />
  }

  return <>{children}</>
}
