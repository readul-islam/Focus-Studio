'use client';
import { PermissionGuard } from '@/components/PermissionGuard';
import { useEffect, useState } from 'react';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { FormField, FormItem, FormControl } from '@/components/ui/form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, CircleX, Loader2, Paperclip } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { gooeyToast as toast } from 'goey-toast';
import souqLogo from '/public/studio.jpeg';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import errorImage from '/public/product-placeholder-wp.jpg';
import { Textarea } from '@/components/ui/textarea';
import { patchData } from '@/lib/Api';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useFetch from '@/hooks/useFetch';
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


const EditInvoiceContent = ({ params }: any) => {
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const form2 = useForm({});
  const form = useForm({});
  const queryClient = useQueryClient();
  const router = useRouter();
  const invoiceId = params.Invid;
  const projectId = params.id;

  const { data: invoiceDataResponse, isLoading: invoiceLoading } = useFetch(`finance/invoices/${invoiceId}/`);
    const { currency } = useCurrency(invoiceDataResponse?.currency);

  const handleBack = () => {
    router.back();
  };
  const { guard } = useEditGuard('finance.edit');

  const { mutate: updateInvoice, isPending: isUpdating } = useMutation<any, Error, any>({
    mutationFn: (data) => patchData({ url: `finance/invoices/${invoiceId}/`, data }),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: [`finance/invoices/${invoiceId}/`] });
      queryClient.refetchQueries({ queryKey: [`finance/project-finance?project_id=${projectId}`] });
      queryClient.refetchQueries({ queryKey: ['finance/studio-finance/'] });
      router.push(`/projects/${projectId}/finance/`);
      toast('Invoice Updated');
    },
    onError: () => {
      toast('Error! Try again');
    },
  });

  const updateLineItem = guard((e: any, itemId: any) => {
    const { name, value } = e.target;
    setInvoiceData((prev: any) => ({
      ...prev,
      line_items: prev.line_items.map((item: any) =>
        item.id === itemId ? { ...item, [name]: value } : item
      ),
    }));
  });

  const handleDueDateChange = (date: Date | undefined) => {
    if (!date) {
      form2.reset({ dueDate: undefined });
      setInvoiceData((prev: any) => ({ ...prev, due_date: '' }));
      return;
    }
    const parseDate = formatDateToLocal(date);
    form2.setValue('dueDate', date);
    setInvoiceData((prev: any) => ({
      ...prev,
      due_date: parseDate,
    }));
  };

  const handleRemoveItem = (itemId: any) => {
    setInvoiceData((prev: any) => ({
      ...prev,
      line_items: prev.line_items.filter((item: any) => item.id !== itemId),
    }));
  };

  const handleIssueDateChange = (date: Date | undefined) => {
    if (!date) {
      form.reset({ issueDate: undefined });
      setInvoiceData((prev: any) => ({ ...prev, date: '' }));
      return;
    }
    const parseDate = formatDateToLocal(date);
    form.setValue('issueDate', date);
    setInvoiceData((prev: any) => ({
      ...prev,
      date: parseDate,
    }));
  };

  const updateStatus = (value: string) => {
    setInvoiceData((prev: any) => ({ ...prev, status: value }));
  };

  // Initialize invoiceData from API response
  useEffect(() => {
    if (invoiceDataResponse) {
      setInvoiceData(invoiceDataResponse);
    }
  }, [invoiceDataResponse]);

  // Initialize form dates
  useEffect(() => {
    if (invoiceData) {
      if (invoiceData.due_date) {
        const dueDate = parseDateFromString(invoiceData.due_date);
        form2.setValue('dueDate', dueDate);
      }
      if (invoiceData.date) {
        const issueDate = parseDateFromString(invoiceData.date);
        form.setValue('issueDate', issueDate);
      }
    } else {
      form2.reset({ dueDate: undefined });
      form.reset({ issueDate: undefined });
    }
  }, [invoiceData, form, form2]);

  const handleConfirmSave = guard(() => {
    if (!invoiceData) return;

    const payload = {
      project: typeof invoiceData.project === 'object' ? invoiceData.project.id : invoiceData.project,
      client: typeof invoiceData.client === 'object' ? invoiceData.client.id : invoiceData.client,
      studio: typeof invoiceData.studio === 'object' ? invoiceData?.studio?.id : invoiceData?.studio,
      status: invoiceData.status,
      date: invoiceData.date,
      due_date: invoiceData.due_date,
      currency: invoiceData.currency,
      xero_sync: invoiceData.xero_sync || false,
      delivery_charge: Number(invoiceData.delivery_charge) || 0,
      line_items: invoiceData.line_items.map((item: any) => ({
        product: item.product?.id || item.product,
        description: item.description,
        quantity: Number(item.quantity),
        unit_price: String(item.unit_price),
        account_code: item.account_code || '',
      })),
    };
    updateInvoice(payload);
  });

  const subTotalNum = (
    invoiceData?.line_items?.reduce((total: number, item: any) => {
      const amount = parseFloat(String(item?.unit_price || 0));
      return total + amount * (item.quantity || 1);
    }, 0) || 0
  ) + (parseFloat(String(invoiceData?.ffne || 0)));

  const subTotal = subTotalNum.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (invoiceLoading || !invoiceData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mx-auto max-w-4xl p-[28px] px-10 rounded-xl bg-gradient-to-br from-[#F3F3F3] to-[#F1F5FA]">
        <form onSubmit={(e) => e.preventDefault()} className="relative">
          {/* <ScrollArea className="h-[calc(100vh-16rem)] px-1"> */}
          <div className="space-y-8 pb-8">
            {/* Heading */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-[#091E42] font-semibold mb-1 text-2xl">Edit Invoice</h1>
                <h4 className="text-xl">#{invoiceData?.display_invoice}</h4>
                <div className="my-8 text-[14px] leading-[180%]">
                  Issue Date : {invoiceData?.date ? new Date(invoiceData.date).toLocaleDateString('en-GB') : '-'}
                  <br />
                  Due Date : {invoiceData?.due_date ? new Date(invoiceData.due_date).toLocaleDateString('en-GB') : '-'}
                  <br />
                  Client : {invoiceData?.client?.company_name || `${invoiceData?.client?.name} ${invoiceData?.client?.surname}`} <br />
                  <br />
                  Project : {invoiceData?.project?.project_name}
                </div>
              </div>
              <div>
                <Image alt="Souq Logo" src={souqLogo} className="w-[90px] h-[90px] mb-4" />
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
                value={invoiceData?.project?.project_name || ''}
                className="border disabled:opacity-100 rounded-lg text-sm font-medium text-black"
                readOnly
                disabled
              />
            </div>

            <div className="pt-8 mt-8 border-t">
              {/* <h2 className="text-[#091E42] uppercase font-medium mb-5 text-base">Client:</h2> */}
              <div className="space-y-2">
                <Label htmlFor="client">Client</Label>
                <Input
                  value={invoiceData?.client?.company_name || `${invoiceData?.client?.name} ${invoiceData?.client?.surname}` || ''}
                  className="border disabled:opacity-100 rounded-lg text-sm font-medium text-black"
                  readOnly
                  disabled
                />
              </div>
            </div>
            <div className="pt-8 mt-8 border-t">

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
                    {invoiceData?.line_items?.map((item: any) => (
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
                            className="bg-white border rounded-lg text-sm font-medium text-[#091E42] w-full p-2"
                            name="unit_price"
                            value={`${item?.unit_price}`}
                            onChange={e => updateLineItem(e, item.id)}
                          />
                        </td>
                        <td className=" p-2">
                          <Input disabled
                            className="bg-white disabled:opacity-100 rounded-lg text-sm font-medium text-[#091E42] w-full p-2 border"
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

                    <tr className="p-2">
                      <td></td>
                      <td>
                        <div className="border p-3 rounded-lg">{invoiceData?.ffne_desc || 'FF&E'}</div>
                      </td>
                      <td >
                        <div className="border p-3 rounded-lg">1</div>
                      </td>
                      <td >
                        <div className="border p-3 rounded-lg">{invoiceData?.ffne || 0}</div>
                      </td>
                      <td >
                        <div className="border p-3 rounded-lg">{invoiceData?.ffne || 0}</div>
                      </td>
                    </tr>
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
                    value={invoiceData?.status || 'DFT'}
                    onValueChange={updateStatus}
                  >
                    <SelectTrigger className="bg-white focus:ring-0 focus:ring-offset-0 text-sm py-1 font-medium w-full focus:border-0 focus-visible:outline-0">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white z-[99]">
                      <SelectItem value="DFT">Draft</SelectItem>
                      <SelectItem value="SNT">Sent</SelectItem>
                      <SelectItem value="PD">Paid</SelectItem>
                      <SelectItem value="OVD">Overdue</SelectItem>
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
                    step="0.01"
                    placeholder="0.00"
                    value={invoiceData?.delivery_charge || ''}
                    onChange={(e) => setInvoiceData((prev: any) => ({ ...prev, delivery_charge: e.target.value }))}
                    className="bg-white border rounded-lg text-sm font-medium text-[#091E42]"
                  />
                </div>
                {invoiceData?.trade_invoices?.length > 0 && (
                  <div>
                    <Label className="font-normal block mb-2 text-[#091E42] text-sm">
                      Trade Invoices :
                    </Label>
                    <div className="flex flex-row flex-wrap gap-2">
                      {invoiceData.trade_invoices.filter((ti: any) => ti?.trade_invoice != null).map((ti: any) => (
                        <Link
                          key={ti.po_id}
                          href={ti?.trade_invoice || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 border rounded-lg px-4 py-2 text-sm font-medium text-[#091E42] bg-white hover:bg-stone-50 w-fit"
                        >
                          <Paperclip size={14} />
                          PO-{ti.po_id} Trade Invoice
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Total Details */}
            <div className="flex pb-9 border-b justify-end">
              <div className="min-w-[220px]  space-y-[14px] text-[#091E42] text-sm font-medium">
                <div className="grid grid-cols-4">
                  <p className="col-span-2">Subtotal:</p>
                  <p className="col-span-2 text-right">{` ${currency?.symbol || '$'}${subTotal}`}</p>
                </div>
                {invoiceData?.delivery_charge && Number(invoiceData.delivery_charge) > 0 && (
                  <div className="grid grid-cols-4">
                    <p className="col-span-2">Delivery Charge:</p>
                    <p className="col-span-2 text-right">
                      {` ${currency?.symbol || '$'}${Number(invoiceData.delivery_charge).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`}
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-4 pt-2 border-t">
                  <p className="col-span-2 font-semibold">Total:</p>
                  <p className="col-span-2 text-right font-semibold">
                    {` ${currency?.symbol || '$'}${(
                      subTotalNum + (Number(invoiceData?.delivery_charge) || 0)
                    ).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`}
                  </p>
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
                  <p className="col-span-2 text-right">{invoiceData?.display_invoice}</p>
                </div>
                <div className="grid grid-cols-4">
                  <p className="col-span-2">Amount Due</p>
                  <p className="col-span-2 text-right">{currency?.symbol || '$'}0.00</p>
                </div>
                <div className="grid grid-cols-4">
                  <p className="col-span-2">Due Date</p>
                  <p className="col-span-2 text-right">
                    {invoiceData?.due_date && new Date(invoiceData?.due_date).toLocaleDateString('en-GB')}
                  </p>
                </div>
                <p className="font-medium text-sm text-gray-400 pt-4 mt-4 border-t">Enter the amount you are paying above</p>
              </div>
            </div>
          </div>
          {/* </ScrollArea> */}
          {/* 
          <div className="space-y-2 mb-4 col-span-2">
            <Label className="font-normal text-[#091E42] text-sm " htmlFor="note">
              Add Note
            </Label>
            <Input
              onChange={updateClientInfo}
              value={defaultValue?.note}
              className="bg-white rounded-lg text-sm font-medium text-[#091E42]"
              id="note"
              name="note"
            />
          </div> */}

          <div className="flex justify-end space-x-4 mt-6  py-4 ">
            <Button
              onClick={handleBack}
              variant="outline"
              type="button"
              className="bg-white rounded-[10px] hover:bg-stone-50 text-gray-700 px-8 py-2"
            >
              Cancel
            </Button>
            <Button type="button" disabled={isUpdating} onClick={() => {
              if (invoiceData?.status !== 'DFT') {
                setIsDialogOpen(true);
              } else {
                handleConfirmSave();
              }
            }} className="bg-[#1e1e1e] rounded-[10px] hover:bg-[#2d2d2d] text-white px-8 py-2 flex items-center gap-2">
              {isUpdating && <Loader2 size={15} className="animate-spin" />}
              {isUpdating ? 'Saving...' : 'Save'}
            </Button>
          </div>

          <DeleteDialog
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            onConfirm={handleConfirmSave}
            title="Confirm Changes"
            description="The invoice has been approved  from Xero, the changes made here won’t be reflected on the Xero invoice"
            confirmText="Submit"
            requireConfirmation={false}
            isArchive={true}
          />
        </form>
      </div>
    </div>
  );
};

const EditInvoice = (params: any) => (
  <PermissionGuard permission="finance.view" redirectTo="/projects">
    <EditInvoiceContent {...params} />
  </PermissionGuard>
);

export default EditInvoice;
