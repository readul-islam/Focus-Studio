'use client';

import { useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import useFetch from '@/hooks/useFetch';
import { usePost } from '@/hooks/usePost';
import { useDebounce } from '@/hooks/useDebounce';
import { useQueryClient } from '@tanstack/react-query';
import { gooeyToast as toast } from 'goey-toast';
import { ArrowLeft, Globe, Loader2, Minus, Plus, Search, Store } from 'lucide-react';
import { useTranslations } from 'next-intl';

function formatCatalogPrice(value?: string | null, currency = 'GBP') {
  if (!value) return null;
  const amount = parseFloat(String(value));
  if (Number.isNaN(amount)) return null;
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(amount);
}

export type CatalogBrowseProduct = {
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

type CatalogBrowseDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number;
};

type Room = { id: number; name: string };

export function CatalogBrowseDialog({ open, onOpenChange, projectId }: CatalogBrowseDialogProps) {
  const t = useTranslations('catalogBrowse');
  const tc = useTranslations('common');
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<CatalogBrowseProduct | null>(null);
  const [roomId, setRoomId] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  const debouncedSearch = useDebounce(search, 400);

  const catalogUrl = useMemo(() => {
    if (!open) return null;
    const params = new URLSearchParams();
    if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());
    if (category !== 'all') params.set('category', category);
    const query = params.toString();
    return `supplier_portal/catalog/browse${query ? `?${query}` : ''}`;
  }, [open, debouncedSearch, category]);

  const { data: products, isLoading } = useFetch<CatalogBrowseProduct[]>(catalogUrl, {
    enabled: open && !selectedProduct,
  });

  const { data: rooms, isLoading: roomsLoading } = useFetch<Room[]>(
    open && selectedProduct ? `/projects/project-rooms?project_id=${projectId}` : null,
  );

  const categories = useMemo(() => {
    if (!products?.length) return [];
    return [...new Set(products.map(p => p.category).filter(Boolean))].sort() as string[];
  }, [products]);

  const { mutate: addToProject, isPending } = usePost({
    onSuccess: () => {
      toast.success(t('addedToProcurement'));
      queryClient.invalidateQueries({
        queryKey: [`projects/project-procurements/?project_id=${projectId}`],
      });
      handleClose();
    },
    onError: () => toast.error(t('addFailed')),
  });

  const handleClose = () => {
    setSearch('');
    setCategory('all');
    setSelectedProduct(null);
    setRoomId('');
    setQuantity(1);
    onOpenChange(false);
  };

  const handleAdd = () => {
    if (!selectedProduct) return;
    addToProject({
      url: 'supplier_portal/catalog/add-to-project/',
      data: {
        catalog_product_id: selectedProduct.id,
        project_id: projectId,
        room_id: roomId ? Number(roomId) : null,
        quantity,
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={value => (value ? onOpenChange(true) : handleClose())}>
      <DialogContent className="max-w-4xl gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-neutral-600" />
            <div>
              <DialogTitle>{selectedProduct ? t('configureTitle') : t('title')}</DialogTitle>
              <DialogDescription>
                {selectedProduct ? t('configureDescription') : t('description')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {!selectedProduct ? (
          <div className="space-y-4 px-6 py-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                  className="pl-9"
                />
              </div>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder={t('allCategories')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allCategories')}</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
              </div>
            ) : !products?.length ? (
              <div className="flex h-64 flex-col items-center justify-center text-center">
                <Globe className="mb-3 h-8 w-8 text-neutral-300" />
                <p className="text-sm font-medium text-neutral-700">{t('emptyTitle')}</p>
                <p className="mt-1 max-w-sm text-sm text-neutral-500">{t('emptyDescription')}</p>
              </div>
            ) : (
              <ScrollArea className="h-[420px] pr-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  {products.map(product => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => setSelectedProduct(product)}
                      className="flex gap-3 rounded-xl border border-greige-500/30 bg-white p-3 text-left transition hover:border-neutral-400 hover:shadow-sm"
                    >
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-greige-500/30 bg-neutral-50">
                        {product.primary_image ? (
                          <img
                            src={product.primary_image}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-neutral-300">
                            <Store className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-sm text-neutral-900">{product.name}</p>
                        <p className="mt-0.5 truncate text-xs text-neutral-500">{product.supplier_name}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {product.category && (
                            <Badge variant="secondary" className="text-[10px]">
                              {product.category}
                            </Badge>
                          )}
                          <span className="text-sm font-medium text-neutral-800">
                            {formatCatalogPrice(product.trade_price, product.currency) ?? t('priceOnRequest')}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        ) : (
          <div className="space-y-5 px-6 py-4">
            <button
              type="button"
              onClick={() => setSelectedProduct(null)}
              className="inline-flex items-center gap-1 text-sm text-neutral-600 hover:text-neutral-900"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('backToBrowse')}
            </button>

            <div className="flex gap-4 rounded-xl border border-greige-500/30 bg-neutral-50 p-4">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg border bg-white">
                {selectedProduct.primary_image ? (
                  <img
                    src={selectedProduct.primary_image}
                    alt={selectedProduct.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-neutral-300">
                    <Store className="h-7 w-7" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-neutral-900">{selectedProduct.name}</p>
                <p className="text-sm text-neutral-500">{selectedProduct.supplier_name}</p>
                {selectedProduct.dimension && (
                  <p className="mt-1 text-xs text-neutral-500">{selectedProduct.dimension}</p>
                )}
                <p className="mt-2 text-sm font-medium text-neutral-900">
                  {formatCatalogPrice(selectedProduct.trade_price, selectedProduct.currency) ?? t('priceOnRequest')}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t('room')}</Label>
                <Select value={roomId} onValueChange={setRoomId} disabled={roomsLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectRoom')} />
                  </SelectTrigger>
                  <SelectContent>
                    {(rooms || []).map(room => (
                      <SelectItem key={room.id} value={String(room.id)}>
                        {room.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('quantity')}</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={e => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                    className="text-center"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => setQuantity(q => q + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t pt-4">
              <Button variant="outline" onClick={handleClose}>
                {tc('cancel')}
              </Button>
              <Button onClick={handleAdd} disabled={isPending}>
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {isPending ? t('adding') : t('addToProcurement')}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
