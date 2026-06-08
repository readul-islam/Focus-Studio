import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import {
  MOBILE_CLIENT_HEADER,
  MOBILE_CLIENT_VALUE,
  type AppUser,
  type AuthTokens,
  type LoginResponse,
} from '@focuspilot/shared';

export interface TokenStorage {
  getAccessToken(): Promise<string | null>;
  getRefreshToken(): Promise<string | null>;
  setTokens(tokens: AuthTokens): Promise<void>;
  clearTokens(): Promise<void>;
}

export interface ApiClientOptions {
  baseURL: string;
  storage: TokenStorage;
  onUnauthorized?: () => void;
}

export function createApiClient({ baseURL, storage, onUnauthorized }: ApiClientOptions): AxiosInstance {
  const api = axios.create({
    baseURL: baseURL.replace(/\/$/, '').replace('127.0.0.1', 'localhost'),
    timeout: 30000,
    headers: {
      [MOBILE_CLIENT_HEADER]: MOBILE_CLIENT_VALUE,
      'Content-Type': 'application/json',
    },
  });

  let refreshPromise: Promise<string | null> | null = null;

  api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    const access = await storage.getAccessToken();
    if (access) {
      config.headers.Authorization = `Bearer ${access}`;
    }
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  });

  api.interceptors.response.use(
    res => res,
    async error => {
      const originalRequest = error.config;

      if (originalRequest?.url?.includes('/user/refresh/')) {
        await storage.clearTokens();
        onUnauthorized?.();
        return Promise.reject(error);
      }

      if (
        error.response?.status === 401 &&
        originalRequest &&
        !originalRequest._retry &&
        !originalRequest.url?.includes('/user/login/')
      ) {
        originalRequest._retry = true;

        try {
          if (!refreshPromise) {
            refreshPromise = refreshAccessToken(api, storage).finally(() => {
              refreshPromise = null;
            });
          }
          const access = await refreshPromise;
          if (!access) {
            onUnauthorized?.();
            return Promise.reject(error);
          }
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        } catch {
          await storage.clearTokens();
          onUnauthorized?.();
          return Promise.reject(error);
        }
      }

      return Promise.reject(error);
    }
  );

  return api;
}

async function refreshAccessToken(api: AxiosInstance, storage: TokenStorage): Promise<string | null> {
  const refresh = await storage.getRefreshToken();
  if (!refresh) return null;

  const response = await api.post<{ access: string; refresh?: string }>('/user/refresh/', { refresh });
  const access = response.data.access;
  const newRefresh = response.data.refresh ?? refresh;
  await storage.setTokens({ access, refresh: newRefresh });
  return access;
}

export async function login(
  api: AxiosInstance,
  storage: TokenStorage,
  email: string,
  password: string
): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/user/login/', { email, password });
  const data = response.data;

  if (data.requires_2fa) {
    return data;
  }

  if (data.access && data.refresh) {
    await storage.setTokens({ access: data.access, refresh: data.refresh });
  }

  return data;
}

export async function verifyTwoFactor(
  api: AxiosInstance,
  storage: TokenStorage,
  email: string,
  code: string
): Promise<AppUser> {
  const response = await api.post<LoginResponse>('/user/verify-2fa/', { email, code });
  const data = response.data;

  if (data.access && data.refresh) {
    await storage.setTokens({ access: data.access, refresh: data.refresh });
  }

  if (!data.user) {
    throw new Error('Invalid 2FA response');
  }

  return data.user;
}

export async function logout(api: AxiosInstance, storage: TokenStorage): Promise<void> {
  const refresh = await storage.getRefreshToken();
  try {
    if (refresh) {
      await api.post('/user/logout/', { refresh });
    }
  } catch {
    // Session may already be invalid
  }
  await storage.clearTokens();
}

export async function fetchCurrentUser(api: AxiosInstance): Promise<AppUser> {
  const response = await api.get<AppUser>('/user/self/');
  return response.data;
}
