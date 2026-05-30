'use client';

import { useMutation } from '@tanstack/react-query';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { gooeyToast as toast } from 'goey-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Check, Upload, X, Star, Loader2, Package, ChevronDown,
  Link2, DollarSign, Ruler, Sofa, AlertCircle, Image as ImageIcon,
  Pencil
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '../ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Command, CommandInput, CommandList, CommandItem, CommandEmpty
} from '@/components/ui/command';
import {
  Popover, PopoverContent, PopoverTrigger
} from '@/components/ui/popover';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import AddSupplier from '../contacts/AddSupplier';
import { patchData, postData, deleteData } from '@/lib/Api';
import useFetch from '@/hooks/useFetch';
import useUser from '@/hooks/useUser';
import { CurrencySelector } from '@/components/ui/CurrencySelector';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

// ─── Sub-components (shared design language) ──────────────────────────────────

function SectionHeader({ icon: Icon, title, description }: { icon: any; title: string; description?: string }) {
  return (
    <div className="flex items-center gap-3 pb-3 mb-4 border-b border-stone-100">
      <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center flex-shrink-0">
        <Icon className="h-4 w-4 text-stone-600" />
      </div>
      <div>
        <p className="text-[13px] font-semibold text-stone-900 tracking-tight">{title}</p>
        {description && <p className="text-[11px] text-stone-400 mt-0.5">{description}</p>}
      </div>
    </div>
  );
}

function FormField({ label, id, required, children }: {
  label: string; id: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium text-ink">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      {children}
    </div>
  );
}

function BooleanSelect({ value, onChange, label, id }: {
  value: boolean; onChange: (v: boolean) => void; label: string; id: string;
}) {
  const t = useTranslations('libraryProductModal');
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </Label>
      <Select
        value={String(value)}
        onValueChange={v => onChange(v === 'true')}
      >
        <SelectTrigger
          id={id}
          className="h-10 rounded-xl border border-borderSoft bg-white text-[13px] font-medium transition-colors hover:border-clay-300 focus:ring-0 focus:outline-none focus:border-clay-300 focus-visible:ring-0 focus-visible:ring-offset-0"
        >
          <SelectValue placeholder={t('selectPlaceholder')} />
        </SelectTrigger>
        <SelectContent className="bg-white z-[9999] rounded-xl border-borderSoft shadow-xl">
          <SelectItem value="true" className="text-[13px] cursor-pointer focus:bg-stone-50">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />{t('yes')}
            </div>
          </SelectItem>
          <SelectItem value="false" className="text-[13px] cursor-pointer focus:bg-stone-50">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-stone-400" />{t('no')}
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

// ─── Image Zones ──────────────────────────────────────────────────────────────

interface UploadedFile extends File { preview: string; }

function ExistingImages({
  images,
  onDelete,
  onSetPrimary,
}: {
  images: any[];
  onDelete: (id: string) => void;
  onSetPrimary: (id: string) => void;
}) {
  const t = useTranslations('libraryProductModal');
  if (images.length === 0) return null;
  return (
    <div className="flex gap-3 flex-wrap">
      <AnimatePresence>
        {images.map((img) => (
          <motion.div
            key={img.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="relative group"
          >
            <div className={cn(
              'w-20 h-20 rounded-xl overflow-hidden border-2 transition-all',
              img.is_primary
                ? 'border-amber-400 shadow-[0_0_0_3px_rgba(251,191,36,0.2)]'
                : 'border-borderSoft'
            )}>
              <img src={img.image} alt={t('productAlt')} className="w-full h-full object-cover" />
            </div>
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onDelete(img.id); }}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
              aria-label={t('deleteImage')}
            >
              <X className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onSetPrimary(img.id); }}
              className={cn(
                'absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center transition-all z-10',
                img.is_primary
                  ? 'bg-amber-400 text-white'
                  : 'bg-stone-200 text-stone-400 opacity-0 group-hover:opacity-100 hover:bg-amber-200'
              )}
              title={img.is_primary ? t('primaryImage') : t('setPrimary')}
              aria-label={img.is_primary ? t('primaryImage') : t('setPrimary')}
            >
              <Star className="h-3 w-3" fill={img.is_primary ? 'currentColor' : 'none'} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function NewFilePreviews({ files, onRemove }: { files: UploadedFile[]; onRemove: (name: string) => void; }) {
  const t = useTranslations('libraryProductModal');
  if (files.length === 0) return null;
  return (
    <div className="flex gap-3 flex-wrap">
      <AnimatePresence>
        {files.map(file => (
          <motion.div
            key={file.name}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="relative group"
          >
            <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-emerald-300 shadow-[0_0_0_3px_rgba(52,211,153,0.15)]">
              <img src={file.preview} alt={t('previewAlt')} className="w-full h-full object-cover" />
            </div>
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onRemove(file.name); }}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
              aria-label={t('deleteImage')}
            >
              <X className="h-3 w-3" />
            </button>
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-full z-10 whitespace-nowrap">
              {t('newImageBadge')}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const PRODUCT_TYPES = ['Furniture', 'Lighting', 'Textiles', 'Dining', 'Bathroom', 'Accessories', 'Home Fragrance', 'Outdoor', 'Art'];

const EDIT_SPEC_FIELDS = [
  { id: 'measurement', labelKey: 'measurements', placeholderKey: 'measurements' },
  { id: 'materials', labelKey: 'materials', placeholderKey: 'materials' },
  { id: 'dimension', labelKey: 'dimensions', placeholderKey: 'dimensions' },
  { id: 'weight', labelKey: 'weight', placeholderKey: 'weight' },
  { id: 'box_dimension', labelKey: 'boxDimensions', placeholderKey: 'boxDimensions' },
] as const;

const initial = {
  id: '',
  name: '',
  supplier: null as any,
  tader_price: 0,
  regular_price: 0,
  description: '',
  currency: '',
  measurement: '',
  materials: '',
  dimension: '',
  weight: '',
  box_dimension: '',
  assembly_required: false,
  instruction: '',
  composition: '',
  construction: '',
  feet: 0,
  filling: '',
  frame: '',
  removeable_cushion: false,
  removeable_legs: false,
  seat_depth: '',
  seat_height: '',
  seat_width: '',
  type: '',
  url: '',
};

interface EditProductModalProps {
  productInfo: any;
  editModal: boolean;
  closeEditModal: () => void;
  refetch: () => void;
}

const EditProductModal = ({ productInfo, editModal, closeEditModal, refetch }: EditProductModalProps) => {
  const t = useTranslations('libraryProductModal');
  const specFields = useMemo(
    () =>
      EDIT_SPEC_FIELDS.map(({ id, labelKey, placeholderKey }) => ({
        id,
        label: t(`fields.${labelKey}` as 'fields.measurements'),
        placeholder: t(`fieldPlaceholders.${placeholderKey}` as 'fieldPlaceholders.measurements'),
      })),
    [t]
  );
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [imageError, setImageError] = useState('');
  const [product, setProduct] = useState(initial);
  const [supplierOpen, setSupplierOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useUser();

  const { data: suppliers, isLoading: loadingSuppliers, refetch: refetchSupplier } = useFetch('crm/studio-suppliers/');

  const { mutate: patchProduct, isPending: isPatching } = useMutation({
    mutationFn: ({ url, data }: { url: string; data: any }) => patchData({ url, data }),
    onSuccess: async () => {
      if (files.length > 0) {
        setIsUploading(true);
        try {
          await Promise.all(
            files.map(file => {
              const formData = new FormData();
              formData.append('image', file);
              formData.append('is_primary', 'false');
              formData.append('product', product.id);
              if (user?.studio?.id) formData.append('studio', user.studio.id);
              if (user?.id) formData.append('created_by', user.id);
              return postData({ url: 'library/product-images/', data: formData });
            })
          );
          toast.success(t('productUpdatedWithImages'));
        } catch {
          toast.error(t('productUpdatedImagesFailed'));
        } finally {
          setIsUploading(false);
        }
      } else {
        toast.success(t('updated'));
      }
      refetch();
      afterCloseModal();
    },
    onError: () => toast.error(t('updateError')),
  });

  useEffect(() => {
    if (productInfo) {
      const { images, ...rest } = productInfo;
      setProduct(rest);
      setExistingImages(images || []);
    }
  }, [productInfo]);

  const afterCloseModal = useCallback(() => {
    setFiles([]);
    setImageError('');
    closeEditModal();
  }, [closeEditModal]);

  const handleDeleteImage = async (imageId: string) => {
    try {
      await deleteData({ url: `library/product-images/${imageId}/` });
      setExistingImages(prev => prev.filter(img => img.id !== imageId));
      toast.success(t('imageDeleted'));
      refetch();
    } catch {
      toast.error(t('imageDeleteFailed'));
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    try {
      const current = existingImages.find(img => img.id === imageId);
      const newPrimary = !current?.is_primary;
      setExistingImages(prev => prev.map(img => ({
        ...img,
        is_primary: newPrimary ? img.id === imageId : (img.id === imageId ? false : img.is_primary),
      })));
      await patchData({
        url: `library/products/${product.id}/`,
        data: {
          images: existingImages.map(img => ({
            id: img.id,
            is_primary: img.id === imageId ? newPrimary : false,
          })),
        },
      });
      toast.success(newPrimary ? t('primarySet') : t('primaryUnset'));
      refetch();
    } catch {
      toast.error(t('primaryUpdateFailed'));
    }
  };

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      const code = rejectedFiles[0].errors[0].code;
      if (code === 'too-many-files') setImageError(t('imageErrors.maxImages'));
      else if (code === 'file-too-large') setImageError(t('imageErrors.fileTooLarge'));
      else setImageError(t('imageErrors.invalidFormat'));
      return;
    }
    setImageError('');
    setFiles(prev => [
      ...prev,
      ...acceptedFiles.map(f => Object.assign(f, { preview: URL.createObjectURL(f) })) as UploadedFile[],
    ]);
  }, [t]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/png': [], 'image/jpeg': [], 'image/jpg': [], 'image/gif': [], 'image/webp': [] },
    maxSize: 20 * 1024 * 1024,
    maxFiles: 5,
    onDrop,
  });

  const removeNewFile = useCallback((name: string) => {
    setFiles(prev => prev.filter(f => f.name !== name));
  }, []);

  const updateField = (name: string, value: any) => {
    setProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    updateField(e.target.name, e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...product,
      tader_price: Number(product.tader_price) || 0,
      regular_price: Number(product.regular_price) || 0,
      feet: Number(product.feet) || 0,
      supplier: product.supplier?.id,
    };
    patchProduct({ url: `library/products/${product.id}/`, data: payload });
  };

  const isBusy = isPatching || isUploading;
  const inputCls = "h-10 rounded-xl border border-borderSoft bg-white text-[13px] placeholder:text-stone-400 focus:ring-0 focus:outline-none focus:border-clay-300 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors";

  return (
    <>
      <Dialog open={editModal} onOpenChange={v => !v && afterCloseModal()} modal={!isAddSupplierOpen}>
        <DialogContent
          className="p-0 gap-0 border-0 shadow-2xl overflow-hidden w-full max-w-[680px] max-h-[92vh] flex flex-col bg-[#FAFAF8] rounded-2xl"
          onInteractOutside={e => e.preventDefault()}
        >
          {/* ── Header ── */}
          <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-stone-100 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-stone-900 flex items-center justify-center">
                <Pencil className="h-4 w-4 text-white" />
              </div>
              <div>
                <DialogTitle className="text-[16px] font-semibold text-stone-900 tracking-tight">
                  {t('titleEdit')}
                </DialogTitle>
                <DialogDescription className="text-[12px] text-stone-400 mt-0.5">
                  {product.name || t('descriptionEdit')}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* ── Scrollable Body ── */}
          <div className="flex-1 overflow-y-auto">
            <form id="edit-product-form" onSubmit={handleSubmit} noValidate>

              {/* Images */}
              <div className="px-6 py-5 bg-white border-b border-stone-100 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center">
                    <ImageIcon className="h-4 w-4 text-stone-600" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-stone-900 tracking-tight">{t('productImages')}</p>
                    <p className="text-[11px] text-stone-400">
                      {existingImages.length > 0
                        ? t('editImagesSavedHint', { count: existingImages.length })
                        : t('imagesHint')}
                    </p>
                  </div>
                </div>

                {/* Existing saved images */}
                <ExistingImages
                  images={existingImages}
                  onDelete={handleDeleteImage}
                  onSetPrimary={handleSetPrimary}
                />

                {/* New file previews */}
                <NewFilePreviews files={files} onRemove={removeNewFile} />

                {/* Drop zone */}
                <div
                  {...getRootProps()}
                  className={cn(
                    'relative border-2 border-dashed rounded-2xl p-5 cursor-pointer transition-all duration-200',
                    'flex flex-col items-center justify-center text-center gap-2',
                    isDragActive
                      ? 'border-stone-900 bg-stone-50 scale-[1.01]'
                      : 'border-borderSoft hover:border-clay-300 hover:bg-greige-50/50 bg-white'
                  )}
                >
                  <input {...getInputProps()} aria-label={t('uploadImagesAria')} />
                  <div className={cn(
                    'w-9 h-9 rounded-xl flex items-center justify-center transition-colors',
                    isDragActive ? 'bg-stone-900' : 'bg-stone-100'
                  )}>
                    <Upload className={cn('h-4 w-4', isDragActive ? 'text-white' : 'text-stone-500')} />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-stone-700">
                      {isDragActive ? t('dropImages') : t('dragOrClickAddMore')}
                    </p>
                    <p className="text-[11px] text-stone-400 mt-0.5">{t('imagesFormats')}</p>
                  </div>
                  {imageError && (
                    <p className="flex items-center gap-1 text-[11px] font-medium text-red-500">
                      <AlertCircle className="h-3 w-3" />{imageError}
                    </p>
                  )}
                </div>
              </div>

              {/* Basic Info */}
              <div className="px-6 py-5 bg-white border-b border-stone-100">
                <SectionHeader icon={Package} title={t('sectionTitles.basic')} description={t('sectionDescriptions.basic')} />
                <div className="grid grid-cols-2 gap-4">
                  {/* Name */}
                  <FormField label={t('fields.productName')} id="name" required>
                    <Input
                      id="name" name="name" value={product.name} onChange={handleChange}
                      placeholder={t('namePlaceholder')}
                      className={inputCls}
                    />
                  </FormField>

                  {/* Supplier */}
                  <FormField label={t('fields.supplier')} id="supplier">
                    <Popover open={supplierOpen} onOpenChange={setSupplierOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button" variant="outline" role="combobox"
                          aria-expanded={supplierOpen}
                          aria-label={t('selectSupplierAria')}
                          className={cn(
                            'w-full h-10 rounded-xl border border-borderSoft bg-white text-[13px] font-normal',
                            'justify-between hover:bg-greige-50 hover:border-clay-300',
                            'focus:ring-0 focus:outline-none focus:border-clay-300 focus-visible:ring-0 focus-visible:ring-offset-0',
                            !product.supplier && 'text-stone-400'
                          )}
                        >
                          {product.supplier?.company_name || t('selectSupplier')}
                          <ChevronDown className="ml-2 h-3.5 w-3.5 opacity-50 flex-shrink-0" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent side="bottom" align="start" className="w-72 p-0 z-[9999] bg-white border-borderSoft shadow-xl rounded-xl">
                        <Command>
                          <CommandInput placeholder={t('searchSuppliers')} className="text-[13px]" />
                          <CommandList className="max-h-52">
                            <CommandEmpty className="text-[12px] text-stone-400 py-3 px-4">{t('noSuppliersFound')}</CommandEmpty>
                            {!loadingSuppliers && suppliers?.map((item: any) => (
                              <CommandItem
                                key={item.id}
                                value={item.company_name}
                                onSelect={() => { updateField('supplier', item); setSupplierOpen(false); }}
                                className="text-[13px] cursor-pointer"
                              >
                                <Check className={cn('mr-2 h-3.5 w-3.5', product.supplier?.id === item.id ? 'opacity-100' : 'opacity-0')} />
                                {item.company_name}
                              </CommandItem>
                            ))}
                          </CommandList>
                          <div className="border-t border-stone-100">
                            <button
                              type="button"
                              onClick={() => { setSupplierOpen(false); setIsAddSupplierOpen(true); }}
                              className="w-full text-[12px] font-medium text-stone-600 py-2.5 px-4 text-left hover:bg-stone-50 transition-colors"
                            >
                              {t('addNewSupplier')}
                            </button>
                          </div>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </FormField>

                  {/* Type */}
                  <FormField label={t('fields.productType')} id="type">
                    <Popover open={typeOpen} onOpenChange={setTypeOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button" variant="outline" role="combobox"
                          aria-expanded={typeOpen}
                          className={cn(
                            'w-full h-10 rounded-xl border border-borderSoft bg-white text-[13px] font-normal',
                            'justify-between hover:bg-greige-50 hover:border-clay-300',
                            !product.type && 'text-stone-400'
                          )}
                        >
                          {product.type || t('selectType')}
                          <ChevronDown className="ml-2 h-3.5 w-3.5 opacity-50 flex-shrink-0" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent side="bottom" align="start" className="w-52 p-1 z-[9999] bg-white border-borderSoft shadow-xl rounded-xl">
                        {PRODUCT_TYPES.map(t => (
                          <button
                            key={t} type="button"
                            onClick={() => { updateField('type', t); setTypeOpen(false); }}
                            className={cn(
                              'w-full text-left text-[13px] px-3 py-2 rounded-lg transition-colors flex items-center justify-between',
                              product.type === t ? 'bg-stone-100 text-stone-900 font-medium' : 'hover:bg-stone-50 text-stone-700'
                            )}
                          >
                            {t}
                            {product.type === t && <Check className="h-3.5 w-3.5" />}
                          </button>
                        ))}
                      </PopoverContent>
                    </Popover>
                  </FormField>

                  {/* URL */}
                  <FormField label={t('fields.productUrl')} id="url">
                    <div className="relative">
                      <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
                      <Input
                        id="url" name="url" type="url" value={product.url} onChange={handleChange}
                        placeholder={t('productUrlPlaceholder')}
                        className={cn(inputCls, 'pl-9')}
                      />
                    </div>
                  </FormField>
                </div>

                {/* Description */}
                <div className="mt-4">
                  <FormField label={t('fields.description')} id="description">
                    <Textarea
                      id="description" name="description" rows={3} value={product.description} onChange={handleChange}
                      placeholder={t('fields.descriptionPlaceholder')}
                      className="rounded-xl border border-borderSoft bg-white text-[13px] resize-none placeholder:text-stone-400 focus:ring-0 focus:outline-none focus:border-clay-300 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </FormField>
                </div>
              </div>

              {/* Pricing */}
              <div className="px-6 py-5 bg-white border-b border-stone-100">
                <SectionHeader icon={DollarSign} title={t('sectionTitles.pricing')} description={t('sectionDescriptions.pricing')} />
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <FormField label={t('fields.currency')} id="currency" required>
                      <CurrencySelector
                        value={product.currency}
                        onChange={(currencyData: any) => {
                          updateField('currency', currencyData.currency.value || currencyData.currency);
                        }}
                        data={product}
                      />
                    </FormField>
                  </div>
                  <FormField label={t('fields.tradePrice')} id="tader_price">
                    <Input
                      id="tader_price" name="tader_price" type="number" min="0" step="0.01"
                      value={product.tader_price} onChange={handleChange}
                      placeholder="0.00" className={inputCls}
                    />
                  </FormField>
                  <FormField label={t('fields.regularPrice')} id="regular_price">
                    <Input
                      id="regular_price" name="regular_price" type="number" min="0" step="0.01"
                      value={product.regular_price} onChange={handleChange}
                      placeholder="0.00" className={inputCls}
                    />
                  </FormField>
                </div>
              </div>

              {/* Specifications */}
              <div className="px-6 py-5 bg-white border-b border-stone-100">
                <SectionHeader icon={Ruler} title={t('sectionTitles.specs')} description={t('sectionDescriptions.specs')} />
                <div className="grid grid-cols-2 gap-4">
                  {specFields.map(({ label, id, placeholder }) => (
                    <FormField key={id} label={label} id={id}>
                      <Input
                        id={id} name={id} value={(product as any)[id]} onChange={handleChange}
                        placeholder={placeholder} className={inputCls}
                      />
                    </FormField>
                  ))}
                </div>
              </div>

              {/* Furniture Details */}
              <div className="px-6 py-5 bg-white">
                <SectionHeader icon={Sofa} title={t('sectionTitles.furniture')} description={t('sectionDescriptions.furniture')} />
                <div className="grid grid-cols-2 gap-4">
                  <BooleanSelect
                    value={product.assembly_required}
                    onChange={v => updateField('assembly_required', v)}
                    label={t('fields.assemblyRequired')}
                    id="assembly_required"
                  />
                  <FormField label={t('fields.seatWidth')} id="seat_width">
                    <Input id="seat_width" name="seat_width" value={product.seat_width} onChange={handleChange} placeholder={t('furniturePlaceholders.seatWidth')} className={inputCls} />
                  </FormField>
                  <FormField label={t('fields.seatDepth')} id="seat_depth">
                    <Input id="seat_depth" name="seat_depth" value={product.seat_depth} onChange={handleChange} placeholder={t('furniturePlaceholders.seatDepth')} className={inputCls} />
                  </FormField>
                  <FormField label={t('fields.seatHeight')} id="seat_height">
                    <Input id="seat_height" name="seat_height" value={product.seat_height} onChange={handleChange} placeholder={t('furniturePlaceholders.seatHeight')} className={inputCls} />
                  </FormField>
                  <FormField label={t('fields.composition')} id="composition">
                    <Input id="composition" name="composition" value={product.composition} onChange={handleChange} placeholder={t('furniturePlaceholders.composition')} className={inputCls} />
                  </FormField>
                  <FormField label={t('fields.construction')} id="construction">
                    <Input id="construction" name="construction" value={product.construction} onChange={handleChange} placeholder={t('furniturePlaceholders.construction')} className={inputCls} />
                  </FormField>
                  <FormField label={t('fields.feet')} id="feet">
                    <Input id="feet" name="feet" type="number" min="0" value={product.feet} onChange={handleChange} placeholder={t('furniturePlaceholders.feet')} className={inputCls} />
                  </FormField>
                  <FormField label={t('fields.filling')} id="filling">
                    <Input id="filling" name="filling" value={product.filling} onChange={handleChange} placeholder={t('furniturePlaceholders.filling')} className={inputCls} />
                  </FormField>
                  <FormField label={t('fields.frame')} id="frame">
                    <Input id="frame" name="frame" value={product.frame} onChange={handleChange} placeholder={t('furniturePlaceholders.frame')} className={inputCls} />
                  </FormField>
                  <BooleanSelect
                    value={product.removeable_cushion}
                    onChange={v => updateField('removeable_cushion', v)}
                    label={t('fields.removableCushions')}
                    id="removeable_cushion"
                  />
                  <BooleanSelect
                    value={product.removeable_legs}
                    onChange={v => updateField('removeable_legs', v)}
                    label={t('fields.removableLegs')}
                    id="removeable_legs"
                  />
                </div>

                <div className="mt-4">
                  <FormField label={t('fields.instructions')} id="instruction">
                    <Textarea
                      id="instruction" name="instruction" rows={3} value={product.instruction} onChange={handleChange}
                      placeholder={t('fields.instructionsPlaceholder')}
                      className="rounded-xl border border-borderSoft bg-white text-[13px] resize-none placeholder:text-stone-400 focus:ring-0 focus:outline-none focus:border-clay-300 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </FormField>
                </div>
              </div>
            </form>
          </div>

          {/* ── Footer ── */}
          <div className="flex-shrink-0 flex items-center justify-between gap-3 px-6 py-4 border-t border-stone-100 bg-white">
            <Button
              type="button" variant="ghost" onClick={afterCloseModal} disabled={isBusy}
              className="h-10 px-5 rounded-xl text-[13px] font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors"
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit" form="edit-product-form" disabled={isBusy}
              className={cn(
                'h-10 px-6 rounded-xl text-[13px] font-medium bg-stone-900 text-white',
                'hover:bg-stone-800 active:bg-stone-950 transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
              )}
            >
              {isBusy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isUploading ? t('uploadingImages') : isPatching ? t('saving') : t('saveChanges')}
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

export default EditProductModal;
