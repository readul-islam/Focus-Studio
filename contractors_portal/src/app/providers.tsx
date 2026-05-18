'use client'

import { AuthProvider } from '@/components/Providers/AuthProvider'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'sonner'

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 1000 * 60 * 5,
          },
        },
      })
  )

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <AuthProvider>
            {children}
            <Toaster
            duration={900}
            toastOptions={{
              classNames: {
                toast: 'max-sm:!top-4 max-sm:!py-6',
              },
            }}
            className="max-sm:!top-0 max-sm:!bottom-auto max-sm:!mx-auto"
            />
          </AuthProvider>
        </LocalizationProvider>
      </QueryClientProvider>
    </HelmetProvider>
  )
}
