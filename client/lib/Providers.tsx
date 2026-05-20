'use client';

import { AppearanceProvider } from '@/components/providers/appearance-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 1000 * 60 * 5,
            refetchOnMount: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppearanceProvider>{children}</AppearanceProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
