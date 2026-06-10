import { useParams, useNavigate } from '@/lib/navigation';
import useFetch from '@/hooks/useFetch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader, X, ArrowLeft } from 'lucide-react';
const logo = '/images/studio.jpeg';
const placeHolder = '/images/product-placeholder-wp.jpg';
import { Badge } from '@/components/ui/badge';
import { useCurrency } from '@/hooks/getCurrencySymbol';
import { useTranslations } from 'next-intl';
import { useFinanceStatusOptions, useShortDate } from '@/lib/i18n-helpers';

// Inline StatusBadge component
const StatusBadge = ({ status, label, className }: { status: string; label: string; className?: string }) => {
  return (
    <Badge variant="outline" className={`font-medium border ${className}`}>
      {label}
    </Badge>
  );
};


const Invoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const t = useTranslations('finance');
  const statusOptions = useFinanceStatusOptions().filter((o) => o.value !== 'All');
  const formatShortDate = useShortDate();

  const { data: invoiceData, isLoading: invoiceLoading } = useFetch(`contractor_portal/invoices/${id}/`);
  const { currency: currencyDetails } = useCurrency(invoiceData?.currency);

  const handleBack = () => {
    navigate(-1);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PD': // Paid
        return 'bg-[#A8E2EC] text-[#2C96A8] border-[#7FCEDC]';

      case 'DFT': // Draft
      case 'NE': // New
        return 'bg-orange-100 text-orange-900 border-orange-300';

      case 'SNT': // Sent
        return 'bg-[#DAEAFD] text-[#3556BB] border-[#B5D4F9]';

      case 'APR': // Approved
      case 'RCV': // Received
        return 'bg-[#C5E7D9] text-green-900 border-[#98D2BD]';

      case 'OVD': // Overdue
        return 'bg-red-100 text-red-900 border-red-300';

      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  if (invoiceLoading || !invoiceData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin" size={32} />
        <span className="ml-2">{t('loadingInvoice')}</span>
      </div>
    );
  }

  const currencySymbol = currencyDetails?.symbol || invoiceData?.currency || '£';
  const totalAmount = parseFloat(invoiceData?.total_amount || '0');

  // Calculate subtotal from line items if available, otherwise use total
  const subTotalNum = invoiceData?.line_items?.reduce((total: number, item: any) => {
    const amount = parseFloat(String(item?.unit_price || 0));
    return total + amount * (item.quantity || 1);
  }, 0) || totalAmount;

  const deliveryCharge = parseFloat(invoiceData?.delivery_charge || '0');

  return (
    <div className="space-y-4 md:space-y-6 p-3 md:p-6 bg-gray-50 min-h-screen">
      <div className="mx-auto max-w-4xl p-4 md:p-6 rounded-xl bg-white shadow-sm border border-gray-200">
        <div className="space-y-6 md:space-y-8 pb-6 md:pb-8">
          {/* Back/Close Button */}
          <div className="flex justify-start -mt-2 -ml-2 mb-2">
            <Button
              onClick={handleBack}
              variant="ghost"
              className="p-2 md:py-2 md:px-4 h-auto hover:bg-gray-100 text-gray-600 rounded-full transition-colors cursor-pointer"
            >
              <div className="hidden md:flex items-center gap-2">
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium text-sm">{t('back')}</span>
              </div>
              <div className="md:hidden">
                <X className="w-6 h-6" />
              </div>
            </Button>
          </div>
          {/* Heading */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-900 mb-1">{t('invoiceDetails')}</h1>
              <h4 className="text-base font-medium text-gray-600">#{invoiceData?.invoice_number}</h4>
              <div className="my-4 md:my-8 text-xs md:text-sm leading-[180%] text-gray-600">
                {t('issueDateLabel')} : {formatShortDate(invoiceData?.date)}<br />
                {t('dueDateLabel')} : {formatShortDate(invoiceData?.due_date)}<br />
                {invoiceData?.project && (
                  <>{t('projectLabel')} : {invoiceData?.project?.project_name || '-'}</>
                )}
              </div>
            </div>
            <div className="flex flex-col items-start md:items-end">
              <img alt={t('studioLogoAlt')} src={logo} className="w-16 h-16 md:w-[90px] md:h-[90px] mb-4 object-contain" />
              <p className="text-gray-600 font-medium text-xs md:text-sm leading-[150%] text-left md:text-right">
                {t('companyName')} <br /> {t('companyAddressLine1')} <br /> {t('companyAddressLine2')} <br /> {t('companyCity')} <br /> {t('companyPostcode')} <br />
                {t('vatNumber')} <br />
                {t('companyEmail')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            <div className="space-y-2">
              <Label className="text-gray-500">{t('issueDateLabel')}</Label>
              <div className="font-medium text-gray-900">
                {formatShortDate(invoiceData?.date)}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-500">{t('dueDateLabel')}</Label>
              <div className="font-medium text-gray-900">
                {formatShortDate(invoiceData?.due_date)}
              </div>
            </div>
          </div>

          <Separator />

          {invoiceData?.project && (
            <>
              <div className="space-y-2">
                <Label className="text-gray-500">{t('projectLabel')}</Label>
                <div className="font-medium text-gray-900">
                  {invoiceData?.project?.project_name || '-'}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Line Items - Desktop Table View */}
          {invoiceData?.line_items && invoiceData.line_items.length > 0 && (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block bg-white rounded-xl overflow-hidden border border-gray-100">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-3 text-left font-medium text-gray-500">{t('image')}</th>
                      <th className="p-3 text-left font-medium text-gray-500">{t('description')}</th>
                      <th className="p-3 text-center font-medium text-gray-500">{t('qty')}</th>
                      <th className="p-3 text-right font-medium text-gray-500">{t('unitPrice')}</th>
                      <th className="p-3 text-right font-medium text-gray-500">{t('amount')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {invoiceData.line_items.map((item: any, index: number) => (
                      <tr key={index}>
                        <td className="p-3 w-[80px]">
                          <div className="w-12 h-12 rounded bg-gray-100 overflow-hidden">
                            {item?.product?.images?.find((img: any) => img.is_primary)?.image || item?.product?.images?.[0]?.image ? (
                              <img className="w-full h-full object-cover" src={item?.product?.images?.find((img: any) => img.is_primary)?.image || item?.product?.images?.[0]?.image} alt={t('productImageAlt')} />
                            ) : (
                              <img className="w-full h-full object-cover" src={placeHolder} alt={t('placeholderImageAlt')} />
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <p className="font-medium text-gray-900">{item.description}</p>
                        </td>
                        <td className="p-3 text-center">{item.quantity}</td>
                        <td className="p-3 text-right">
                          {currencySymbol}
                          {parseFloat(item.unit_price || '0').toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="p-3 text-right font-medium">
                          {currencySymbol}
                          {((parseFloat(item.unit_price || '0') * (item.quantity || 1))).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    ))}

                    {/* FFNE Row if exists */}
                    {(invoiceData?.ffne && Number(invoiceData.ffne) > 0) && (
                      <tr>
                        <td className="p-3"></td>
                        <td className="p-3">
                          <p className="font-medium text-gray-900">{invoiceData?.ffne_desc || t('ffneDefault')}</p>
                        </td>
                        <td className="p-3 text-center">1</td>
                        <td className="p-3 text-right">
                          {currencySymbol}
                          {Number(invoiceData.ffne).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="p-3 text-right font-medium">
                          {currencySymbol}
                          {Number(invoiceData.ffne).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {invoiceData.line_items.map((item: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3 bg-white">
                    <div className="flex gap-3">
                      <div className="w-16 h-16 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                        {item?.product?.images?.find((img: any) => img.is_primary)?.image || item?.product?.images?.[0]?.image ? (
                          <img className="w-full h-full object-cover" src={item?.product?.images?.find((img: any) => img.is_primary)?.image || item?.product?.images?.[0]?.image} alt={t('productImageAlt')} />
                        ) : (
                          <img className="w-full h-full object-cover" src={placeHolder} alt={t('placeholderImageAlt')} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm mb-2">{item.description}</p>
                        <div className="space-y-1 text-xs text-gray-600">
                          <div className="flex justify-between">
                            <span>{t('qtyColon')}</span>
                            <span className="font-medium">{item.quantity}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>{t('unitPriceColon')}</span>
                            <span className="font-medium">
                              {currencySymbol}
                              {parseFloat(item.unit_price || '0').toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                          <div className="flex justify-between pt-1 border-t border-gray-200">
                            <span>{t('amountColon')}</span>
                            <span className="font-semibold text-gray-900">
                              {currencySymbol}
                              {((parseFloat(item.unit_price || '0') * (item.quantity || 1))).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* FFNE Card if exists */}
                {(invoiceData?.ffne && Number(invoiceData.ffne) > 0) && (
                  <div className="border border-gray-200 rounded-lg p-3 bg-white">
                    <p className="font-medium text-gray-900 text-sm mb-2">{invoiceData?.ffne_desc || t('ffneDefault')}</p>
                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span>{t('qtyColon')}</span>
                        <span className="font-medium">1</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-gray-200">
                        <span>{t('amountColon')}</span>
                        <span className="font-semibold text-gray-900">
                          {currencySymbol}
                          {Number(invoiceData.ffne).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Status Section */}
          <div className="pt-4 md:pt-6 mt-6 md:mt-8">
            <div className="grid grid-cols-1 gap-4">
              <div className='flex items-center gap-4 md:gap-10'>
                <Label className="font-normal block text-gray-900 text-sm md:text-sm">
                  {t('statusColon')}
                </Label>
                <div className="flex items-center">
                  <StatusBadge
                    status={invoiceData?.status}
                    label={statusOptions.find(o => o.value === invoiceData?.status)?.label || invoiceData?.status}
                    className={getStatusStyle(invoiceData?.status)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end pt-4">
            <div className="w-full md:w-64 space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>{t('subtotalColon')}</span>
                <span>{currencySymbol}{subTotalNum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              {deliveryCharge > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{t('deliveryCharge')}</span>
                  <span>{currencySymbol}{deliveryCharge.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold text-gray-900">
                <span>{t('totalColon')}</span>
                <span>{currencySymbol}{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-8 md:pt-14 flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-t mt-8">
            <div>
              <h2 className="text-sm font-semibold text-gray-900 uppercase mb-3 md:mb-5">{t('paymentAdvance')}</h2>
              <p className="text-gray-600 font-medium text-xs md:text-sm">
                {t('companyName')} <br /> {t('companyAddressLine1')} <br /> {t('companyAddressLine2')} <br /> {t('companyCity')} <br /> {t('companyPostcode')} <br />
                {t('vatNumber')} <br />
                {t('companyEmail')}
              </p>
            </div>
            <div className="w-full md:min-w-[220px] space-y-3 md:space-y-[14px] text-gray-900 text-sm md:text-sm font-medium">
              <div className="grid grid-cols-2 gap-4">
                <p className="text-gray-500">{t('documentNumber')}</p>
                <p className="text-right">{invoiceData?.invoice_number}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <p className="text-gray-500">{t('amountDue')}</p>
                <p className="text-right">
                  {currencySymbol}
                  {(invoiceData?.amount_due ?? (invoiceData?.status === 'PD' ? 0 : totalAmount)).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <p className="text-gray-500">{t('dueDateLabel')}</p>
                <p className="text-right">
                  {formatShortDate(invoiceData?.due_date)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
