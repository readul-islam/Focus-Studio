'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { gooeyToast as toast } from 'goey-toast';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, X, Star, Loader2, Package, ChevronDown, Check,
  AlertCircle, Link2, FileText, Ruler, Weight, Box, Sofa,
  Wrench, DollarSign, Tag, Image as ImageIcon
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Popover, PopoverContent, PopoverTrigger
} from '@/components/ui/popover';
import {
  Command, CommandInput, CommandList, CommandItem, CommandEmpty
} from '@/components/ui/command';
import { CurrencySelector } from '@/components/ui/CurrencySelector';
import AddSupplier from '../contacts/AddSupplier';
import useFetch from '@/hooks/useFetch';
import useUser from '@/hooks/useUser';
import { usePost } from '@/hooks/usePost';
import { postData } from '@/lib/Api';
import { cn } from '@/lib/utils';

// ─── Zod Schema ──────────────────────────────────────────────────────────────

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200, 'Max 200 characters'),
  supplier: z.string().optional(),
  product_url: z.string().url('Enter a valid URL').or(z.literal('')).optional(),
  description: z.string().optional(),
  currency: z.string().min(1, 'Currency is required'),
  priceMember: z.coerce.number().min(0, 'Must be ≥ 0').optional(),
  priceRegular: z.coerce.number().min(0, 'Must be ≥ 0').optional(),
  measurements: z.string().optional(),
  materials: z.string().optional(),
  dimensions: z.string().optional(),
  weight: z.string().optional(),
  boxedDimensions: z.string().optional(),
  boxedWeight: z.string().optional(),
  assemblyRequired: z.enum(['true', 'false', '']).optional(),
  seatWidth: z.string().optional(),
  seatDepth: z.string().optional(),
  seatHeight: z.string().optional(),
  composition: z.string().optional(),
  construction: z.string().optional(),
  feet: z.coerce.number().min(0).optional(),
  filling: z.string().optional(),
  frame: z.string().optional(),
  removableCushions: z.enum(['true', 'false', '']).optional(),
  removableLegs: z.enum(['true', 'false', '']).optional(),
  type: z.string().optional(),
  instructions: z.string().optional(),
});

type ProductForm = z.infer<typeof productSchema>;

// ─── Constants ────────────────────────────────────────────────────────────────

const PRODUCT_TYPES = ['Furniture', 'Lighting', 'Textiles', 'Dining', 'Bathroom', 'Accessories', 'Home Fragrance', 'Outdoor', 'Art'];

const SECTIONS = [
  { id: 'basic', label: 'Basic Info', icon: Package },
  { id: 'pricing', label: 'Pricing', icon: DollarSign },
  { id: 'specs', label: 'Specifications', icon: Ruler },
  { id: 'furniture', label: 'Furniture Details', icon: Sofa },
] as const;

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <motion.p
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.15 }}
      className="flex items-center gap-1 text-[11px] font-medium text-red-500 mt-1"
      role="alert"
    >
      <AlertCircle className="h-3 w-3 flex-shrink-0" />
      {message}
    </motion.p>
  );
}

function SectionHeader({ icon: Icon, title, description }: { icon: any; title: string; description?: string }) {
  return (
    <div className="flex items-center gap-3 pb-3 mb-4 border-b border-border/40">
      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
        <Icon className="h-4 w-4 text-foreground/80" />
      </div>
      <div>
        <p className="text-[13px] font-semibold text-foreground tracking-tight">{title}</p>
        {description && <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>}
      </div>
    </div>
  );
}

function BooleanSelect({ value, onChange, label, id, error }: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  id: string;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium text-foreground/90">
        {label}
      </Label>
      <Select value={value || ''} onValueChange={onChange}>
        <SelectTrigger
          id={id}
          className={cn(
            'h-10 rounded-xl border bg-background text-foreground text-[13px] font-medium transition-colors',
            'hover:border-primary/40 focus:ring-0 focus:outline-none focus:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0',
            error ? 'border-red-300 focus:border-red-400' : 'border-border/60'
          )}
        >
          <SelectValue placeholder="Select…" />
        </SelectTrigger>
        <SelectContent className="bg-card z-[9999] rounded-xl border-border/80 shadow-2xl">
          <SelectItem value="true" className="text-[13px] cursor-pointer hover:bg-muted/40 focus:bg-muted/40">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              Yes
            </div>
          </SelectItem>
          <SelectItem value="false" className="text-[13px] cursor-pointer hover:bg-muted/40 focus:bg-muted/40">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-muted-foreground/60" />
              No
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
      <AnimatePresence mode="wait">
        {error && <FieldError message={error} />}
      </AnimatePresence>
    </div>
  );
}

function FormField({ label, id, error, required, children }: {
  label: string;
  id: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label
        htmlFor={id}
        className="text-sm font-medium text-foreground/90"
      >
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      {children}
      <AnimatePresence mode="wait">
        {error && <FieldError message={error} />}
      </AnimatePresence>
    </div>
  );
}

// ─── Image Upload Zone ────────────────────────────────────────────────────────

interface UploadedFile extends File {
  preview: string;
}

function ImageUploadZone({
  files,
  primaryIndex,
  onDrop,
  onRemove,
  onSetPrimary,
  error,
}: {
  files: UploadedFile[];
  primaryIndex: number;
  onDrop: (accepted: File[], rejected: any[]) => void;
  onRemove: (name: string) => void;
  onSetPrimary: (index: number) => void;
  error: string;
}) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/png': [], 'image/jpeg': [], 'image/jpg': [], 'image/gif': [], 'image/webp': [] },
    maxSize: 20 * 1024 * 1024,
    maxFiles: 5,
    onDrop,
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
          <ImageIcon className="h-4 w-4 text-foreground/80" />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-foreground tracking-tight">Product Images</p>
          <p className="text-[11px] text-muted-foreground">Up to 5 images · Max 20MB each</p>
        </div>
      </div>

      <div
        {...getRootProps()}
        className={cn(
          'relative border-2 border-dashed rounded-2xl p-6 cursor-pointer transition-all duration-200',
          'flex flex-col items-center justify-center text-center gap-3',
          isDragActive
            ? 'border-primary bg-primary/5 scale-[1.01]'
            : 'border-border/60 hover:border-primary/40 hover:bg-muted/20 bg-background'
        )}
      >
        <input {...getInputProps()} aria-label="Upload product images" />
        <div className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center transition-colors',
          isDragActive ? 'bg-primary' : 'bg-muted'
        )}>
          <Upload className={cn('h-4 w-4', isDragActive ? 'text-primary-foreground' : 'text-muted-foreground')} />
        </div>
        <div>
          <p className="text-[13px] font-medium text-foreground/85">
            {isDragActive ? 'Drop images here' : 'Drag & drop or click to upload'}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">PNG, JPG, GIF, WEBP supported</p>
        </div>
        {error && (
          <p className="flex items-center gap-1 text-[11px] font-medium text-red-500">
            <AlertCircle className="h-3 w-3" />
            {error}
          </p>
        )}
      </div>

      {files.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          <AnimatePresence>
            {files.map((file, index) => (
              <motion.div
                key={file.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="relative group"
              >
                <div className={cn(
                  'w-20 h-20 rounded-xl overflow-hidden border-2 transition-all',
                  index === primaryIndex ? 'border-amber-400 shadow-[0_0_0_3px_rgba(251,191,36,0.2)]' : 'border-border/60 bg-muted/20'
                )}>
                  <img src={file.preview} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); onRemove(file.name); }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); onSetPrimary(index); }}
                  className={cn(
                    'absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center transition-all z-10',
                    index === primaryIndex
                      ? 'bg-amber-400 text-white'
                      : 'bg-muted text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-primary/20 hover:text-primary'
                  )}
                  title="Set as primary image"
                  aria-label={index === primaryIndex ? 'Primary image' : 'Set as primary'}
                >
                  <Star className="h-3 w-3" fill={index === primaryIndex ? 'currentColor' : 'none'} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface AddProductModalProps {
  closeModal: () => void;
  modalOpen: boolean;
}

const AddProductModal = ({ closeModal, modalOpen }: AddProductModalProps) => {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [imageError, setImageError] = useState('');
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [supplierOpen, setSupplierOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);

  const { data: suppliers, isLoading: loadingSuppliers, refetch: refetchSupplier } = useFetch('crm/studio-suppliers/');

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '', currency: '', supplier: '', product_url: '', description: '',
      priceMember: undefined, priceRegular: undefined, measurements: '', materials: '',
      dimensions: '', weight: '', boxedDimensions: '', boxedWeight: '',
      assemblyRequired: '', seatWidth: '', seatDepth: '', seatHeight: '',
      composition: '', construction: '', feet: undefined, filling: '',
      frame: '', removableCushions: '', removableLegs: '', type: '', instructions: '',
    },
  });

  const typeValue = watch('type');

  const { mutate: postProduct, isPending: isProductPending } = usePost({
    onSuccess: async (data: any) => {
      if (files.length > 0) {
        if (!data?.id) {
          toast.error('Product created but ID missing. Cannot upload images.');
          return;
        }
        setIsUploading(true);
        try {
          await Promise.all(
            files.map((file, index) => {
              const formData = new FormData();
              formData.append('image', file);
              formData.append('is_primary', String(index === primaryImageIndex));
              formData.append('product', data.id);
              if (user?.studio?.id) formData.append('studio', user.studio.id);
              if (user?.id) formData.append('created_by', user.id);
              return postData({ url: 'library/product-images/', data: formData });
            })
          );
          toast.success('Product and images saved');
        } catch (err: any) {
          toast.error(`Image upload failed: ${err.message || 'Unknown error'}`);
        } finally {
          setIsUploading(false);
        }
      } else {
        toast.success('Product saved');
      }
      queryClient.refetchQueries({ queryKey: ['library/studio-products/'] });
      handleClose();
    },
    onError: () => toast.error('Failed to create product. Please try again.'),
  });

  const handleClose = useCallback(() => {
    reset();
    setFiles([]);
    setImageError('');
    setPrimaryImageIndex(0);
    setSelectedSupplier(null);
    closeModal();
  }, [reset, closeModal]);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      const err = rejectedFiles[0].errors[0];
      if (err.code === 'too-many-files') setImageError('Maximum 5 images allowed.');
      else if (err.code === 'file-too-large') setImageError('File exceeds 20MB limit.');
      else setImageError('Only PNG, JPG, GIF, WEBP files are allowed.');
      return;
    }
    setImageError('');
    setFiles(prev => [
      ...prev,
      ...acceptedFiles.map(f => Object.assign(f, { preview: URL.createObjectURL(f) })) as UploadedFile[],
    ]);
  }, []);

  const removeImage = useCallback((name: string) => {
    setFiles(prev => {
      const next = prev.filter(f => f.name !== name);
      if (primaryImageIndex >= next.length) setPrimaryImageIndex(Math.max(0, next.length - 1));
      return next;
    });
  }, [primaryImageIndex]);

  const onSubmit = (values: ProductForm) => {
    const payload = {
      name: values.name,
      url: values.product_url || '',
      description: values.description || '',
      currency: values.currency,
      tader_price: Number(values.priceMember) || 0,
      regular_price: Number(values.priceRegular) || 0,
      measurement: values.measurements || '',
      materials: values.materials || '',
      dimension: values.dimensions || '',
      weight: values.weight || '',
      box_dimension: values.boxedDimensions || '',
      assembly_required: values.assemblyRequired === 'true',
      seat_width: values.seatWidth || '',
      seat_depth: values.seatDepth || '',
      seat_height: values.seatHeight || '',
      composition: values.composition || '',
      construction: values.construction || '',
      feet: Number(values.feet) || 0,
      filling: values.filling || '',
      removeable_cushion: values.removableCushions === 'true',
      removeable_legs: values.removableLegs === 'true',
      frame: values.frame || '',
      instruction: values.instructions || '',
      type: values.type || '',
      studio: user?.studio?.id,
      supplier: selectedSupplier?.id,
    };
    postProduct({ url: 'library/products/', data: payload });
  };

  const isBusy = isProductPending || isUploading || isSubmitting;

  return (
    <>
      <Dialog open={modalOpen} onOpenChange={v => !v && handleClose()}>
        <DialogContent
          overlayClassName="bg-background/35 backdrop-blur-[8px]"
          className={cn(
            'p-0 gap-0 border border-border/40 shadow-[0_20px_60px_rgba(0,0,0,0.65)] hover:border-primary/25 transition-colors duration-300 overflow-hidden',
            'w-full max-w-[680px] max-h-[92vh] flex flex-col',
            'bg-card rounded-2xl text-foreground'
          )}
          onInteractOutside={e => e.preventDefault()}
        >
          {/* ── Header ── */}
          <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-border/40 bg-card">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <Package className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <DialogTitle className="text-[16px] font-bold text-foreground tracking-tight">
                  Add Product
                </DialogTitle>
                <DialogDescription className="text-[12px] text-muted-foreground mt-0.5">
                  Fill in the details below. Name and currency are required.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* ── Scrollable Body ── */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-rounded pr-1">
            <form
              id="add-product-form"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="space-y-0"
            >
              {/* Images */}
              <div className="px-6 py-5 bg-card border-b border-border/40">
                <ImageUploadZone
                  files={files}
                  primaryIndex={primaryImageIndex}
                  onDrop={onDrop}
                  onRemove={removeImage}
                  onSetPrimary={setPrimaryImageIndex}
                  error={imageError}
                />
              </div>

              {/* Basic Info */}
              <div className="px-6 py-5 bg-card border-b border-border/40">
                <SectionHeader icon={Package} title="Basic Information" description="Core product details" />
                <div className="grid grid-cols-2 gap-4">
                  {/* Product Name */}
                  <FormField label="Product Name" id="name" error={errors.name?.message} required>
                    <Input
                      {...register('name')}
                      id="name"
                      placeholder="e.g. Oslo Lounge Chair"
                      autoComplete="off"
                      aria-describedby={errors.name ? 'name-error' : undefined}
                      aria-invalid={!!errors.name}
                      className={cn(
                        'h-10 rounded-xl border bg-background text-foreground text-[13px] transition-colors',
                        'placeholder:text-muted-foreground/60 focus:ring-0 focus:outline-none focus:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0',
                        errors.name ? 'border-red-300 focus:border-red-400' : 'border-border/60'
                      )}
                    />
                  </FormField>

                  {/* Supplier */}
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-foreground/90">
                      Supplier
                    </Label>
                    <Popover open={supplierOpen} onOpenChange={setSupplierOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          role="combobox"
                          aria-expanded={supplierOpen}
                          aria-label="Select supplier"
                          className={cn(
                            'w-full h-10 rounded-xl border border-border/60 bg-background text-foreground text-[13px] font-normal',
                            'justify-between hover:bg-muted/40 hover:border-primary/30',
                            'focus:ring-0 focus:outline-none focus:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0',
                            !selectedSupplier && 'text-muted-foreground/60'
                          )}
                        >
                          {selectedSupplier?.company_name || 'Select supplier…'}
                          <ChevronDown className="ml-2 h-3.5 w-3.5 opacity-50 flex-shrink-0" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent side="bottom" align="start" className="w-72 p-0 z-[9999] bg-card border-border/80 shadow-2xl rounded-xl">
                        <Command className="bg-transparent">
                          <CommandInput placeholder="Search suppliers…" className="text-[13px] text-foreground bg-transparent" />
                          <CommandList className="max-h-52">
                            <CommandEmpty className="text-[12px] text-muted-foreground py-3 px-4">No suppliers found.</CommandEmpty>
                            {!loadingSuppliers && suppliers?.map((item: any) => (
                              <CommandItem
                                key={item.id}
                                value={item.company_name}
                                onSelect={() => {
                                  setSelectedSupplier(item);
                                  setValue('supplier', item.company_name);
                                  setSupplierOpen(false);
                                }}
                                className="text-[13px] cursor-pointer hover:bg-muted/40 focus:bg-muted/40 text-foreground"
                              >
                                <Check className={cn('mr-2 h-3.5 w-3.5', selectedSupplier?.id === item.id ? 'opacity-100' : 'opacity-0')} />
                                {item.company_name}
                              </CommandItem>
                            ))}
                          </CommandList>
                          <div className="border-t border-border/40">
                            <button
                              type="button"
                              onClick={() => { setSupplierOpen(false); setIsAddSupplierOpen(true); }}
                              className="w-full text-[12px] font-medium text-primary py-2.5 px-4 text-left hover:bg-muted/40 transition-colors"
                            >
                              + Add new supplier
                            </button>
                          </div>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Type */}
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-foreground/90">
                      Product Type
                    </Label>
                    <Popover open={typeOpen} onOpenChange={setTypeOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          role="combobox"
                          aria-expanded={typeOpen}
                          className={cn(
                            'w-full h-10 rounded-xl border border-border/60 bg-background text-foreground text-[13px] font-normal',
                            'justify-between hover:bg-muted/40 hover:border-primary/30',
                            !typeValue && 'text-muted-foreground/60'
                          )}
                        >
                          {typeValue || 'Select type…'}
                          <ChevronDown className="ml-2 h-3.5 w-3.5 opacity-50 flex-shrink-0" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent side="bottom" align="start" className="w-52 p-1 z-[9999] bg-card border-border/80 shadow-2xl rounded-xl">
                        {PRODUCT_TYPES.map(t => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => { setValue('type', t); setTypeOpen(false); }}
                            className={cn(
                              'w-full text-left text-[13px] px-3 py-2 rounded-lg transition-colors flex items-center justify-between',
                              typeValue === t ? 'bg-muted text-foreground font-medium' : 'hover:bg-muted/40 text-foreground/80'
                            )}
                          >
                            {t}
                            {typeValue === t && <Check className="h-3.5 w-3.5" />}
                          </button>
                        ))}
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Product URL */}
                  <FormField label="Product URL" id="product_url" error={errors.product_url?.message}>
                    <div className="relative">
                      <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
                      <Input
                        {...register('product_url')}
                        id="product_url"
                        type="url"
                        placeholder="https://supplier.com/product"
                        aria-invalid={!!errors.product_url}
                        className={cn(
                          'h-10 pl-9 rounded-xl border bg-background text-foreground text-[13px] transition-colors',
                          'placeholder:text-muted-foreground/60 focus:ring-0 focus:outline-none focus:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0',
                          errors.product_url ? 'border-red-300' : 'border-border/60'
                        )}
                      />
                    </div>
                  </FormField>
                </div>

                {/* Description */}
                <div className="mt-4">
                  <FormField label="Description" id="description" error={errors.description?.message}>
                    <Textarea
                      {...register('description')}
                      id="description"
                      rows={3}
                      placeholder="Brief product description…"
                      className={cn(
                        'rounded-xl border border-border/60 bg-background text-foreground text-[13px] resize-none',
                        'placeholder:text-muted-foreground/60 focus:ring-0 focus:outline-none focus:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0'
                      )}
                    />
                  </FormField>
                </div>
              </div>

              {/* Pricing */}
              <div className="px-6 py-5 bg-card border-b border-border/40">
                <SectionHeader icon={DollarSign} title="Pricing" description="Trade and retail pricing" />
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <FormField label="Currency" id="currency" error={errors.currency?.message} required>
                      <Controller
                        name="currency"
                        control={control}
                        render={({ field }) => (
                          <CurrencySelector
                            value={field.value}
                            onChange={(currencyData: any) => {
                              field.onChange(currencyData.currency.value || currencyData.currency);
                            }}
                            data={{ currency: field.value }}
                          />
                        )}
                      />
                    </FormField>
                  </div>
                  <FormField label="Trade Price" id="priceMember" error={errors.priceMember?.message}>
                    <Input
                      {...register('priceMember')}
                      id="priceMember"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className={cn(
                        'h-10 rounded-xl border bg-background text-foreground text-[13px] transition-colors',
                        'placeholder:text-muted-foreground/60 focus:ring-0 focus:outline-none focus:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0',
                        errors.priceMember ? 'border-red-300' : 'border-border/60'
                      )}
                    />
                  </FormField>
                  <FormField label="Regular Price" id="priceRegular" error={errors.priceRegular?.message}>
                    <Input
                      {...register('priceRegular')}
                      id="priceRegular"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className={cn(
                        'h-10 rounded-xl border bg-background text-foreground text-[13px] transition-colors',
                        'placeholder:text-muted-foreground/60 focus:ring-0 focus:outline-none focus:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0',
                        errors.priceRegular ? 'border-red-300' : 'border-border/60'
                      )}
                    />
                  </FormField>
                </div>
              </div>

              {/* Specifications */}
              <div className="px-6 py-5 bg-card border-b border-border/40">
                <SectionHeader icon={Ruler} title="Specifications" description="Physical product details" />
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Measurements', id: 'measurements', placeholder: 'e.g. W80 × D75 × H85cm' },
                    { label: 'Materials', id: 'materials', placeholder: 'e.g. Oak, Leather' },
                    { label: 'Dimensions', id: 'dimensions', placeholder: 'e.g. 80 × 75 × 85 cm' },
                    { label: 'Weight', id: 'weight', placeholder: 'e.g. 12 kg' },
                    { label: 'Box Dimensions', id: 'boxedDimensions', placeholder: 'e.g. 90 × 80 × 95 cm' },
                    { label: 'Box Weight', id: 'boxedWeight', placeholder: 'e.g. 14 kg' },
                  ].map(({ label, id, placeholder }) => (
                    <FormField key={id} label={label} id={id} error={(errors as any)[id]?.message}>
                      <Input
                        {...register(id as keyof ProductForm)}
                        id={id}
                        placeholder={placeholder}
                        className="h-10 rounded-xl border border-border/60 bg-background text-foreground text-[13px] placeholder:text-muted-foreground/60 focus:ring-0 focus:outline-none focus:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </FormField>
                  ))}
                </div>
              </div>

              {/* Furniture Details */}
              <div className="px-6 py-5 bg-card">
                <SectionHeader icon={Sofa} title="Furniture Details" description="Optional furniture-specific attributes" />
                <div className="grid grid-cols-2 gap-4">
                  {/* Assembly Required */}
                  <Controller
                    name="assemblyRequired"
                    control={control}
                    render={({ field }) => (
                      <BooleanSelect
                        value={field.value || ''}
                        onChange={field.onChange}
                        label="Assembly Required"
                        id="assemblyRequired"
                        error={errors.assemblyRequired?.message}
                      />
                    )}
                  />

                  {/* Seat Width */}
                  <FormField label="Seat Width" id="seatWidth" error={errors.seatWidth?.message}>
                    <Input
                      {...register('seatWidth')}
                      id="seatWidth"
                      placeholder="e.g. 55 cm"
                      className="h-10 rounded-xl border border-border/60 bg-background text-foreground text-[13px] placeholder:text-muted-foreground/60 focus:ring-0 focus:outline-none focus:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </FormField>

                  {/* Seat Depth */}
                  <FormField label="Seat Depth" id="seatDepth" error={errors.seatDepth?.message}>
                    <Input
                      {...register('seatDepth')}
                      id="seatDepth"
                      placeholder="e.g. 50 cm"
                      className="h-10 rounded-xl border border-border/60 bg-background text-foreground text-[13px] placeholder:text-muted-foreground/60 focus:ring-0 focus:outline-none focus:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </FormField>

                  {/* Seat Height */}
                  <FormField label="Seat Height" id="seatHeight" error={errors.seatHeight?.message}>
                    <Input
                      {...register('seatHeight')}
                      id="seatHeight"
                      placeholder="e.g. 44 cm"
                      className="h-10 rounded-xl border border-border/60 bg-background text-foreground text-[13px] placeholder:text-muted-foreground/60 focus:ring-0 focus:outline-none focus:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </FormField>

                  {/* Composition */}
                  <FormField label="Composition" id="composition" error={errors.composition?.message}>
                    <Input
                      {...register('composition')}
                      id="composition"
                      placeholder="e.g. 80% polyester"
                      className="h-10 rounded-xl border border-border/60 bg-background text-foreground text-[13px] placeholder:text-muted-foreground/60 focus:ring-0 focus:outline-none focus:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </FormField>

                  {/* Construction */}
                  <FormField label="Construction" id="construction" error={errors.construction?.message}>
                    <Input
                      {...register('construction')}
                      id="construction"
                      placeholder="e.g. Kiln-dried oak frame"
                      className="h-10 rounded-xl border border-border/60 bg-background text-foreground text-[13px] placeholder:text-muted-foreground/60 focus:ring-0 focus:outline-none focus:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </FormField>

                  {/* Feet */}
                  <FormField label="Feet (cm)" id="feet" error={errors.feet?.message}>
                    <Input
                      {...register('feet')}
                      id="feet"
                      type="number"
                      min="0"
                      placeholder="e.g. 15"
                      className="h-10 rounded-xl border border-border/60 bg-background text-foreground text-[13px] placeholder:text-muted-foreground/60 focus:ring-0 focus:outline-none focus:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </FormField>

                  {/* Filling */}
                  <FormField label="Filling" id="filling" error={errors.filling?.message}>
                    <Input
                      {...register('filling')}
                      id="filling"
                      placeholder="e.g. High-density foam"
                      className="h-10 rounded-xl border border-border/60 bg-background text-foreground text-[13px] placeholder:text-muted-foreground/60 focus:ring-0 focus:outline-none focus:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </FormField>

                  {/* Frame */}
                  <FormField label="Frame" id="frame" error={errors.frame?.message}>
                    <Input
                      {...register('frame')}
                      id="frame"
                      placeholder="e.g. Solid oak"
                      className="h-10 rounded-xl border border-border/60 bg-background text-foreground text-[13px] placeholder:text-muted-foreground/60 focus:ring-0 focus:outline-none focus:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </FormField>

                  {/* Removable Cushions */}
                  <Controller
                    name="removableCushions"
                    control={control}
                    render={({ field }) => (
                      <BooleanSelect
                        value={field.value || ''}
                        onChange={field.onChange}
                        label="Removable Cushions"
                        id="removableCushions"
                        error={errors.removableCushions?.message}
                      />
                    )}
                  />

                  {/* Removable Legs */}
                  <Controller
                    name="removableLegs"
                    control={control}
                    render={({ field }) => (
                      <BooleanSelect
                        value={field.value || ''}
                        onChange={field.onChange}
                        label="Removable Legs"
                        id="removableLegs"
                        error={errors.removableLegs?.message}
                      />
                    )}
                  />
                </div>

                {/* Instructions */}
                <div className="mt-4">
                  <FormField label="Instructions" id="instructions" error={errors.instructions?.message}>
                    <Textarea
                      {...register('instructions')}
                      id="instructions"
                      rows={3}
                      placeholder="Assembly or care instructions…"
                      className="rounded-xl border border-border/60 bg-background text-foreground text-[13px] resize-none placeholder:text-muted-foreground/60 focus:ring-0 focus:outline-none focus:border-primary/40 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </FormField>
                </div>
              </div>
            </form>
          </div>

          {/* ── Footer ── */}
          <div className="flex-shrink-0 flex items-center justify-between gap-3 px-6 py-4 border-t border-border/40 bg-card">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={isBusy}
              className="h-10 px-5 rounded-xl text-[13px] font-medium text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="add-product-form"
              disabled={isBusy}
              className={cn(
                'h-10 px-6 rounded-xl text-[13px] font-medium bg-primary text-primary-foreground',
                'hover:bg-primary/90 active:bg-primary/95 transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'flex items-center gap-2'
              )}
            >
              {isBusy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isUploading ? 'Uploading images…' : isProductPending ? 'Saving…' : 'Save Product'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AddSupplier
        refetchSupplier={refetchSupplier}
        open={isAddSupplierOpen}
        onOpenChange={setIsAddSupplierOpen}
        renderTrigger={false}
      />
    </>
  );
};

export default AddProductModal;
