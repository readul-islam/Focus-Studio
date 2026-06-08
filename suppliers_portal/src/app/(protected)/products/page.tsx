'use client';

import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Loader from '@/components/ui/loader';
import { useFetch } from '@/hooks/useFetch';
import { formatCurrency } from '@/lib/utils';
import type { CatalogProduct } from '@/types/supplier';
import { Plus } from 'lucide-react';

export default function ProductsPage() {
  const { data: products, isLoading } = useFetch<CatalogProduct[]>('supplier_portal/products/');

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Products</h2>
          <p className="mt-1 text-sm text-neutral-500">Manage your trade catalog for design studios.</p>
        </div>
        <Button asChild>
          <Link href="/products/new">
            <Plus className="h-4 w-4" />
            Add product
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <Loader />
      ) : !products?.length ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-neutral-500">No products yet.</p>
            <Button asChild className="mt-4">
              <Link href="/products/new">Create your first product</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {products.map(product => (
            <Link key={product.id} href={`/products/${product.id}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardContent className="p-5">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{product.name}</h3>
                      <p className="mt-1 text-sm text-neutral-500">{product.category || 'Uncategorised'}</p>
                    </div>
                    <Badge className={product.is_published ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-600'}>
                      {product.is_published ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {product.trade_price ? formatCurrency(product.trade_price, product.currency) : 'Price on request'}
                  </p>
                  {product.lead_time_days != null && (
                    <p className="mt-2 text-xs text-neutral-500">{product.lead_time_days} day lead time</p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
