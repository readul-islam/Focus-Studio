'use client'

import NextLink from 'next/link'
import {
  useParams as useNextParams,
  usePathname,
  useRouter,
  useSearchParams,
} from 'next/navigation'
import { forwardRef, useEffect, type ComponentProps } from 'react'

type LinkProps = Omit<ComponentProps<typeof NextLink>, 'href'> & {
  to: string
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function PortalLink(
  { to, ...props },
  ref
) {
  return <NextLink ref={ref} href={to} {...props} />
})

export { Link as RouterLink }

export function useNavigate() {
  const router = useRouter()
  return (to: string) => router.push(to)
}

export function useParams<T extends Record<string, string | undefined> = Record<string, string>>() {
  return useNextParams() as T
}

export { useSearchParams }

export function useLocation() {
  const pathname = usePathname() ?? '/'
  const searchParams = useSearchParams()
  return {
    pathname,
    search: searchParams?.toString() ? `?${searchParams.toString()}` : '',
    hash: '',
  }
}

export function Navigate({ to, replace }: { to: string; replace?: boolean }) {
  const router = useRouter()
  useEffect(() => {
    if (replace) router.replace(to)
    else router.push(to)
  }, [router, to, replace])
  return null
}

export function Outlet({ children }: { children?: React.ReactNode }) {
  return <>{children}</>
}
