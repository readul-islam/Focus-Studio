'use client';

import * as React from 'react';
import Image from 'next/image';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, Globe, LinkIcon, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { gooeyToast as toast } from 'goey-toast';
import Link from 'next/link';
import {  useQueryClient } from '@tanstack/react-query';
import ProductImage from './project/ProductImage';
import errorImage from '/public/product-placeholder-wp.jpg';
import useUser from '@/hooks/useUser';
import { useCurrency } from '@/lib/getCurrencySymbol';
import { usePost } from '@/hooks/usePost';
import { AddToProjectDialog } from '@/components/product/AddToProjectDialog';

type ProductImage = {
  src: string;
  alt?: string;
};

export type ProductDetails = {
  id: string;
  created_at: string;
  name: string;
  supplier?: string;
  priceMember?: string;
  priceRegular?: string;
  description?: string;
  measurements?: string;
  materials?: string;
  dimensions?: string;
  weight?: string;
  boxedDimensions?: string;
  boxedWeight?: string;
  assemblyRequired?: string;
  instructions?: string;
  composition?: string;
  construction?: string;
  feet?: number;
  filling?: string;
  frame?: string;
  removableCushions?: string;
  removableLegs?: string;
  seatDepth?: string;
  seatHeight?: string;
  seatWidth?: string;
  type?: string;
  product_url?: string;
  status?: string;
  imageURL?: string[];
  initialStatus?: string;
  qty?: number;
  delivery?: string | null;
  install?: string | null;
  sendToClient?: boolean;
  sample?: string;
  images: ProductImage[];
};

export type ProductDetailSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: ProductDetails;
};

function StatCard({ label, value, className }: { label: string; value?: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-lg border border-greige-500/30 bg-stone-50 p-4', className)}>
      <div className="text-xs  truncate font-medium text-neutral-500">{label}</div>
      <div className="mt-1 text-sm capitalize font-semibold text-neutral-900">{value || 'Not Available'}</div>
    </div>
  );
}

export function ProductDetailSheet({ open, onOpenChange, product,libraryPermission }: ProductDetailSheetProps) {
const data = {
  ...product,
  priceMember: product?.tader_price,
  priceRegular: product?.regular_price,
  measurements: product?.measurement,
  materials: product?.materials,
  dimensions: product?.dimension,
  weight: product?.weight,
  boxedDimensions: product?.box_dimension,
  assemblyRequired: product?.assembly_required,
  removableCushions: product?.removeable_cushion,
  removableLegs: product?.removeable_legs,
  seatDepth: product?.seat_depth,
  seatHeight: product?.seat_height,
  seatWidth: product?.seat_width,
  composition: product?.composition,
  construction: product?.construction,
  feet: product?.feet,
  filling: product?.filling,
  frame: product?.frame,
  instructions: product?.instruction,
  product_url: product?.url,
  type: product?.type,
  images: product?.images || [],
};


    const [activeIdx, setActiveIdx] = React.useState(0);
    const [swiper, setSwiper] = React.useState<SwiperType | null>(null);
  const queryClient = useQueryClient();
  const {user} = useUser()
  const [addToProjectOpen, setAddToProjectOpen] = React.useState(false);

  const {currency:productCurrency , isLoading:currencyLoading} = useCurrency(product?.currency || user?.studio?.default_currency)

  const { mutate: addToProcurement } = usePost();

  const handleAddToProject = (data: { projectId: number; roomId: number; quantity: number; productId: number }) => {
    addToProcurement(
      { url: 'projects/procurements/', data: { quantity: data.quantity, project: data.projectId, room: data.roomId, product: data.productId, studio: user?.studio?.id, created_by: user?.id, updated_by: user?.id } },
      {
        onSuccess: () => {
          toast.success('Product added to project');
          queryClient.refetchQueries({ queryKey: [`projects/project-procurements/?project_id=${data.projectId}`] });
        },
        onError: (error: any) => {
          console.error(error);
          toast.error('Failed to add product');
        },
      }
    );
  };


  const handleThumbnailClick = (idx: number) => {
    setActiveIdx(idx);
    swiper?.slideTo(idx);
  };
 
  function copyUrl() {
    if (!data?.product_url){
      return toast.error('No URL available');
    };
    navigator.clipboard.writeText(data.product_url).catch(() => {});
    toast.success('Copied !');
  }

  if (!data) {
    return null;
  }

  const parsePrice = value => {
    if (!value) return 0;
    return (
      parseFloat(
        String(value).replace(/[^0-9.]/g, '') // strip out everything except numbers + dot
      ) || 0
    );
  };
  
  // Format prices with currency symbol
  const formatPrice = (price: string) => {
    if (price === null || price === undefined || price === '') return 'Not Available';
    return `${!currencyLoading && (productCurrency?.symbol || '£')} ${Number(price).toLocaleString('en-GB', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    })}`;
  };

  // Format boolean values
  const formatBoolean = (value: string) => {
    if (value === 'true' || true) return 'Yes';
    if (value === 'false' || false) return 'No';
    return value || 'Not Available';
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-screen max-w-full p-0 sm:max-w-xl md:max-w-3xl overflow-x-hidden">
        <div className="flex h-full flex-col">
          <SheetHeader className="px-6 pt-6">
            <SheetTitle className="text-xl font-semibold text-neutral-900">{data?.name}</SheetTitle>
            {product?.supplier ? <div className="text-sm text-neutral-600">Supplier: {product?.supplier?.company_name}</div> : null}
          </SheetHeader>

          <Separator className="mt-4" />

          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="grid gap-6 p-6 md:grid-cols-2 min-w-0">
              {/* Left: gallery */}
              <section aria-label="Product images" className="min-w-0 w-full">
                <div className="overflow-hidden rounded-xl border border-greige-500/30 bg-white w-full">
                  <Swiper
                    onSwiper={setSwiper}
                    onSlideChange={(s) => setActiveIdx(s.activeIndex)}
                    modules={[Navigation, Pagination]}
                    spaceBetween={0}
                    slidesPerView={1}
                    grabCursor
                    style={{ width: '100%', minWidth: 0 }}
                  >
                    {data?.images?.length > 0 ? (
                      data.images.map((img, idx) => (
                        <SwiperSlide key={idx} className="select-none">
                          <div className="relative h-56 sm:h-64 md:h-80 w-full bg-white">
                            <ProductImage
                              alt="Product Image"
                              src={img?.image}
                              fill
                              className="object-contain"
                              sizes="(max-width: 768px) 100vw, 50vw"
                            />
                          </div>
                        </SwiperSlide>
                      ))
                    ) : (
                      <SwiperSlide className="select-none">
                        <div className="relative h-56 sm:h-64 md:h-80 w-full bg-white">
                          <Image src={errorImage} alt="Placeholder" fill className="object-contain" />
                        </div>
                      </SwiperSlide>
                    )}
                  </Swiper>
                </div>

                {data?.images?.length > 1 && (
                  <div className="mt-3 flex gap-3 overflow-x-auto scrollbar-hide">
                    {data?.images?.map((img, idx) => (
                      <button
                        key={img.src + idx}
                        type="button"
                        onClick={() => handleThumbnailClick(idx)}
                        className={cn(
                          'relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition',
                          idx === activeIdx ? 'border-clay-600 ' : 'border-greige-500/30 hover:border-greige-500/60'
                        )}
                        aria-label={`Show image ${idx + 1}`}
                      >
                      {img?.image &&   <Image width={200} alt="Thumbnail" height={200} src={img?.image} className="h-full w-full object-cover" />}
                      </button>
                    ))}
                  </div>
                )}
              </section>

              {/* Right: details */}
              <section className="flex flex-col gap-4">
      { data?.product_url &&         <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" className="border-greige-500/30 bg-white" onClick={copyUrl}>
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Copy Link
                  </Button>
                  <Link
                    href={data?.product_url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 border-greige-500/30 bg-white"
                  >
                    <Globe className="mr-2 h-4 w-4" />
                    Website
                  </Link>
                </div>}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <StatCard label="Retail Price" value={`${formatPrice(parsePrice(data?.priceRegular))}`} />
                  <StatCard label="Trade Price" value={formatPrice(parsePrice(data?.priceMember))} />
                  <StatCard label="Supplier" value={product?.supplier?.company_name} />
                  <StatCard label="Product Type" value={data?.type} />
                  <StatCard label="Materials" value={data?.materials} />
                  <StatCard label="Dimensions" value={data.dimensions} />
                  <StatCard label="Weight" value={data.weight} />
                  <StatCard label="Status" value={data.status} />
                  <StatCard label="Sample" value={data.sample} />
                  <StatCard label="Quantity" value={data.qty} />
                </div>
                {data.measurements && (
                  <div className="mt-2">
                    <h3 className="text-base font-semibold text-neutral-900">Measurements</h3>
                    <p className="mt-1 text-sm text-neutral-600">{data.measurements}</p>
                  </div>
                )}
                {data.description ? (
                  <div className="mt-2">
                    <h3 className="text-base font-semibold text-neutral-900">Description</h3>
                    <p className="mt-1 text-sm leading-6 text-neutral-700">{data.description}</p>
                  </div>
                ) : null}
                {/* Additional product details */}
                <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <StatCard label="Assembly Required" value={formatBoolean(data.assemblyRequired)} />
                  <StatCard label="Removable Cushions" value={formatBoolean(data.removableCushions)} />
                  <StatCard label="Removable Legs" value={formatBoolean(data.removableLegs)} />
                  <StatCard label="Seat Depth" value={data.seatDepth} />
                  <StatCard label="Seat Height" value={data.seatHeight} />
                  <StatCard label="Seat Width" value={data.seatWidth} />
                  <StatCard label="Feet" value={data.feet} />
                  <StatCard label="Filling" value={data.filling} />
                  <StatCard label="Frame" value={data.frame} />
                  <StatCard label="Composition" value={data.composition} />
                  <StatCard label="Construction" value={data.construction} />
                </div>
                {/* Packaging information */}
                <div className="mt-2">
                  <h3 className="text-base font-semibold text-neutral-900">Packaging Details</h3>
                  <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <StatCard label="Boxed Dimensions" value={data.boxedDimensions} />
                    <StatCard label="Boxed Weight" value={data.boxedWeight} />
                  </div>
                </div>
                {data.instructions && (
                  <div className="mt-2">
                    <h3 className="text-base font-semibold text-neutral-900">Instructions</h3>
                    <p className="mt-1 text-sm leading-6 text-neutral-700">{data.instructions}</p>
                  </div>
                )}
                {/* Tags section */}
                <div className="mt-2">
                  <h3 className="text-base font-semibold text-neutral-900">Product Details</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {data.type && (
                      <Badge variant="secondary" className="rounded-md bg-greige-100 text-taupe-700">
                        {data.type}
                      </Badge>
                    )}
                    {data.status && (
                      <Badge variant="secondary" className="rounded-md bg-greige-100 text-taupe-700">
                        Status: <span className=" capitalize">{data.status}</span>
                      </Badge>
                    )}
                    {data.initialStatus && (
                      <Badge variant="secondary" className="rounded-md bg-greige-100 text-taupe-700">
                        Initial Status: {data.initialStatus}
                      </Badge>
                    )}
                    {data.sendToClient !== undefined && (
                      <Badge variant="secondary" className="rounded-md bg-greige-100 text-taupe-700">
                        Send to Client: {data.sendToClient ? 'Yes' : 'No'}
                      </Badge>
                    )}
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Sticky footer actions */}
          <div className="border-t border-greige-500/30 bg-white p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-neutral-600">Add this product to a project.</div>
              <div className="flex gap-2">
                {data.product_url ? (
                  <a
                    href={data.product_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex flex-shrink-0 items-center rounded-md border border-greige-500/30 bg-white px-4 py-2 text-sm text-neutral-700 hover:bg-stone-50"
                  >
                    View Product
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                ) : null}

              {libraryPermission &&  <Button
                  onClick={() => setAddToProjectOpen(true)}
                  className="bg-clay-600 text-white hover:bg-clay-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add to Project
                </Button>}
              </div>
            </div>
          </div>
        </div>
      </SheetContent>

      <AddToProjectDialog
        open={addToProjectOpen}
        onOpenChange={setAddToProjectOpen}
        product={product}
        onSubmit={handleAddToProject}
      />

    </Sheet>
  );
}
