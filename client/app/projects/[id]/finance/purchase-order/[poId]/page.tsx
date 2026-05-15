'use client';
import { useEffect, useState } from 'react';
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
import { gooeyToast as toast } from 'goey-toast';
import souqLogo from '/public/studio.jpeg';
import errorImage from '/public/product-placeholder-wp.jpg';
import { patchData, patchFormData } from '@/lib/Api';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import useFetch from '@/hooks/useFetch';
import useUser from '@/hooks/useUser';
import { DeleteDialog } from '@/components/DeleteDialog';
import { useCurrency } from '@/lib/getCurrencySymbol';
import { useEditGuard } from '@/hooks/useEditGuard';

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

export default function EditPurchaseOrder({ params }: any) {
  const [poData, setPoData] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isApprovalWarningOpen, setIsApprovalWarningOpen] = useState(false);
  const [tradeInvoice, setTradeInvoice] = useState<File | null>(null);
  const poId = params?.poId;
  const projectId = params?.id;
  const form2 = useForm({});
  const form = useForm({});
  const router = useRouter();
  const queryClient = useQueryClient();
  const { guard } = useEditGuard('finance.edit');
  
  const { data: poDataResponse, isLoading: poLoading } = useFetch(`finance/purchase-orders/${poId}/`) as { data: any; isLoading: boolean };
   const { currency } = useCurrency(poDataResponse?.currency);
  const handleBack = () => {
    router.back();
  };

  // update PO
  const { mutate: updatePurchaseOrder, isPending: isUpdating } = useMutation<any, Error, any>({
    mutationFn: (data) =>
      data instanceof FormData
        ? patchFormData({ url: `finance/purchase-orders/${poId}/`, data })
        : patchData({ url: `finance/purchase-orders/${poId}/`, data }),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: [`finance/purchase-orders/${poId}/`] });
      queryClient.refetchQueries({ queryKey: [`finance/studio-finance/`] });
      queryClient.refetchQueries({ queryKey: [`finance/project-finance?project_id=${projectId}`] });
      queryClient.refetchQueries({ queryKey: [`projects/project-procurements/?project_id=${projectId}`] });
      router.push(`/projects/${projectId}/finance/`);
      toast('PO Updated');
    },
    onError: () => {
      toast('Error! Try again');
    },
  });

  const updateLineItem = guard((e: any, itemId: any) => {
    const { name, value } = e.target;
    setPoData((prev: any) => ({
      ...prev,
      line_items: prev.line_items.map((item: any) =>
        item.id === itemId ? { ...item, [name]: value } : item
      ),
    }));
  });

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

  const handleRemoveItem = guard((itemId: any) => {
    setPoData((prev: any) => ({
      ...prev,
      line_items: prev.line_items.filter((item: any) => item.id !== itemId),
    }));
  });

  const updateStatus = guard((value: string) => {
    setPoData((prev: any) => ({ ...prev, status: value }));
  });

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
      const original = poDataResponse.line_items.find((o: any) => o.id === item.id);
      if (!original) return false;
      const qtyChanged = String(item.quantity) !== String(original.quantity);
      const priceChanged = String(item.unit_price) !== String(original.unit_price);
      return qtyChanged || priceChanged;
    });
  };

  const handleSaveClick = guard(() => {
    if (poData?.status !== 'DFT') {
      setIsDialogOpen(true);
    } else if (hasLineItemChanges()) {
      setIsApprovalWarningOpen(true);
    } else {
      handleConfirmSave();
    }
  });

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
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => e.preventDefault()} className="relative max-w-4xl px-10 mx-auto py-10">
      {/* <ScrollArea className="h-[calc(100vh-16rem)] px-1"> */}
      <div className="space-y-8 pb-8">
        {/* Heading */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[#091E42] font-semibold mb-1 text-2xl">Purchase Order</h1>
            <h4 className="text-xl">#{poData?.display_po}</h4>
            <div className="my-8 text-[14px] leading-[180%]">
              Issue Date : {poData?.date ? new Date(poData.date).toLocaleDateString('en-GB') : '-'}
              <br />
              Due Date : {poData?.due_date ? new Date(poData.due_date).toLocaleDateString('en-GB') : '-'}
              <br />
              Supplier : {poData?.supplier?.company_name || `${poData?.supplier?.name} ${poData?.supplier?.surname}`} <br />
              <br />
              Project : {poData?.project?.project_name}
            </div>
          </div>
          <div>
            <Image alt="Logo" src={souqLogo} className="w-[90px] h-[90px] mb-4" />
            <p className="text-[#5D6573] font-medium text-[14px] leading-[150%]">
              Manifest Designs Ltd t/a Souq.Studio<br /> 11 Wilman Rd <br /> Tunbridge Wells <br /> TN4 9AJ <br />
              VAT NO: GB423127335 <br />
              hello@souqdesign.co.uk
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="space-y-2 col-span-2">
            <Label className="font-normal text-[#091E42] text-sm " htmlFor="poNumber">
              Issue Date
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
                                'justify-between bg-white rounded-lg w-full text-left font-normal',
                                !field.value && 'text-[#595F69]'
                              )}
                            >
                              {field.value ? format(field.value, 'MMM dd, yyyy') : <span>Pick a date</span>}
                              <CalendarIcon className="mr-2 h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                        </FormControl>
                        <PopoverContent className="w-auto pt-3 shadow-2xl bg-white">
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
            <Label className="font-normal text-[#091E42] text-sm " htmlFor="poNumber">
              Due Date
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
                                'justify-between bg-white rounded-lg w-full text-left font-normal',
                                !field.value && 'text-[#595F69]'
                              )}
                            >
                              {field.value ? format(field.value, 'MMM dd, yyyy') : <span>Pick a date</span>}
                              <CalendarIcon className="mr-2 h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                        </FormControl>
                        <PopoverContent className="w-auto pt-3 shadow-2xl bg-white">
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
          <Label htmlFor="project">Project</Label>
          <Input
            value={poData?.project?.project_name || ''}
            className="border disabled:opacity-100 rounded-lg text-sm font-medium text-black"
            readOnly
            disabled
          />
        </div>

        <div className="pt-8 mt-8 border-t">
          {/* <h2 className="text-[#091E42] uppercase font-medium mb-5 text-base">Supplier:</h2> */}
          <div className="space-y-2">
            <Label htmlFor="supplier">Supplier</Label>
            <Input
              value={poData?.supplier?.company_name || `${poData?.supplier?.name} ${poData?.supplier?.surname}` || ''}
              className="border disabled:opacity-100 rounded-lg text-sm font-medium text-black"
              readOnly
              disabled
            />
          </div>
        </div>
        <div className="pt-8 mt-8 border-t">
          {/* <div className="flex items-center justify-between">
            <h2 className="text-[#091E42] font-medium uppercase mb-5 text-base">Line Items:</h2>
            <a onClick={handleAddItem} className="text-[#091E42] font-medium cursor-pointer underline uppercase mb-5 text-base">
              + Add Item
            </a>
          </div> */}
          <div className="bg-white p-4 rounded-xl scrollbar scrollbar-thin">
            <table className="border-collapse w-full">
              <thead>
                <tr>
                  <th className=" p-2 pb-4 w-[80px] text-left font-normal text-[#091E42] text-sm">Image</th>
                  <th className=" p-2 pb-4 text-left font-normal text-[#091E42] text-sm">Description</th>
                  {/* <th className=" p-2 pb-4 text-left font-normal text-[#091E42] text-sm">Dimensions</th> */}
                  <th className=" p-2 pb-4 text-left font-normal text-[#091E42] text-sm">Quantity</th>
                  <th className=" p-2 pb-4 text-left font-normal text-[#091E42] text-sm">Unit Price</th>
                  <th className=" p-2 pb-4 text-left font-normal text-[#091E42] text-sm">Amount</th>
                  <th className=" p-2 pb-4 w-[20px] text-left font-normal text-[#091E42] text-sm"></th>
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
                        className="bg-white border h-full rounded-lg text-sm font-medium text-[#091E42] w-full py-2 px-2"
                        name="description"
                        value={item?.description}
                        onChange={e => updateLineItem(e, item.id)}
                      />
                    </td>
                    <td className=" p-2">
                      <input
                        type="number"
                        className="bg-white border rounded-lg text-sm font-medium text-[#091E42] w-full py-2 px-2"
                        name="quantity"
                        value={item?.quantity}
                        onChange={e => updateLineItem(e, item.id)}
                      />
                    </td>
                    <td className=" p-2">
                      <input
                        type="number"
                        // step="0.01"
                        className="bg-white border rounded-lg text-sm font-medium text-[#091E42] w-full p-2"
                        name="unit_price"
                        value={item?.unit_price}
                        onChange={e => updateLineItem(e, item.id)}
                      />
                    </td>
                    <td className=" p-2">
                      <Input disabled
                        className="bg-white disabled:opacity-100 focus:outline-none focus:ring-0 rounded-lg text-sm font-medium text-[#091E42] w-full p-2 border"
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
              <Label className="font-normal block mb-2 text-[#091E42] text-sm " htmlFor="status">
                Status :
              </Label>
              <Select
                value={poData?.status || 'DFT'}
                onValueChange={updateStatus}
              >
                <SelectTrigger className="bg-white focus:ring-0 focus:ring-offset-0 text-sm py-1 font-medium w-full focus:border-0 focus-visible:outline-0">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent className="bg-white z-[99]">
                  <SelectItem value="DFT">Draft</SelectItem>
                  <SelectItem value="SNT">Sent</SelectItem>
                  <SelectItem value="APR">Approved</SelectItem>
                  <SelectItem value="PD">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
            <Label className="font-normal block mb-2 text-[#091E42] text-sm " htmlFor="delivery_charge">
              Delivery Charge :
            </Label>
            <Input
              id="delivery_charge"
              type="number"
              step="1"
              placeholder="0"
              value={poData?.delivery_charge || ''}
              onChange={(e) => setPoData((prev: any) => ({ ...prev, delivery_charge: e.target.value }))}
              className="bg-white border rounded-lg text-sm font-medium text-[#091E42]"
            />
          </div>
          <div>
            <Label className="font-normal block mt-4 mb-2 text-[#091E42] text-sm" htmlFor="trade_invoice">
              Trade Invoice (PDF) :
            </Label>
            <div className="flex items-center gap-3">
              <label
                htmlFor="trade_invoice"
                className="flex items-center gap-2 cursor-pointer border rounded-lg px-4 py-2 text-sm w-full font-medium text-[#091E42] bg-white hover:bg-stone-50"
              >
                <Paperclip size={15} />
                {tradeInvoice ? tradeInvoice.name : poData?.trade_invoice ? 'Update PDF' : 'Upload PDF'}
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
                  className="text-gray-400 hover:text-red-500"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            {poData?.trade_invoice && !tradeInvoice && (
              <Link
                href={poData.trade_invoice}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs underline"
              >
                <Paperclip size={12} /> View existing invoice
              </Link>
            )}
          </div>
          </div>
        </div>
        {/* Total Details */}
        <div className="flex pb-9 border-b justify-end">
          <div className="min-w-[220px]  space-y-[14px] text-[#091E42] text-sm font-medium">
            <div className="grid grid-cols-4">
              <p className="col-span-2">Total:</p>
              <p className="col-span-2 text-right">{` ${currency?.symbol || '$'}${subTotal}`}</p>
            </div>
          </div>
        </div>
        {/* Bottom Details */}
        <div className="pt-14 flex items-center justify-between">
          <div>
            <h2 className="text-[#091E42] uppercase font-medium mb-5 text-base">Payment Advance</h2>
            <p className="text-[#5D6573] font-medium text-sm">
              Manifest Designs Ltd t/a Souq.Studio<br /> 11 Wilman Rd <br /> Tunbridge Wells <br /> TN4 9AJ <br />
              VAT NO: GB423127335 <br />
              hello@souqdesign.co.uk
            </p>
          </div>
          <div className="min-w-[220px]  space-y-[14px] text-[#091E42] text-sm font-medium">
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
            <p className="font-medium text-sm text-gray-400 pt-4 mt-4 border-t">Enter the amount you are paying above</p>
          </div>
        </div>
      </div>
      {/* </ScrollArea> */}



      <div className="flex justify-end space-x-4 mt-6  py-4 ">
        <Button
          onClick={handleBack}
          variant="outline"
          type="button"
          className="bg-white rounded-[10px] hover:bg-stone-50 text-gray-700 px-8 py-2"
        >
          Cancel
        </Button>
        <Button type="button" disabled={isUpdating} onClick={handleSaveClick} className="bg-[#1e1e1e] rounded-[10px] hover:bg-[#2d2d2d] text-white px-8 py-2 flex items-center gap-2">
          {isUpdating && <Loader2 size={15} className="animate-spin" />}
          {isUpdating ? 'Saving...' : 'Save'}
        </Button>
      </div>
      <DeleteDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleConfirmSave}
        title="Confirm Changes"
        description="The purchase order has been approved from Xero, the changes made here won’t be reflected on the Xero bill"
        confirmText="Submit"
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
              <DialogTitle className="text-base font-semibold text-neutral-900">
                Review Before Saving
              </DialogTitle>
            </div>
            <DialogDescription className="text-sm text-neutral-600 leading-relaxed pl-[52px]">
              You have made changes to one or more line item quantities or unit prices. These updates will be reflected in the procurement schedule and the client will be notified of the changes via an email.
              <br /><br />
              Please confirm that these changes have been reviewed and are ready to be submitted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setIsApprovalWarningOpen(false)}>Cancel</Button>
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
  );
}
