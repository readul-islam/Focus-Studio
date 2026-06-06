'use client';
import { PermissionGuard } from '@/components/PermissionGuard';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { FormField, FormItem, FormControl } from '@/components/ui/form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AlertTriangle, CalendarIcon, CircleX, Loader2, Paperclip, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { FinanceDocumentShell } from '@/components/finance/finance-document-shell';
import { fd, formatPartyName } from '@/lib/finance-document-styles';

import { gooeyToast as toast } from 'goey-toast';
import { StudioLetterhead } from '@/components/finance/studio-letterhead';
import errorImage from '/public/product-placeholder-wp.jpg';
import { patchData, patchFormData } from '@/lib/Api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import useFetch from '@/hooks/useFetch';
import useUser from '@/hooks/useUser';
import { DeleteDialog } from '@/components/DeleteDialog';
import { useCurrency } from '@/lib/getCurrencySymbol';
import Link from 'next/link';

// Format Date object to YYYY-MM-DD string in local timezone
const formatDateToLocal = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Parse date string (YYYY-MM-DD) as local date, not UTC
const parseDateFromString = (dateString: string) => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

function EditPurchaseOrderContent({ params }: any) {
  const t = useTranslations('purchaseOrderEditorPage');
  const tCommon = useTranslations('common');
  const tFinance = useTranslations('financePage');

   const id = params?.id;
   const { data: poDataResponse, isLoading: poLoading } = useFetch(`finance/purchase-orders/${id}/` ,{enabled: !!id});
  const [poData, setPoData] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isApprovalWarningOpen, setIsApprovalWarningOpen] = useState(false);
  const [tradeInvoice, setTradeInvoice] = useState<File | null>(null);
  const form2 = useForm({});
  const form = useForm({});
  const router = useRouter();
  const { currency } = useCurrency(poDataResponse?.currency);
  const queryClient = useQueryClient();
  



  const handleBack = () => {
    router.back();
  };

  // update PO
  const { mutate: updatePurchaseOrder, isPending: isUpdating } = useMutation<any, Error, any>({
    mutationFn: (data) =>
      data instanceof FormData
        ? patchFormData({ url: `finance/purchase-orders/${id}/`, data })
        : patchData({ url: `finance/purchase-orders/${id}/`, data }),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: [`finance/purchase-orders/${id}/`] });
      queryClient.refetchQueries({ queryKey: [`finance/studio-finance/`] });
      router.push('/finance/purchase-order');
      toast(t('toasts.updated'));
    },
  });

  const updateLineItem = (e: any, itemId: any) => {
    const { name, value } = e.target;
    setPoData((prev: any) => ({
      ...prev,
      line_items: prev.line_items.map((item: any) =>
        item.id === itemId ? { ...item, [name]: value } : item
      ),
    }));
  };

  const handleDueDateChange = (date: Date | undefined) => {
    if (!date) {
      form2.reset({ dueDate: undefined });
      setPoData((prev: any) => ({ ...prev, due_date: '' }));
      return;
    }
    const parseDate = formatDateToLocal(date);
    form2.setValue('dueDate', date);
    setPoData((prev: any) => ({
      ...prev,
      due_date: parseDate,
    }));
  };

  const handleIssueDateChange = (date: Date | undefined) => {
    if (!date) {
      form.reset({ issueDate: undefined });
      setPoData((prev: any) => ({ ...prev, date: '' }));
      return;
    }
    const parseDate = formatDateToLocal(date);
    form.setValue('issueDate', date);
    setPoData((prev: any) => ({
      ...prev,
      date: parseDate,
    }));
  };

  const handleRemoveItem = (itemId: any) => {
    setPoData((prev: any) => ({
      ...prev,
      line_items: prev.line_items.filter((item: any) => item.id !== itemId),
    }));
  };

  const updateStatus = (value: string) => {
    setPoData((prev: any) => ({ ...prev, status: value }));
  };

  // Initialize poData from API response
  useEffect(() => {
    if (poDataResponse) {
      setPoData(poDataResponse);
    }
  }, [poDataResponse]);

  // Initialize form dates
  useEffect(() => {
    if (poData) {
      if (poData.due_date) {
        const dueDate = parseDateFromString(poData.due_date);
        form2.setValue('dueDate', dueDate);
      }
      if (poData.date) {
        const issueDate = parseDateFromString(poData.date);
        form.setValue('issueDate', issueDate);
      }
    } else {
      form2.reset({ dueDate: undefined });
      form.reset({ issueDate: undefined });
    }
  }, [poData, form, form2]);

  const hasLineItemChanges = () => {
    if (!poDataResponse?.line_items || !poData?.line_items) return false;
    return poData.line_items.some((item: any) => {
      const original = (poDataResponse as any).line_items.find((o: any) => o.id === item.id);
      if (!original) return false;
      return String(item.quantity) !== String(original.quantity) || String(item.unit_price) !== String(original.unit_price);
    });
  };

  const handleSaveClick = () => {
    if (poData?.status !== 'DFT') {
      setIsDialogOpen(true);
    } else if (hasLineItemChanges()) {
      setIsApprovalWarningOpen(true);
    } else {
      handleConfirmSave();
    }
  };

  const handleConfirmSave = () => {
    if (!poData) return;

    const payload = {
      project: typeof poData.project === 'object' ? poData.project.id : poData.project,
      supplier: typeof poData.supplier === 'object' ? poData.supplier.id : poData.supplier,
      studio: typeof poData.studio === 'object' ? poData.studio.id : poData.studio,
      status: poData.status,
      date: poData.date,
      due_date: poData.due_date,
      currency: poData.currency,
      delivery_charge: Number(poData.delivery_charge) || 0,
      xero_sync: poData.xero_sync || false,
      line_items: poData.line_items.map((item: any) => ({
        product: item.product?.id || item.product,
        description: item.description,
        quantity: Number(item.quantity),
        unit_price: String(item.unit_price),
        account_code: item.account_code || '',
      })),
    };
    if (tradeInvoice) {
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (key === 'line_items') {
          formData.append(key, JSON.stringify(value));
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });
      formData.append('trade_invoice', tradeInvoice);
      updatePurchaseOrder(formData);
    } else {
      updatePurchaseOrder(payload);
    }
  };

  const subTotalNum =
    poData?.line_items?.reduce((total: number, item: any) => {
      const amount = parseFloat(String(item?.unit_price || 0));
      return total + amount * (item.quantity || 1);
    }, 0) || 0;

  const subTotal = (subTotalNum + (Number(poData?.delivery_charge) || 0)).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  


  if (poLoading || !poData) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
        <p>{tCommon('loading')}</p>
      </div>
    );
  }

  return (
    <FinanceDocumentShell>
      <form onSubmit={(e) => e.preventDefault()} className="relative">
        <div className="space-y-8 pb-8">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className={fd.title}>{t('editTitle')}</h1>
              <p className={fd.docId}>#{poData?.display_po}</p>
            </div>
            <StudioLetterhead className="shrink-0 text-right" />
          </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="space-y-2 col-span-2">
            <Label className="font-normal text-foreground text-sm " htmlFor="poNumber">
              {t('issueDate')}
            </Label>
            <Form {...form}>
              <form className="flex items-end gap-4 justify-center">
                <FormField
                  control={form.control}
                  name="issueDate"
                  render={({ field }) => (
                    <FormItem className="flex  w-full flex-col">
                      <Popover>
                        <FormControl>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                fd.dateTrigger,
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? format(field.value, 'MMM dd, yyyy') : <span>{t('pickDate')}</span>}
                              <CalendarIcon className="mr-2 h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                        </FormControl>
                        <PopoverContent className={fd.popoverContent}>
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={date => {
                              if (date instanceof Date) {
                                field.onChange(date);
                                handleIssueDateChange(date);
                              } else {
                                field.onChange(undefined);
                                handleIssueDateChange(undefined);
                              }
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>

          {/* Due Date */}
          <div className="space-y-2  col-span-2">
            <Label className="font-normal text-foreground text-sm " htmlFor="poNumber">
              {t('dueDate')}
            </Label>
            <Form {...form2}>
              <form className="flex items-end gap-4 justify-center">
                <FormField
                  control={form2.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex  w-full flex-col">
                      <Popover>
                        <FormControl>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                fd.dateTrigger,
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? format(field.value, 'MMM dd, yyyy') : <span>{t('pickDate')}</span>}
                              <CalendarIcon className="mr-2 h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                        </FormControl>
                        <PopoverContent className={fd.popoverContent}>
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={date => {
                              if (date instanceof Date) {
                                field.onChange(date);
                                handleDueDateChange(date);
                              } else {
                                field.onChange(undefined);
                                handleDueDateChange(undefined);
                              }
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="project">{tCommon('project')}</Label>
          <Input
            value={poData?.project?.project_name || ''}
            className="disabled:opacity-80"
            readOnly
            disabled
          />
        </div>

        <div className="pt-8 mt-8 border-t">
          {/* <h2 className="text-foreground uppercase font-medium mb-5 text-base">Supplier:</h2> */}
          <div className="space-y-2">
            <Label htmlFor="supplier">{tCommon('supplier')}</Label>
            <Input
              value={formatPartyName(poData?.supplier)}
              className="disabled:opacity-80"
              readOnly
              disabled
            />
          </div>
        </div>
        <div className="pt-8 mt-8 border-t">
          {/* <div className="flex items-center justify-between">
            <h2 className="text-foreground font-medium uppercase mb-5 text-base">Line Items:</h2>
            <a onClick={handleAddItem} className="text-foreground font-medium cursor-pointer underline uppercase mb-5 text-base">
              + Add Item
            </a>
          </div> */}
          <div className={fd.tableWrap}>
            <table className="border-collapse w-full">
              <thead>
                <tr>
                  <th className={cn("p-2 pb-4 w-[80px]", fd.tableHead)}>Image</th>
                  <th className={cn("p-2 pb-4", fd.tableHead)}>Description</th>
                  {/* <th className={cn("p-2 pb-4", fd.tableHead)}>Dimensions</th> */}
                  <th className={cn("p-2 pb-4", fd.tableHead)}>Quantity</th>
                  <th className={cn("p-2 pb-4", fd.tableHead)}>Unit Price</th>
                  <th className={cn("p-2 pb-4", fd.tableHead)}>Amount</th>
                  <th className={cn("p-2 pb-4 w-[20px]", fd.tableHead)}></th>
                </tr>
              </thead>
              <tbody>
                {poData?.line_items?.map((item: any) => (
                  <tr key={item.id}>
                    <td>
                      <div className="w-[80px] mb-2 h-[80px] rounded-md border overflow-hidden">
                        {item?.product?.images?.find((img: any) => img.is_primary)?.image || item?.product?.images?.[0]?.image ? (
                          <img className="w-full h-full object-cover" src={item?.product?.images?.find((img: any) => img.is_primary)?.image || item?.product?.images?.[0]?.image} />
                        ) : (
                          <img className="w-full h-full object-cover" src={errorImage.src} />
                        )}
                      </div>
                    </td>
                    <td className=" p-2">
                      <textarea
                        rows={3}
                        className={cn(fd.tableInput, "h-full")}
                        name="description"
                        value={item?.description}
                        onChange={e => updateLineItem(e, item.id)}
                      />
                    </td>
                    <td className=" p-2">
                      <input
                        type="number"
                        className={fd.tableInput}
                        name="quantity"
                        value={item?.quantity}
                        onChange={e => updateLineItem(e, item.id)}
                      />
                    </td>
                    <td className=" p-2">
                      <input
                        type="number"
                        step="0.01"
                        className={fd.tableInput}
                        name="unit_price"
                        value={item?.unit_price}
                        onChange={e => updateLineItem(e, item.id)}
                      />
                    </td>
                    <td className=" p-2">
                      <Input disabled
                        className={cn(fd.tableInput, fd.tableInputDisabled, 'w-full p-2')}
                        value={`${currency?.symbol || '$'}${(item?.quantity * parseFloat(item?.unit_price || 0)).toLocaleString()}`}
                        readOnly
                      />
                    </td>
                    <td>
                      <CircleX
                        onClick={() => handleRemoveItem(item.id)}
                        className="cursor-pointer"
                        color="#EC5635"
                        strokeWidth={1.6}
                        size={20}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="pt-6 mt-8 border-t">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label className="font-normal block mb-2 text-foreground text-sm " htmlFor="status">
                {tCommon('status')} :
              </Label>
              <Select
                value={poData?.status || 'DFT'}
                onValueChange={updateStatus}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('selectStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DFT">{tFinance('status.draft')}</SelectItem>
                  <SelectItem value="SNT">{tFinance('status.sent')}</SelectItem>
                  <SelectItem value="APR">{tFinance('status.approved')}</SelectItem>
                  <SelectItem value="PD">{tFinance('status.paid')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
                  <div>
                  <Label className="font-normal block mb-2 text-foreground text-sm " htmlFor="delivery_charge">
                    Delivery Charge :
                  </Label>
                  <Input
                    id="delivery_charge"
                    type="number"
                    step="1"
                    placeholder="0"
                    value={poData?.delivery_charge || ''}
                    onChange={(e) => setPoData((prev: any) => ({ ...prev, delivery_charge: e.target.value }))}
                    
                  />
                </div>
          </div>
          <div>
            <Label className="font-normal block mt-4 mb-2 text-foreground text-sm" htmlFor="trade_invoice">
              Trade Invoice (PDF) :
            </Label>
            <div className="flex items-center gap-3">
              <label
                htmlFor="trade_invoice"
                className={cn(fd.fileUploadLabel, 'w-full')}
              >
                <Paperclip size={15} />
                {tradeInvoice ? tradeInvoice.name : poData?.trade_invoice ? t('updatePdf') : t('uploadPdf')}
              </label>
              <input
                id="trade_invoice"
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setTradeInvoice(file);
                }}
              />
              {tradeInvoice && (
                <button
                  type="button"
                  onClick={() => {
                    setTradeInvoice(null);
                    (document.getElementById('trade_invoice') as HTMLInputElement).value = '';
                  }}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            {poData?.trade_invoice && !tradeInvoice && (
              <Link
                href={poData?.trade_invoice}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs  underline"
              >
                <Paperclip size={12} /> View existing invoice
              </Link>
            )}
          </div>
        </div>
        {/* Total Details */}
        <div className="flex justify-end border-b border-border pb-9">
          <div className={fd.totalsBox}>
            <div className="grid grid-cols-4">
              <p className="col-span-2">Total:</p>
              <p className="col-span-2 text-right">{` ${currency?.symbol || '$'}${subTotal}`}</p>
            </div>
          </div>
        </div>
        {/* Bottom Details */}
        <div className="pt-14 flex items-center justify-between">
          <div>
            <h2 className={fd.sectionTitle}>Payment Advance</h2>
            <StudioLetterhead compact />
          </div>
          <div className={fd.totalsBox}>
            <div className="grid grid-cols-4">
              <p className="col-span-2">Document Number</p>
              <p className="col-span-2 text-right">{poData?.display_po}</p>
            </div>
            <div className="grid grid-cols-4">
              <p className="col-span-2">Amount Due</p>
              <p className="col-span-2 text-right">{currency?.symbol || '$'}0.00</p>
            </div>
            <div className="grid grid-cols-4">
              <p className="col-span-2">Due Date</p>
              <p className="col-span-2 text-right">
                {poData?.due_date && new Date(poData?.due_date).toLocaleDateString('en-GB')}
              </p>
            </div>
            <p className={fd.totalsHint}>Enter the amount you are paying above</p>
          </div>
        </div>
      </div>
      {/* </ScrollArea> */}

      <div className={fd.footerActions}>
        <Button onClick={handleBack} variant="outline" type="button" className="px-8">
          {tCommon('cancel')}
        </Button>
        <Button type="button" disabled={isUpdating} onClick={handleSaveClick} className="px-8 flex items-center gap-2">
          {isUpdating && <Loader2 size={15} className="animate-spin" />}
          {isUpdating ? tCommon('saving') : t('save')}
        </Button>
      </div>
      <DeleteDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleConfirmSave}
        title={t('confirmChangesTitle')}
        description={t('confirmPoXero')}
        confirmText={t('submit')}
        requireConfirmation={false}
        isArchive={true}
      />

      <Dialog open={isApprovalWarningOpen} onOpenChange={setIsApprovalWarningOpen}>
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#f3e5d0] shrink-0">
                <AlertTriangle className="w-5 h-5 text-[#a2702f]" />
              </div>
              <DialogTitle className="text-base font-semibold text-foreground">
                Review Before Saving
              </DialogTitle>
            </div>
            <DialogDescription className="pl-[52px] text-sm leading-relaxed text-muted-foreground">
              You have made changes to one or more line item quantities or unit prices. These updates will be reflected in the procurement schedule and the client will be notified of the changes via email.
              <br /><br />
              Please confirm that these changes have been reviewed and are ready to be submitted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setIsApprovalWarningOpen(false)}>{tCommon('cancel')}</Button>
            <Button
              onClick={() => { setIsApprovalWarningOpen(false); handleConfirmSave(); }}
              className="bg-[#cfb189] hover:bg-[#c5a57a] text-white"
            >
              Confirm & Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </form>
    </FinanceDocumentShell>
  );
}

export default function EditPurchaseOrder({ params }: { params: { id: string } }) {
  return (
    <PermissionGuard permission="finance.view" redirectTo="/finance">
      <EditPurchaseOrderContent params={params} />
    </PermissionGuard>
  );
}