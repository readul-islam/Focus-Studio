import axios from 'axios';
import { getApiBaseUrl } from '@/lib/api-config';
import type { CatalogProduct, ProductFormValues, SupplierAccount, SupplierDashboard, SupplierOrderLine } from '@/types/supplier';

const api = axios.create();

api.interceptors.request.use(config => {
  if (!config.baseURL) {
    config.baseURL = getApiBaseUrl();
  }
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  res => res,
  async error => {
    const originalRequest = error.config;

    if (originalRequest?.url?.includes('/user/refresh/')) {
      localStorage.clear();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refresh = localStorage.getItem('refresh');
      if (!refresh) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const res = await api.post('/user/refresh/', { refresh });
        const newAccess = res.data.access;
        localStorage.setItem('access', newAccess);
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api(originalRequest);
      } catch {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export const fetchData = async <T,>(url: string): Promise<T> => {
  const response = await api.get<T>(url);
  return response.data;
};

export const postData = async <T,>(url: string, data: unknown): Promise<T> => {
  const response = await api.post<T>(url, data);
  return response.data;
};

export const patchData = async <T,>(url: string, data: unknown): Promise<T> => {
  const response = await api.patch<T>(url, data);
  return response.data;
};

export const loginSupplier = async ({ email, password }: { email: string; password: string }) => {
  const res = await api.post<{
    access: string;
    refresh: string;
    supplier: SupplierAccount;
  }>('supplier_portal/login/', { email, password });
  return res.data;
};

export type SupplierRegisterPayload = {
  company_name: string;
  contact_name?: string;
  email: string;
  password: string;
  phone?: string;
  website?: string;
  country?: string;
  city?: string;
  description?: string;
  categories?: string[];
};

export const registerSupplier = (data: SupplierRegisterPayload) =>
  postData<{ message: string; supplier: SupplierAccount }>('supplier_portal/register/', data);

export const fetchDashboard = () => fetchData<SupplierDashboard>('supplier_portal/dashboard/');

export const fetchOrders = (status?: string) => {
  const query = status ? `?status=${status}` : '';
  return fetchData<SupplierOrderLine[]>(`supplier_portal/orders/${query}`);
};

export const fetchProducts = () => fetchData<CatalogProduct[]>('supplier_portal/products/');

export const fetchProduct = (id: number) => fetchData<CatalogProduct>(`supplier_portal/products/${id}/`);

export const createProduct = (data: ProductFormValues) =>
  postData<CatalogProduct>('supplier_portal/products/', data);

export const updateProduct = (id: number, data: Partial<ProductFormValues>) =>
  patchData<CatalogProduct>(`supplier_portal/products/${id}/`, data);

export const uploadProductImage = async (productId: number, file: File, isPrimary = false) => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('is_primary', isPrimary ? 'true' : 'false');
  const response = await api.post(`supplier_portal/products/${productId}/images/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const removeProductImage = (productId: number, imageId: number) =>
  postData<void>(`supplier_portal/products/${productId}/images/${imageId}/remove/`, {});

export const updateOrderStatus = (id: number, data: { status: string; notes?: string }) =>
  patchData<SupplierOrderLine>(`supplier_portal/orders/${id}/update_status/`, data);

export default api;
