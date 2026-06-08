'use client';

import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProductForm } from '@/components/products/ProductForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createProduct } from '@/lib/api';
import type { ProductFormValues } from '@/types/supplier';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function NewProductPage() {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: createProduct,
    onSuccess: product => {
      toast.success('Product created');
      router.push(`/products/${product.id}`);
    },
    onError: () => toast.error('Could not create product'),
  });

  return (
    <DashboardLayout>
      <Card>
        <CardHeader>
          <CardTitle>Add product</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm
            isSubmitting={mutation.isPending}
            submitLabel="Create product"
            onSubmit={(values: ProductFormValues) => mutation.mutate(values)}
          />
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
