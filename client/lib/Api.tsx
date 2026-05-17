import axios from 'axios';

function normalizeApiBase(url: string): string {
  return url.replace(/\/$/, '').replace('127.0.0.1', 'localhost');
}

const baseURL = typeof window === 'undefined'
  ? normalizeApiBase(process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000')
  : normalizeApiBase(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000');

const api = axios.create({
  baseURL,
  withCredentials: true, // send httpOnly cookies on every request
});

// Endpoints that must never receive an Authorization header
const PUBLIC_AUTH_ENDPOINTS = [
  '/user/login/',
  '/user/register/',
  '/user/refresh/',
  '/user/logout/',
  '/user/password-reset/',
  '/user/password-reset-confirm/',
  '/user/otp-session/',
  '/user/verify-otp/',
  '/user/resend-otp/',
];

// No request interceptor needed — cookies are sent automatically by the browser.
// The PUBLIC_AUTH_ENDPOINTS list is kept for the response interceptor below.

const handleError = (error: any) => {
  const err: any = new Error(error.response ? `HTTP error! status: ${error.response.status}` : error.message);
  if (error.response) {
    err.response = error.response;
  }
  throw err;
};

export const fetchData = async (url: string) => {
  if (!url) throw new Error('No URL provided');
  try {
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const postData = async ({ url, data, config = {} }: { url: string; data?: any; config?: any }) => {
  if (!url) throw new Error('No post URL provided');
  try {
    const response = await api.post(url, data, config);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const deleteData = async ({ url, data }: { url: string; data?: any }) => {
  if (!url) throw new Error('No URL provided');
  try {
    const response = await api.delete(url, data ? { data } : undefined);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const putData = async ({ url, data }: { url: string; data?: any }) => {
  if (!url) throw new Error('No put URL provided');
  try {
    const response = await api.put(url, data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const patchData = async ({ url, data }: { url: string; data?: any }) => {
  if (!url) throw new Error('No patch URL provided');
  try {
    const response = await api.patch(url, data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const patchFormData = async ({ url, data }: { url: string; data: FormData }) => {
  if (!url) throw new Error('No patch URL provided');
  try {
    const response = await api.patch(url, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const loginUser = async ({ email, password }: { email: string; password: string }) => {
  const res = await api.post('/user/login/', { email, password });
  return res.data; // { user }  — tokens are now in httpOnly cookies
};

// Token refresh mutex — prevents concurrent refresh attempts
let refreshPromise: Promise<void> | null = null;
let isRedirectingToLogin = false;

function redirectToLogin() {
  if (typeof window === 'undefined' || isRedirectingToLogin) return;
  const path = window.location.pathname;
  if (path.startsWith('/login') || path.startsWith('/auth/google/callback')) return;
  isRedirectingToLogin = true;
  window.location.href = '/login';
}

api.interceptors.response.use(
  res => res,
  async error => {
    const originalRequest = error.config;

    // Refresh request itself failed — session is dead, redirect to login
    if (originalRequest.url?.includes('/user/refresh/')) {
      redirectToLogin();
      return Promise.reject(error);
    }

    const isPublicAuthRequest = PUBLIC_AUTH_ENDPOINTS.some(p =>
      (originalRequest.url || '').includes(p)
    );

    if (error.response?.status === 401 && !originalRequest._retry && !isPublicAuthRequest) {
      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          // POST with empty body — backend reads the refresh cookie
          refreshPromise = api.post('/user/refresh/', {}).then(() => {}).finally(() => {
            refreshPromise = null;
          });
        }
        await refreshPromise;
        // New access cookie is set by the backend; browser sends it automatically
        return api(originalRequest);
      } catch {
        redirectToLogin();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);
