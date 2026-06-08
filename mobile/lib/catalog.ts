import { api } from '@/lib/api';

export type CatalogProduct = {
  id: number;
  name: string;
  supplier_name: string;
  category?: string | null;
  currency: string;
  trade_price?: string | null;
  retail_price?: string | null;
  lead_time_days?: number | null;
  dimension?: string | null;
  description?: string | null;
  primary_image?: string | null;
};

export type ProjectRoom = {
  id: number;
  name: string;
};

export type CatalogBrowseParams = {
  search?: string;
  category?: string;
};

export function formatCatalogPrice(value?: string | null, currency = 'GBP'): string | null {
  if (!value) return null;
  const amount = parseFloat(String(value));
  if (Number.isNaN(amount)) return null;
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(amount);
}

export async function fetchCatalogProducts(params: CatalogBrowseParams = {}): Promise<CatalogProduct[]> {
  const response = await api.get<CatalogProduct[]>('/supplier_portal/catalog/browse/', { params });
  return response.data;
}

export async function fetchProjectRooms(projectId: string): Promise<ProjectRoom[]> {
  const response = await api.get<ProjectRoom[]>('/projects/project-rooms/', {
    params: { project_id: projectId },
  });
  return response.data;
}

export async function addCatalogProductToProject(input: {
  catalogProductId: number;
  projectId: string;
  quantity: number;
  roomId?: number | null;
}): Promise<{ procurement_id: number }> {
  const response = await api.post<{ procurement_id: number }>(
    '/supplier_portal/catalog/add-to-project/',
    {
      catalog_product_id: input.catalogProductId,
      project_id: Number(input.projectId),
      quantity: input.quantity,
      room_id: input.roomId ?? undefined,
    },
  );
  return response.data;
}

export function catalogCategories(products: CatalogProduct[]): string[] {
  return [...new Set(products.map(product => product.category).filter(Boolean))].sort() as string[];
}
