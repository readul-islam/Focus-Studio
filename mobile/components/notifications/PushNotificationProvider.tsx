import { useEffect, useRef } from 'react';
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useAuth } from '@/context/AuthContext';
import { PushNotificationsProvider } from '@/context/PushNotificationsContext';
import { routeFromPushData, type PushNotificationData } from '@/lib/push-notifications';

function PushNotificationListeners({ children }: { children: React.ReactNode }) {
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data as PushNotificationData;
      const route = routeFromPushData(data);
      if (route) {
        router.push(route);
      }
    });

    return () => {
      responseListener.current?.remove();
    };
  }, []);

  return <>{children}</>;
}

export function PushNotificationProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  return (
    <PushNotificationsProvider isAuthenticated={isAuthenticated}>
      <PushNotificationListeners>{children}</PushNotificationListeners>
    </PushNotificationsProvider>
  );
}
