'use client';

import { useEffect, useRef } from 'react';
import { gooeyToast as toast } from 'goey-toast';

const POLL_INTERVAL = 1 * 60 * 1000; // 5 minutes

interface VersionInfo {
  hash: string;
  buildTime: string;
}

export function useAppUpdate() {
  const initialHashRef = useRef<string | null>(null);
  const hasShownToastRef = useRef(false);

  useEffect(() => {
    const fetchVersion = async (): Promise<VersionInfo | null> => {
      try {
        const response = await fetch('/version.json', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        });
        if (!response.ok) return null;
        return await response.json();
      } catch {
        return null;
      }
    };

    const checkForUpdate = async () => {
      const version = await fetchVersion();
      if (!version) return;

      // Store initial hash on first load
      if (initialHashRef.current === null) {
        initialHashRef.current = version.hash;
        return;
      }

      // Check if version changed and we haven't shown toast yet
      if (version.hash !== initialHashRef.current && !hasShownToastRef.current) {
        hasShownToastRef.current = true;
        toast.info('A new version is available', {
          description: 'Refresh to get the latest features',
          timing: { displayDuration: 999999999 },
          action: {
            label: 'Refresh',
            onClick: () => window.location.reload(),
            successLabel: 'Refreshing...',
          },
          onDismiss: () => {
            hasShownToastRef.current = false;
          },
        });
      }
    };

    // Check immediately on mount
    checkForUpdate();

    // Poll every 5 minutes
    const interval = setInterval(checkForUpdate, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, []);
}
