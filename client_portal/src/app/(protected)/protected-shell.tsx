'use client'

import Loader from '@/components/ui/loader'
import useUser from '@/hooks/userUser'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, type ReactNode } from 'react'

export function ProtectedShell({ children }: { children: ReactNode }) {
  const { user } = useUser()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!user && pathname !== '/login') {
      router.replace('/login')
    }
  }, [user, router, pathname])

  if (!user) {
    return <Loader />
  }

  return <>{children}</>
}
