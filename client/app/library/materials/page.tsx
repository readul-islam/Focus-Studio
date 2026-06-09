'use client';

import { PermissionGuard } from '@/components/PermissionGuard';
import { LibraryNav } from '@/components/library-nav';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Search } from 'lucide-react';
import useFetch from '@/hooks/useFetch';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

type MaterialProduct = {
  id: number;
  name?: string;
  materials?: string;
  type?: string;
  supplier?: { name?: string; company_name?: string };
  description?: string;
};

type ProductsResponse = {
  results: MaterialProduct[];
  count: number;
};

function MaterialsPageContent() {
  const t = useTranslations('libraryMaterialsPage');
  const [query, setQuery] = useState('');
  const endpoint = query
    ? `library/studio-products/?materials_only=1&q=${encodeURIComponent(query)}`
    : 'library/studio-products/?materials_only=1';
  const { data, isLoading } = useFetch<ProductsResponse>(endpoint);
  const products = data?.results ?? [];

  const emptyMessage = useMemo(() => {
    if (query) return t('noSearchResults');
    return t('empty');
  }, [query, t]);

  return (
    <div className="flex flex-col h-[calc(100svh-3.5rem)] min-h-0 bg-stone-50 p-4 sm:p-6">
      <div className="w-full flex flex-col flex-1 min-h-0 space-y-6">
        <LibraryNav />

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col flex-1 min-h-0">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{t('title')}</h3>
              <p className="text-sm text-gray-600">{t('subtitle')}</p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="pl-9"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-1 items-center justify-center text-gray-500">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-gray-600">{emptyMessage}</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 overflow-y-auto min-h-0">
              {products.map((product) => (
                <Card key={product.id} className="border-gray-200">
                  <CardContent className="p-4 space-y-2">
                    <p className="font-medium text-gray-900">{product.name || t('untitled')}</p>
                    {product.type ? (
                      <p className="text-xs uppercase tracking-wide text-gray-500">{product.type}</p>
                    ) : null}
                    <p className="text-sm text-gray-700">{product.materials}</p>
                    {product.description ? (
                      <p className="text-xs text-gray-500 line-clamp-2">{product.description}</p>
                    ) : null}
                    {product.supplier?.company_name || product.supplier?.name ? (
                      <p className="text-xs text-gray-500">
                        {t('supplier')}: {product.supplier.company_name || product.supplier.name}
                      </p>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MaterialsPage() {
  return (
    <PermissionGuard permission="library.view" redirectTo="/">
      <MaterialsPageContent />
    </PermissionGuard>
  );
}
