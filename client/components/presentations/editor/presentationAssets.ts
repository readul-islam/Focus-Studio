export type LibraryProduct = {
  id: number;
  name: string;
  images?: { image: string; is_primary?: boolean }[];
  primary_image_url?: string;
};

export function getProductImageUrl(product: LibraryProduct): string | null {
  if (product.primary_image_url) return product.primary_image_url;
  const primary = product.images?.find((i) => i.is_primary) || product.images?.[0];
  return primary?.image || null;
}
