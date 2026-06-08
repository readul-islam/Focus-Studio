import * as SecureStore from 'expo-secure-store';
import type { TokenStorage } from '@focuspilot/api-client';

const ACCESS_KEY = 'focuspilot_access_token';
const REFRESH_KEY = 'focuspilot_refresh_token';

export const secureTokenStorage: TokenStorage = {
  async getAccessToken() {
    return SecureStore.getItemAsync(ACCESS_KEY);
  },
  async getRefreshToken() {
    return SecureStore.getItemAsync(REFRESH_KEY);
  },
  async setTokens({ access, refresh }) {
    await SecureStore.setItemAsync(ACCESS_KEY, access);
    await SecureStore.setItemAsync(REFRESH_KEY, refresh);
  },
  async clearTokens() {
    await SecureStore.deleteItemAsync(ACCESS_KEY);
    await SecureStore.deleteItemAsync(REFRESH_KEY);
  },
};

export async function hasStoredSession(): Promise<boolean> {
  const refresh = await SecureStore.getItemAsync(REFRESH_KEY);
  return Boolean(refresh);
}
