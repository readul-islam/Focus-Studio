'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import type { CatalogProduct, ProductFormValues } from '@/types/supplier';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

type ProductFormProps = {
  initial?: CatalogProduct;
  onSubmit: (values: ProductFormValues) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  isVerified?: boolean;
};

const emptyValues: ProductFormValues = {
  name: '',
  sku: '',
  url: '',
  description: '',
  category: '',
  currency: 'GBP',
  trade_price: '',
  retail_price: '',
  lead_time_days: undefined,
  dimension: '',
  materials: '',
  weight: '',
  is_published: false,
};

export function ProductForm({ initial, onSubmit, isSubmitting, submitLabel = 'Save product', isVerified = true }: ProductFormProps) {
  const [values, setValues] = useState<ProductFormValues>(emptyValues);

  useEffect(() => {
    if (!initial) return;
    setValues({
      name: initial.name ?? '',
      sku: initial.sku ?? '',
      url: initial.url ?? '',
      description: initial.description ?? '',
      category: initial.category ?? '',
      currency: initial.currency ?? 'GBP',
      trade_price: initial.trade_price ?? '',
      retail_price: initial.retail_price ?? '',
      lead_time_days: initial.lead_time_days ?? undefined,
      dimension: initial.dimension ?? '',
      materials: initial.materials ?? '',
      weight: initial.weight ?? '',
      is_published: initial.is_published ?? false,
    });
  }, [initial]);

  const update = (field: keyof ProductFormValues, value: string | number | boolean | undefined) => {
    setValues(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...values,
      trade_price: values.trade_price || undefined,
      retail_price: values.retail_price || undefined,
      lead_time_days: values.lead_time_days ? Number(values.lead_time_days) : undefined,
    });
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="name">Product name *</Label>
          <Input id="name" required value={values.name} onChange={e => update('name', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sku">SKU</Label>
          <Input id="sku" value={values.sku} onChange={e => update('sku', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input id="category" placeholder="Lighting, Furniture…" value={values.category} onChange={e => update('category', e.target.value)} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="url">Product URL</Label>
          <Input id="url" type="url" value={values.url} onChange={e => update('url', e.target.value)} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" value={values.description} onChange={e => update('description', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="trade_price">Trade price</Label>
          <Input id="trade_price" type="number" min="0" step="0.01" value={values.trade_price} onChange={e => update('trade_price', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="retail_price">Retail price</Label>
          <Input id="retail_price" type="number" min="0" step="0.01" value={values.retail_price} onChange={e => update('retail_price', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Input id="currency" maxLength={3} value={values.currency} onChange={e => update('currency', e.target.value.toUpperCase())} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lead_time_days">Lead time (days)</Label>
          <Input
            id="lead_time_days"
            type="number"
            min="0"
            value={values.lead_time_days ?? ''}
            onChange={e => update('lead_time_days', e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dimension">Dimensions</Label>
          <Input id="dimension" value={values.dimension} onChange={e => update('dimension', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="materials">Materials</Label>
          <Input id="materials" value={values.materials} onChange={e => update('materials', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="weight">Weight</Label>
          <Input id="weight" value={values.weight} onChange={e => update('weight', e.target.value)} />
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border bg-neutral-50 p-4">
        <div>
          <p className="text-sm font-medium text-gray-900">Publish to catalog</p>
          <p className="text-xs text-neutral-500">
            {isVerified
              ? 'Verified suppliers can make products visible to studios.'
              : 'Publishing is available after your account is verified.'}
          </p>
        </div>
        <Switch
          checked={values.is_published}
          disabled={!isVerified}
          onCheckedChange={checked => update('is_published', checked)}
        />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {isSubmitting ? 'Saving…' : submitLabel}
      </Button>
    </form>
  );
}
