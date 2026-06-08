import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import type { Href } from 'expo-router';
import { api } from '@/lib/api';

export type PushNotificationData = {
  notification_id?: number;
  notification_type?: string;
  task?: number;
  project?: number;
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function routeFromPushData(data: PushNotificationData): Href | null {
  if (data.task) return `/task/${data.task}` as Href;
  if (data.project) return `/project/${data.project}` as Href;
  return '/notifications' as Href;
}

export async function requestPushPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    return false;
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') {
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function getExpoPushToken(): Promise<string | null> {
  if (!Device.isDevice) {
    return null;
  }

  const granted = await requestPushPermissions();
  if (!granted) {
    return null;
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  try {
    const response = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    return response.data;
  } catch {
    return null;
  }
}

export async function registerPushTokenWithServer(token: string): Promise<void> {
  await api.post('/notifications/push-token/', {
    token,
    platform: Platform.OS,
    device_name: Device.modelName ?? Device.deviceName ?? Platform.OS,
  });
}

export async function unregisterPushToken(token?: string | null): Promise<void> {
  try {
    await api.delete('/notifications/push-token/', {
      params: token ? { token } : undefined,
    });
  } catch {
    // Best-effort on logout
  }
}

export async function showLocalNotification(title: string, body: string, data?: PushNotificationData) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data ?? {},
      sound: true,
    },
    trigger: null,
  });
}
