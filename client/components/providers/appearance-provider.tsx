'use client';

import { useAppearanceSync } from '@/hooks/useAppearanceSync';
import { clearAppearanceFromDocument, DEFAULT_APPEARANCE } from '@/lib/appearance';
import { useTheme } from 'next-themes';
import { type ReactNode, useEffect } from 'react';
import useUser from '@/hooks/useUser';

/** Keeps density/accent in sync; theme is owned by next-themes. */
export function AppearanceProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const { setTheme } = useTheme();
  useAppearanceSync();

  useEffect(() => {
    if (!user?.email) {
      clearAppearanceFromDocument();
      setTheme(DEFAULT_APPEARANCE.theme);
    }
  }, [user?.email, setTheme]);

  return <>{children}</>;
}
