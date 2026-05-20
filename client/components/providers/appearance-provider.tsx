'use client';

import { useAppearanceSync } from '@/hooks/useAppearanceSync';
import { clearAppearanceFromDocument, DEFAULT_APPEARANCE } from '@/lib/appearance';
import { isPublicAppRoute } from '@/lib/auth-routes';
import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';
import { type ReactNode, useEffect } from 'react';
import useUser from '@/hooks/useUser';

/** Keeps density/accent in sync; theme is owned by next-themes. */
export function AppearanceProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPublic = isPublicAppRoute(pathname);
  const { user } = useUser({ enabled: !isPublic });
  const { setTheme } = useTheme();
  useAppearanceSync({ enabled: !isPublic });

  useEffect(() => {
    if (!user?.email) {
      clearAppearanceFromDocument();
      setTheme(DEFAULT_APPEARANCE.theme);
    }
  }, [user?.email, setTheme]);

  return <>{children}</>;
}
