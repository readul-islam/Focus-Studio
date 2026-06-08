import Constants from 'expo-constants';
import { Platform } from 'react-native';

function normalizeApiBase(url: string): string {
  return url.replace(/\/$/, '').replace('127.0.0.1', 'localhost');
}

export function getApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) {
    return normalizeApiBase(fromEnv);
  }

  // Android emulator cannot reach host localhost — use special alias
  if (Platform.OS === 'android' && !Constants.isDevice) {
    return 'http://10.0.2.2:8000';
  }

  return 'http://localhost:8000';
}
