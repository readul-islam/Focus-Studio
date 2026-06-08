import { useCallback, useEffect, useRef, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import {
  getExpoPushToken,
  registerPushTokenWithServer,
  unregisterPushToken,
} from '@/lib/push-notifications';

const PUSH_ENABLED_KEY = 'push_notifications_enabled';

async function readPushEnabled(): Promise<boolean> {
  const stored = await SecureStore.getItemAsync(PUSH_ENABLED_KEY);
  return stored !== 'false';
}

async function writePushEnabled(enabled: boolean): Promise<void> {
  await SecureStore.setItemAsync(PUSH_ENABLED_KEY, enabled ? 'true' : 'false');
}

export function usePushNotifications(isAuthenticated: boolean) {
  const [enabled, setEnabled] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [loading, setLoading] = useState(true);
  const tokenRef = useRef<string | null>(null);

  const syncRegistration = useCallback(async (shouldEnable: boolean) => {
    if (!isAuthenticated || !shouldEnable) {
      if (tokenRef.current) {
        await unregisterPushToken(tokenRef.current);
        tokenRef.current = null;
      }
      return;
    }

    const token = await getExpoPushToken();
    if (!token) {
      setPermissionGranted(false);
      return;
    }

    tokenRef.current = token;
    setPermissionGranted(true);
    await registerPushTokenWithServer(token);
  }, [isAuthenticated]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const storedEnabled = await readPushEnabled();
      if (cancelled) return;

      setEnabled(storedEnabled);

      const { status } = await Notifications.getPermissionsAsync();
      if (cancelled) return;

      setPermissionGranted(status === 'granted');
      await syncRegistration(storedEnabled);
      if (!cancelled) setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, syncRegistration]);

  const enable = useCallback(async (): Promise<boolean> => {
    if (!Device.isDevice) {
      return false;
    }

    await writePushEnabled(true);
    setEnabled(true);
    await syncRegistration(true);

    const { status } = await Notifications.getPermissionsAsync();
    const granted = status === 'granted';
    setPermissionGranted(granted);
    return granted;
  }, [syncRegistration]);

  const disable = useCallback(async () => {
    await writePushEnabled(false);
    setEnabled(false);
    await syncRegistration(false);
  }, [syncRegistration]);

  return {
    enabled,
    permissionGranted,
    isDevice: Device.isDevice,
    loading,
    enable,
    disable,
  };
}
