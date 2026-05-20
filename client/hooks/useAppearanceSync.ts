'use client';

import useFetch from '@/hooks/useFetch';
import usePatch from '@/hooks/usePatch';
import useUser from '@/hooks/useUser';
import {
  applyAppearanceToDocument,
  DEFAULT_APPEARANCE,
  type AppearancePrefs,
  type AppearanceTheme,
} from '@/lib/appearance';
import { useTheme } from 'next-themes';
import { useCallback, useEffect, useRef } from 'react';

const APPEARANCE_URL = '/user/self/appearance/';

/**
 * Syncs theme with next-themes (localStorage + html.dark) and density/accent on document.
 * API is source of truth on first load; user changes update both instantly.
 */
export function useAppearanceSync() {
  const { user, isLoading: userLoading } = useUser();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const syncedFromApi = useRef(false);
  const { data } = useFetch(user?.email ? APPEARANCE_URL : null, {
    enabled: !userLoading && !!user?.email,
  });
  const { mutate: patchAppearance } = usePatch();

  // Apply API preferences once per session (do not fight user toggles after that)
  useEffect(() => {
    if (!user?.email) {
      syncedFromApi.current = false;
      return;
    }
    if (!data || syncedFromApi.current) return;

    const prefs = data as AppearancePrefs;
    setTheme(prefs.theme);
    applyAppearanceToDocument(prefs);
    syncedFromApi.current = true;
  }, [data, user?.email, setTheme]);

  useEffect(() => {
    if (!user?.email || !data) return;
    applyAppearanceToDocument({
      ...(data as AppearancePrefs),
      theme: (theme as AppearanceTheme) ?? (data as AppearancePrefs).theme,
    });
  }, [resolvedTheme, theme, data, user?.email]);

  const setAppearanceTheme = useCallback(
    (nextTheme: AppearanceTheme, fullPrefs?: AppearancePrefs) => {
      setTheme(nextTheme);
      const prefs: AppearancePrefs = fullPrefs
        ? { ...fullPrefs, theme: nextTheme }
        : {
            theme: nextTheme,
            density: (data as AppearancePrefs)?.density ?? DEFAULT_APPEARANCE.density,
            accent_color: (data as AppearancePrefs)?.accent_color ?? null,
          };
      applyAppearanceToDocument(prefs);

      if (user?.email) {
        patchAppearance({ url: APPEARANCE_URL, data: { theme: nextTheme } });
      }
    },
    [setTheme, data, user?.email, patchAppearance]
  );

  const applyPrefs = useCallback(
    (prefs: AppearancePrefs) => {
      setTheme(prefs.theme);
      applyAppearanceToDocument(prefs);
    },
    [setTheme]
  );

  return {
    theme: (theme as AppearanceTheme) ?? DEFAULT_APPEARANCE.theme,
    resolvedTheme,
    setTheme: setAppearanceTheme,
    applyPrefs,
    apiPrefs: data as AppearancePrefs | undefined,
    isAuthenticated: !!user?.email,
  };
}
