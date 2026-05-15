'use client';

import { useAppUpdate } from '@/hooks/use-app-update';

export function AppUpdateChecker() {
  useAppUpdate();
  return null;
}
