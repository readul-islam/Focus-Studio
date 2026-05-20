'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ReactNode } from 'react';

/**
 * Standard class-based theming (shadcn / next-themes).
 * Sets `class="dark"` on <html> for Tailwind `darkMode: ['class']`.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      enableColorScheme
      storageKey="focuspilot-theme"
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
