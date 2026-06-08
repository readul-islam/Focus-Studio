'use client';

import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProductForm } from '@/components/products/ProductForm';
import { ProductImages } from '@/components/products/ProductImages';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Loader from '@/components/ui/loader';
import { useFetch } from '@/hooks/useFetch';
import { useSupplierUser } from '@/hooks/useSupplierUser';
import { updateProduct } from '@/lib/api';
import type { CatalogProduct, ProductFormValues } from '@/types/supplier';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { supplier } = useSupplierUser();
  const productId = Number(params.id);

  const { data: product, isLoading } = useFetch<CatalogProduct>(
    Number.isFinite(productId) ? `supplier_portal/products/${productId}/` : null,
  );

  const mutation = useMutation({
    mutationFn: (values: ProductFormValues) => updateProduct(productId, values),
    onSuccess: () => {
      toast.success('Product updated');
      router.refresh();
    },
    onError: () => toast.error('Could not update product'),
  });

  if (isLoading || !product) {
    return (
      <DashboardLayout>
        <Loader />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Edit product</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductForm
              initial={product}
              isVerified={supplier?.is_verified ?? false}
              isSubmitting={mutation.isPending}
              submitLabel="Save changes"
              onSubmit={values => mutation.mutate(values)}
            />
          </CardContent>
        </Card>
        <ProductImages product={product} />
      </div>
    </DashboardLayout>
  );
}
