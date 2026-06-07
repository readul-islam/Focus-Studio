'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { PermissionGuard } from '@/components/PermissionGuard';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Search, MoreHorizontal, Package, Loader2, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { LibraryNav } from '@/components/library-nav';
import { ProductDetailSheet, type ProductDetails } from '@/components/product-detail-sheet';
import { useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import AddProductModal from '@/components/product/AddProductModal';
import { gooeyToast as toast } from 'goey-toast';
import EditProductModal from '@/components/product/EditProductModal';
import { DeleteDialog } from '@/components/DeleteDialog';
import ProductImage from '@/components/project/ProductImage';
import useFetch from '@/hooks/useFetch';
import useDeleteData from '@/hooks/useDelete';
import useUser from '@/hooks/useUser';
import { usePost } from '@/hooks/usePost';
import { patchData } from '@/lib/Api';
import HeartIcon from '@/components/product/HeartIcon';
import { ViewCurrencySymbol } from '@/components/ViewCurrencySymbol';
import { AddToProjectDialog } from '@/components/product/AddToProjectDialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useEditGuard } from '@/hooks/useEditGuard';
import { usePermissions } from '@/hooks/usePermissions';
import { useTranslations } from 'next-intl';

const PRODUCT_CATEGORIES = [
  { value: 'All', key: 'all' },
  { value: 'Furniture', key: 'furniture' },
  { value: 'Lighting', key: 'lighting' },
  { value: 'Textiles', key: 'textiles' },
  { value: 'Dining', key: 'dining' },
  { value: 'Bathroom', key: 'bathroom' },
  { value: 'Accessories', key: 'accessories' },
  { value: 'Home Fragrance', key: 'homeFragrance' },
  { value: 'Outdoor', key: 'outdoor' },
  { value: 'Art', key: 'art' },
] as const;

const parsePrice = (value: any) => {
  if (!value) return 0;
  return (
    parseFloat(
      String(value).replace(/[^0-9.]/g, ''), // strip out everything except numbers + dot
    ) || 0
  );
};

// Format prices with currency symbol
const formatPrice = (price: string | number, notAvailableLabel: string) => {
  if (price === null || price === undefined || price === '') return notAvailableLabel;
  return `${Number(price).toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

interface Product {
  id: number;
  name: string;
  url: string;
  description: string;
  tader_price: number;
  regular_price: number;
  measurement: string;
  materials: string;
  dimension: string;
  weight: string;
  box_dimension: string;
  assembly_required: boolean;
  seat_width: string;
  seat_depth: string;
  seat_height: string;
  composition: string;
  construction: string;
  feet: number;
  filling: string;
  removeable_cushion: boolean;
  removeable_legs: boolean;
  frame: string;
  instruction: string;
  created_at: string;
  updated_at: string;
  supplier: number;
  type: any;
  studio: number;
  created_by: any;
  updated_by: any;
}

function ProductsPageContent() {
  const t = useTranslations('libraryProductsPage');
  const tc = useTranslations('common');
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // URL is source of truth — no state for page/search/category
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const searchQuery = searchParams.get('search') || '';
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [pageSize] = useState(12);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selected, setSelected] = useState<ProductDetails | undefined>(undefined);
  const [addProductmodalOpen, setAddProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>([]);
  const [editModal, setEditModal] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { user } = useUser();
  const { guard } = useEditGuard('library.edit');
  const [addToProjectOpen, setAddToProjectOpen] = useState(false);
  const [productForProject, setProductForProject] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const {can} = usePermissions();
  const libraryPermission = can('library.edit');
  const libraryDeletePermission = can('library.delete');

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollState, { passive: true });
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => { el.removeEventListener('scroll', updateScrollState); ro.disconnect(); };
  }, []);

  const selectedCategory = searchParams.get('category') || 'All';

  const updateUrl = (patch: { page?: number; search?: string; category?: string }) => {
    const params = new URLSearchParams(searchParams.toString());
    if (patch.page !== undefined) {
      if (patch.page <= 1) params.delete('page'); else params.set('page', String(patch.page));
    }
    if (patch.search !== undefined) {
      if (!patch.search) params.delete('search'); else params.set('search', patch.search);
    }
    if (patch.category !== undefined) {
      if (patch.category === 'All') params.delete('category'); else params.set('category', patch.category);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const setCurrentPage = (page: number) => updateUrl({ page });

  const setSelectedCategory = (category: string) => {
    updateUrl({ category, page: 1 });
    setTimeout(() => {
      const el = scrollRef.current;
      if (!el) return;
      const active = el.querySelector(`[data-category="${category}"]`) as HTMLElement;
      if (active) active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }, 0);
  };

  const queryClient = useQueryClient();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== searchQuery) {
        updateUrl({ search: searchInput, page: 1 });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Build API URL with pagination and search
  const buildApiUrl = () => {
    const params = new URLSearchParams();
    params.append('page', currentPage.toString());
    params.append('page_size', pageSize.toString());
    if (searchQuery.trim()) {
      params.append('q', searchQuery.trim());
    }
    if (selectedCategory !== 'All') {
      params.append('type', selectedCategory);
    }
    return `library/studio-products?${params.toString()}`;
  };

  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError,
    refetch,
    isFetching,
  } = useFetch(buildApiUrl(), {
    placeholderData: keepPreviousData,
  });
  const { mutate } = useDeleteData({
    onSuccess: () => {
      toast(t('toasts.deleted'));
      refetch();
    },
    onError: () => {
      toast(t('toasts.deleteFailed'));
    },
  });

  const { mutate: patchProduct, isPending: isPatching } = useMutation({
    mutationFn: ({ url, data }: { url: string; data: any }) => patchData({ url, data }),
    onSuccess: async () => {
      // queryClient.refetchQueries({ queryKey: ['library/studio-products/'] });
    },
    onError: () => {
      toast.error(t('toasts.errorTryAgain'));
    },
  });

  // Handle Form Submit
  const handleFav = guard((id, value) => {
    patchProduct({
      url: `library/products/${id}/`,
      data: { is_fav: value },
    });
    refetch();
  });

  useEffect(() => {
    document.title = t('documentTitle');
  }, [t]);

  function closeEditModal() {
    setEditModal(false);
  }

  const { mutate: addToProcurement } = usePost();

  const typeMutation = {
    mutate: (payload: any) => {
      addToProcurement(
        { url: payload.url, data: payload.data },
        {
          onSuccess: () => {
            toast.success(t('toasts.addedToProject'));
            queryClient.refetchQueries({ queryKey: [`projects/project-procurements/?project_id=${payload.data.project}`] });
          },
          onError: (error: any) => {
            console.error(error);
            toast.error(t('toasts.addToProjectFailed'));
          },
        },
      );
    },
  };

  const openDetails = useCallback((product: Product) => {
    setSelected(product);
    setSheetOpen(true);
  }, []);

  const handleAddToProject = (data: {
    projectId: number;
    roomId: number;
    quantity: number;
    productId: number;
  }) => {
    if (!user?.studio?.id || !user?.id) {
      toast.error(t('toasts.missingInfo'));
      return;
    }
    const payload = {
      quantity: data.quantity,
      project: data.projectId,
      room: data.roomId,
      product: data.productId,
      studio: user.studio.id,
      created_by: user.id,
      updated_by: user.id,
    };

    typeMutation.mutate({
      url: 'projects/procurements/',
      data: payload,
    });
  };

  const openAddToProjectDialog = (product: any) => {
    setProductForProject(product);
    setAddToProjectOpen(true);
  };

  const handleSelectProduct = guard((product: any) => {
    setSelectedProduct(product);
    setEditModal(true);
  });

  const handleDeleOpenModal = guard((product: any) => {
    setIsDeleteOpen(true);
    setSelectedProduct(product);
  });

  const handleDelete = guard((id: any) => {
    if(!libraryDeletePermission){
      toast.error(tc('noPermissionDelete'))
      return;
    }
    mutate({ url: `/library/products/${id}/` });
  });

  const renderPaginationItems = () => {
    if (!productsData) return null;
    const totalPages = productsData.total_pages;

    const delta = 2;
    const start = Math.max(2, currentPage - delta);
    const end = Math.min(totalPages - 1, currentPage + delta);
    const pages: (number | 'ellipsis')[] = [];

    pages.push(1);
    if (start > 2) pages.push('ellipsis');
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push('ellipsis');
    if (totalPages > 1) pages.push(totalPages);

    return pages.map((page, idx) =>
      page === 'ellipsis' ? (
        <PaginationItem key={`ellipsis-${idx}`}>
          <PaginationEllipsis />
        </PaginationItem>
      ) : (
        <PaginationItem key={page}>
          <PaginationLink
            isActive={page === currentPage}
            onClick={() => page !== currentPage && setCurrentPage(page)}
            className={page === currentPage ? 'cursor-default' : 'cursor-pointer'}
          >
            {page}
          </PaginationLink>
        </PaginationItem>
      )
    );
  };

  return (
    <div className="flex flex-col h-[calc(100svh-3.5rem)] min-h-0 bg-stone-50 p-4 sm:p-6">
      <div className=" w-full flex flex-col flex-1 min-h-0 space-y-6">
        <LibraryNav />

        {/* Header - Single Line Layout */}
        <div className="mb-4 flex items-center flex-col lg:flex-row  justify-between gap-4">
          {/* Left side - Category filters */}
          <div className="relative w-full max-w-[500px] flex-shrink-0">
            <div
              ref={scrollRef}
              className="flex items-center gap-1 bg-stone-100 rounded-lg p-1 overflow-x-auto"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {PRODUCT_CATEGORIES.map(({ value, key }) => (
                <button
                  key={value}
                  data-category={value}
                  onClick={() => setSelectedCategory(value)}
                  className={`relative flex-shrink-0 px-3 py-1.5 text-sm rounded-md transition-colors ${
                    selectedCategory === value ? 'text-neutral-900 font-medium' : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  {selectedCategory === value && (
                    <motion.div
                      layoutId="products-category-pill"
                      className="absolute inset-0 bg-white rounded-md shadow-sm"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 whitespace-nowrap">{t(`categories.${key}`)}</span>
                </button>
              ))}
            </div>
            <motion.div
              className="absolute left-0 top-0 h-full w-8 rounded-l-lg flex items-center justify-start pl-0.5 z-10 category-fade-left"
              animate={{ opacity: canScrollLeft ? 1 : 0, pointerEvents: canScrollLeft ? 'auto' : 'none' }}
              transition={{ duration: 0.2 }}
            >
              <button
                onClick={() => scrollRef.current?.scrollBy({ left: -120, behavior: 'smooth' })}
                className="text-neutral-500 hover:text-neutral-900"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </motion.div>
            <motion.div
              className="absolute right-0 top-0 h-full w-8 rounded-r-lg flex items-center justify-end pr-0.5 z-10 category-fade-right"
              animate={{ opacity: canScrollRight ? 1 : 0, pointerEvents: canScrollRight ? 'auto' : 'none' }}
              transition={{ duration: 0.2 }}
            >
              <button
                onClick={() => scrollRef.current?.scrollBy({ left: 120, behavior: 'smooth' })}
                className="text-neutral-500 hover:text-neutral-900"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          </div>
          
          {/* Right side - Search and actions */}
          <div className="flex items-center gap-3">
            <div className="">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                placeholder={t('searchPlaceholder')}
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                className="h-9 w-full  max-w-[350px] pl-10 pr-10"
              />
              {(isFetching || searchInput !== searchQuery) && (
                <Loader2 className="absolute right-3  h-4 w-4 top-2.5 text-gray-400 animate-spin" />
              )}
            </div>
          </div>

        {libraryPermission &&    <Button className="h-9 gap-2" onClick={guard(() => setAddProductModalOpen(true))}>
              <Plus className="h-4 w-4" />
              {t('addProduct')}
            </Button>}
          </div>
        </div>

        {/* Products Grid */}
        <div className="rounded-xl  animate-in fade-in slide-in-from-bottom-4 duration-500 border border-gray-200 bg-white p-6 shadow-sm">
          {isFetching && !searchInput ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array(pageSize)
                .fill(0)
                .map((_, index) => (
                  <div key={index} className="h-64 rounded-md bg-stone-200 animate-pulse"></div>
                ))}
            </div>
          ) : productsError ? (
            <div className="text-center text-red-500">{t('loadError')}</div>
          ) : productsData?.results?.length === 0 ? (
            <div className="py-12 text-center">
              <Package className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p className="text-gray-600">{t('empty')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {productsData?.results?.map((product: any) => (
                <Card key={product.id} className="group flex flex-col overflow-hidden transition-all duration-200 hover:shadow-lg">
                  <div className="relative">
                    {/* Clickable image to open Product Detail Sheet */}
                    <button
                      type="button"
                      onClick={() => openDetails(product)}
                      className="block w-full cursor-pointer"
                      aria-label={t('viewProduct', { name: product.name })}
                    >
                      <div className="aspect-square overflow-hidden bg-white">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {/* Placeholder image logic since new data doesn't have images array */}
                        <ProductImage
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          height={300}
                          width={300}
                          alt={product?.name}
                          src={product?.images.find(item => item.is_primary)?.image || product?.images?.[0]?.image || null}
                        />
                      </div>
                    </button>

                    {/* Overlay Actions */}
                    <div className="absolute right-3 top-3 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                      {/* <Button onClick={()=> handleFav(product.id, !product.is_fav)} size="sm" variant="secondary" className="h-8 w-8 bg-white/90 p-0 hover:bg-white">
                        <Heart className="h-4 w-4" />
                      </Button> */}
                      <HeartIcon handleClick={() => handleFav(product.id, !product.is_fav)} active={product.is_fav} />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 bg-white/90 p-0 hover:bg-white"
                            aria-label={t('openActions')}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openDetails(product)}>{t('viewDetails')}</DropdownMenuItem>
                        {libraryPermission &&   <DropdownMenuItem onClick={() => handleSelectProduct(product)}>{t('editProduct')}</DropdownMenuItem>}
                         {libraryDeletePermission &&   <DropdownMenuSeparator />}
                         {libraryDeletePermission &&   <DropdownMenuItem className="text-red-600" onClick={() => handleDeleOpenModal(product)}>
                            {t('deleteProduct')}
                          </DropdownMenuItem>}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <CardContent className="p-4 flex-1 ">
                    <div className="space-y-2.5 flex flex-col justify-between h-full w-full ">
                      <div>
                        <div>
                          {/* Clickable title also opens details */}
                          <button
                            type="button"
                            onClick={() => openDetails(product)}
                            className="text-left max-w-full truncate"
                            aria-label={t('openProductDetails', { name: product.name })}
                          >
                            <h3 className="truncate text-sm !capitalize font-semibold tracking-tight text-gray-900">
                              {product?.name || t('unknown')}
                            </h3>
                            <h3 className="truncate text-xs my-1 !capitalize font-normal tracking-tight text-gray-500">
                              {product?.dimension || t('unknown')}
                            </h3>
                            <p className="text-xs capitalize tracking-wide text-gray-500">
                              {product?.supplier?.company_name || t('noSupplier')}
                            </p>
                          </button>
                        </div>
                      </div>

                      <div>
                        <div className="flex  items-center justify-between">
                          <span className="tabular-nums text-sm font-semibold text-gray-900">
                            <ViewCurrencySymbol code={product?.currency || user?.studio?.default_currency} />
                            {formatPrice(parsePrice(product?.tader_price) || parsePrice(product?.regular_price) || 0, tc('notAvailable'))}
                          </span>
                          {product?.type && (
                            <TooltipProvider delayDuration={0}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="w-[100px] flex items-center justify-center rounded-md border px-2.5 py-1 text-xs font-medium leading-none select-none bg-greige-100 text-taupe-700 capitalize border-greige-500">
                                    <span className="inline-block truncate">{product.type}</span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className='text-xs'>{product.type}</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if(libraryPermission){
                              openAddToProjectDialog(product)
                            }else{
                              toast.error(tc('noPermissionAction'))
                            }
                            }}
                          className="mt-3 w-full bg-transparent opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          {t('addToProject')}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Add to Project Dialog */}
          <AddToProjectDialog
            open={addToProjectOpen}
            onOpenChange={setAddToProjectOpen}
            product={productForProject}
            onSubmit={handleAddToProject}
          />

          {/* Pagination */}
          <div className="mt-8">
            {productsData && productsData?.total_pages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>

                  {renderPaginationItems()}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(Math.min(productsData.total_pages, currentPage + 1))}
                      className={currentPage === productsData.total_pages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </div>
      </div>

      {/* Product Detail Sheet */}
      <ProductDetailSheet libraryPermission={libraryPermission} open={sheetOpen} onOpenChange={setSheetOpen} product={selected} />

      <EditProductModal refetch={refetch} productInfo={selectedProduct} closeEditModal={closeEditModal} editModal={editModal} />

      {/* Add Product Modal - You would need to create this component */}
      <AddProductModal closeModal={() => setAddProductModalOpen(false)} modalOpen={addProductmodalOpen} />

      <DeleteDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => handleDelete(selectedProduct?.id)}
        title={t('deleteTitle')}
        description={t('deleteDescription')}
        itemName={selectedProduct?.name}
        requireConfirmation={false} // 👈 disables the typing step
      />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <PermissionGuard permission="library.view">
      <ProductsPageContent />
    </PermissionGuard>
  );
}
