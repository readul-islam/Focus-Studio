import { createContext, useContext, type ReactNode } from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';

type PushNotificationsContextValue = ReturnType<typeof usePushNotifications>;

const PushNotificationsContext = createContext<PushNotificationsContextValue | null>(null);

export function PushNotificationsProvider({
  isAuthenticated,
  children,
}: {
  isAuthenticated: boolean;
  children: ReactNode;
}) {
  const value = usePushNotifications(isAuthenticated);
  return <PushNotificationsContext.Provider value={value}>{children}</PushNotificationsContext.Provider>;
}

export function usePushNotificationsContext() {
  const ctx = useContext(PushNotificationsContext);
  if (!ctx) {
    throw new Error('usePushNotificationsContext must be used within PushNotificationsProvider');
  }
  return ctx;
}
