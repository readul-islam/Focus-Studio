export type SupplierAccount = {
  id: number;
  company_name: string;
  contact_name?: string | null;
  email: string;
  phone?: string | null;
  website?: string | null;
  description?: string | null;
  country?: string | null;
  city?: string | null;
  categories?: string[];
  is_verified: boolean;
  created_at: string;
};

export type CatalogProduct = {
  id: number;
  supplier: number;
  supplier_name: string;
  name: string;
  sku?: string | null;
  url?: string | null;
  description?: string | null;
  category?: string | null;
  currency: string;
  trade_price?: string | null;
  retail_price?: string | null;
  lead_time_days?: number | null;
  dimension?: string | null;
  materials?: string | null;
  weight?: string | null;
  is_published: boolean;
  primary_image?: string | null;
  images?: Array<{ id: number; image: string; is_primary: boolean }>;
  created_at: string;
  updated_at: string;
};

export type SupplierOrderLine = {
  id: number;
  product_name: string;
  project_name: string;
  studio_name: string;
  quantity: number;
  unit_price?: string | null;
  total_price?: number | null;
  currency: string;
  status: string;
  status_display: string;
  quote_status?: string;
  quote_status_display?: string;
  quote_requested_at?: string | null;
  quoted_at?: string | null;
  quoted_lead_time_days?: number | null;
  quote_notes?: string | null;
  delivery_address?: string | null;
  delivery_city?: string | null;
  delivery_postcode?: string | null;
  delivery_country?: string | null;
  notes?: string | null;
  payment_status?: string;
  ordered_at?: string | null;
  created_at: string;
  updated_at: string;
};

export type SupplierDashboard = {
  summary: {
    total_products: number;
    published_products: number;
    total_orders: number;
    open_orders: number;
    month_orders: number;
    month_units: number;
    month_revenue: number;
    month_paid_revenue: number;
    lifetime_revenue: number;
    lifetime_paid_revenue: number;
  };
  monthly_sales: Array<{
    month: string;
    order_count: number;
    units: number;
    revenue: number;
    paid_revenue?: number;
  }>;
  status_breakdown: Array<{ status: string; count: number }>;
};

export type SupplierAnalytics = SupplierDashboard & {
  payment_breakdown: Array<{ payment_status: string; count: number }>;
  top_products: Array<{
    product_id: number;
    name: string;
    units: number;
    orders: number;
    revenue: number;
  }>;
  studio_breakdown: Array<{
    studio_id: number;
    name: string;
    orders: number;
    revenue: number;
  }>;
  category_breakdown: Array<{ category: string; product_count: number }>;
  fulfillment: {
    delivery_rate: number;
    shipped_count: number;
    delivered_count: number;
    paid_orders: number;
    unpaid_orders: number;
  };
};

export type ProductFormValues = {
  name: string;
  sku?: string;
  url?: string;
  description?: string;
  category?: string;
  currency: string;
  trade_price?: string;
  retail_price?: string;
  lead_time_days?: number;
  dimension?: string;
  materials?: string;
  weight?: string;
  is_published: boolean;
};
