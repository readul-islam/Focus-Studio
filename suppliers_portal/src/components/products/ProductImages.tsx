'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { removeProductImage, uploadProductImage } from '@/lib/api';
import type { CatalogProduct } from '@/types/supplier';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { useRef } from 'react';
import { toast } from 'sonner';

type ProductImagesProps = {
  product: CatalogProduct;
};

export function ProductImages({ product }: ProductImagesProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadProductImage(product.id, file, !product.images?.length),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`supplier_portal/products/${product.id}/`] });
      toast.success('Image uploaded');
    },
    onError: () => toast.error('Could not upload image'),
  });

  const removeMutation = useMutation({
    mutationFn: (imageId: number) => removeProductImage(product.id, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`supplier_portal/products/${product.id}/`] });
      toast.success('Image removed');
    },
    onError: () => toast.error('Could not remove image'),
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Product images</CardTitle>
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
          {uploadMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
          Upload
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) uploadMutation.mutate(file);
            e.target.value = '';
          }}
        />
      </CardHeader>
      <CardContent>
        {!product.images?.length ? (
          <p className="text-sm text-neutral-500">No images yet. Upload a product photo for studios to browse.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {product.images.map(image => (
              <div key={image.id} className="group relative overflow-hidden rounded-lg border bg-neutral-50">
                <img src={image.image} alt={product.name} className="aspect-square w-full object-cover" />
                {image.is_primary && (
                  <span className="absolute left-2 top-2 rounded-full bg-black/75 px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
                    Primary
                  </span>
                )}
                <button
                  type="button"
                  className="absolute right-2 top-2 rounded-md bg-white/90 p-1.5 text-red-600 opacity-0 transition group-hover:opacity-100"
                  onClick={() => removeMutation.mutate(image.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
