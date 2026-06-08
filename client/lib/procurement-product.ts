/** Helpers for procurement rows that may reference studio library products or global catalog products. */

export function isCatalogProcurement(item: {
  catalog_product?: unknown;
  catalog_product_id?: number | null;
  is_from_catalog?: boolean;
}): boolean {
  return Boolean(item.is_from_catalog || item.catalog_product || item.catalog_product_id);
}

export function getProcurementDisplayProduct(item: {
  product?: Record<string, unknown> | null;
  catalog_product?: {
    name?: string;
    trade_price?: string | number | null;
    retail_price?: string | number | null;
    tader_price?: string | number | null;
    regular_price?: string | number | null;
    currency?: string;
    dimension?: string | null;
    primary_image?: string | null;
    url?: string | null;
    supplier_name?: string | null;
  } | null;
}) {
  if (item.product) {
    return item.product;
  }

  if (!item.catalog_product) {
    return null;
  }

  const catalog = item.catalog_product;
  return {
    name: catalog.name,
    tader_price: catalog.tader_price ?? catalog.trade_price,
    regular_price: catalog.regular_price ?? catalog.retail_price,
    currency: catalog.currency,
    dimension: catalog.dimension,
    url: catalog.url,
    images: catalog.primary_image
      ? [{ image: catalog.primary_image, is_primary: true }]
      : [],
  };
}

export function getProcurementProductName(item: Parameters<typeof getProcurementDisplayProduct>[0]): string {
  return (getProcurementDisplayProduct(item)?.name as string) || '';
}

export function getProcurementProductImage(item: Parameters<typeof getProcurementDisplayProduct>[0]): string | undefined {
  const product = getProcurementDisplayProduct(item) as { images?: Array<{ image?: string; is_primary?: boolean }> } | null;
  if (!product?.images?.length) return undefined;
  const primary = product.images.find(img => img.is_primary) || product.images[0];
  return primary?.image;
}

export function getProcurementSupplierName(item: {
  supplier?: { company_name?: string | null } | null;
  catalog_product?: { supplier_name?: string | null } | null;
  product?: { supplier?: { company_name?: string | null } | null } | null;
}): string {
  return (
    item.supplier?.company_name ||
    item.catalog_product?.supplier_name ||
    item.product?.supplier?.company_name ||
    ''
  );
}

export function getProcurementUnitPrice(item: {
  unit_price?: string | number | null;
  product?: { tader_price?: string | number | null; regular_price?: string | number | null } | null;
  catalog_product?: {
    trade_price?: string | number | null;
    retail_price?: string | number | null;
    tader_price?: string | number | null;
    regular_price?: string | number | null;
  } | null;
}): number {
  const rawUnit = item.unit_price ? parseFloat(String(item.unit_price).replace(/[^\d.]/g, '')) : 0;
  if (rawUnit > 0) return rawUnit;

  const product = getProcurementDisplayProduct(item) as {
    tader_price?: string | number | null;
    regular_price?: string | number | null;
  } | null;

  const trade = parseFloat(String(product?.tader_price || '0').replace(/[^\d.]/g, '')) || 0;
  const retail = parseFloat(String(product?.regular_price || '0').replace(/[^\d.]/g, '')) || 0;
  return trade > 0 ? trade : retail;
}
