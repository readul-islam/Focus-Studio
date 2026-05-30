'use client';
import { PermissionGuard } from '@/components/PermissionGuard';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { FormField, FormItem, FormControl } from '@/components/ui/form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, CircleX } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { gooeyToast as toast } from 'goey-toast';
import souqLogo from '/public/studio.jpeg';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import errorImage from '/public/product-placeholder-wp.jpg';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import useFetch from '@/hooks/useFetch';
import { usePost } from '@/hooks/usePost';
import useUser from '@/hooks/useUser';
import { useCurrency } from '@/lib/getCurrencySymbol';

const formatDate = (date) => {
  if (!date) return null;
  return new Date(date).toISOString().split("T")[0];
};


const EditInvoiceContent = () => {
  const t = useTranslations('invoiceEditorPage');
  const tCommon = useTranslations('common');
  const tFinance = useTranslations('financePage');

  const [defaultValue, setDefaultValue] = useState<any>({
    products: [],
    dueDate: new Date().toISOString(),
    issueDate: new Date().toISOString(),
    project: '',
    clientId: '',
    status: 'DFT',
    currency: 'USD',
    studio: 0,
  });
  const form2 = useForm({});
  const form = useForm({});
  const queryClient = useQueryClient();
  const router = useRouter();
  const { user } = useUser();

  const { data: projectsData, isLoading: projectsLoading } = useFetch('projects/studio-projects/');
  const { data: clientsData, isLoading: clientsLoading } = useFetch('crm/studio-clients/');
  const { currency } = useCurrency(user?.studio?.default_currency);

  const handleBack = () => {
    router.back();
  };



  const { mutate: createInvoice, isPending: isCreating } = usePost({
    onSuccess: () => {
      queryClient.refetchQueries(['finance/invoices/']);
      router.push('/finance');
      toast(t('toasts.created'));
    },
    onError: () => {
      toast(t('toasts.createFailed'));
    },
  });

  const updateClientInfo = e => {
    const { name, value } = e.target;
    setDefaultValue((prevTask: any) => ({
      ...prevTask,
      [name]: value,
    }));
  };

  const updateInfo = (e, itemID) => {
    const { name, value } = e.target;
    setDefaultValue((prev: any) => ({
      ...prev,
      products: prev.products.map((item: any) => (item.itemID === itemID ? { ...item, [name]: value } : item)),
    }));
  };
  const handleDueDateChange = (date: Date | undefined) => {
    if (!date) {
      form2.reset({ dueDate: undefined });
      setDefaultValue((prev: any) => ({ ...prev, dueDate: '' }));
      return;
    }
    const parseDate = date.toISOString();
    form2.setValue('dueDate', date);
    setDefaultValue((prev: any) => ({
      ...prev,
      dueDate: parseDate,
    }));
  };

  const handleRemoveItem = (e: any) => {
    setDefaultValue((prev: any) => ({
      ...prev,
      products: prev.products.filter((item: any) => item.itemID !== e.itemID),
    }));
  };

  const handleAddItem = () => {
    setDefaultValue((prev: any) => ({
      ...prev,
      products: [
        ...prev.products,
        {
          QTY: 1,
          dimensions: '',
          dueDate: null,
          imageURL: null,
          itemID: crypto.randomUUID(),
          itemName: '',
          amount: '0',
        },
      ],
    }));
  };

  const handleIssueDateChange = (date: Date | undefined) => {
    if (!date) {
      form.reset({ issueDate: undefined });
      setDefaultValue((prev: any) => ({ ...prev, issueDate: '' }));
      return;
    }
    const parseDate = date.toISOString();
    form.setValue('issueDate', date);
    setDefaultValue((prev: any) => ({
      ...prev,
      issueDate: parseDate,
    }));
  };

  useEffect(() => {
    if (defaultValue) {
      const initializeDates = () => {
        // set due date
        if (defaultValue.dueDate) {
          const dueDate = new Date(defaultValue.dueDate);
          form2.setValue('dueDate', dueDate);
          // set issue date
        }
        if (defaultValue.issueDate) {
          const issueDate = new Date(defaultValue.issueDate);
          form.setValue('issueDate', issueDate);
        }
      };
      initializeDates();
    } else {
      form2.reset({ dueDate: undefined });
      form.reset({ issueDate: undefined });
    }
  }, [defaultValue]);

  const handleSubmit = e => {
    e.preventDefault();
    // console.log(defaultValue);

    const payload = {
      project: Number(defaultValue.project),
      client: defaultValue.client,
      status: defaultValue.status,
      date: formatDate(defaultValue.issueDate),
      due_date: formatDate(defaultValue.dueDate),
      currency: "USD",
      studio: user?.studio?.id,
      line_items: defaultValue.products.map((item) => ({
        description: item.itemName,
        quantity: item.QTY,
        unit_price: Number(item.amount.replace(/[^0-9.]/g, "")),
      })),
    };

    // console.log(payload);
    // createInvoice.mutate({ invoice: defaultValue });
    createInvoice({ url: 'finance/invoices/', data: payload });
  };

  const subTotalNum =
    defaultValue?.products?.reduce((total: any, product: any) => {
      const amount = parseFloat(product?.amount?.replace(/[^0-9.-]+/g, ''));
      return total + amount * product?.QTY;
    }, 0) || 0;

  const subTotalWithDeliveryNum = subTotalNum + Number(defaultValue?.delivery_charge || 0);
  const subTotalWithDelivery = subTotalWithDeliveryNum.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const taxNum = subTotalNum * 0.15;
  const totalWithTaxNum = subTotalNum + taxNum;

  const subTotal = subTotalNum.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const tax = taxNum.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const totalWithTax = totalWithTaxNum.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="space-y-6">
      <div className="mx-auto max-w-4xl p-[28px] px-10 rounded-xl bg-gradient-to-br from-[#F3F3F3] to-[#F1F5FA]">
        <form onSubmit={handleSubmit} className="relative">
          {/* <ScrollArea className="h-[calc(100vh-16rem)] px-1"> */}
          <div className="space-y-8 pb-8">
            {/* Heading */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-[#091E42] font-semibold mb-1 text-2xl">{t('createTitle')}</h1>
                <div className="my-8 text-[14px] leading-[180%]">
                  {/* <p className="mb-1 font-semibold">Supplier</p> */}
                  {t('issueDate')} : {new Date(defaultValue?.issueDate).toLocaleDateString('en-GB')}
                  <br />
                  {t('dueDate')} : {defaultValue?.dueDate ? new Date(defaultValue.dueDate).toLocaleDateString('en-GB') : '-'}
                  <br />
                  {t('clientName')} : {defaultValue?.clientName} <br />
                  {t('clientEmail')} : {defaultValue?.clientEmail} <br />
                  {t('clientPhone')} : {defaultValue?.clientPhone} <br />
                  {t('clientAddress')} : {defaultValue?.clientAddress}
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
                                    'justify-between bg-white rounded-lg w-full text-left font-normal',
                                    !field.value && 'text-[#595F69]'
                                  )}
                                >
                                  {field.value ? format(field.value, 'MMM dd, yyyy') : <span>{t('pickDate')}</span>}
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
                                    'justify-between bg-white rounded-lg w-full text-left font-normal',
                                    !field.value && 'text-[#595F69]'
                                  )}
                                >
                                  {field.value ? format(field.value, 'MMM dd, yyyy') : <span>{t('pickDate')}</span>}
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
              <Label htmlFor="project">{t('projects')}</Label>
              <Select
                value={defaultValue?.project || ''}
                onValueChange={value => {
                  setDefaultValue((prev: any) => ({ ...prev, project: value }));
                }}
              >
                <SelectTrigger className="bg-white rounded-[10px] w-full px-3 py-[10px] border">
                  <SelectValue placeholder={t('selectProject')} />
                </SelectTrigger>
                <SelectContent className="bg-white z-[999]">
                  {!projectsLoading &&
                    projectsData?.map((project: any) => (
                      <SelectItem key={project.id} value={String(project.id)}>
                        {project.project_name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="pt-8 mt-8 border-t">
              <h2 className="text-[#091E42] uppercase font-medium mb-5 text-base">{t('deliveryTo')}</h2>

              <div className="grid grid-cols-4 mb-4 gap-4">
                <div className="space-y-2 col-span-4">
                  <Label htmlFor="client">{tCommon('client')}</Label>
                  <Select
                    onValueChange={value => {
                      const selectedClient = clientsData?.find(
                        (client: any) => String(client.id) === value
                      );

                      if (selectedClient) {

                        setDefaultValue((prev: any) => ({
                          ...prev,
                          client: selectedClient.id, // <-- 🔥 client ID stored here
                          clientName: selectedClient.company_name || `${selectedClient.name} ${selectedClient.surname}`,
                          clientEmail: selectedClient.email,
                          clientPhone: selectedClient.phone,
                          clientAddress: selectedClient.address,
                        }));
                      }
                    }}
                  >
                    <SelectTrigger className="bg-white rounded-[10px] w-full px-3 py-[10px] border">
                      <SelectValue placeholder={t('selectClient')} />
                    </SelectTrigger>

                    <SelectContent className="bg-white z-[999]">
                      {!clientsLoading &&
                        clientsData?.map((client: any) => (
                          <SelectItem key={client.id} value={String(client.id)}>
                            {client.company_name || `${client.name} ${client.surname}`}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>

                </div>
                <div className="space-y-2  col-span-2">
                  <Label className="font-normal text-[#091E42] text-sm " htmlFor="poNumber">
                    {t('clientName')}
                  </Label>
                  <Input
                    onChange={updateClientInfo}
                    value={defaultValue?.clientName}
                    className="bg-white rounded-lg text-sm font-medium text-[#091E42]"
                    id="clientName"
                    name="clientName"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label className="font-normal text-[#091E42] text-sm " htmlFor="poNumber">
                    {t('clientEmail')}
                  </Label>
                  <Input
                    onChange={updateClientInfo}
                    value={defaultValue?.clientEmail}
                    className="bg-white rounded-lg text-sm font-medium text-[#091E42]"
                    id="clientEmail"
                    name="clientEmail"
                  />
                </div>
              </div>
              <div className="space-y-2 mb-4 col-span-2">
                <Label className="font-normal text-[#091E42] text-sm " htmlFor="poNumber">
                  {t('clientPhone')}
                </Label>
                <Input
                  onChange={updateClientInfo}
                  value={defaultValue?.clientPhone}
                  className="bg-white rounded-lg text-sm font-medium text-[#091E42]"
                  id="clientPhone"
                  name="clientPhone"
                />
              </div>
              <div className="space-y-2 mb-4 col-span-2">
                <Label className="font-normal text-[#091E42] text-sm " htmlFor="poNumber">
                  {t('clientAddress')}
                </Label>
                <Textarea
                  onChange={updateClientInfo}
                  value={defaultValue?.clientAddress}
                  className="bg-white rounded-lg text-sm font-medium text-[#091E42]"
                  id="clientAddress"
                  name="clientAddress"
                  rows={5}
                />
              </div>
            </div>
            <div className="pt-8 mt-8 border-t">
              <div className="flex items-center justify-between">
                <h2 className="text-[#091E42] font-medium uppercase mb-5 text-base">Line Items:</h2>
                <a onClick={handleAddItem} className="text-[#091E42] font-medium cursor-pointer underline uppercase mb-5 text-base">
                  + Add Item
                </a>
              </div>

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
                    {defaultValue?.products?.map((item: any) => (
                      <tr>
                        <td>
                          <div className="w-[80px] mb-2 h-[80px] rounded-md border overflow-hidden">
                            {item?.imageURL ? (
                              <Image className="w-full h-full object-cover" src={item.imageURL} alt="Product Image" />
                            ) : (
                              <Image className="w-full h-full object-cover" src={errorImage} alt="Error Image" />
                            )}
                          </div>
                        </td>
                        <td className=" p-2">
                          <textarea
                            rows={3}
                            className="bg-white border h-full rounded-lg text-sm font-medium text-[#091E42] w-full py-2 px-2"
                            id="itemName"
                            name="itemName"
                            value={item?.itemName}
                            onChange={e => updateInfo(e, item.itemID)}
                          />
                        </td>
                        {/* <td className=" p-2">
                          <textarea
                            rows={3}
                            className="bg-white border rounded-lg text-sm font-medium text-[#091E42] w-full py-2 px-2"
                            id="dimensions"
                            name="dimensions"
                            value={item?.dimensions}
                            onChange={e => updateInfo(e, item.itemID)}
                          />
                        </td> */}
                        <td className=" p-2">
                          <input
                            className="bg-white border rounded-lg text-sm font-medium text-[#091E42] w-full py-2 px-2"
                            id="QTY"
                            name="QTY"
                            value={item?.QTY}
                            onChange={e => updateInfo(e, item.itemID)}
                          />
                        </td>
                        <td className=" p-2">
                          <input
                            className="bg-white border rounded-lg text-sm font-medium text-[#091E42] w-full p-2"
                            id="amount"
                            name="amount"
                            value={`${currency?.symbol || '£'}${parseFloat(item?.amount?.replace(/[^0-9.-]+/g, '')).toLocaleString()}`}
                            onChange={e => updateInfo(e, item.itemID)}
                          />
                        </td>
                        <td className=" p-2">
                          <input
                            className="bg-white rounded-lg text-sm font-medium text-[#091E42] w-full p-2 border"
                            id="totalAmount"
                            name="totalAmount"
                            value={`${currency?.symbol || '£'}${(
                              item?.QTY * parseFloat(item?.amount?.replace(/[^0-9.-]+/g, ''))
                            ).toLocaleString()}`}
                            onChange={e => updateInfo(e, item.itemID)}
                          />
                        </td>
                        <td>
                          <CircleX
                            onClick={() => handleRemoveItem(item)}
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
                <div className="">
                  <Label className="font-normal mb-2 block text-[#091E42] text-sm " htmlFor="delivery_charge">
                    Delivery Charge :
                  </Label>
                  <Input
                    step="any" // or "0.01" to limit to 2 decimals
                    inputMode="decimal"
                    pattern="[0-9]*[.]?[0-9]*" // optional: allow both dot & comma
                    onChange={updateClientInfo}
                    value={defaultValue?.delivery_charge}
                    className="bg-white rounded-lg text-sm font-medium text-[#091E42]"
                    id="delivery_charge"
                    name="delivery_charge"
                    type="number"
                  />
                </div>
                <div>
                  <Label
                    className="font-normal block mb-2 text-[#091E42] text-sm"
                    htmlFor="delivery_charge"
                  >
                    {tCommon('status')} :
                  </Label>

                  <Select
                    value={defaultValue?.status || ""}
                    onValueChange={(value) => {
                      const e = {
                        target: {
                          name: "status",
                          value: value,
                        },
                      };
                      updateClientInfo(e);
                    }}
                  >
                    <SelectTrigger className="bg-white focus:ring-0 focus:ring-offset-0 text-sm py-1 font-medium w-full focus:border-0 focus-visible:outline-0">
                      <SelectValue placeholder={t('selectStatus')} />
                    </SelectTrigger>

                    <SelectContent className="bg-white z-[99]">
                      <SelectItem value="DFT">{tFinance('status.draft')}</SelectItem>
                      <SelectItem value="SNT">{tFinance('status.sent')}</SelectItem>
                      <SelectItem value="PD">{tFinance('status.paid')}</SelectItem>
                      <SelectItem value="OVD">{tFinance('status.overdue')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

              </div>
            </div>
            {/* Total Details */}
            <div className="flex pb-9 border-b justify-end">
              <div className="min-w-[220px]  space-y-[14px] text-[#091E42] text-sm font-medium">
                <div className="grid grid-cols-4">
                  <p className="col-span-2">Subtotal:</p>
                  <p className="col-span-2 text-right">{` ${currency?.symbol || '£'}${subTotal}`}</p>
                </div>

                <div className="grid grid-cols-4">
                  <p className="col-span-2">Total:</p>
                  <p className="col-span-2 text-right">{`${currency?.symbol || '£'}${subTotalWithDelivery}`}</p>
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
                  <p className="col-span-2 text-right">{defaultValue?.inNumber}</p>
                </div>
                <div className="grid grid-cols-4">
                  <p className="col-span-2">Amount Due</p>
                  <p className="col-span-2 text-right">{currency?.symbol || '£'}0.00</p>
                </div>
                <div className="grid grid-cols-4">
                  <p className="col-span-2">Due Date</p>
                  <p className="col-span-2 text-right">
                    {defaultValue?.dueDate && new Date(defaultValue?.dueDate).toLocaleDateString('en-GB')}
                  </p>
                </div>
                <p className="font-medium text-sm text-gray-400 pt-4 mt-4 border-t">Enter the amount you are paying above</p>
              </div>
            </div>
          </div>
          {/* </ScrollArea> */}

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
          </div>

          <div className="flex justify-end space-x-4 mt-6  py-4 ">
            <Button
              onClick={handleBack}
              variant="outline"
              type="button"
              className="bg-white rounded-[10px] hover:bg-stone-50 text-gray-700 px-8 py-2"
            >
              {tCommon('cancel')}
            </Button>
            <Button type="submit" className="bg-[#1e1e1e] rounded-[10px] hover:bg-[#2d2d2d] text-white px-8 py-2">
              {t('save')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditInvoice = () => (
  <PermissionGuard permission="finance.view" redirectTo="/finance">
    <EditInvoiceContent />
  </PermissionGuard>
);

export default EditInvoice;
